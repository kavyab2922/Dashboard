import { useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Trophy, PartyPopper, BookOpen,
  Megaphone, Heart, Users, MessageSquare, BarChart3,
  CalendarCheck, Zap, ChevronRight, Sparkles, Activity, MapPin, Briefcase, Map, Shield, Gamepad2
} from 'lucide-react';
import Avatar from '../common/Avatar';
import ProfileMenu from '../common/ProfileMenu';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const navItems = [
  { path: '/',             icon: LayoutDashboard, label: 'Dashboard',    exact: true, color: '#6366f1' },
  { path: '/spotlight',    icon: Trophy,           label: 'Spotlight',    badge: 'New', color: '#f59e0b' },
  { path: '/celebrations', icon: PartyPopper,      label: 'Celebrations', color: '#ec4899' },
  { path: '/announcements',icon: Megaphone,        label: 'Announcements',color: '#3b82f6' },
  { path: '/policies',     icon: BookOpen,         label: 'Policy Hub',   color: '#8b5cf6' },
  { path: '/kudos',        icon: Heart,            label: 'Kudos Wall',   color: '#f43f5e' },
  { path: '/directory',    icon: Users,            label: 'Directory',    color: '#06b6d4' },
  { path: '/leaves',       icon: CalendarCheck,    label: 'Leave Tracker',color: '#10b981' },
  { path: '/feedback',     icon: MessageSquare,    label: 'Feedback',     color: '#a78bfa' },
  { path: '/analytics',    icon: BarChart3,        label: 'Analytics',    color: '#34d399' },
  { path: '/pulse',        icon: Activity,        label: 'Team Pulse',   badge: 'Live', color: '#818cf8' },
  { path: '/whos-in',      icon: MapPin,           label: "Who's In?",    color: '#10b981' },
  { path: '/projects',     icon: Briefcase,        label: 'Projects',     color: '#a78bfa' },
  { path: '/fun-friday',   icon: Gamepad2,         label: 'Fun Friday',   color: '#ec4899', badge: 'Play' },
  { path: '/journey',      icon: Map,              label: 'Journey',      color: '#f472b6' },
  { path: '/ask-hr',       icon: MessageSquare,    label: 'Ask HR',       badge: 'AI', color: '#34d399' },
];

/* ── Tooltip for collapsed state ──────────────────────────── */
function NavTooltip({ label, color, visible }) {
  return (
    <div
      className="absolute left-full ml-3 px-3 py-1.5 rounded-xl text-sm font-semibold text-white whitespace-nowrap pointer-events-none z-50"
      style={{
        background: 'rgba(12,10,30,0.97)',
        border: `1px solid ${color}30`,
        boxShadow: `0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-6px)',
        transition: 'opacity 0.15s ease, transform 0.15s ease',
        top: '50%',
        marginTop: '-16px',
      }}
    >
      {label}
      {/* Arrow */}
      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent"
        style={{ borderRightColor: `${color}30` }} />
    </div>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const [expanded, setExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const hoverTimeout = useRef(null);
  const { user } = useAuth();
  const { isDark } = useTheme();
  const isAdmin = user?.keycloakRoles?.includes('hr-admin');
  const userInitials = user?.avatar || user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U';
  const userColor = user?.color || '#6366f1';
  const textMuted   = isDark ? 'rgba(255,255,255,0.4)' : '#64748b';
  const textPrimary = isDark ? 'rgba(255,255,255,0.85)' : '#1e293b';
  const textAccent  = isDark ? 'rgba(139,92,246,0.7)'   : '#6366f1';

  // Dynamically add admin link for hr-admin users
  const items = isAdmin
    ? [...navItems, { path: '/admin', icon: Shield, label: 'HR Admin', color: '#f97316', badge: 'Admin' }]
    : navItems;

  const iconInactiveColor = isDark ? 'rgba(255,255,255,0.45)' : '#64748b';
  const iconBgInactive    = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.06)';

  const handleMouseEnter = () => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setExpanded(true), 60);
  };
  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setExpanded(false), 120);
  };

  /* Width: collapsed = 64px, expanded = 260px */
  const W_COLLAPSED = 64;
  const W_EXPANDED  = 260;
  const w = expanded ? W_EXPANDED : W_COLLAPSED;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-20 lg:hidden" onClick={onClose} />
      )}

      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          fixed top-0 left-0 h-full z-30 flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          width: `${w}px`,
          transition: 'width 0.28s cubic-bezier(0.16,1,0.3,1), transform 0.3s ease',
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--border-default)',
          overflow: 'hidden',
          willChange: 'width',
        }}
      >
        {/* ── Logo ────────────────────────────────────────── */}
        <div className="flex items-center flex-shrink-0"
          style={{ padding: '14px 14px', height: 65, gap: 12, overflow: 'hidden', borderBottom: '1px solid var(--border-default)', background: 'var(--bg-surface)' }}>

          {/* Logo mark — orbit rings + core dot — also acts as tooltip when collapsed */}
          <div className="relative flex-shrink-0 group/logo" style={{ width: 36, height: 36, minWidth: 36 }}>
            {/* Outer orbit ring */}
            <div className="absolute inset-0 rounded-full animate-spin-slow"
              style={{
                background: 'transparent',
                border: '1.5px solid rgba(139,92,246,0.5)',
                borderTopColor: 'rgba(99,102,241,0.9)',
                borderRadius: '50%',
              }} />
            {/* Inner orbit ring */}
            <div className="absolute rounded-full"
              style={{
                inset: 5,
                border: '1.5px solid rgba(236,72,153,0.4)',
                borderBottomColor: 'rgba(236,72,153,0.9)',
                borderRadius: '50%',
                animation: 'spin-slow 5s linear infinite reverse',
              }} />
            {/* Core */}
            <div className="absolute rounded-full flex items-center justify-center"
              style={{
                inset: 9,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 0 12px rgba(99,102,241,0.8)',
              }}>
              <div className="w-2 h-2 rounded-full bg-white" style={{ boxShadow: '0 0 6px white' }} />
            </div>
          </div>

          {/* Tooltip when collapsed */}
          {!expanded && (
            <div className="absolute left-full ml-3 px-3 py-2 rounded-xl pointer-events-none z-50 whitespace-nowrap"
              style={{
                background: 'rgba(10,8,24,0.97)',
                border: '1px solid rgba(139,92,246,0.3)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                top: '50%', marginTop: '-22px',
                opacity: 0,
                transition: 'opacity 0.15s ease',
              }}
              ref={el => {
                if (el) el.parentElement.addEventListener('mouseenter', () => el.style.opacity = 1);
                if (el) el.parentElement.addEventListener('mouseleave', () => el.style.opacity = 0);
              }}
            >
              <p className="font-black text-sm" style={{ background: 'linear-gradient(135deg, #a5b4fc, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                OfficeVerse
              </p>
              <p className="text-white/30 text-xs">Your Digital Workplace Universe</p>
            </div>
          )}

          {/* Brand name */}
          <div style={{
            opacity: expanded ? 1 : 0,
            transform: expanded ? 'translateX(0)' : 'translateX(-6px)',
            transition: 'opacity 0.2s ease 0.05s, transform 0.2s ease 0.05s',
            overflow: 'hidden',
            minWidth: 0,
            flex: 1,
          }}>
            <h1 className="font-black text-base leading-none tracking-tight truncate"
              style={{ background: 'linear-gradient(135deg, #a5b4fc, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              OfficeVerse
            </h1>
            <p className="text-xs mt-1 font-medium truncate" style={{ color: 'rgba(139,92,246,0.6)' }}>
              Digital Workplace Universe
            </p>
          </div>
        </div>

        {/* ── Nav ─────────────────────────────────────────── */}
        <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden"
          style={{ padding: '12px 8px' }}>

          {items.map(({ path, icon: Icon, label, badge, exact, color }) => (
            <NavLink
              key={path}
              to={path}
              end={exact}
              onClick={onClose}
              onMouseEnter={() => setHoveredItem(path)}
              onMouseLeave={() => setHoveredItem(null)}
              className={({ isActive }) => `
                relative flex items-center rounded-2xl text-sm font-medium
                transition-colors duration-150 group
                ${isActive ? '' : ''}
              `}
              style={({ isActive }) => ({
                padding: '10px',
                gap: 10,
                color: isActive ? (isDark ? 'white' : color) : textMuted,
                background: isActive
                  ? `linear-gradient(135deg, ${color}20, ${color}0a)`
                  : 'transparent',
                border: isActive ? `1px solid ${color}25` : '1px solid transparent',
                boxShadow: isActive ? `0 4px 16px ${color}15` : 'none',
              })}
            >
              {({ isActive }) => (
                <>
                  {/* Icon container */}
                  <div className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 32, height: 32,
                      borderRadius: 12,
                      background: isActive ? `${color}20` : iconBgInactive,
                      boxShadow: isActive ? `0 0 16px ${color}35` : 'none',
                      transition: 'all 0.2s ease',
                      minWidth: 32,
                    }}>
                    <Icon size={16} style={{ color: isActive ? color : iconInactiveColor }} />
                  </div>

                  {/* Label + badge */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6, flex: 1,
                    opacity: expanded ? 1 : 0,
                    transform: expanded ? 'translateX(0)' : 'translateX(-4px)',
                    transition: 'opacity 0.18s ease 0.06s, transform 0.18s ease 0.06s',
                    whiteSpace: 'nowrap', overflow: 'hidden',
                  }}>
                    <span style={{ color: isActive ? (isDark ? 'white' : color) : undefined, flex: 1 }}>{label}</span>
                    {badge && !isActive && (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: `${color}20`, color }}>
                        {badge}
                      </span>
                    )}
                    {isActive && (
                      <ChevronRight size={12} style={{ color: `${color}70`, flexShrink: 0 }} />
                    )}
                  </div>

                  {/* Active glow sweep */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-20"
                      style={{ background: `radial-gradient(ellipse at 0% 50%, ${color}, transparent 70%)` }} />
                  )}

                  {/* Tooltip (only when collapsed) */}
                  {!expanded && (
                    <NavTooltip label={label} color={color} visible={hoveredItem === path} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── User Card ────────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-white/5 relative" style={{ padding: 8 }}>
          <div className="flex items-center rounded-2xl hover:bg-white/5 transition-colors"
            style={{ padding: '10px', gap: 10 }}>
            {/* Profile menu trigger (always visible) */}
            <div className="flex-shrink-0" style={{ minWidth: 32 }}>
              <ProfileMenu anchor="bottom" />
            </div>

            {/* Name + role (visible only when expanded) */}
            <div style={{
              opacity: expanded ? 1 : 0,
              transform: expanded ? 'translateX(0)' : 'translateX(-4px)',
              transition: 'opacity 0.18s ease 0.06s, transform 0.18s ease 0.06s',
              whiteSpace: 'nowrap', overflow: 'hidden', flex: 1,
              pointerEvents: 'none',
            }}>
              <p className="text-sm font-semibold" style={{ color: textPrimary }}>{user?.name || 'User'}</p>
              <p className="text-xs" style={{ color: textAccent }}>
                {user?.role?.split(' ').slice(0, 2).join(' ') || 'Employee'} · {(user?.points || 0).toLocaleString()} pts
              </p>
            </div>

            <Sparkles size={13} style={{
              color: '#818cf8',
              opacity: expanded ? 0.6 : 0,
              transition: 'opacity 0.15s ease',
              flexShrink: 0,
              pointerEvents: 'none',
            }} />
          </div>
        </div>
      </aside>
    </>
  );
}
