import { useMemo, useState } from 'react';
import { ArrowUpRight, AtSign, Building2, Mail, MapPin, Phone, Search, Users } from 'lucide-react';
import EditableCollectionPage from '../components/common/EditableCollectionPage';
import { Avatar, Button, PageTitle, Panel, Tag } from '../components/common/UI';
import { useApp } from '../context/AppContext';

export default function HRContacts() {
  const { contacts, contactsState, setToast } = useApp();
  const [search, setSearch] = useState('');
  const [team, setTeam] = useState('All');
  const [manage, setManage] = useState(false);

  const teams = ['All', ...new Set(contacts.map((item) => item.team))];
  const filtered = contacts.filter((item) =>
    `${item.name} ${item.team} ${item.focus} ${item.location}`.toLowerCase().includes(search.toLowerCase()) &&
    (team === 'All' || item.team === team)
  );

  if (manage) return (
    <>
      <EditableCollectionPage type="contacts" embedded/>
      <div className="back-to-feed">
        <Button variant="secondary" onClick={() => setManage(false)}>← Back to Quick Connect</Button>
      </div>
    </>
  );

  return (
    <>
      <PageTitle
        eyebrow="THE PEOPLE BEHIND THE HELP"
        title="Quick Connect"
        description="Dedicated People Partners and HR Specialists ready to assist with benefits, career development, leave and operations."
        actions={<Button variant="secondary" onClick={() => setManage(true)}>Manage contacts</Button>}
      />

      {contactsState.loading && (
        <Panel><p className="muted">Loading HR contacts…</p></Panel>
      )}
      {contactsState.error && (
        <Panel><p className="muted">Unable to load HR contacts: {contactsState.error}</p></Panel>
      )}
      {!contactsState.loading && !contactsState.error && contacts.length === 0 && (
        <Panel><p className="muted">No HR contacts found in the employee directory.</p></Panel>
      )}

      <div className="contacts-hero">
        <div className="contacts-hero-copy">
          <Tag tone="purple">PEOPLE & CULTURE DIRECTORY</Tag>
          <h2>A real conversation makes all the difference.</h2>
          <p>
            Connect directly with your dedicated HR points of contact for confidential support, benefits advisement, and internal transfers.
          </p>
          <div className="contacts-hero-stats">
            <span><strong>{contacts.length.toString().padStart(2,'0')}</strong> verified HR specialists</span>
            <span><strong>{teams.length - 1}</strong> departments represented</span>
          </div>
        </div>
      </div>

      <Panel className="contacts-filter-panel">
        <div className="contacts-filter-heading">
          <div>
            <span className="contacts-filter-kicker">Find your HR partner</span>
            <h2>Browse the directory</h2>
          </div>
          <span className="contacts-filter-count">{filtered.length} of {contacts.length} contacts</span>
        </div>
        <div className="contacts-toolbar">
          <label className="inline-search contacts-search">
            <Search size={16}/>
            <span className="sr-only">Search HR contacts</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, team or specialty..."/>
          </label>
          <label className="contacts-department-filter">
            <span><Building2 size={15}/> Department</span>
            <select value={team} onChange={(e) => setTeam(e.target.value)} aria-label="Filter by department">
              {teams.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>
      </Panel>

      <div className="contacts-grid">
        {filtered.map((contact) => (
          <Panel className="contact-card" key={contact.id}>
            <div className="contact-card-cover">
              {contact.cover && (
                <img src={contact.cover} alt={contact.name} className="contact-cover-img" loading="lazy" />
              )}
              <div className="contact-cover-overlay" />
              <span className="contact-team-label">{contact.team}</span>
              <div className="contact-avatar-overlap">
                <Avatar name={contact.name} initials={contact.initials} size="xl" src={contact.avatar}/>
              </div>
            </div>

            <div className="contact-card-body">
              <h3>{contact.name}</h3>
              <p className="contact-focus">{contact.focus}</p>
              {contact.location && (
                <div className="contact-detail-row">
                  <MapPin size={14}/> {contact.location}
                </div>
              )}
              <div className="contact-detail-row">
                <AtSign size={14}/> {contact.email || 'No email on file'}
              </div>
              <div className="contact-card-actions">
                {contact.email && (
                  <a
                    className="btn btn-secondary btn-sm"
                    href={`mailto:${contact.email}`}
                  >
                    <Mail size={14}/> Email Partner
                  </a>
                )}
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setToast(`${contact.name}: ${contact.focus}`)}
                >
                  Schedule chat <ArrowUpRight size={14}/>
                </button>
              </div>
            </div>
          </Panel>
        ))}
        {filtered.length === 0 && (
          <Panel className="contact-empty">
            <Search size={22}/>
            <strong>No contacts found</strong>
            <p>Try searching another name or department.</p>
          </Panel>
        )}
      </div>
    </>
  );
}
