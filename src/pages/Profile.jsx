import { useEffect, useState } from 'react';
import { BadgeCheck, CalendarDays, Edit3, Mail, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { Button, FormField, Modal, Panel, Tag } from '../components/common/UI';
import { useApp } from '../context/AppContext';

export default function Profile() {
  const { currentEmployee, updateProfile, setToast, dashboardSummary } = useApp();
  const [editOpen, setEditOpen] = useState(false);
  const [roleTitle, setRoleTitle] = useState(currentEmployee.role);
  const [location, setLocation] = useState(currentEmployee.location);
  const [bio, setBio] = useState(currentEmployee.bio || '');
  const [draft, setDraft] = useState({});

  useEffect(() => {
    setRoleTitle(currentEmployee.role);
    setLocation(currentEmployee.location);
    setBio(currentEmployee.bio || '');
  }, [currentEmployee]);

  const save = async (event) => {
    event.preventDefault();
    const nextRole = draft.roleTitle || roleTitle;
    const nextLocation = draft.location || location;
    const nextBio = draft.bio ?? bio;
    try {
      await updateProfile({ roleTitle: nextRole, location: nextLocation, bio: nextBio, interests: currentEmployee.interests });
      setRoleTitle(nextRole);
      setLocation(nextLocation);
      setBio(nextBio);
      setEditOpen(false);
    } catch (err) {
      setToast(err.message || 'Could not update profile.');
    }
  };

  return (
    <>
      <div className="profile-hero">
        <div className="profile-cover">
          {currentEmployee.cover && (
            <img src={currentEmployee.cover} alt="Profile Cover" className="profile-cover-img" />
          )}
          <div className="profile-cover-overlay" />
        </div>

        <div className="profile-hero-person">
          <div className="profile-hero-info">
            <div className="profile-name-row">
              <h2>{currentEmployee.name}</h2>
              <BadgeCheck size={20} className="profile-verified-badge" />
              <Tag tone="mint">FULL-TIME EMPLOYEE</Tag>
            </div>
            <p>{roleTitle} <span>·</span> {currentEmployee.team}</p>
            <div className="profile-meta-row">
              <span><MapPin size={14}/> {location}</span>
              <span><Mail size={14}/> {currentEmployee.email}</span>
              <span><CalendarDays size={14}/> Joined {currentEmployee.joined || '—'}</span>
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
            <p>{bio}</p>
            <div className="profile-interest-tags">
              {(currentEmployee.interests || []).map((item) => <span key={item}>{item}</span>)}
            </div>
          </Panel>

          <Panel className="profile-info">
            <div className="profile-section-head">
              <h3>Professional Details</h3>
              <span className="profile-private"><ShieldCheck size={13}/> Verified HR Record</span>
            </div>
            <div className="profile-info-grid">
              <div>
                <small>LEGAL NAME</small>
                <strong>{currentEmployee.name}</strong>
              </div>
              <div>
                <small>DEPARTMENT</small>
                <strong>{currentEmployee.team}</strong>
              </div>
              <div>
                <small>OFFICE LOCATION</small>
                <strong>{location}</strong>
              </div>
              <div>
                <small>CORPORATE EMAIL</small>
                <strong>{currentEmployee.email}</strong>
              </div>
              <div>
                <small>JOB TITLE</small>
                <strong>{roleTitle}</strong>
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
            <p>Your performance milestones and achievements unlocked this year.</p>
            <div className="growth-metric">
              <span><strong>{dashboardSummary?.achievements?.value || '08'}</strong><small>Milestones Unlocked</small></span>
              <div className="growth-meter"><i style={{width:'80%'}}/></div>
            </div>
            <div className="growth-metric">
              <span><strong>{dashboardSummary?.kudosReceived?.value || '12'}</strong><small>Kudos Received</small></span>
              <div className="growth-meter purple"><i style={{width:'68%'}}/></div>
            </div>
          </Panel>

          <Panel className="profile-milestone">
            <span className="milestone-icon"><CalendarDays size={20}/></span>
            <span className="milestone-label">UPCOMING MILESTONE</span>
            <h3>4th Work Anniversary</h3>
            <p>Celebrate 4 years of impactful engineering with the team in October 2026.</p>
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
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
