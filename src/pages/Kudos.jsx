import { useState, useEffect } from 'react';
import { Heart, Plus, X, Send, Trophy, Sparkles, Crown, Shield, Rocket, Star, Lightbulb, Target, Zap, Medal, Activity, TrendingUp, CheckCircle, Award } from 'lucide-react';
import Avatar from '../components/common/Avatar';
import PageLoader from '../components/common/PageLoader';
import { kudosAPI, employeesAPI } from '../services/api';
import { useLocation } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const BADGE_ICON_MAP = {
  'Trophy': Trophy, 'Star': Star, 'Sparkles': Sparkles, 'Award': Award,
  'Rocket': Zap, 'Diamond': Star, 'Heart': Heart, 'Shield': CheckCircle,
  'Hero': CheckCircle, 'Innovator': Zap, 'Insights': Activity,
  'Culture': Heart, 'Impact': TrendingUp, 'Rising Star': Star, 'Mentor': Sparkles,
};
function BadgeIcon({ badge, color, size = 14 }) {
  const Icon = BADGE_ICON_MAP[badge] || Star;
  return <Icon size={size} style={{ color }} />;
}

const BADGES = [
  { label: 'Hero',        value: 'Hero',        color: '#f59e0b', Icon: Shield  },
  { label: 'Innovator',   value: 'Innovator',   color: '#6366f1', Icon: Rocket  },
  { label: 'Star',        value: 'Star',        color: '#ec4899', Icon: Star    },
  { label: 'Mentor',      value: 'Mentor',      color: '#8b5cf6', Icon: Sparkles},
  { label: 'Insights',    value: 'Insights',    color: '#10b981', Icon: Lightbulb},
  { label: 'Culture',     value: 'Culture',     color: '#ef4444', Icon: Heart   },
  { label: 'Impact',      value: 'Impact',      color: '#a855f7', Icon: Target  },
  { label: 'Rising Star', value: 'Rising Star', color: '#fbbf24', Icon: Zap     },
];
const CATEGORIES = ['Problem Solving','Innovation','Excellence','Business Impact','Culture Building','Mentorship','Growth','Teamwork'];

function KudoCard({ kudo, index }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(kudo.likes);

  const handleLike = async () => {
    if (liked) return;
    try {
      const res = await kudosAPI.like(kudo.id);
      setLikes(res.likes);
      setLiked(true);
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="glass-card p-5 animate-slide-up group"
      style={{
        animationDelay: `${index * 50}ms`,
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.4)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar photo={kudo.fromPhoto} initials={kudo.fromAvatar} color={kudo.fromColor} size="sm" shape="circle" />
          <div className="min-w-0">
            <p className="text-xs text-white/40">
              <span className="text-white/80 font-bold">{kudo.fromName}</span>
              <span className="mx-1">→</span>
              <span className="text-white/80 font-bold">{kudo.toName}</span>
            </p>
            <p className="text-white/25 text-xs">{formatDistanceToNow(parseISO(kudo.date), { addSuffix: true })}</p>
          </div>
        </div>
        <span className="badge flex-shrink-0 text-xs font-bold px-3 py-1 flex items-center gap-1.5"
          style={{ background: `${kudo.badgeColor}18`, color: kudo.badgeColor, border: `1px solid ${kudo.badgeColor}30` }}>
          <BadgeIcon badge={kudo.badge} color={kudo.badgeColor} size={11} /> {kudo.badge}
        </span>
      </div>

      {/* Message */}
      <div className="px-4 py-3 rounded-xl mb-3"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-white/60 text-sm leading-relaxed italic">"{kudo.message}"</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="tag">{kudo.category}</span>
          <span className="text-xs font-bold" style={{ color: '#a5b4fc' }}>+{kudo.points} pts</span>
        </div>
        <button onClick={handleLike}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
          style={liked
            ? { background: 'rgba(244,63,94,0.18)', color: '#f87171', border: '1px solid rgba(244,63,94,0.3)' }
            : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.07)' }
          }
        >
          <Heart size={12} className={liked ? 'fill-current' : ''} /> {likes}
        </button>
      </div>
    </div>
  );
}

function GiveKudosModal({ employees, onClose, onSubmit }) {
  const [form, setForm] = useState({ toId: '', message: '', badge: '', badgeColor: '', category: '', points: 100 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.toId || !form.message || !form.badge || !form.category) {
      toast.error('Fill in all required fields'); return;
    }
    const emp = employees.find(e => e.id === form.toId);
    await onSubmit({ fromId: 'emp001', fromName: 'Arjun Sharma', fromAvatar: 'AS', fromColor: '#6366f1',
      toId: emp.id, toName: emp.name, toAvatar: emp.avatar, toColor: emp.coverColor,
      message: form.message, badge: form.badge, badgeColor: form.badgeColor, category: form.category, points: form.points });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}>
      <div className="glass-card max-w-lg w-full animate-scale-in max-h-[90vh] overflow-y-auto"
        style={{ border: '1px solid rgba(236,72,153,0.2)', boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(236,72,153,0.1)' }}>
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(244,63,94,0.15)' }}>
              <Heart size={16} style={{ color: '#f472b6' }} />
            </div>
            <h2 className="text-white font-black">Give Kudos</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-white/30 hover:text-white hover:bg-white/8 transition-all">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2 block">Recognize *</label>
            <select value={form.toId} onChange={e => setForm(f => ({ ...f, toId: e.target.value }))} className="input-field" required>
              <option value="">Select a colleague…</option>
              {employees.filter(e => e.id !== 'emp001').map(e => (
                <option key={e.id} value={e.id}>{e.name} — {e.role}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2 block">Badge *</label>
            <div className="grid grid-cols-2 gap-2">
              {BADGES.map(badge => (
                <button key={badge.value} type="button"
                  onClick={() => setForm(f => ({ ...f, badge: badge.value, badgeColor: badge.color }))}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold text-left transition-all duration-200 flex items-center gap-2 ${form.badge !== badge.value ? 'kudos-btn-inactive' : ''}`}
                  style={form.badge === badge.value
                    ? { background: `${badge.color}20`, border: `1px solid ${badge.color}40`, color: badge.color }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }
                  }
                >
                  <badge.Icon size={13} /> {badge.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2 block">Category *</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat} type="button"
                  onClick={() => setForm(f => ({ ...f, category: cat }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${form.category !== cat ? 'kudos-btn-inactive' : ''}`}
                  style={form.category === cat
                    ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', boxShadow: '0 4px 16px rgba(99,102,241,0.35)' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2 block">Your Message *</label>
            <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Tell them why they're amazing…" rows={4} className="input-field resize-none" required />
          </div>

          <div>
            <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2 block">Points</label>
            <div className="flex gap-2">
              {[50, 75, 100, 150].map(pts => (
                <button key={pts} type="button" onClick={() => setForm(f => ({ ...f, points: pts }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${form.points !== pts ? 'kudos-btn-inactive' : ''}`}
                  style={form.points === pts
                    ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }
                  }
                >
                  +{pts}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center"><Send size={15} /> Send Kudos</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Kudos() {
  const [kudos, setKudos] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const filterTo = location.state?.filterTo;

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = filterTo ? { employeeId: filterTo } : {};
      const [k, l, e] = await Promise.all([kudosAPI.getAll(params), kudosAPI.getLeaderboard(), employeesAPI.getAll()]);
      const filtered = filterTo ? k.filter(kd => kd.toId === filterTo) : k;
      setKudos(filtered); setLeaderboard(l); setEmployees(e);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (location.state?.openModal) {
      setShowModal(true);
      // Clear the state so refreshing the page doesn't re-open it
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const handleSubmit = async (data) => {
    await kudosAPI.create(data);
    toast.success('Kudos sent!');
    setShowModal(false);
    fetchData();
  };

  const medals = [
    <Trophy size={16} style={{ color: '#fbbf24' }} />,
    <Medal  size={16} style={{ color: '#d1d5db' }} />,
    <Medal  size={16} style={{ color: '#f97316' }} />,
  ];

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="section-title flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.2), rgba(236,72,153,0.1))', boxShadow: '0 4px 16px rgba(244,63,94,0.2)' }}>
              <Heart size={20} style={{ color: '#f472b6' }} />
            </div>
            <span style={{ background: 'linear-gradient(135deg, #f472b6, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Kudos Wall
            </span>
          </h1>
          <p className="text-white/35 text-sm mt-2 ml-14">
          {filterTo ? 'Kudos received by Arjun Sharma' : 'Spread appreciation. Recognize greatness.'}
        </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} /> Give Kudos
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feed */}
        <div className="lg:col-span-2 space-y-4">
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Recent Appreciations</p>
          <PageLoader loading={loading} minHeight="150px">
            <div className="space-y-4">
              {kudos.map((k, i) => <KudoCard key={k.id} kudo={k} index={i} />)}
            </div>
          </PageLoader>
        </div>

        {/* Leaderboard */}
        <div>
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-4">Recognition Leaderboard</p>
          <div className="glass-card p-5" style={{ border: '1px solid rgba(245,158,11,0.1)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Crown size={16} style={{ color: '#fbbf24' }} />
              <span className="text-white/60 text-sm font-bold">Top Recognized</span>
            </div>
            <div className="space-y-2.5">
              {leaderboard.map((person, idx) => (
                <div key={person.id}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all"
                  style={idx === 0
                    ? { background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }
                    : { background: 'rgba(255,255,255,0.025)' }
                  }
                >
                  <span className="text-lg w-7 text-center flex-shrink-0 flex items-center justify-center">{medals[idx] || <span className="text-white/30 text-sm font-bold">{idx+1}</span>}</span>
                  <Avatar photo={person.photo} initials={person.avatar} color={person.color} size="sm" shape="circle" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm font-semibold truncate">{person.name}</p>
                    <div className="w-full rounded-full h-1 mt-1.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-1 rounded-full transition-all" style={{
                        width: `${(person.points / (leaderboard[0]?.points || 1)) * 100}%`,
                        background: idx === 0 ? 'linear-gradient(90deg, #f59e0b, #fb923c)' : 'rgba(99,102,241,0.6)'
                      }} />
                    </div>
                  </div>
                  <span className="font-black text-sm flex-shrink-0" style={{ color: idx === 0 ? '#fbbf24' : '#a5b4fc' }}>
                    {person.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showModal && <GiveKudosModal employees={employees} onClose={() => setShowModal(false)} onSubmit={handleSubmit} />}
    </div>
  );
}
