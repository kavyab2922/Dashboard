import { useEffect, useRef, useState } from 'react';
import { Building2, Check, ChevronDown, Copy, Mail, MapPin, Search, Users } from 'lucide-react';
import useClickOutside from '../hooks/useClickOutside';
import { Avatar, PageTitle, Panel } from '../components/common/UI';
import { useApp } from '../context/AppContext';

// Simple Microsoft Teams mark (purple tile with a "T") for the chat button.
function TeamsLogo() {
  return (
    <svg className="qc-teams-logo" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect width="16" height="16" rx="3.5" fill="#5059C9"/>
      <path d="M4.5 4.75h7v1.6H8.85v5.9h-1.7v-5.9H4.5z" fill="#fff"/>
    </svg>
  );
}

const buildTeamsChatUrl = (email) => (
  email
    ? `msteams://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(email)}`
    : null
);

export default function HRContacts() {
  const { contacts, contactsState, setToast, user } = useApp();
  const [search, setSearch] = useState('');
  const [team, setTeam] = useState('All');
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [menuPlacement, setMenuPlacement] = useState('down');
  const departmentRef = useRef(null);
  const currentUserContact = user?.name?.trim() ? {
    id: `hr-current-${user.id || user.email || user.name}`,
    employee_code: user.employee_code || user.employeeCode || null,
    name: user.name.trim(),
    team: user.team || user.department || 'People & Culture',
    role: user.designation || user.jobTitle || user.role || 'Employee',
    focus: 'Your HR Orbit employee profile and workplace support',
    email: user.email || user.official_email || null,
    location: user.location || 'Bengaluru',
    initials: user.initials,
    color: 'blue',
    avatar: user.avatar || null,
    cover: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=85',
  } : null;
  const contactsWithCurrentUser = currentUserContact && !contacts.some((item) =>
    item.email && currentUserContact.email && item.email.toLowerCase() === currentUserContact.email.toLowerCase()
  ) ? [currentUserContact, ...contacts] : contacts;
  const validContacts = contactsWithCurrentUser.filter((item) => item.name?.trim());
  const teams = ['All', ...new Set(validContacts.map((item) => item.team))];

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

  const normalizedSearch = search.trim().toLowerCase();
  const filtered = validContacts.filter((item) =>
    `${item.name} ${item.email || ''} ${item.employee_code || ''} ${item.role || ''} ${item.team} ${item.focus} ${item.location}`
      .toLowerCase()
      .includes(normalizedSearch) &&
    (team === 'All' || item.team === team)
  );

  const [copiedEmail, setCopiedEmail] = useState(null);
  const copyEmail = async (email) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      window.setTimeout(() => setCopiedEmail((current) => (current === email ? null : current)), 1600);
    } catch {
      setToast('Unable to copy the email address.');
    }
  };
  const isCurrentUser = (contact) => contact.id === currentUserContact?.id;
  const ready = !contactsState.loading && !contactsState.error;

  return (
    <>
      <PageTitle
        eyebrow="PEOPLE & CULTURE"
        title="Quick Connect"
        description="Reach the right HR partner for benefits, leave, career development and workplace operations."
      />

      <Panel className={`qc-toolbar ${departmentOpen ? 'is-department-open' : ''}`}>
        <label className="inline-search qc-search">
          <Search size={16}/>
          <span className="sr-only">Search HR contacts</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, role, department or email"/>
        </label>
        <div ref={departmentRef} className={`contacts-select-wrap qc-department is-menu-${menuPlacement}`}>
          <button
            type="button"
            className={`contacts-select-trigger ${departmentOpen ? 'is-open' : ''}`}
            aria-haspopup="listbox"
            aria-expanded={departmentOpen}
            aria-label="Filter by department"
            onClick={() => setDepartmentOpen((isOpen) => !isOpen)}
          >
            <span className="qc-department-value"><Building2 size={15}/> {team === 'All' ? 'All departments' : team}</span>
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
                  <span>{item === 'All' ? 'All departments' : item}</span>
                  {team === item && <span className="contacts-select-check">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="qc-count"><Users size={15}/> {filtered.length} of {validContacts.length} contacts · {teams.length - 1} {teams.length - 1 === 1 ? 'department' : 'departments'}</span>
      </Panel>

      {contactsState.loading && <Panel className="qc-state"><p className="muted">Loading HR contacts…</p></Panel>}
      {contactsState.error && <Panel className="qc-state"><p className="muted">Unable to load HR contacts: {contactsState.error}</p></Panel>}

      {ready && (
        <div className="qc-grid">
          {filtered.map((contact) => (
            <article className="qc-card" key={contact.id}>
              <header className="qc-card-head">
                <Avatar name={contact.name} initials={contact.initials} color={contact.color || 'blue'} size="lg" src={contact.avatar}/>
                <div className="qc-identity">
                  <h3>
                    {contact.name}
                    {isCurrentUser(contact) && <span className="qc-you">You</span>}
                  </h3>
                  {contact.role && <p className="qc-role">{contact.role}</p>}
                  <span className="qc-team">{contact.team}</span>
                </div>
              </header>

              <dl className="qc-details">
                {contact.location && (
                  <div><dt><MapPin size={14}/><span className="sr-only">Location</span></dt><dd>{contact.location}</dd></div>
                )}
                <div>
                  <dt><Mail size={14}/><span className="sr-only">Email</span></dt>
                  <dd className="qc-email">
                    {contact.email ? (
                      <>
                        <span title={contact.email}>{contact.email}</span>
                        <button
                          type="button"
                          className="qc-copy"
                          aria-label={`Copy ${contact.name}'s email`}
                          title={copiedEmail === contact.email ? 'Copied' : 'Copy email'}
                          onClick={() => copyEmail(contact.email)}
                        >
                          {copiedEmail === contact.email ? <Check size={14}/> : <Copy size={14}/>}
                        </button>
                      </>
                    ) : 'No email on file'}
                  </dd>
                </div>
              </dl>

              {contact.email && !isCurrentUser(contact) && (
                <div className="qc-actions">
                  <a className="btn btn-primary btn-sm" href={`mailto:${contact.email}`}>
                    <Mail size={14}/> Email
                  </a>
                  <a className="btn btn-secondary btn-sm" href={buildTeamsChatUrl(contact.email)} aria-label={`Chat with ${contact.name} on Teams`}>
                    <TeamsLogo/> Teams chat
                  </a>
                </div>
              )}
            </article>
          ))}
          {filtered.length === 0 && (
            <Panel className="qc-empty">
              <Search size={22}/>
              <strong>{validContacts.length === 0 ? 'No HR contacts yet' : 'No contacts found'}</strong>
              <p>{validContacts.length === 0 ? 'No HR contacts were found in the employee directory.' : 'Try another name or department.'}</p>
            </Panel>
          )}
        </div>
      )}
    </>
  );
}
