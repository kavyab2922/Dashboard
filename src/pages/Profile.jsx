import { useEffect, useState } from 'react';
import { BadgeCheck, CalendarDays, Edit3, Mail, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { Avatar, Button, FormField, Modal, PageTitle, Panel, Tag } from '../components/common/UI';
import { useApp } from '../context/AppContext';
import { dataApi } from '../services/api';
import { formatDate } from '../utils/format';

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

export default function Profile() {
  const { user, updateProfile, setToast } = useApp();
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    dataApi.dashboard.summary()
      .then((response) => { if (!cancelled) setSummary(response.data || null); })
      .catch(() => { /* summary metrics degrade to em dashes */ })
      .finally(() => { if (!cancelled) setSummaryLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const roleTitle = user?.role || '';
  const location = user?.location || '';
  const bio = user?.bio || '';
  const interests = Array.isArray(user?.interests) ? user.interests.filter(Boolean) : [];
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
          {user?.cover && (
            <img src={user.cover} alt="Profile Cover" className="profile-cover-img" />
          )}
          <div className="profile-cover-overlay" />
        </div>

        <div className="profile-hero-person">
          <div className="profile-avatar-wrap">
            <Avatar name={user?.name || 'Employee'} initials={user?.initials} size="xxl" src={user?.avatar}/>
          </div>
          <div className="profile-hero-info">
            <div className="profile-name-row">
              <h2>{user?.name || 'Employee'}</h2>
              <BadgeCheck size={20} className="profile-verified-badge" />
              <Tag tone="mint">FULL-TIME EMPLOYEE</Tag>
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

      <div className="profile-content-grid">
        <div className="profile-main-column">
          <Panel className="profile-about">
            <div className="profile-section-head">
              <h3>About me</h3>
              <button className="icon-button" aria-label="Edit about me" onClick={() => { setDraft({ roleTitle, location, bio }); setEditOpen(true); }}>
                <Edit3 size={15}/>
              </button>
            </div>
            {bio ? <p>{bio}</p> : <p className="muted">No bio on file yet. Add one with “Edit profile”.</p>}
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
              <span className="profile-private"><ShieldCheck size={13}/> Verified HR Record</span>
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
              <span><strong>{summaryLoading ? '…' : '—'}</strong><small>Milestones Unlocked (not tracked yet)</small></span>
              <div className="growth-meter"><i style={{width:'0%'}}/></div>
            </div>
            <div className="growth-metric">
              <span><strong>{summaryLoading ? '…' : (summary?.kudosReceived?.value ?? '—')}</strong><small>Kudos Received</small></span>
              <div className="growth-meter purple"><i style={{width: summary?.kudosReceived?.value ? '68%' : '0%'}}/></div>
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
