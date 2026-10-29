import { useEffect, useRef, useState } from 'react';
import { BadgeCheck, CalendarDays, Camera, Check, Edit3, Mail, MapPin, Minus, Plus, ShieldCheck, Sparkles, Trash2, Upload, X } from 'lucide-react';
import { Avatar, Button, FormField, Modal, PageTitle, Panel, Tag } from '../components/common/UI';
import { useApp } from '../context/AppContext';
import { authApi, resolveAssetUrl } from '../services/api';
import { formatDate } from '../utils/format';
import defaultCover from '../assets/default-cover.svg';

const COVER_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_COVER_SIZE = 5 * 1024 * 1024; // keep in sync with backend MAX_FILE_SIZE

function formatJoiningDate(joinedDate) {
  if (!joinedDate) return 'Not available';
  const parsed = new Date(`${String(joinedDate).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return 'Not available';
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(parsed);
}

function computeAnniversary(joinedDate) {
  if (!joinedDate) return null;
  const joined = new Date(`${String(joinedDate).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(joined.getTime())) return null;
  const now = new Date();
  const years = now.getFullYear() - joined.getFullYear();
  if (years < 1) return null;
  const nextDate = new Date(now.getFullYear(), joined.getMonth(), joined.getDate());
  if (nextDate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    nextDate.setFullYear(now.getFullYear() + 1);
  }
  const monthName = nextDate.toLocaleString('en', { month: 'long' });
  return {
    title: `${years + 1}${years + 1 === 2 ? 'nd' : years + 1 === 3 ? 'rd' : years + 1 === 1 ? 'st' : 'th'} Work Anniversary`,
    detail: `Celebrate ${years + 1} years with the team in ${monthName} ${nextDate.getFullYear()}.`,
  };
}

// Crops the chosen photo to a 512×512 square at the selected zoom before upload.
function createEditedAvatar(file, previewUrl, zoom) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const size = 512;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext('2d');
      const scale = Math.max(size / image.width, size / image.height) * zoom;
      context.translate(size / 2, size / 2);
      context.drawImage(image, -(image.width * scale) / 2, -(image.height * scale) / 2, image.width * scale, image.height * scale);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Unable to prepare the profile photo.'));
          return;
        }
        resolve(new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.92);
    };
    image.onerror = () => reject(new Error('Unable to read the selected profile photo.'));
    image.src = previewUrl;
  });
}

export default function Profile() {
  const { user, userLoading, updateProfile, setToast } = useApp();
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);

  // Cover image: unsaved preview blob + upload state
  const coverInputRef = useRef(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverSaving, setCoverSaving] = useState(false);

  // Profile photo editor: the chosen file stays local until Save.
  const avatarInputRef = useRef(null);
  const [avatarEditorOpen, setAvatarEditorOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarZoom, setAvatarZoom] = useState(1);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [savedAvatarBroken, setSavedAvatarBroken] = useState(false);
  const savedAvatar = resolveAssetUrl(user?.avatar) || null;

  const closeAvatarEditor = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
    setAvatarFile(null);
    setAvatarRemoved(false);
    setAvatarZoom(1);
    setSavedAvatarBroken(false);
    setAvatarEditorOpen(false);
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  const onAvatarFileSelected = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setToast('Please choose an image file.');
      return;
    }
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarRemoved(false);
    setAvatarZoom(1);
    setAvatarEditorOpen(true);
  };

  const saveAvatar = async () => {
    if (!avatarFile && !avatarRemoved) return closeAvatarEditor();
    setAvatarSaving(true);
    try {
      if (avatarRemoved) {
        await updateProfile({ avatarUrl: null });
      } else {
        const edited = await createEditedAvatar(avatarFile, avatarPreview, avatarZoom);
        const uploaded = await authApi.uploadFile(edited);
        await updateProfile({ avatarUrl: uploaded.url }); // refreshes user from the server
      }
      setToast(avatarRemoved ? 'Profile photo removed.' : 'Profile photo updated.');
      closeAvatarEditor();
    } catch (err) {
      setToast(err.message || 'Unable to save your profile photo.');
    } finally {
      setAvatarSaving(false);
    }
  };
  const editorImage = avatarRemoved ? null : avatarPreview || (!savedAvatarBroken && savedAvatar);

  const savedCover = resolveAssetUrl(user?.cover) || null;
  const coverSrc = coverPreview || savedCover || defaultCover;

  const clearCoverPreview = () => {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
    setCoverFile(null);
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const onCoverFileSelected = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!COVER_TYPES.includes(file.type)) {
      clearCoverPreview();
      setToast('Unsupported file type. Please choose a JPG, JPEG, PNG or WebP image.');
      return;
    }
    if (file.size > MAX_COVER_SIZE) {
      clearCoverPreview();
      setToast('Image is too large. Maximum cover image size is 5 MB.');
      return;
    }
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const onCoverImageError = (event) => {
    const img = event.currentTarget;
    if (img.dataset.fallback !== '1') {
      img.dataset.fallback = '1';
      img.src = defaultCover; // saved image failed to load → show the default banner
    } else {
      img.style.display = 'none'; // default asset unavailable → keep the gradient
    }
  };

  const saveCover = async () => {
    if (!coverFile) return;
    setCoverSaving(true);
    try {
      const uploaded = await authApi.uploadFile(coverFile);
      await updateProfile({ coverUrl: uploaded.url }); // refreshes user from the server
      clearCoverPreview();
      setToast('Cover image updated.');
    } catch (err) {
      setToast(err.message || 'Unable to save your cover image.');
    } finally {
      setCoverSaving(false);
    }
  };

  const roleTitle = user?.role || '';
  const location = user?.location || '';
  const bio = user?.bio || '';
  const interests = Array.isArray(user?.interests) ? user.interests.filter(Boolean) : [];
  const joiningDate = formatJoiningDate(user?.joined);
  const anniversary = computeAnniversary(user?.joined);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        bio: draft.bio ?? bio,
        location: draft.location ?? location,
        roleTitle: draft.roleTitle ?? roleTitle,
      });
      setEditOpen(false);
      setToast('Profile details saved.');
    } catch (err) {
      setToast(err.message || 'Unable to save your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageTitle
        eyebrow="YOUR WORKPLACE IDENTITY"
        title="My profile"
        description="Employee profile overview, department records and professional journey."
        actions={
          <Button onClick={() => { setDraft({ roleTitle, location, bio }); setEditOpen(true); }}>
            <Edit3 size={15}/> Edit profile
          </Button>
        }
      />

      <div className="profile-hero">
        <div className="profile-cover">
          <img
            key={coverSrc}
            src={coverSrc}
            alt="Profile cover"
            className="profile-cover-img"
            onError={onCoverImageError}
          />
          <div className="profile-cover-overlay" />

          {coverPreview ? (
            <div className="cover-preview-bar">
              <span className="cover-preview-label">Preview — not saved yet</span>
              <Button size="sm" variant="secondary" onClick={clearCoverPreview} disabled={coverSaving}>
                <X size={14}/> Cancel
              </Button>
              <Button size="sm" onClick={saveCover} disabled={coverSaving}>
                <Check size={14}/> {coverSaving ? 'Saving…' : 'Save cover'}
              </Button>
            </div>
          ) : (
            <button
              type="button"
              className="cover-upload-button"
              title="Upload cover image"
              aria-label="Upload cover image"
              onClick={() => coverInputRef.current && coverInputRef.current.click()}
            >
              <Camera size={12}/>
              {/* <span>Upload cover image</span> */}
            </button>
          )}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="cover-file-input"
            onChange={onCoverFileSelected}
          />
        </div>

        <div className="profile-hero-person">
          <div className="profile-avatar-wrap">
            <Avatar name={user?.name || 'Employee'} initials={user?.initials} size="xxl" src={user?.avatar}/>
            <button
              type="button"
              className="avatar-upload-button"
              title="Change profile photo"
              aria-label="Change profile photo"
              onClick={() => setAvatarEditorOpen(true)}
            >
              <Camera size={14}/>
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="cover-file-input"
              onChange={onAvatarFileSelected}
            />
          </div>
          <div className="profile-hero-info">
            <div className="profile-name-row">
              <h2>{user?.name || 'Employee'}</h2>
              <BadgeCheck size={20} className="profile-verified-badge" />
              <Tag tone="mint">{(user?.employmentType || 'Employee').toUpperCase()}</Tag>
            </div>
            <p>{roleTitle || 'Role not on file'} {user?.team && <><span>·</span> {user.team}</>}</p>
            <div className="profile-meta-row">
              {location && <span><MapPin size={14}/> {location}</span>}
              {user?.email && <span><Mail size={14}/> {user.email}</span>}
              {user?.joined && <span><CalendarDays size={14}/> Joined {formatDate(user.joined, {month:'short',year:'numeric'})}</span>}
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={avatarEditorOpen}
        onClose={closeAvatarEditor}
        title="Profile photo"
        description="Upload a photo, zoom to frame it, then save."
        className="avatar-editor-dialog"
        hideClose
      >
        <button type="button" className="avatar-editor-close" aria-label="Close" onClick={closeAvatarEditor}><X size={18}/></button>
        <div className="avatar-editor">
          <div className="avatar-editor-frame">
            {editorImage ? (
              <img
                src={editorImage}
                alt="Profile photo preview"
                style={{ transform: `scale(${avatarZoom})` }}
                onError={() => { if (!avatarPreview) setSavedAvatarBroken(true); }}
              />
            ) : (
              <Avatar name={user?.name || 'Employee'} initials={user?.initials} size="xxl" color="blue" />
            )}
          </div>

          <div className={`avatar-zoom-control ${avatarPreview ? '' : 'is-disabled'}`}>
            <button type="button" aria-label="Zoom out" disabled={!avatarPreview} onClick={() => setAvatarZoom((value) => Math.max(1, +(value - 0.1).toFixed(1)))}><Minus size={16}/></button>
            <input aria-label="Zoom" type="range" min="1" max="3" step="0.1" value={avatarZoom} disabled={!avatarPreview} onChange={(event) => setAvatarZoom(Number(event.target.value))}/>
            <button type="button" aria-label="Zoom in" disabled={!avatarPreview} onClick={() => setAvatarZoom((value) => Math.min(3, +(value + 0.1).toFixed(1)))}><Plus size={16}/></button>
          </div>

          <div className="avatar-editor-tools">
            <Button type="button" variant="secondary" size="sm" onClick={() => avatarInputRef.current && avatarInputRef.current.click()}>
              <Upload size={14}/> {savedAvatar || avatarPreview ? 'Choose another photo' : 'Upload photo'}
            </Button>
            {(savedAvatar || avatarPreview) && !avatarRemoved && (
              <Button type="button" variant="secondary" size="sm" className="avatar-remove-button" onClick={() => { if (avatarPreview) URL.revokeObjectURL(avatarPreview); setAvatarPreview(null); setAvatarFile(null); setAvatarZoom(1); setAvatarRemoved(true); }}>
                <Trash2 size={14}/> Remove photo
              </Button>
            )}
          </div>
          {avatarRemoved && <p className="avatar-editor-note">Your photo will be removed and your initials shown instead.</p>}
        </div>
        <div className="avatar-editor-actions">
          <Button type="button" variant="secondary" onClick={closeAvatarEditor} disabled={avatarSaving}>Cancel</Button>
          <Button type="button" onClick={saveAvatar} disabled={avatarSaving || (!avatarFile && !avatarRemoved)}>{avatarSaving ? 'Saving…' : 'Save'}</Button>
        </div>
      </Modal>

      <div className="profile-content-grid">
        <div className="profile-main-column">
          <Panel className="profile-about">
            <div className="profile-section-head">
              <h3>About me</h3>
              <button className="icon-button" aria-label="Edit about me" onClick={() => { setDraft({ roleTitle, location, bio }); setEditOpen(true); }}>
                <Edit3 size={15}/>
              </button>
            </div>
            {userLoading ? (
              <p className="muted">Loading your profile…</p>
            ) : bio ? (
              <p>{bio}</p>
            ) : (
              <p className="muted">No information added yet.</p>
            )}
            {interests.length > 0 ? (
              <div className="profile-interest-tags">
                {interests.map((interest) => <span key={interest}>{interest}</span>)}
              </div>
            ) : (
              <div className="profile-interest-tags">
                <span className="muted">No interests on file yet.</span>
              </div>
            )}
          </Panel>

          <Panel className="profile-info">
            <div className="profile-section-head">
              <h3>Professional Details</h3>
              <span className="profile-private"><ShieldCheck size={13}/></span>
            </div>
            <div className="profile-info-grid">
              <div>
                <small>LEGAL NAME</small>
                <strong>{user?.name || '—'}</strong>
              </div>
              <div>
                <small>DEPARTMENT</small>
                <strong>{user?.team || '—'}</strong>
              </div>
              <div>
                <small>OFFICE LOCATION</small>
                <strong>{location || '—'}</strong>
              </div>
              <div>
                <small>CORPORATE EMAIL</small>
                <strong>{user?.email || '—'}</strong>
              </div>
              <div>
                <small>JOB TITLE</small>
                <strong>{roleTitle || '—'}</strong>
              </div>
              <div>
                <small>TIMEZONE</small>
                <strong>Asia/Kolkata (IST · UTC+5:30)</strong>
              </div>
              <div>
                <small>JOINING DATE</small>
                <strong>{joiningDate}</strong>
              </div>
            </div>
          </Panel>
        </div>

        <div className="profile-side-column">
          <Panel className="profile-growth">
            <div className="growth-top">
              <span><Sparkles size={18}/></span>
              <Tag tone="purple">YOUR JOURNEY</Tag>
            </div>
            <h3>Excellence in practice.</h3>
            <p>Your performance milestones and kudos recorded so far.</p>
            <div className="growth-metric">
              <span><strong>—</strong><small>Milestones Unlocked (not tracked yet)</small></span>
              <div className="growth-meter"><i style={{width:'0%'}}/></div>
            </div>
            <div className="growth-metric">
              <span>
                <strong>—</strong>
                <small>Kudos Received</small>
              </span>
              <div className="growth-meter purple">
                <i style={{width: '0%'}}/>
              </div>
            </div>
          </Panel>

          <Panel className="profile-milestone">
            <span className="milestone-icon"><CalendarDays size={20}/></span>
            <span className="milestone-label">UPCOMING MILESTONE</span>
            {anniversary ? (
              <>
                <h3>{anniversary.title}</h3>
                <p>{anniversary.detail}</p>
              </>
            ) : (
              <>
                <h3>No milestone on file</h3>
                <p>Your work anniversary appears here once your join date is on record.</p>
              </>
            )}
          </Panel>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit profile" description="Update your public profile display information.">
        <form className="form-stack" onSubmit={save}>
          <FormField label="Role title">
            <input value={draft.roleTitle ?? roleTitle} onChange={(e) => setDraft((d) => ({ ...d, roleTitle: e.target.value }))}/>
          </FormField>
          <FormField label="Work location">
            <input value={draft.location ?? location} onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}/>
          </FormField>
          <FormField label="About me bio">
            <textarea rows={4} value={draft.bio ?? bio} onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}/>
          </FormField>
          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
