import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  User, Settings, Flame,
  LogOut, ChevronRight, Zap, Shield,
  Copy, Check, X, Lock,
  AlertTriangle
} from 'lucide-react';
import Avatar from './Avatar';
import toast from 'react-hot-toast';

const STATS = [
  { label: 'Points', value: '1,250', color: '#818cf8' },
  { label: 'Awards', value: '2',     color: '#fbbf24' },
  { label: 'Kudos',  value: '3',     color: '#f472b6' },
  { label: 'Streak', value: '5d',    color: '#fb923c', icon: Flame },
];

/* ── Settings Modal ────────────────────────────────────────── */
function SettingsModal({ onClose }) {
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifKudos, setNotifKudos] = useState(true);

  const Toggle = ({ value, onChange, label, sub }) => (
    <div className="flex items-center justify-between py-2.5">
      <div>
        <p className="settings-toggle-label text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {sub && <p className="settings-toggle-sub text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
      </div>
      <button onClick={() => onChange(!value)}
        className="relative w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0"
        style={{ background: value ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(99,102,241,0.15)' }}>
        <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300"
          style={{ left: value ? '22px' : '2px' }} />
      </button>
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm animate-scale-in"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.8)', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Settings size={16} style={{ color: '#a5b4fc' }} />
            <h2 className="text-white font-black">Settings</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-3 space-y-1">
          <p className="settings-section-title text-[10px] font-black uppercase tracking-widest py-2" style={{ color: 'var(--text-muted)' }}>Notifications</p>
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <Toggle value={notifEmail} onChange={setNotifEmail} label="Email Notifications" sub="Receive HR updates via email" />
          </div>
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <Toggle value={notifPush} onChange={setNotifPush} label="In-App Notifications" sub="Badges and alert banners" />
          </div>
          <Toggle value={notifKudos} onChange={setNotifKudos} label="Kudos Alerts" sub="When someone recognizes you" />
        </div>

        <div className="px-5 py-4 border-t border-white/5 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
            Cancel
          </button>
          <button onClick={() => { toast.success('Settings saved!'); onClose(); }}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.35)' }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Privacy Modal ─────────────────────────────────────────── */
function PrivacyModal({ onClose }) {
  const [profileVisible, setProfileVisible] = useState(true);
  const [showInDirectory, setShowInDirectory] = useState(true);
  const [shareActivity, setShareActivity] = useState(false);

  const Toggle = ({ value, onChange, label, sub }) => (
    <div className="flex items-center justify-between py-2.5">
      <div className="min-w-0 flex-1 pr-4">
        <p className="text-white/75 text-sm font-medium">{label}</p>
        {sub && <p className="text-white/30 text-xs mt-0.5">{sub}</p>}
      </div>
      <button onClick={() => onChange(!value)}
        className="relative w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0"
        style={{ background: value ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(99,102,241,0.15)' }}>
        <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300"
          style={{ left: value ? '22px' : '2px' }} />
      </button>
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm animate-scale-in"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.8)', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Shield size={16} style={{ color: '#a78bfa' }} />
            <h2 className="text-white font-black">Privacy Settings</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-2 space-y-0">
          <p className="text-white/30 text-[10px] font-black uppercase tracking-widest py-3">Profile Visibility</p>
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <Toggle value={profileVisible} onChange={setProfileVisible} label="Public Profile" sub="Other employees can view your profile" />
          </div>
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <Toggle value={showInDirectory} onChange={setShowInDirectory} label="Show in Directory" sub="Appear in the employee directory search" />
          </div>
          <Toggle value={shareActivity} onChange={setShareActivity} label="Share Activity" sub="Show your kudos and achievements publicly" />
        </div>

        <div className="px-5 py-3 mx-5 mb-4 mt-2 rounded-2xl"
          style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <div className="flex items-start gap-2">
            <Lock size={13} style={{ color: '#a5b4fc', marginTop: 2, flexShrink: 0 }} />
            <p className="text-white/45 text-xs leading-relaxed">
              Your data is stored securely and never shared outside the organization. Pulse check-ins are always 100% anonymous.
            </p>
          </div>
        </div>

        <div className="px-5 pb-4 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
            Cancel
          </button>
          <button onClick={() => { toast.success('Privacy preferences saved!'); onClose(); }}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', boxShadow: '0 4px 16px rgba(139,92,246,0.35)' }}>
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Sign Out Confirmation ─────────────────────────────────── */
function SignOutModal({ onClose, onConfirm }) {
  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}>
      <div className="w-full max-w-xs animate-scale-in text-center"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 28, boxShadow: '0 32px 80px rgba(0,0,0,0.8)' }}
        onClick={e => e.stopPropagation()}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <AlertTriangle size={24} style={{ color: '#f87171' }} />
        </div>
        <h2 className="text-white font-black text-lg mb-2">Sign Out?</h2>
        <p className="text-white/45 text-sm leading-relaxed mb-6">
          You'll need to sign back in to access OfficeVerse. Your data and preferences are saved.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid var(--border-default)' }}>
            Stay
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #ef4444, #f43f5e)', boxShadow: '0 4px 16px rgba(239,68,68,0.35)' }}>
            Sign Out
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Main Component ────────────────────────────────────────── */
export default function ProfileMenu({ anchor = 'top' }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Dynamic user data from auth session
  const u = {
    name:   user?.name  || 'User',
    role:   user?.role  || '',
    dept:   user?.department || '',
    email:  user?.email || '',
    photo:  user?.photo || '',
    avatar: user?.avatar || user?.name?.split(' ').map(n => n[0]).join('').slice(0,2) || 'U',
    color:  user?.color || '#6366f1',
    id:     user?.id    || 'emp001',
    points: user?.points || 0,
    roles:  user?.keycloakRoles || [],
    isAdmin: user?.keycloakRoles?.includes('hr-admin'),
  };

  const computePos = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuW = 300, menuH = 520;
    if (anchor === 'top') {
      const left = Math.min(rect.right - menuW, window.innerWidth - menuW - 12);
      setMenuPos({ top: rect.bottom + 8, left: Math.max(left, 8) });
    } else {
      const top = Math.max(rect.bottom - menuH, 12);
      setMenuPos({ top, left: rect.right + 8 });
    }
  };

  const handleOpen = () => { computePos(); setOpen(o => !o); };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) &&
          triggerRef.current && !triggerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => { window.removeEventListener('resize', close); window.removeEventListener('scroll', close, true); };
  }, [open]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(u.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Action handler: every item now has a defined action ── */
  const handleAction = (action, link) => {
    setOpen(false);
    switch (action) {
      case 'my-profile':
        navigate('/directory', { state: { openProfile: u.id } });
        break;
      case 'my-achievements':
        navigate('/spotlight', { state: { filterEmployee: u.id, employeeName: u.name } });
        break;
      case 'my-kudos':
        navigate('/kudos', { state: { filterTo: u.id } });
        break;
      case 'my-leaves':
        navigate('/leaves');
        break;
      case 'my-journey':
        navigate('/journey');
        break;
      case 'admin':
        navigate('/admin');
        break;
      case 'notifications':
        navigate('/announcements');
        toast('Opening announcements & notifications…');
        break;
      case 'privacy':
        setTimeout(() => setShowPrivacy(true), 100);
        break;
      case 'settings':
        setTimeout(() => setShowSettings(true), 100);
        break;
      case 'signout':
        setTimeout(() => setShowSignOut(true), 100);
        return; // don't close menu yet, SignOutModal handles it
      default:
        if (link) navigate(link);
    }
  };

  const MENU_ITEMS = [
    {
      group: 'My Space',
      items: [
        { icon: User, label: 'My Profile', sub: 'View your profile card', color: '#6366f1', action: 'my-profile' },
        ...(u.isAdmin ? [{ icon: Shield, label: 'HR Admin Portal', sub: 'Manage HR operations', color: '#f97316', action: 'admin' }] : []),
      ],
    },
    {
      group: 'Preferences',
      items: [
        { icon: Shield, label: 'Privacy', sub: 'Manage your data', color: '#8b5cf6', action: 'privacy' },
      ],
    },
  ];

  const dropdown = open && createPortal(
    <div ref={menuRef} className="animate-scale-in"
      style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, width: 300, zIndex: 9999,
        background: 'var(--bg-surface)', backdropFilter: 'blur(24px)',
        border: '1px solid var(--border-default)', borderRadius: 20,
        boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(99,102,241,0.1)', overflow: 'hidden' }}>

      {/* Profile Header */}
      <div className="p-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08))' }}>
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent)', filter: 'blur(20px)' }} />
          <div className="relative z-10 flex items-start gap-3">
            <Avatar photo={u.photo} initials={u.avatar} color={u.color} size="lg" online ring />
            <div className="flex-1 min-w-0">
              <p className="text-white font-black text-base leading-tight">{u.name}</p>
              <p className="text-white/50 text-xs mt-0.5">{u.role}</p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="badge text-[10px] font-bold" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }}>● Active</span>
                <span className="badge text-[10px] font-bold" style={{ background: `${u.color}15`, color: u.color, border: `1px solid ${u.color}20` }}>{u.dept}</span>
                {u.isAdmin && <span className="badge text-[10px] font-black" style={{ background: 'rgba(249,115,22,0.15)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.3)' }}>hr-admin</span>}
              </div>
              <button onClick={handleCopyEmail} className="flex items-center gap-1 mt-1.5 text-white/30 hover:text-white/60 transition-colors group">
                <span className="text-[11px] truncate">{u.email}</span>
                {copied ? <Check size={11} className="text-emerald-400 flex-shrink-0" /> : <Copy size={11} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />}
              </button>
            </div>
          </div>
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {STATS.map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <p className="font-black text-sm flex items-center gap-0.5" style={{ color }}>
                {value}{Icon && <Icon size={11} className="fill-current" />}
              </p>
              <p className="text-white/25 text-[10px]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Menu items */}
      <div className="py-1.5">
        {MENU_ITEMS.map(({ group, items }) => (
          <div key={group}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 px-4 py-2">{group}</p>
            {items.map(({ icon: Icon, label, sub, color, action }) => (
              <button key={label} onClick={() => handleAction(action)}
                className="w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-150 group text-left"
                onMouseEnter={e => e.currentTarget.style.background = `${color}0d`}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}15`, border: `1px solid ${color}20` }}>
                  <Icon size={14} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm font-semibold group-hover:text-white transition-colors">{label}</p>
                  <p className="text-white/30 text-xs">{sub}</p>
                </div>
                <ChevronRight size={13} className="text-white/15 group-hover:text-white/40 transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="profilemenu-footer-border px-4 py-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => handleAction('settings')}
          className="profilemenu-settings-btn flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}>
          <Settings size={13} /> Settings
        </button>
        <button onClick={() => handleAction('signout')}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{ background: 'rgba(239,68,68,0.08)', color: 'rgba(239,68,68,0.75)', border: '1px solid rgba(239,68,68,0.18)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#f87171'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = 'rgba(239,68,68,0.75)'; }}>
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </div>,
    document.body
  );

  return (
    <div className="relative">
      <button ref={triggerRef} onClick={handleOpen}
        className="transition-all hover:scale-105 active:scale-95 block"
        style={{ borderRadius: anchor === 'top' ? '10px' : '12px' }}>
        <Avatar photo={u.photo} initials={u.avatar} color={u.color} size="sm" online />
      </button>
      {dropdown}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
      {showSignOut && (
        <SignOutModal
          onClose={() => setShowSignOut(false)}
          onConfirm={() => {
            logout();
            navigate('/login');
          }}
        />
      )}
    </div>
  );
}
