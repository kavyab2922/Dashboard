import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, Users, Trophy, BookOpen, Megaphone, Heart, ArrowRight, Clock, Zap, Command,
  LayoutDashboard, PartyPopper, CalendarCheck, MessageSquare, BarChart3,
  Activity, MapPin, Briefcase, Map, Bot, Shield, Gamepad2,
  Star, Sparkles, Award, TrendingUp, CheckCircle
} from 'lucide-react';
import { employeesAPI, achievementsAPI, policiesAPI, announcementsAPI, kudosAPI } from '../../services/api';
import Avatar from './Avatar';

const BADGE_ICON_MAP = {
  'Trophy': Trophy, 'Star': Star, 'Sparkles': Sparkles, 'Award': Award,
  'Rocket': Zap, 'Diamond': Star, 'Heart': Heart, 'Shield': CheckCircle,
  'Hero': CheckCircle, 'Innovator': Zap, 'Insights': Activity,
  'Culture': Heart, 'Impact': TrendingUp, 'Rising Star': Star, 'Mentor': Sparkles,
};

/* ── Page / module quick-launch entries ────────────────────── */
const PAGE_ITEMS = [
  { id: 'p-dashboard',     type: 'pages', title: 'Dashboard',          sub: 'Your workspace overview',              icon: LayoutDashboard, color: '#6366f1', link: '/' },
  { id: 'p-spotlight',     type: 'pages', title: 'Employee Spotlight',  sub: 'Achievements & recognition',           icon: Trophy,          color: '#f59e0b', link: '/spotlight' },
  { id: 'p-celebrations',  type: 'pages', title: 'Celebrations',        sub: 'Birthdays & anniversaries',            icon: PartyPopper,     color: '#ec4899', link: '/celebrations' },
  { id: 'p-announcements', type: 'pages', title: 'Announcements',       sub: 'Company-wide updates',                 icon: Megaphone,       color: '#3b82f6', link: '/announcements' },
  { id: 'p-policies',      type: 'pages', title: 'Policy Hub',          sub: 'Company policies & documents',         icon: BookOpen,        color: '#8b5cf6', link: '/policies' },
  { id: 'p-kudos',         type: 'pages', title: 'Kudos Wall',          sub: 'Spread appreciation',                  icon: Heart,           color: '#f43f5e', link: '/kudos' },
  { id: 'p-give-kudos',    type: 'pages', title: 'Give Kudos',          sub: 'Recognize a teammate now',             icon: Heart,           color: '#ec4899', link: '/kudos', state: { openModal: true } },
  { id: 'p-directory',     type: 'pages', title: 'Directory',           sub: 'Find & connect with colleagues',       icon: Users,           color: '#06b6d4', link: '/directory' },
  { id: 'p-leaves',        type: 'pages', title: 'Leave Tracker',       sub: 'Manage your time-off',                 icon: CalendarCheck,   color: '#10b981', link: '/leaves' },
  { id: 'p-feedback',      type: 'pages', title: 'Feedback',            sub: 'Share your thoughts',                  icon: MessageSquare,   color: '#a78bfa', link: '/feedback' },
  { id: 'p-analytics',     type: 'pages', title: 'Analytics',           sub: 'Culture & engagement metrics',         icon: BarChart3,       color: '#34d399', link: '/analytics' },
  { id: 'p-pulse',         type: 'pages', title: 'Team Pulse',          sub: 'Check in your mood',                   icon: Activity,        color: '#818cf8', link: '/pulse' },
  { id: 'p-whos-in',       type: 'pages', title: "Who's In?",           sub: 'Live office attendance',               icon: MapPin,          color: '#10b981', link: '/whos-in' },
  { id: 'p-projects',      type: 'pages', title: 'Projects & Teams',    sub: 'See who is working on what',           icon: Briefcase,       color: '#a78bfa', link: '/projects' },
  { id: 'p-fun-friday',    type: 'pages', title: 'Fun Friday',          sub: 'Vote for games & fun activities',      icon: Gamepad2,        color: '#ec4899', link: '/fun-friday' },
  { id: 'p-journey',       type: 'pages', title: 'Employee Journey',    sub: 'Your career story',                    icon: Map,             color: '#f472b6', link: '/journey' },
  { id: 'p-ask-hr',        type: 'pages', title: 'Ask HR',              sub: 'AI-powered HR assistant',              icon: Bot,             color: '#34d399', link: '/ask-hr' },
];

/* ── Category config ───────────────────────────────────────── */
const CATEGORIES = {
  pages:         { label: 'Pages',         icon: Zap,       color: '#818cf8', route: () => '/' },
  employees:     { label: 'People',         icon: Users,     color: '#06b6d4', route: () => '/directory' },
  achievements:  { label: 'Achievements',   icon: Trophy,    color: '#f59e0b', route: () => '/spotlight' },
  policies:      { label: 'Policies',       icon: BookOpen,  color: '#8b5cf6', route: () => '/policies'  },
  announcements: { label: 'Announcements',  icon: Megaphone, color: '#3b82f6', route: () => '/announcements' },
  kudos:         { label: 'Kudos',          icon: Heart,     color: '#ec4899', route: () => '/kudos'     },
};

const RECENTS_KEY = 'globalSearchRecents';
const MAX_RECENTS = 5;

function saveRecent(item) {
  const recents = JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]');
  const filtered = recents.filter(r => !(r.id === item.id && r.type === item.type));
  localStorage.setItem(RECENTS_KEY, JSON.stringify([item, ...filtered].slice(0, MAX_RECENTS)));
}
function getRecents() {
  return JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]');
}

/* ── Result Item ───────────────────────────────────────────── */
function ResultItem({ item, active, onSelect }) {
  const cat = CATEGORIES[item.type];
  const ref = useRef(null);

  useEffect(() => {
    if (active && ref.current) ref.current.scrollIntoView({ block: 'nearest' });
  }, [active]);

  return (
    <div ref={ref}
      onClick={() => onSelect(item)}
      className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-150 group"
      style={{
        background: active ? `${cat.color}12` : 'transparent',
        borderLeft: active ? `2px solid ${cat.color}` : '2px solid transparent',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = `${cat.color}0d`; }}
      onMouseLeave={e => { e.currentTarget.style.background = active ? `${cat.color}12` : 'transparent'; }}
    >
      {/* Icon / Avatar */}
      {item.type === 'employees' ? (
        <Avatar photo={item.photo} initials={item.avatar} color={item.coverColor} size="sm" shape="circle" />
      ) : item.type === 'pages' ? (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}25` }}>
          {item.icon && <item.icon size={14} style={{ color: cat.color }} />}
        </div>
      ) : (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}20` }}>
          {item.badgeKey
            ? (() => { const I = BADGE_ICON_MAP[item.badgeKey] || Star; return <I size={14} style={{ color: item.badgeColor || cat.color }} />; })()
            : <cat.icon size={14} style={{ color: cat.color }} />
          }
        </div>
      )}

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-white/85 text-sm font-semibold truncate">{item.title}</p>
        {item.sub && <p className="text-white/35 text-xs truncate mt-0.5">{item.sub}</p>}
      </div>

      {/* Category tag */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="hidden sm:block text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: `${cat.color}15`, color: cat.color }}>
          {cat.label}
        </span>
        <ArrowRight size={13} className="text-white/20 group-hover:text-white/50 transition-colors" />
      </div>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────── */
export default function GlobalSearch({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [recents, setRecents] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults({});
      setActiveIdx(0);
      setRecents(getRecents());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Keyboard: Esc to close, arrows + enter to navigate
  useEffect(() => {
    const handler = (e) => {
      if (!open) return;
      if (e.key === 'Escape') { onClose(); return; }
      const flat = flatResults();
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, flat.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && flat[activeIdx]) handleSelect(flat[activeIdx]);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, results, activeIdx, recents]);

  // Search with debounce
  useEffect(() => {
    if (!query.trim()) { setResults({}); setLoading(false); return; }
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const q = query.trim();
        const lower = q.toLowerCase();

        // Pages / modules — fuzzy match on title + sub
        const pageResults = PAGE_ITEMS.filter(p =>
          p.title.toLowerCase().includes(lower) || p.sub.toLowerCase().includes(lower)
        ).slice(0, 5);

        const [emps, achs, pols, annos, kud] = await Promise.allSettled([
          employeesAPI.getAll({ search: q }),
          achievementsAPI.getAll(),
          policiesAPI.getAll({ search: q }),
          announcementsAPI.getAll(),
          kudosAPI.getAll(),
        ]);

        const empResults = (emps.value || []).slice(0, 4).map(e => ({
          id: e.id, type: 'employees',
          title: e.name, sub: `${e.role} · ${e.department}`,
          photo: e.photo, avatar: e.avatar, coverColor: e.coverColor,
          link: '/directory',
        }));

        const achResults = (achs.value || [])
          .filter(a => a.title.toLowerCase().includes(lower) || a.employeeName.toLowerCase().includes(lower) || a.category.toLowerCase().includes(lower))
          .slice(0, 3).map(a => ({
            id: a.id, type: 'achievements',
            title: a.title, sub: `${a.employeeName} · ${a.category}`,
            badgeKey: a.badge, badgeColor: a.badgeColor, link: '/spotlight',
          }));

        const polResults = (pols.value || []).slice(0, 3).map(p => ({
          id: p.id, type: 'policies',
          title: p.title, sub: p.category,
          emoji: p.categoryIcon, link: '/policies',
        }));

        const annoResults = (annos.value || [])
          .filter(a => a.title.toLowerCase().includes(lower) || a.content.toLowerCase().includes(lower))
          .slice(0, 3).map(a => ({
            id: a.id, type: 'announcements',
            title: a.title, sub: `${a.category} · ${a.date}`,
            link: '/announcements',
          }));

        const kudoResults = (kud.value || [])
          .filter(k => k.fromName.toLowerCase().includes(lower) || k.toName.toLowerCase().includes(lower) || k.message.toLowerCase().includes(lower))
          .slice(0, 3).map(k => ({
            id: k.id, type: 'kudos',
            title: `${k.fromName} → ${k.toName}`,
            sub: k.message.slice(0, 60) + (k.message.length > 60 ? '…' : ''),
            link: '/kudos',
          }));

        const newResults = {};
        if (pageResults.length)  newResults.pages         = pageResults;
        if (empResults.length)   newResults.employees     = empResults;
        if (achResults.length)   newResults.achievements  = achResults;
        if (polResults.length)   newResults.policies      = polResults;
        if (annoResults.length)  newResults.announcements = annoResults;
        if (kudoResults.length)  newResults.kudos         = kudoResults;

        setResults(newResults);
        setActiveIdx(0);
      } catch { setResults({}); }
      finally { setLoading(false); }
    }, 220);
    return () => clearTimeout(timeout);
  }, [query]);

  const flatResults = useCallback(() => {
    if (!query.trim()) return recents;
    return Object.values(results).flat();
  }, [results, query, recents]);

  const handleSelect = (item) => {
    saveRecent(item);
    navigate(item.link, item.state ? { state: item.state } : undefined);
    onClose();
  };

  const totalResults = Object.values(results).reduce((s, a) => s + a.length, 0);
  const flat = flatResults();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)' }}
      onClick={onClose}
    >
      <div className="w-full max-w-2xl animate-scale-in"
        style={{
          background: 'rgba(12,10,30,0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          boxShadow: '0 32px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(99,102,241,0.15)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
          {loading
            ? <div className="w-5 h-5 rounded-full border-2 border-primary-500 border-t-transparent animate-spin flex-shrink-0" />
            : <Search size={18} className="text-white/40 flex-shrink-0" />
          }
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search people, policies, announcements, kudos…"
            className="flex-1 bg-transparent text-white text-base outline-none placeholder-white/25 font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-white/30 hover:text-white transition-colors flex-shrink-0">
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-white/20 text-xs border border-white/10 flex-shrink-0">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">

          {/* Empty state — no query */}
          {!query && recents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 text-center px-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <Zap size={24} style={{ color: '#818cf8' }} />
              </div>
              <p className="text-white/50 font-semibold mb-1">Search everything</p>
              <p className="text-white/25 text-sm">People · Policies · Announcements · Kudos · Achievements</p>
              <div className="flex flex-wrap gap-2 mt-5 justify-center">
                {['Kudos', 'Leave Policy', 'Pulse', 'Fun Friday', 'Arjun'].map(hint => (
                  <button key={hint} onClick={() => setQuery(hint)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent searches */}
          {!query && recents.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <p className="text-xs font-bold uppercase tracking-widest text-white/25 flex items-center gap-1.5">
                  <Clock size={11} /> Recent
                </p>
                <button onClick={() => { localStorage.removeItem(RECENTS_KEY); setRecents([]); }}
                  className="text-xs text-white/20 hover:text-white/50 transition-colors">
                  Clear
                </button>
              </div>
              {recents.map((item, i) => (
                <ResultItem key={`${item.id}-${i}`} item={item} active={activeIdx === i} onSelect={handleSelect} />
              ))}
            </div>
          )}

          {/* Search results grouped by category */}
          {query && totalResults > 0 && Object.entries(results).map(([type, items]) => {
            const cat = CATEGORIES[type];
            let groupStart = 0;
            Object.entries(results).some(([t, arr]) => {
              if (t === type) return true;
              groupStart += arr.length;
              return false;
            });
            return (
              <div key={type}>
                <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
                  <cat.icon size={12} style={{ color: cat.color }} />
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: `${cat.color}80` }}>
                    {cat.label}
                  </p>
                  <span className="text-white/15 text-xs ml-auto">{items.length}</span>
                </div>
                {items.map((item, i) => (
                  <ResultItem key={item.id} item={item} active={activeIdx === groupStart + i} onSelect={handleSelect} />
                ))}
              </div>
            );
          })}

          {/* No results */}
          {query && !loading && totalResults === 0 && (
            <div className="flex flex-col items-center py-14 text-center px-6">
              <Search size={32} style={{ color: 'rgba(255,255,255,0.08)' }} className="mb-3" />
              <p className="text-white/40 font-semibold">No results for "<span className="text-white/60">{query}</span>"</p>
              <p className="text-white/20 text-sm mt-1">Try searching for a name, policy keyword, or topic</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {(totalResults > 0 || recents.length > 0) && (
          <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/5">
            {[
              { key: '↑↓', label: 'navigate' },
              { key: '↵',  label: 'select' },
              { key: 'Esc', label: 'close' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded text-white/30 text-xs border border-white/10 font-mono">{key}</kbd>
                <span className="text-white/20 text-xs">{label}</span>
              </div>
            ))}
            {query && totalResults > 0 && (
              <span className="ml-auto text-white/20 text-xs">{totalResults} result{totalResults !== 1 ? 's' : ''}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
