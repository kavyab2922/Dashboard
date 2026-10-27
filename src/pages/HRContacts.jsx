import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, AtSign, Building2, ChevronDown, Mail, MapPin, Phone, Search, Users } from 'lucide-react';
import EditableCollectionPage from '../components/common/EditableCollectionPage';
import useClickOutside from '../hooks/useClickOutside';
import { Avatar, Button, PageTitle, Panel, Tag } from '../components/common/UI';
import { useApp } from '../context/AppContext';

const buildTeamsChatUrl = (email) => (
  email
    ? `msteams://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(email)}`
    : null
);

export default function HRContacts() {
  const { contacts, contactsState, setToast } = useApp();
  const [search, setSearch] = useState('');
  const [team, setTeam] = useState('All');
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [menuPlacement, setMenuPlacement] = useState('down');
  const [manage, setManage] = useState(false);
  const departmentRef = useRef(null);
  const teams = ['All', ...new Set(contacts.map((item) => item.team))];

  useClickOutside(departmentRef, departmentOpen, () => setDepartmentOpen(false));

  useEffect(() => {
    if (!departmentOpen || !departmentRef.current) return undefined;
    const updatePlacement = () => {
      const bounds = departmentRef.current.getBoundingClientRect();
      const menuHeight = Math.min(260, Math.max(120, teams.length * 42 + 12));
      setMenuPlacement(bounds.bottom + menuHeight > window.innerHeight - 12 ? 'up' : 'down');
    };
    updatePlacement();
    window.addEventListener('resize', updatePlacement);
    window.addEventListener('scroll', updatePlacement, true);
    return () => {
      window.removeEventListener('resize', updatePlacement);
      window.removeEventListener('scroll', updatePlacement, true);
    };
  }, [departmentOpen, teams.length]);

  const filtered = contacts.filter((item) =>
    `${item.name} ${item.team} ${item.focus} ${item.location}`.toLowerCase().includes(search.toLowerCase()) &&
    (team === 'All' || item.team === team)
  );

  if (manage) return (
    <>
      <EditableCollectionPage
        type="contacts"
        embedded
        backAction={(
          <Button variant="secondary" onClick={() => setManage(false)}>← Back to Quick Connect</Button>
        )}
      />
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

      <Panel className={`contacts-filter-panel ${departmentOpen ? 'is-department-open' : ''}`}>
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
          <div className="contacts-department-filter">
            <span className="contacts-department-label"><Building2 size={15}/> Department</span>
            <div ref={departmentRef} className={`contacts-select-wrap is-menu-${menuPlacement}`}>
              <button
                type="button"
                className={`contacts-select-trigger ${departmentOpen ? 'is-open' : ''}`}
                aria-haspopup="listbox"
                aria-expanded={departmentOpen}
                aria-label="Filter by department"
                onClick={() => setDepartmentOpen((isOpen) => !isOpen)}
              >
                <span>{team}</span>
                <ChevronDown size={16}/>
              </button>
              {departmentOpen && (
                <div className="contacts-select-menu" role="listbox" aria-label="Departments">
                  {teams.map((item) => (
                    <button
                      type="button"
                      role="option"
                      aria-selected={team === item}
                      className={`contacts-select-option ${team === item ? 'is-selected' : ''}`}
                      key={item}
                      onClick={() => { setTeam(item); setDepartmentOpen(false); }}
                    >
                      <span>{item}</span>
                      {team === item && <span className="contacts-select-check">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
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
                {contact.email && (
                  <a
                    className="btn btn-ghost btn-sm"
                    href={buildTeamsChatUrl(contact.email)}
                    aria-label={`Open Teams chat with ${contact.name}`}
                  >
                    Schedule chat <ArrowUpRight size={14}/>
                  </a>
                )}
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
