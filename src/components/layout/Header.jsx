import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Menu, Search, Sparkles, Command,
  LayoutDashboard, Trophy, PartyPopper, Megaphone,
  BookOpen, Heart, Users, CalendarCheck,
  MessageSquare, BarChart3, Activity, MapPin, Briefcase, Map, Bot, Shield, Gamepad2,
  Sun, Moon
} from 'lucide-react';
import Avatar from '../common/Avatar';
import NotificationCenter from '../common/NotificationCenter';
import GlobalSearch from '../common/GlobalSearch';
import ProfileMenu from '../common/ProfileMenu';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const routeMeta = {
  '/':             { label: 'Dashboard',         Icon: LayoutDashboard, color: '#6366f1', sub: "Welcome back, Arjun! Here's your workspace." },
  '/spotlight':    { label: 'Employee Spotlight', Icon: Trophy,          color: '#f59e0b', sub: 'Recognizing outstanding achievements.' },
  '/celebrations': { label: 'Celebrations',       Icon: PartyPopper,     color: '#ec4899', sub: 'Birthdays, anniversaries & milestones.' },
  '/announcements':{ label: 'Announcements',      Icon: Megaphone,       color: '#3b82f6', sub: 'Stay in the loop with company updates.' },
  '/policies':     { label: 'Policy Hub',         Icon: BookOpen,        color: '#8b5cf6', sub: 'Everything you need, organized and searchable.' },
  '/kudos':        { label: 'Kudos Wall',         Icon: Heart,           color: '#f43f5e', sub: 'Spread appreciation across the team.' },
  '/directory':    { label: 'Directory',          Icon: Users,           color: '#06b6d4', sub: 'Find and connect with your colleagues.' },
  '/leaves':       { label: 'Leave Tracker',      Icon: CalendarCheck,   color: '#10b981', sub: 'Manage and track your time-off.' },
  '/feedback':     { label: 'Feedback',           Icon: MessageSquare,   color: '#a78bfa', sub: 'Your voice shapes our workplace.' },
  '/analytics':    { label: 'Analytics',          Icon: BarChart3,       color: '#34d399', sub: 'Culture metrics and engagement insights.' },
  '/projects':     { label: 'Projects & Teams',   Icon: Briefcase,       color: '#a78bfa', sub: 'See who is working on what.' },
  '/admin':        { label: 'HR Admin Portal',    Icon: Shield,          color: '#f97316', sub: 'Manage announcements, leaves, achievements & feedback.' },
  '/whos-in':      { label: "Who's In Today?",    Icon: MapPin,          color: '#10b981', sub: 'Live office attendance board.' },
  '/fun-friday':   { label: 'Fun Friday',          Icon: Gamepad2,        color: '#ec4899', sub: 'Vote for games, suggest ideas & see past winners.' },
  '/journey':      { label: 'Employee Journey',   Icon: Map,             color: '#f472b6', sub: 'Every career has a story. This is where we tell it.' },
  '/ask-hr':       { label: 'Ask HR',             Icon: Bot,             color: '#34d399', sub: 'Instant answers to all your HR questions.' },
};

export default function Header({ onMenuToggle }) {
  const location = useLocation();
  const { user } = useAuth();
  const { theme, toggle, isDark } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const meta = routeMeta[location.pathname] || routeMeta['/'];
  const { Icon, color, label, sub } = meta;
  const textPrimary   = isDark ? 'white'                 : '#1e293b';
  const textSecondary = isDark ? 'rgba(255,255,255,0.35)' : '#475569';

  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-10 px-5 py-3"
        style={{ background: 'var(--header-bg)', backdropFilter: 'blur(24px)', borderBottom: '1px solid var(--border-default)' }}>
        <div className="flex items-center justify-between gap-4">

          {/* Left — Page Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-xl transition-all hover:bg-white/8 text-white/50 hover:text-white flex-shrink-0">
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-3 min-w-0">
              {/* Page icon pill */}
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 hidden sm:flex"
                style={{
                  background: `${color}18`,
                  border: `1px solid ${color}30`,
                  boxShadow: `0 0 16px ${color}20`,
                }}>
                <Icon size={17} style={{ color }} />
              </div>

              <div className="min-w-0">
                <h2 className="font-bold text-lg leading-tight tracking-tight truncate" style={{ color: textPrimary }}>
                  {label}
                </h2>
                <p className="text-xs mt-0.5 hidden sm:block truncate" style={{ color: textSecondary }}>
                  {sub}
                </p>
              </div>
            </div>
          </div>

          {/* Right — Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Search trigger */}
            <button onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 py-2 rounded-xl transition-all text-white/40 hover:text-white/70 hover:bg-white/5 border border-white/5 hover:border-white/12 px-2 sm:pl-3 sm:pr-2">
              <Search size={15} />
              <span className="text-xs hidden sm:block" style={{ minWidth: '110px' }}>Search everything…</span>
              <div className="hidden md:flex items-center gap-0.5">
                <kbd className="flex items-center px-1.5 py-0.5 rounded text-white/20 text-[10px] border border-white/10 font-mono">
                  <Command size={9} />
                </kbd>
                <kbd className="px-1.5 py-0.5 rounded text-white/20 text-[10px] border border-white/10 font-mono">K</kbd>
              </div>
            </button>

            <NotificationCenter />

            {/* Theme toggle */}
            <button onClick={toggle}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-xl transition-all hover:scale-110 active:scale-95 flex-shrink-0"
              style={{
                background: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(245,158,11,0.12)',
                border: isDark ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(245,158,11,0.25)',
              }}>
              <span style={{ fontSize: 16 }}>{isDark ? <Sun size={16} style={{ color: '#fbbf24' }} /> : <Moon size={16} style={{ color: '#818cf8' }} />}</span>
            </button>

            {/* Points chip */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
              <Sparkles size={12} />
              {(user?.points || 0).toLocaleString()} pts
            </div>

            <ProfileMenu anchor="top" />
          </div>
        </div>
      </header>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
