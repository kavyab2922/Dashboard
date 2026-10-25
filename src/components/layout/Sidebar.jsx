import { NavLink } from 'react-router-dom';
import { Activity, Award, BookOpen, CalendarDays, ChevronLeft, CircleHelp, Compass, Gamepad2, Gift, HeartHandshake, Home, LayoutGrid, LifeBuoy, Link2, Megaphone, Settings, ShieldCheck, Users, X } from 'lucide-react';
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

export default function Sidebar({ open, onClose, collapsed, onToggle, onHoverExpand }) {
  const { announcements } = useApp();
  const unreadAnnouncements = announcements.filter((item) => !item.read).length;
  const navGroups = navigation.map((group) => ({
    ...group,
    items: group.items.map((item) => item.to === '/announcements' && unreadAnnouncements > 0 ? { ...item, badge: String(unreadAnnouncements) } : item),
  }));
  return <><div className={`sidebar-scrim ${open ? 'visible' : ''}`} onClick={onClose} aria-hidden="true" /><aside className={`sidebar ${open ? 'sidebar-open' : ''} ${collapsed ? 'sidebar-collapsed' : ''}`} onMouseEnter={onHoverExpand}>
    {/* <div className="workspace-switch"><div className="workspace-dot">H</div>{!collapsed && <><div><strong>HROrbit workspace</strong><small>Employee experience</small></div><ChevronLeft size={15} className="workspace-chevron" /></>}</div> */}
    <nav className="sidebar-nav" aria-label="Main navigation">{navGroups.map((group) => <div className="nav-group" key={group.label}><span className="nav-group-title">{!collapsed ? group.label : '—'}</span>{group.items.map(({ to, label, icon: Icon, badge, pill }) => <NavLink end={to === '/'} to={to} key={to} onClick={onClose} title={collapsed ? label : undefined} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><Icon size={18} strokeWidth={1.8} /><span className="nav-label">{label}</span>{badge && <span className="nav-badge">{badge}</span>}{pill && <span className="nav-pill">{pill}</span>}</NavLink>)}</div>)}</nav>
    <div className="sidebar-bottom">{!collapsed && <div className="help-card"><div className="help-card-icon"><HeartHandshake size={18} /></div><strong>Need a hand?</strong><p>Your people team is here for you.</p><NavLink to="/hr-contacts" onClick={onClose}>Connect with HR <span>↗</span></NavLink></div>}<button className="collapse-button" onClick={onToggle}><ChevronLeft size={17} className={collapsed ? 'rotate-180' : ''} /><span>{!collapsed && 'Collapse sidebar'}</span></button></div>
    </aside></>;
}