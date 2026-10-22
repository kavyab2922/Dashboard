import { useMemo, useState } from 'react';
import { Bell, ChevronDown, Command, Menu, Moon, Search, Sun, X, CheckCheck, Megaphone, CalendarDays, Award, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Avatar, Button } from '../common/UI';

export default function Header({ pageTitle, onMenuClick }) {
  const { theme, setTheme, role, setRole, announcements, events, quickLinks, contacts, courses, notifications, markRead, markAllRead, setToast } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const unread = notifications.filter((item) => !item.read).length;
  const results = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    const all = [
      ...announcements.map((item) => ({ title: item.title, subtitle: 'Announcement', to: '/announcements' })),
      ...events.map((item) => ({ title: item.title, subtitle: 'Event', to: '/events' })),
      ...quickLinks.map((item) => ({ title: item.title, subtitle: 'Quick link', to: '/quick-links' })),
      ...contacts.map((item) => ({ title: item.name, subtitle: item.team, to: '/hr-contacts' })),
      ...courses.map((item) => ({ title: item.title, subtitle: item.provider, to: '/learning' })),
    ];
    return all.filter((item) => `${item.title} ${item.subtitle}`.toLowerCase().includes(query)).slice(0, 7);
  }, [search, announcements, events, quickLinks, contacts, courses]);
  const goResult = (to) => { navigate(to); setSearch(''); setSearchOpen(false); };

  return <header className="topbar"><button className="mobile-menu icon-button" aria-label="Open navigation" onClick={onMenuClick}><Menu size={20} /></button><div className="topbar-title"><span className="topbar-kicker">YOUR WORKPLACE, CONNECTED</span><h1>{pageTitle || 'Dashboard'}</h1></div>
    <div className="topbar-tools"><div className={`global-search-wrap ${searchOpen ? 'searching' : ''}`}><Search size={17} /><input aria-label="Search HROrbit" value={search} onFocus={() => { setSearchOpen(true); setNotifOpen(false); setProfileOpen(false); }} onChange={(event) => setSearch(event.target.value)} placeholder="Search anything..." onKeyDown={(event) => { if (event.key === 'Escape') { setSearchOpen(false); setSearch(''); } if (event.key === 'Enter' && results[0]) goResult(results[0].to); }} /><kbd><Command size={10} /> K</kbd>{searchOpen && <><button className="search-dismiss" aria-label="Close search" onClick={() => { setSearchOpen(false); setSearch(''); }}><X size={14} /></button><div className="search-results">{search.trim() ? results.length ? results.map((item, index) => <button className="search-result" key={`${item.title}-${index}`} onClick={() => goResult(item.to)}><span className="search-result-icon"><Search size={14} /></span><span><strong>{item.title}</strong><small>{item.subtitle}</small></span><ArrowUpRight size={14} /></button>) : <div className="search-no-results">No matches found. Try another keyword.</div> : <div className="search-tip">Search announcements, events, people, links and learning resources.</div>}</div></>}</div>
      <div className="topbar-popover-wrap"><button className={`icon-button notification-button ${notifOpen ? 'active' : ''}`} aria-label={`Notifications, ${unread} unread`} onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); setSearchOpen(false); }}><Bell size={19} />{unread > 0 && <i>{unread}</i>}</button>{notifOpen && <div className="popover-panel notification-panel"><div className="popover-header"><div><strong>Notifications</strong><small>{unread} unread updates</small></div><button className="text-link" onClick={markAllRead}><CheckCheck size={14} /> Mark all read</button></div>{notifications.length ? notifications.map((item) => <button key={item.id} className={`notification-row ${!item.read ? 'unread' : ''}`} onClick={() => { markRead(item.id); setNotifOpen(false); navigate(item.type === 'event' ? '/events' : item.type === 'kudos' ? '/recognition' : '/announcements'); }}><span className={`notification-symbol ${item.type}`}>{item.type === 'event' ? <CalendarDays size={16} /> : item.type === 'kudos' ? <Award size={16} /> : <Megaphone size={16} />}</span><span><strong>{item.title}</strong><small>{item.detail}</small><em>{item.time}</em></span>{!item.read && <span className="unread-dot" />}</button>) : <div className="search-no-results">You're all caught up.</div>}<button className="popover-footer" onClick={() => { setNotifOpen(false); setToast('You are viewing the latest demo notifications.'); }}>You're all caught up <span>✓</span></button></div>}</div>
      <button className="icon-button theme-button" aria-label="Toggle theme" title="Toggle theme" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
      <div className="topbar-popover-wrap"><button className="profile-trigger" onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); setSearchOpen(false); }}><Avatar name="B Kavya" initials="AS" color="coral" /><span className="profile-trigger-copy"><strong>B Kavya</strong><small>{role} · Demo</small></span><ChevronDown size={15} /></button>{profileOpen && <div className="popover-panel profile-menu"><div className="profile-menu-top"><Avatar name="B Kavya" initials="AS" color="coral" size="lg"/><div><strong>B Kavya</strong><small>Product Design · Demo profile</small></div></div><button onClick={() => { navigate('/profile'); setProfileOpen(false); }}>My profile <ArrowUpRight size={14} /></button><div className="role-switch"><label htmlFor="demo-role">Demo view</label><select id="demo-role" value={role} onChange={(event) => { setRole(event.target.value); setProfileOpen(false); setToast(`Switched to ${event.target.value} demo view.`); }}><option>Employee</option><option>HR Admin</option></select></div><small className="demo-warning">Demo roles are not security controls.</small></div>}</div>
    </div></header>;
}