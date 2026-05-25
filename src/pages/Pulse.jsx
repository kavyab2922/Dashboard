import { useState, useEffect, useRef } from 'react';
import { Activity, Send, TrendingUp, Users, Smile, Zap, Heart, Lock, BarChart2, Flame, Trophy } from 'lucide-react';
import { pulseAPI } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

/* ─── Mood Config ──────────────────────────────────────────── */
const MOODS = [
  { id: 'thriving', emoji: '🚀', label: 'Thriving',  sub: 'On fire today!',       color: '#6366f1', glow: 'rgba(99,102,241,0.4)',  bg: 'rgba(99,102,241,0.12)'  },
  { id: 'good',     emoji: '😊', label: 'Good',      sub: 'Feeling great!',        color: '#10b981', glow: 'rgba(16,185,129,0.4)',  bg: 'rgba(16,185,129,0.12)'  },
  { id: 'okay',     emoji: '😐', label: 'Okay',      sub: 'Getting through it.',   color: '#f59e0b', glow: 'rgba(245,158,11,0.4)',  bg: 'rgba(245,158,11,0.12)'  },
  { id: 'rough',    emoji: '😔', label: 'Rough',     sub: 'Need some support.',    color: '#ef4444', glow: 'rgba(239,68,68,0.4)',   bg: 'rgba(239,68,68,0.12)'   },
];

/* ─── Score Ring ───────────────────────────────────────────── */
function ScoreRing({ score }) {
  const { isDark } = useTheme();
  const r = 70;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#6366f1' : score >= 40 ? '#f59e0b' : '#ef4444';
  const label = score >= 80 ? 'Thriving 🚀' : score >= 60 ? 'Positive 😊' : score >= 40 ? 'Neutral 😐' : 'Needs care 💙';

  return (
    <div className="flex flex-col items-center justify-center relative" style={{ width: 180, height: 180 }}>
      <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="90" cy="90" r={r} fill="none" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)'} strokeWidth="12" />
        <circle cx="90" cy="90" r={r} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={circ} strokeDashoffset={circ - dash}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 10px ${color})`, transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16,1,0.3,1)' }}
        />
        {/* tick marks */}
        {[0,25,50,75].map(pct => {
          const angle = (pct / 100) * 2 * Math.PI - Math.PI / 2;
          const x1 = 90 + (r - 8) * Math.cos(angle), y1 = 90 + (r - 8) * Math.sin(angle);
          const x2 = 90 + (r + 2) * Math.cos(angle), y2 = 90 + (r + 2) * Math.sin(angle);
          return <line key={pct} x1={x1} y1={y1} x2={x2} y2={y2} stroke={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'} strokeWidth="2" />;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-white" style={{ color }}>{score}</span>
        <span className="text-white/40 text-xs font-medium mt-0.5">/ 100</span>
        <span className="text-xs font-bold mt-1.5" style={{ color }}>{label}</span>
      </div>
    </div>
  );
}

/* ─── Mood Bar ─────────────────────────────────────────────── */
function MoodBar({ mood, count, total }) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xl w-7 text-center">{mood.emoji}</span>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-white/60 text-xs font-semibold">{mood.label}</span>
          <span className="text-white/40 text-xs">{count} · {pct}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${mood.color}, ${mood.color}99)`, boxShadow: `0 0 8px ${mood.color}60` }} />
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card p-3 text-xs border border-white/15">
        <p className="text-white/60 mb-1 font-semibold">{label}</p>
        <p style={{ color: '#6366f1' }} className="font-black">Score: {payload[0]?.value}</p>
      </div>
    );
  }
  return null;
};

/* ─── Main Page ────────────────────────────────────────────── */
export default function Pulse() {
  const { isDark } = useTheme();
  const chartGrid = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)';
  const chartTick = isDark ? 'rgba(255,255,255,0.3)'  : '#64748b';
  const [pulseData, setPulseData] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hoveredMood, setHoveredMood] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [streak, setStreak] = useState(0);
  const [streakMsg, setStreakMsg] = useState('');

  // ── Streak helpers ──────────────────────────────────────────
  const getStreak = () => {
    const saved = JSON.parse(localStorage.getItem('pulseStreak') || '{"count":0,"lastDate":""}');
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (saved.lastDate === today) return saved.count;
    if (saved.lastDate === yesterday) return saved.count; // will increment on submit
    return 0; // streak broken
  };

  const bumpStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const saved = JSON.parse(localStorage.getItem('pulseStreak') || '{"count":0,"lastDate":""}');
    let newCount = 1;
    if (saved.lastDate === yesterday) newCount = saved.count + 1;
    else if (saved.lastDate === today) newCount = saved.count;
    localStorage.setItem('pulseStreak', JSON.stringify({ count: newCount, lastDate: today }));
    setStreak(newCount);
    if (newCount === 3)  setStreakMsg('3-day streak! You\'re building a habit 🔥');
    else if (newCount === 5)  setStreakMsg('5 days strong! Incredible consistency 🏆');
    else if (newCount === 7)  setStreakMsg('One full week! You\'re a Pulse Legend 🌟');
    else if (newCount >= 10) setStreakMsg(`${newCount} day streak! Absolute unit 💎`);
    else if (newCount > 1)   setStreakMsg(`${newCount} days in a row! Keep it up 🔥`);
    return newCount;
  };

  useEffect(() => {
    pulseAPI.get().then(d => { setPulseData(d); setLoading(false); })
      .catch(() => setLoading(false));
    // Check if already submitted today
    const key = `pulse_${new Date().toISOString().split('T')[0]}`;
    if (localStorage.getItem(key)) setSubmitted(true);
    setStreak(getStreak());
  }, []);

  const handleSubmit = async () => {
    if (!selectedMood) { toast.error('Pick a mood first!'); return; }
    setSubmitting(true);
    try {
      await pulseAPI.checkin({ mood: selectedMood.id, emoji: selectedMood.emoji, note, department: 'Engineering' });
      const key = `pulse_${new Date().toISOString().split('T')[0]}`;
      localStorage.setItem(key, '1');
      const newStreak = bumpStreak();
      setSubmitted(true);
      if (newStreak >= 3) toast.success(`🔥 ${newStreak}-day streak! Keep it going!`);
      else toast.success('Pulse submitted! 💙');
      const d = await pulseAPI.get();
      setPulseData(d);
    } catch { toast.error('Failed to submit'); }
    finally { setSubmitting(false); }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-72">
        <div className="w-10 h-10 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const { moodCounts = {}, score = 0, total = 0, history = [], checkins = [] } = pulseData || {};
  const chartData = history.map(h => ({ date: h.date.slice(5), score: h.score }));

  return (
    <div className="space-y-7 animate-fade-in">

      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden glass-card p-7"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.06))', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent)', filter: 'blur(30px)' }} />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}>
                <Activity size={20} style={{ color: '#818cf8' }} />
              </div>
              <div>
                <h1 className="text-white text-2xl font-black tracking-tight" style={{ background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Team Pulse
                </h1>
                <p className="text-white/35 text-xs">Anonymous · Resets daily · {total} check-ins today</p>
              </div>
            </div>
            <p className="text-white/50 text-sm max-w-md leading-relaxed">
              How is the team feeling <strong className="text-white/70">right now</strong>? Anonymous responses help leadership support the team better.
            </p>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'rgba(139,92,246,0.7)' }}>
                <Lock size={11} /> 100% Anonymous
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black"
                  style={{
                    background: streak >= 7 ? 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(251,146,60,0.15))'
                              : streak >= 3 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.07)',
                    border: streak >= 7 ? '1px solid rgba(245,158,11,0.4)'
                          : streak >= 3 ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.1)',
                    color: streak >= 7 ? '#fbbf24' : streak >= 3 ? '#f87171' : 'rgba(255,255,255,0.5)',
                    boxShadow: streak >= 3 ? `0 0 16px ${streak >= 7 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.25)'}` : 'none',
                    animation: streak >= 5 ? 'pulse 2s ease-in-out infinite' : 'none',
                  }}>
                  <Flame size={12} className={streak >= 3 ? 'fill-current' : ''} />
                  {streak}-day streak
                  {streak >= 7 && ' 🌟'}
                  {streak >= 5 && streak < 7 && ' 🏆'}
                  {streak >= 3 && streak < 5 && ' 🔥'}
                </div>
              )}
            </div>
          </div>

          <div className="flex-shrink-0">
            <ScoreRing score={score} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Check-in Card ──────────────────────────────── */}
        <div className="lg:col-span-3 glass-card p-6">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="text-6xl mb-4" style={{ animation: 'pulse 2s ease-in-out infinite' }}>💙</div>
              <h3 className="text-white font-black text-xl mb-2">Thank you for checking in!</h3>
              <p className="text-white/45 text-sm max-w-xs">Your response is anonymous and helps us make this a better place to work. See you tomorrow!</p>
              <div className="mt-5 flex flex-col items-center gap-3">
                <div className="px-4 py-2 rounded-xl text-xs font-bold"
                  style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>
                  ✓ Check-in recorded for today
                </div>
                {streak > 0 && (
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm"
                      style={{
                        background: streak >= 7 ? 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(251,146,60,0.15))'
                                  : streak >= 3 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)',
                        border: streak >= 7 ? '1px solid rgba(245,158,11,0.35)' : streak >= 3 ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(255,255,255,0.08)',
                        color: streak >= 7 ? '#fbbf24' : streak >= 3 ? '#f87171' : 'rgba(255,255,255,0.4)',
                        boxShadow: streak >= 5 ? '0 0 24px rgba(245,158,11,0.2)' : 'none',
                      }}>
                      <Flame size={16} className={streak >= 3 ? 'fill-current' : ''} />
                      🔥 {streak}-Day Streak!
                      {streak >= 7 && <Trophy size={14} />}
                    </div>
                    {streakMsg && <p className="text-white/35 text-xs text-center">{streakMsg}</p>}
                    {/* Mini streak grid */}
                    <div className="flex gap-1 mt-1">
                      {Array.from({ length: Math.max(7, streak) }).map((_, i) => (
                        <div key={i} className="w-5 h-5 rounded-md flex items-center justify-center text-xs"
                          style={{
                            background: i < streak
                              ? streak >= 7 ? 'linear-gradient(135deg, #f59e0b, #fb923c)'
                                : streak >= 3 ? '#ef4444' : '#6366f1'
                              : 'rgba(255,255,255,0.05)',
                            boxShadow: i < streak && streak >= 3 ? `0 0 6px ${streak >= 7 ? 'rgba(245,158,11,0.6)' : 'rgba(239,68,68,0.4)'}` : 'none',
                          }}>
                          {i < streak && <span style={{ fontSize: '9px' }}>🔥</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-6">
                <Smile size={18} style={{ color: '#818cf8' }} />
                <h3 className="text-white font-black text-base">How are you feeling today?</h3>
              </div>

              {/* Mood Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {MOODS.map(mood => {
                  const active = selectedMood?.id === mood.id;
                  const hovered = hoveredMood === mood.id;
                  return (
                    <button
                      key={mood.id}
                      onClick={() => setSelectedMood(mood)}
                      onMouseEnter={() => setHoveredMood(mood.id)}
                      onMouseLeave={() => setHoveredMood(null)}
                      className="relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-300"
                      style={{
                        background: active ? mood.bg : hovered ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
                        border: active ? `1.5px solid ${mood.color}50` : '1px solid rgba(255,255,255,0.07)',
                        boxShadow: active ? `0 8px 32px ${mood.glow}, 0 0 0 1px ${mood.color}20` : 'none',
                        transform: active ? 'scale(1.02)' : hovered ? 'scale(1.01)' : 'scale(1)',
                      }}
                    >
                      {active && (
                        <div className="absolute inset-0 opacity-10 pointer-events-none"
                          style={{ background: `radial-gradient(circle at 30% 30%, ${mood.color}, transparent)` }} />
                      )}
                      <span className="text-3xl block mb-2"
                        style={{ filter: active ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' : 'none' }}>
                        {mood.emoji}
                      </span>
                      <p className="text-white font-black text-sm" style={{ color: active ? mood.color : 'rgba(255,255,255,0.8)' }}>
                        {mood.label}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: active ? `${mood.color}90` : 'rgba(255,255,255,0.3)' }}>
                        {mood.sub}
                      </p>
                      {active && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                          style={{ background: mood.color, boxShadow: `0 2px 8px ${mood.glow}` }}>
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Optional Note */}
              <div className="mb-5">
                <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">
                  Anything you want to share? <span className="normal-case font-normal opacity-70">(optional & anonymous)</span>
                </label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Great team standup today… or I'm a bit overwhelmed…"
                  rows={2}
                  className="input-field resize-none text-sm"
                  maxLength={140}
                />
                <p className="text-white/20 text-xs text-right mt-1">{note.length}/140</p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!selectedMood || submitting}
                className="w-full py-3.5 rounded-2xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-2"
                style={selectedMood
                  ? {
                    background: `linear-gradient(135deg, ${selectedMood.color}, ${selectedMood.color}bb)`,
                    boxShadow: `0 8px 32px ${selectedMood.glow}`,
                    color: 'white',
                    transform: 'translateY(0)',
                  }
                  : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.07)' }
                }
              >
                {submitting ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <Send size={15} />
                    Submit My Pulse {selectedMood ? selectedMood.emoji : ''}
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* ── Right Panel ────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Mood Breakdown */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 size={16} style={{ color: '#818cf8' }} />
              <h3 className="text-white font-bold text-sm">Today's Breakdown</h3>
              <span className="ml-auto text-white/30 text-xs">{total} responses</span>
            </div>
            <div className="space-y-3">
              {MOODS.map(mood => (
                <MoodBar key={mood.id} mood={mood} count={moodCounts[mood.id] || 0} total={total} />
              ))}
            </div>
          </div>

          {/* Team Vibe Summary */}
          <div className="glass-card p-5"
            style={{ background: score >= 70 ? 'rgba(99,102,241,0.05)' : 'rgba(245,158,11,0.05)', border: `1px solid ${score >= 70 ? 'rgba(99,102,241,0.15)' : 'rgba(245,158,11,0.15)'}` }}>
            <div className="flex items-center gap-2 mb-3">
              <Heart size={15} style={{ color: score >= 70 ? '#818cf8' : '#fbbf24' }} />
              <span className="text-white/60 text-sm font-bold">Team Vibe</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              {score >= 80 && '🚀 The team is absolutely thriving! Energy is high — great time for bold moves.'}
              {score >= 60 && score < 80 && '😊 The team is in a good place! A few people could use some encouragement.'}
              {score >= 40 && score < 60 && '😐 Mixed signals today. Consider a quick team sync or 1:1 check-ins.'}
              {score < 40 && '💙 The team needs support right now. Leadership should reach out and listen.'}
            </p>
          </div>

          {/* Anonymous Notes Wall */}
          {checkins.filter(c => c.note).length > 0 && (
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={15} style={{ color: '#fbbf24' }} />
                <span className="text-white/60 text-sm font-bold">Team Voices</span>
                <span className="ml-auto text-white/25 text-xs flex items-center gap-1"><Lock size={9} /> anonymous</span>
              </div>
              <div className="space-y-2">
                {checkins.filter(c => c.note).slice(0, 4).map(c => {
                  const mood = MOODS.find(m => m.id === c.mood);
                  return (
                    <div key={c.id} className="flex items-start gap-2 p-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span className="text-base flex-shrink-0">{c.emoji}</span>
                      <p className="text-white/50 text-xs leading-relaxed italic flex-1">"{c.note}"</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 7-Day Trend ───────────────────────────────────── */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={16} style={{ color: '#10b981' }} />
          <h3 className="text-white font-bold">7-Day Pulse Trend</h3>
          <span className="ml-auto text-white/30 text-xs">Higher = Happier team</span>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="pulseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
            <XAxis dataKey="date" tick={{ fill: chartTick, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: chartTick, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5}
              fill="url(#pulseGrad)" dot={{ fill: '#6366f1', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#818cf8', boxShadow: '0 0 12px rgba(99,102,241,0.8)' }} />
          </AreaChart>
        </ResponsiveContainer>

        {/* Legend row */}
        <div className="flex justify-center gap-6 mt-3">
          {[{label:'< 40 Needs care',c:'#ef4444'},{label:'40-60 Neutral',c:'#f59e0b'},{label:'60-80 Good',c:'#10b981'},{label:'80+ Thriving',c:'#6366f1'}].map(x => (
            <div key={x.label} className="flex items-center gap-1.5 text-xs text-white/30">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: x.c }} />
              {x.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
