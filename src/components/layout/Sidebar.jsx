import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Award, BookOpen, CalendarDays, ChevronLeft, CircleHelp, Compass, Gamepad2, HeartHandshake, Home, LifeBuoy, Link2, Megaphone, Pin, Settings, ShieldCheck, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const navigation = [
  { label: 'Workspace', items: [
    { to: '/', label: 'Dashboard', icon: Home },
    { to: '/announcements', label: 'Announcements', icon: Megaphone },
    { to: '/events', label: 'Upcoming events', icon: CalendarDays },
    { to: '/quick-links', label: 'Quick links', icon: Link2 },
  ]},
  { label: 'People & growth', items: [
    { to: '/hr-contacts', label: 'Quick Connect', icon: LifeBuoy },
    { to: '/faq', label: 'HR FAQ assistant', icon: CircleHelp },
    { to: '/games', label: 'Daily games', icon: Gamepad2, pill: 'Daily' },
    { to: '/learning', label: 'Learning hub', icon: BookOpen },
    { to: '/recognition', label: 'Kudos & recognition', icon: Award },
    { to: '/community', label: 'Employee community', icon: Users },
  ]},
  { label: 'Personal', items: [
    { to: '/profile', label: 'My profile', icon: Compass },
    { to: '/settings', label: 'Settings', icon: Settings },
  ]},
];

// Admin entry is only offered when the backend granted HR Admin access.
const hrNavigation = { label: 'Administration', items: [
  { to: '/admin', label: 'Admin console', icon: ShieldCheck },
]};

export default function Sidebar({ open, onClose, collapsed, pinned, onPinToggle, onToggle, onAutoCollapse }) {
  const [hovered, setHovered] = useState(false);
  const { announcements, isHrAdmin } = useApp();
  const unreadAnnouncements = announcements.filter((item) => !item.read).length;
  const navGroups = [...navigation, ...(isHrAdmin ? [hrNavigation] : [])].map((group) => ({
    ...group,
    items: group.items.map((item) => item.to === '/announcements' && unreadAnnouncements > 0 ? { ...item, badge: String(unreadAnnouncements) } : item),
  }));
  const hoverExpanded = !pinned && collapsed && hovered;
  const expanded = pinned || !collapsed || hoverExpanded;
  const stateClass = expanded ? 'sidebar-expanded' : 'sidebar-collapsed';

  return <><div className={`sidebar-scrim ${open ? 'visible' : ''}`} onClick={onClose} aria-hidden="true" /><aside className={`sidebar ${open ? 'sidebar-open' : ''} ${stateClass}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => { setHovered(false); if (!pinned) onAutoCollapse?.(); }}>
    <div className="sidebar-header"><button type="button" className={`sidebar-pin-button ${pinned ? 'active' : ''}`} onClick={(event) => { event.stopPropagation(); onPinToggle(); }} aria-pressed={pinned} aria-label={pinned ? 'Unpin sidebar' : 'Pin sidebar'} title={pinned ? 'Unpin sidebar' : 'Pin sidebar'}><Pin size={16} aria-hidden="true" /></button></div>
    <nav className="sidebar-nav" aria-label="Main navigation">{navGroups.map((group) => <div className="nav-group" key={group.label}><span className="nav-group-title">{expanded ? group.label : '—'}</span>{group.items.map(({ to, label, icon: Icon, badge, pill }) => <NavLink end={to === '/'} to={to} key={to} onClick={() => { onClose(); if (to === '/announcements') { sessionStorage.setItem('hrobit-announcement-force-feed', 'true'); sessionStorage.removeItem('hrobit-announcement-manage-open'); window.dispatchEvent(new Event('hrobit:show-announcements-feed')); } if (to === '/events') { sessionStorage.removeItem('hrobit-event-manage-open'); window.dispatchEvent(new Event('hrobit:show-events-list')); } }} title={!expanded ? label : undefined} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><Icon size={18} strokeWidth={1.8} /><span className="nav-label">{label}</span>{badge && <span className="nav-badge">{badge}</span>}{pill && <span className="nav-pill">{pill}</span>}</NavLink>)}</div>)}</nav>
    <div className="sidebar-bottom">{expanded && <div className="help-card"><div className="help-card-icon"><HeartHandshake size={18} /></div><strong>Need a hand?</strong><p>Your people team is here for you.</p><NavLink to="/hr-contacts" onClick={onClose}>Connect with HR <span>↗</span></NavLink></div>}<button type="button" className="collapse-button" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}><ChevronLeft size={17} className={collapsed ? 'rotate-180' : ''} /><span>{expanded && (collapsed ? 'Expand sidebar' : 'Collapse sidebar')}</span></button></div>
    </aside></>;
}