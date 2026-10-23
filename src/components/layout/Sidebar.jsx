import { NavLink } from 'react-router-dom';
import {
  Award,
  BookOpen,
  CalendarDays,
  CircleHelp,
  Compass,
  Gamepad2,
  Home,
  LifeBuoy,
  Link2,
  Megaphone,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const navigation = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/events', label: 'Upcoming events', icon: CalendarDays },
  { to: '/quick-links', label: 'Quick links', icon: Link2 },
  { to: '/hr-contacts', label: 'Quick Connect', icon: LifeBuoy },
  { to: '/faq', label: 'HR FAQ assistant', icon: CircleHelp },
  { to: '/games', label: 'Daily games', icon: Gamepad2 },
  { to: '/learning', label: 'Learning hub', icon: BookOpen },
  { to: '/recognition', label: 'Kudos + recognition', icon: Award },
  { to: '/community', label: 'Employee community', icon: Users },
  { to: '/profile', label: 'My profile', icon: Compass },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/admin', label: 'Admin', icon: ShieldCheck },
];

export default function Sidebar({ open, onClose }) {
  const { announcements } = useApp();
  const unreadAnnouncements = announcements.filter((a) => !a.read).length;

  return (
    <>
      <div className={`sidebar-scrim ${open ? 'visible' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              end={to === '/'}
              to={to}
              key={to}
              onClick={onClose}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span className="nav-label">{label}</span>
              {to === '/announcements' && unreadAnnouncements > 0 && (
                <span className="nav-badge">{unreadAnnouncements}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
