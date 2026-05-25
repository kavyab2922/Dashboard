import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, useInView } from 'framer-motion';
import {
  Trophy, PartyPopper, Megaphone, Heart, Users, TrendingUp,
  ArrowRight, Zap, Bell, BarChart3, Star, Sparkles,
  ArrowUpRight, Activity, CheckCircle, X, CalendarCheck, Map,
  Play, BookOpen, Award, Cake, Sun, Cloud, Moon,
  TrendingUp as TrendUp, Smile, Meh, Rocket, BookMarked, MapPin, Gamepad2
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { achievementsAPI, celebrationsAPI, announcementsAPI, kudosAPI, analyticsAPI, pulseAPI, leavesAPI } from '../services/api';
import api from '../services/api';
import { format, parseISO, differenceInYears } from 'date-fns';
import Avatar from '../components/common/Avatar';
import { useAuth } from '../context/AuthContext';
import BirthdayCountdownCard from '../components/common/BirthdayCountdown';

/* ── Spring configs ────────────────────────────────────────── */
const SPRING_SOFT   = { type: 'spring', stiffness: 80,  damping: 20, mass: 1 };
const SPRING_SNAPPY = { type: 'spring', stiffness: 200, damping: 28 };
const SPRING_FLOAT  = { type: 'spring', stiffness: 40,  damping: 10 };

/* ── Ambient Particle Canvas ───────────────────────────────── */
function AmbientField() {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const particles = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Seed particles
    particles.current = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.35 + 0.05,
      hue: Math.random() > 0.5 ? 240 : 270,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const ps = particles.current;

      // Move
      ps.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      // Draw connections
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x, dy = ps[i].y - ps[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(ps[i].x, ps[i].y);
            ctx.lineTo(ps[j].x, ps[j].y);
            ctx.strokeStyle = `hsla(${ps[i].hue}, 70%, 65%, ${0.12 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw dots
      ps.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 65%, ${p.opacity})`;
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ borderRadius: 'inherit' }}
    />
  );
}

/* ── 3D Tilt Card wrapper ──────────────────────────────────── */
function TiltCard({ children, className = '', style = {}, intensity = 8 }) {
  const ref   = useRef(null);
  const rotX  = useMotionValue(0);
  const rotY  = useMotionValue(0);
  const sRotX = useSpring(rotX, SPRING_FLOAT);
  const sRotY = useSpring(rotY, SPRING_FLOAT);
  const glow  = useSpring(useMotionValue(0), SPRING_FLOAT);

  const handleMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = (e.clientX - rect.left) / rect.width  - 0.5;
    const cy = (e.clientY - rect.top)  / rect.height - 0.5;
    rotX.set(-cy * intensity);
    rotY.set(cx  * intensity);
    glow.set(1);
  }, [intensity]);

  const handleLeave = useCallback(() => {
    rotX.set(0); rotY.set(0); glow.set(0);
  }, []);

  return (
    <motion.div
      ref={ref}
      style={{
        rotateX: sRotX,
        rotateY: sRotY,
        transformPerspective: 900,
        transformStyle: 'preserve-3d',
        ...style,
      }}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </motion.div>
  );
}

/* ── Magnetic Button ───────────────────────────────────────── */
function MagneticBtn({ children, className = '', style = {}, to, onClick }) {
  const x  = useMotionValue(0);
  const y  = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 150, damping: 15 });
  const sy = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width  / 2) * 0.35);
    y.set((e.clientY - rect.top  - rect.height / 2) * 0.35);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  const Component = motion[to ? 'div' : 'button'];
  const el = (
    <Component
      style={{ x: sx, y: sy, ...style }}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
    >
      {children}
    </Component>
  );
  return to ? <Link to={to} className="inline-block">{el}</Link> : el;
}

/* ── Animated Counter ──────────────────────────────────────── */
function Counter({ value, duration = 1.4 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = value;
    const step = end / (duration * 60);
    const id = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(id); }
      else setDisplay(Math.round(start));
    }, 1000 / 60);
    return () => clearInterval(id);
  }, [inView, value]);

  return <span ref={ref}>{display}</span>;
}

/* ── Stat Card ─────────────────────────────────────────────── */
const statConfigs = [
  { key: 'totalEmployees',    label: 'Team Members',  icon: Users,    grad: ['#6366f1','#8b5cf6'], glow: '#6366f1', trend: '+2 this month',    link: '/directory',     pastel: 'card-blue'   },
  { key: 'totalAchievements', label: 'Achievements',  icon: Trophy,   grad: ['#f59e0b','#fb923c'], glow: '#f59e0b', trend: '3 this quarter',   link: '/spotlight',     pastel: 'card-peach'  },
  { key: 'totalKudos',        label: 'Kudos Sent',    icon: Heart,    grad: ['#ec4899','#f43f5e'], glow: '#ec4899', trend: 'Team is thriving', link: '/kudos',         pastel: 'card-lilac'  },
  { key: 'totalAnnouncements',label: 'Announcements', icon: Megaphone,grad: ['#3b82f6','#06b6d4'], glow: '#3b82f6', trend: '3 pinned updates', link: '/announcements', pastel: 'card-sky'    },
];

function StatCard({ config, value, index }) {
  const { label, icon: Icon, grad, glow, trend, link, pastel } = config;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...SPRING_SNAPPY, delay: index * 0.08 }}
    >
      <TiltCard intensity={6}>
        <Link to={link} className={`block glass-card ${pastel} p-5 relative overflow-hidden group`}
          style={{ boxShadow: `0 8px 40px rgba(0,0,0,0.35)`, textDecoration: 'none' }}>

          {/* Animated corner glow */}
          <motion.div className="absolute -top-10 -right-10 w-28 h-28 rounded-full pointer-events-none"
            animate={{ opacity: [0.12, 0.25, 0.12], scale: [1, 1.15, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.5 }}
            style={{ background: `radial-gradient(circle, ${glow}, transparent)` }}
          />

          {/* Shimmer sweep */}
          <motion.div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%)', backgroundSize: '200% 100%' }}
            animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear', delay: index * 0.6 }}
          />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <motion.div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${grad[0]}25, ${grad[1]}15)`, border: `1px solid ${grad[0]}30` }}
                whileHover={{ scale: 1.12, rotate: 8 }}
                transition={SPRING_SNAPPY}>
                <Icon size={20} style={{ color: grad[0] }} />
              </motion.div>
              <ArrowUpRight size={15} className="text-white/15 group-hover:text-white/50 transition-colors" />
            </div>
            <p className="text-4xl font-black text-white tracking-tight">
              <Counter value={value || 0} />
            </p>
            <p className="text-white/50 text-sm mt-1 font-medium">{label}</p>
            <div className="flex items-center gap-1 mt-3">
              <TrendingUp size={11} style={{ color: grad[0] }} />
              <span className="text-xs font-medium" style={{ color: grad[0] }}>{trend}</span>
            </div>
          </div>
        </Link>
      </TiltCard>
    </motion.div>
  );
}

/* ── Kudo Detail Modal ─────────────────────────────────────── */
function KudoModal({ kudo, onClose }) {
  if (!kudo) return null;
  return createPortal(
    <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(14px)' }}
      onClick={onClose}
    >
      <motion.div className="w-full max-w-md overflow-hidden"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 10, opacity: 0 }}
        transition={SPRING_SNAPPY}
        style={{ background: 'rgb(10,8,24)', border: `1px solid ${kudo.badgeColor}30`, borderRadius: 24, boxShadow: `0 32px 80px rgba(0,0,0,0.8), 0 0 60px ${kudo.badgeColor}15` }}
        onClick={e => e.stopPropagation()}
      >
        <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${kudo.badgeColor}, ${kudo.fromColor}, ${kudo.toColor})` }} />
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <Heart size={16} style={{ color: '#f472b6' }} />
            <span className="text-white font-black text-sm">Kudos Recognition</span>
          </div>
          <motion.button onClick={onClose} whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} transition={SPRING_SNAPPY}
            className="p-1.5 rounded-xl text-white/30 hover:text-white hover:bg-white/8 transition-colors">
            <X size={16} />
          </motion.button>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Avatar photo={kudo.fromPhoto} initials={kudo.fromAvatar} color={kudo.fromColor} size="md" shape="circle" />
              <div className="min-w-0">
                <p className="text-white font-bold text-sm truncate">{kudo.fromName}</p>
                <p className="text-white/35 text-xs">Sender</p>
              </div>
            </div>
            <div className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>
              recognized →
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
              <div className="min-w-0 text-right">
                <p className="text-white font-bold text-sm truncate">{kudo.toName}</p>
                <p className="text-white/35 text-xs">Recipient</p>
              </div>
              <Avatar photo={kudo.toPhoto} initials={kudo.toAvatar} color={kudo.toColor} size="md" shape="circle" />
            </div>
          </div>
            <motion.div className="flex justify-center mb-5">
            <motion.div className="flex items-center gap-2 px-4 py-2 rounded-full"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...SPRING_SNAPPY, delay: 0.15 }}
              style={{ background: `${kudo.badgeColor}20`, border: `1px solid ${kudo.badgeColor}35`, boxShadow: `0 0 20px ${kudo.badgeColor}25` }}>
              <BadgeIcon badge={kudo.badge} color={kudo.badgeColor} size={14} />
              <span className="text-sm font-black" style={{ color: kudo.badgeColor }}>{kudo.badge}</span>
            </motion.div>
          </motion.div>
          <div className="px-5 py-4 rounded-2xl mb-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-white/75 text-sm leading-relaxed italic text-center">"{kudo.message}"</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="badge text-xs" style={{ background: `${kudo.badgeColor}12`, color: `${kudo.badgeColor}cc` }}>{kudo.category}</span>
              <span className="text-white/25 text-xs">{kudo.date}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold" style={{ color: '#a5b4fc' }}>+{kudo.points} pts</span>
                      <span className="text-white/25 text-xs">♥ {kudo.likes}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

/* ── Section Header ────────────────────────────────────────── */
function SectionHeader({ icon: Icon, color, title, link }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <motion.div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${color}18` }}
          animate={{ boxShadow: [`0 0 0px ${color}00`, `0 0 12px ${color}40`, `0 0 0px ${color}00`] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
          <Icon size={15} style={{ color }} />
        </motion.div>
        <h3 className="text-white font-bold text-base">{title}</h3>
      </div>
      <Link to={link} className="flex items-center gap-1 text-xs font-semibold transition-all hover:gap-2"
        style={{ color: 'rgba(139,92,246,0.8)' }}>
        View all <ArrowRight size={13} />
      </Link>
    </div>
  );
}

/* ── Days Chip ─────────────────────────────────────────────── */
function DaysChip({ days }) {
  if (days === 0) return <span className="badge text-xs font-bold" style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>🎉 Today!</span>;
  if (days <= 3) return <span className="badge text-xs" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' }}>{days}d</span>;
  return <span className="badge text-xs" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>{days}d</span>;
}

/* ── Badge icon map (replaces emoji badges from backend data) ─ */
const BADGE_ICON_MAP = {
  'Trophy':     Trophy,
  'Star':       Star,
  'Sparkles':   Sparkles,
  'Award':      Award,
  'Rocket':     Zap,
  'Diamond':    Star,
  'Heart':      Heart,
  'Shield':     CheckCircle,
  'Hero':       CheckCircle,
  'Innovator':  Zap,
  'Insights':   Activity,
  'Culture':    Heart,
  'Impact':     TrendingUp,
  'Rising Star':Star,
  'Mentor':     Sparkles,
};
function BadgeIcon({ badge, color, size = 14 }) {
  const Icon = BADGE_ICON_MAP[badge] || Star;
  return <Icon size={size} style={{ color }} />;
}

/* ── My Journey Modal ──────────────────────────────────────── */
const JOURNEY_TYPE_CONFIG = {
  joined:      { color: '#6366f1', label: 'Joined',       GlyphIcon: Zap       },
  promotion:   { color: '#10b981', label: 'Promotion',    GlyphIcon: TrendingUp },
  anniversary: { color: '#ec4899', label: 'Anniversary',  GlyphIcon: Cake      },
  skill:       { color: '#3b82f6', label: 'Skill Growth', GlyphIcon: BookOpen  },
  award:       { color: '#f59e0b', label: 'Recognition',  GlyphIcon: Award     },
  milestone:   { color: '#a855f7', label: 'Milestone',    GlyphIcon: Star      },
};

function JourneyEventCard({ event, index }) {
  const cfg = JOURNEY_TYPE_CONFIG[event.type] || JOURNEY_TYPE_CONFIG.milestone;
  return (
    <motion.div
      className="relative flex gap-4"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 200, damping: 24 }}
    >
      {/* Spine dot + line */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 36 }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
          style={{
            background: event.highlight ? `linear-gradient(135deg, ${event.color}, ${event.color}bb)` : `${event.color}18`,
            border: `2px solid ${event.color}${event.highlight ? 'ff' : '35'}`,
            boxShadow: event.highlight ? `0 0 16px ${event.color}50` : 'none',
          }}>
          {event.icon}
        </div>
        <div className="flex-1 w-0.5 mt-1.5" style={{ background: `linear-gradient(180deg, ${event.color}30, transparent)`, minHeight: 24 }} />
      </div>
      {/* Card */}
      <div className="flex-1 pb-5">
        <div className="p-3.5 rounded-2xl"
          style={{
            background: event.highlight ? `linear-gradient(135deg, ${event.color}0a, rgba(255,255,255,0.02))` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${event.highlight ? event.color + '30' : 'rgba(255,255,255,0.07)'}`,
          }}>
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}25` }}>
                <cfg.GlyphIcon size={9} /> {cfg.label}
              </span>
              {event.highlight && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}>
                  ✦ Key Moment
                </span>
              )}
            </div>
            <span className="text-white/25 text-xs flex-shrink-0">{format(parseISO(event.date), 'MMM yyyy')}</span>
          </div>
          <p className={`font-bold leading-snug mb-1 ${event.highlight ? 'text-white text-sm' : 'text-white/80 text-xs'}`}>{event.title}</p>
          <p className="text-white/40 text-xs leading-relaxed">{event.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

function MyJourneyModal({ user, onClose }) {
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/journeys').then(all => {
      const mine = all.find(j => j.employeeId === (user?.id || 'emp001')) || all[0];
      setJourney(mine);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const events = journey?.events || [];
  const years = journey ? differenceInYears(new Date(), parseISO(journey.joinDate)) : 0;
  const highlights = events.filter(e => e.highlight).length;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(18px)' }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-3xl flex flex-col overflow-hidden"
        style={{ maxHeight: '88vh', background: 'rgb(10,8,24)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 24, boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 60px rgba(168,85,247,0.1)' }}
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1,   y: 0,  opacity: 1 }}
        exit={{    scale: 0.92, y: 10, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Gradient top bar */}
        <div className="h-1.5 flex-shrink-0" style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7, #f472b6)' }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
              <Map size={15} style={{ color: '#c084fc' }} />
            </div>
            <div>
              <h3 className="text-white font-black text-sm">My Journey</h3>
              <p className="text-white/30 text-xs">Your career story at OfficeVerse</p>
            </div>
          </div>
          <motion.button onClick={onClose} whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="p-1.5 rounded-xl text-white/30 hover:text-white hover:bg-white/8 transition-colors">
            <X size={16} />
          </motion.button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          </div>
        ) : journey ? (
          <>
            {/* Profile strip */}
            <div className="flex-shrink-0 px-5 py-4" style={{ background: `linear-gradient(135deg, ${journey.coverColor}10, transparent)`, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0"
                  style={{ border: `2px solid ${journey.coverColor}60`, boxShadow: `0 0 20px ${journey.coverColor}30` }}>
                  {journey.photo
                    ? <img src={journey.photo} alt={journey.employeeName} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center font-black text-lg"
                        style={{ background: `${journey.coverColor}25`, color: journey.coverColor }}>{journey.avatar}</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black text-base">{journey.employeeName}</p>
                  <p className="text-white/45 text-xs">{journey.role} · {journey.department}</p>
                  <p className="text-white/35 text-xs italic mt-0.5">"{journey.story}"</p>
                </div>
                {/* Stats */}
                <div className="flex gap-4 flex-shrink-0">
                  {[
                    { v: years,            l: 'Years',    c: journey.coverColor },
                    { v: highlights,       l: 'Key',      c: '#fbbf24' },
                    { v: events.length,    l: 'Events',   c: '#a5b4fc' },
                  ].map(s => (
                    <div key={s.l} className="text-center">
                      <p className="font-black text-lg leading-none" style={{ color: s.c }}>{s.v}</p>
                      <p className="text-white/25 text-[10px]">{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-0">
              {events.map((event, i) => (
                <JourneyEventCard key={event.id} event={event} index={i} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center py-16 text-white/30 text-sm">No journey found</div>
        )}
      </motion.div>
    </motion.div>,
    document.body
  );
}

/* ── Main Dashboard ────────────────────────────────────────── */
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showJourney, setShowJourney] = useState(false);
  const [analytics, setAnalytics]     = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [upcoming, setUpcoming]       = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [kudos, setKudos]             = useState([]);
  const [pulse, setPulse]             = useState(null);
  const [myLeaves, setMyLeaves]       = useState(null);
  const [loading, setLoading]         = useState(true);
  const [selectedKudo, setSelectedKudo] = useState(null);

  useEffect(() => {
    Promise.all([
      analyticsAPI.get(), achievementsAPI.getAll({ featured: true }),
      celebrationsAPI.getUpcoming(30), announcementsAPI.getAll({ pinned: true }),
      kudosAPI.getAll(), pulseAPI.get(), leavesAPI.getAll(),
    ]).then(([a, ach, up, ann, k, p, lv]) => {
      setAnalytics(a); setAchievements(ach.slice(0, 3)); setUpcoming(up.slice(0, 5));
      setAnnouncements(ann.slice(0, 3)); setKudos(k.slice(0, 3)); setPulse(p);
      // Compute my leaves: filter by current user, count approved + pending
      const myLv = lv.filter(l => l.employeeId === (user?.id || 'emp001'));
      const used = myLv.filter(l => l.status === 'approved').reduce((s, l) => s + (l.days || 1), 0);
      const total = 20; // standard allocation
      setMyLeaves({ used, remaining: total - used, total });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const now  = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const GreetIcon = hour < 12 ? Sun : hour < 17 ? Cloud : Moon;
  const greetColor = hour < 12 ? '#fbbf24' : hour < 17 ? '#818cf8' : '#6366f1';
  const displayName = user?.name?.split(' ')[0] || 'there';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <motion.div className="absolute inset-0 rounded-full border-2 border-primary-500/20"
              animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} />
            <motion.div className="absolute inset-1 rounded-full border-2 border-t-primary-500 border-transparent"
              animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap size={18} className="text-primary-400" />
            </div>
          </div>
          <p className="text-white/30 text-sm">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div className="space-y-7"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}>

      {/* ── Hero ──────────────────────────────────────────── */}
      <motion.div className="relative overflow-hidden glass-card card-lavender"
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_SOFT, delay: 0.05 }}
        style={{ padding: '32px', border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 8px 60px rgba(0,0,0,0.4)' }}>

        {/* Ambient particle field */}
        <AmbientField />

        {/* Animated radial gradients */}
        <motion.div className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: 'radial-gradient(ellipse at 10% 20%, rgba(99,102,241,0.18), transparent 55%)' }}
        />
        <motion.div className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{ background: 'radial-gradient(ellipse at 90% 80%, rgba(168,85,247,0.12), transparent 55%)' }}
        />


<motion.div className="absolute -right-8 -top-8 w-44 h-44 rounded-full pointer-events-none border border-purple-500/10"
          animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} />
        <div className="relative z-10">
          <div className="flex flex-col xl:flex-row xl:items-center gap-6">

            {/* Left — Greeting */}
            <div className="flex-shrink-0">
              {/* Date chip */}
              <motion.div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-xs font-bold"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ ...SPRING_SNAPPY, delay: 0.15 }}>
                <motion.span className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                  animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }} />
                {format(now, 'EEEE, MMMM d · yyyy')}
              </motion.div>

              <motion.h2 className="text-white text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-2"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ ...SPRING_SNAPPY, delay: 0.2 }}>
                <GreetIcon size={28} style={{ color: greetColor, flexShrink: 0 }} /> {greeting},<br className="sm:hidden" />
                {' '}<motion.span
                  style={{ background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200%' }}
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
                  {displayName}!
                </motion.span>
              </motion.h2>

              <motion.p className="text-white/45 text-sm max-w-xs leading-relaxed"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}>
                {upcoming.some(u => u.daysUntil === 0)
                  ? 'Someone is celebrating today! Check it out.'
                  : `You have ${upcoming.length} upcoming celebrations this month.`}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div className="flex flex-wrap gap-3 mt-5"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING_SNAPPY, delay: 0.35 }}>
                <MagneticBtn
                  onClick={() => navigate('/kudos', { state: { openModal: true } })}
                  className="btn-primary"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 24px rgba(99,102,241,0.4)' }}>
                  <Heart size={16} /> Give Kudos
                </MagneticBtn>
                <MagneticBtn to="/spotlight" className="btn-secondary">
                  <Trophy size={16} /> View Spotlight
                </MagneticBtn>
                <MagneticBtn to="/analytics" className="btn-secondary">
                  <BarChart3 size={16} /> Analytics
                </MagneticBtn>
                <MagneticBtn
                  onClick={() => setShowJourney(true)}
                  className="btn-secondary">
                  <Map size={16} /> My Journey
                </MagneticBtn>
              </motion.div>
            </div>

            {/* Centre — My Space mini stats */}
            <motion.div className="flex-1 grid grid-cols-3 gap-3"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING_SNAPPY, delay: 0.28 }}>
              {[
                {
                  icon: Trophy,
                  label: 'My Achievements',
                  value: analytics?.overview?.totalAchievements ?? '—',
                  sub: 'awards earned',
                  color: '#f59e0b',
                  pastel: 'card-lemon',
                  go: () => navigate('/spotlight', { state: { filterEmployee: user?.id, employeeName: user?.name } }),
                },
                {
                  icon: Heart,
                  label: 'Kudos Received',
                  value: analytics?.overview?.totalKudos ?? '—',
                  sub: 'this month',
                  color: '#ec4899',
                  pastel: 'card-rose',
                  go: () => navigate('/kudos', { state: { filterTo: user?.id } }),
                },
                {
                  icon: CalendarCheck,
                  label: 'My Leaves',
                  value: myLeaves ? `${myLeaves.remaining}` : '—',
                  sub: 'days remaining',
                  color: '#10b981',
                  pastel: 'card-mint',
                  go: () => navigate('/leaves'),
                },
              ].map(({ icon: Icon, label, value, sub, color, pastel, go }, i) => (
                <motion.button key={label} onClick={go}
                  className={`text-left p-4 rounded-2xl group transition-all ${pastel}`}
                  style={{ border: `1px solid ${color}20` }}
                  whileHover={{ y: -3, boxShadow: `0 8px 24px ${color}20` }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15 }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                      <Icon size={14} style={{ color }} />
                    </div>
                    <ArrowUpRight size={12} className="ml-auto opacity-0 group-hover:opacity-60 transition-opacity" style={{ color }} />
                  </div>
                  <p className="text-white font-black text-2xl leading-none mb-1">{value}</p>
                  <p className="text-white/35 text-[11px] font-semibold leading-tight">{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: `${color}99` }}>{sub}</p>
                </motion.button>
              ))}
            </motion.div>

            {/* Right — badges */}
            <motion.div className="flex flex-wrap gap-2 xl:flex-col xl:items-end flex-shrink-0"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ ...SPRING_SNAPPY, delay: 0.25 }}>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
                style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
                <Sparkles size={12} /> {(user?.points || 1250).toLocaleString()} pts
              </div>
              <motion.div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }}
                animate={{ boxShadow: ['0 0 0px rgba(16,185,129,0)', '0 0 16px rgba(16,185,129,0.3)', '0 0 0px rgba(16,185,129,0)'] }}
                transition={{ duration: 2.5, repeat: Infinity }}>
                <motion.span className="w-2 h-2 rounded-full bg-emerald-400"
                  animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                Active Now
              </motion.div>
            </motion.div>

          </div>
        </div>
      </motion.div>

      {/* ── Birthday Countdown (only within 24h) ─────────── */}
      <BirthdayCountdownCard user={user} />

      {/* ── Stat Cards ────────────────────────────────────── */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statConfigs.map((cfg, i) => (
            <StatCard key={cfg.key} config={cfg} value={analytics.overview[cfg.key]} index={i} />
          ))}
        </div>
      )}

      {/* ── Main Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

        {/* Featured Achievements */}
        <motion.div className="xl:col-span-3 glass-card card-aqua p-6"
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ ...SPRING_SOFT, delay: 0.3 }}>
          <SectionHeader icon={Trophy} color="#f59e0b" title="Featured Achievements" link="/spotlight" />
          <div className="space-y-3">
            {achievements.map((ach, i) => (
              <motion.div key={ach.id}
                className="flex items-start gap-4 p-4 rounded-2xl cursor-pointer group item-row"
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ ...SPRING_SNAPPY, delay: 0.35 + i * 0.08 }}
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
                whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', transition: { duration: 0.2 } }}
              >
                <Avatar photo={ach.photo} initials={ach.avatar} color={ach.coverColor} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-white font-bold text-sm truncate">{ach.title}</p>
                      <p className="text-white/45 text-xs mt-0.5">{ach.employeeName} · {ach.department}</p>
                    </div>
                    <motion.div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${ach.badgeColor}18`, border: `1px solid ${ach.badgeColor}30` }}
                      animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.8 }}>
                      <BadgeIcon badge={ach.badge} color={ach.badgeColor} size={16} />
                    </motion.div>
                  </div>
                  <p className="text-white/40 text-xs mt-2 line-clamp-2 leading-relaxed">{ach.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="badge" style={{ background: `${ach.badgeColor}15`, color: ach.badgeColor, border: `1px solid ${ach.badgeColor}25` }}>{ach.category}</span>
                    <span className="text-white/25 text-xs">♥ {ach.likes}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pinned Announcements — moved here from bottom row */}
        <motion.div className="xl:col-span-2 glass-card card-ice p-6"
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ ...SPRING_SOFT, delay: 0.35 }}>
          <SectionHeader icon={Megaphone} color="#3b82f6" title="Pinned Announcements" link="/announcements" />
          <div className="space-y-3">
            {announcements.map((ann, i) => (
              <motion.div key={ann.id}
                className="p-4 rounded-2xl cursor-pointer item-row"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING_SNAPPY, delay: 0.4 + i * 0.06 }}
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', y: -2, transition: { duration: 0.15 } }}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${ann.categoryColor}15` }}>
                    <Bell size={14} style={{ color: ann.categoryColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm font-semibold leading-snug line-clamp-2">{ann.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="badge" style={{ background: `${ann.categoryColor}15`, color: ann.categoryColor, border: `1px solid ${ann.categoryColor}20` }}>{ann.category}</span>
                      <span className="text-xs text-white/25">{format(parseISO(ann.date), 'MMM d')}</span>
                      <span className="text-xs text-white/20 ml-auto">♥ {ann.likes}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Today For You + Pulse ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div className="lg:col-span-2 glass-card card-warm p-6"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_SOFT, delay: 0.4 }}
          style={{ border: '1px solid rgba(99,102,241,0.15)' }}>
          <div className="flex items-center gap-2 mb-4">
            <motion.div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}
              animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
              <Zap size={14} style={{ color: '#818cf8' }} />
            </motion.div>
            <h3 className="text-white font-bold text-base">Today For You</h3>
            <span className="ml-auto text-white/20 text-xs">{format(now, 'EEE, MMM d')}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              upcoming.some(u => u.daysUntil === 0) && { Icon: Cake, color: '#ec4899', title: `${upcoming.find(u => u.daysUntil === 0)?.employeeName}'s Birthday Today!`, sub: 'Tap to send them wishes', link: '/celebrations' },
              { Icon: BookMarked, color: '#a78bfa', title: 'Explore Policies', sub: 'Stay informed on company policies', link: '/policies' },
              { Icon: Gamepad2, color: '#f59e0b', title: 'Fun Friday', sub: "See this week's fun activity", link: '/fun-friday' },
              { Icon: MapPin, color: '#34d399', title: "Who's in the office today?", sub: '6 of 10 team members active', link: '/whos-in' },
            ].filter(Boolean).slice(0, 4).map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ ...SPRING_SNAPPY, delay: 0.45 + i * 0.06 }}>
                <Link to={item.link}
                  className="flex items-start gap-3 p-3.5 rounded-2xl transition-all duration-200 group block"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateX(3px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.transform = ''; }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.color}18`, border: `1px solid ${item.color}30` }}>
                    <item.Icon size={15} style={{ color: item.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white/80 text-sm font-semibold leading-tight">{item.title}</p>
                    <p className="text-white/35 text-xs mt-0.5">{item.sub}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Pulse Mini */}
        <motion.div className="glass-card card-pulse p-6 flex flex-col"
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ ...SPRING_SOFT, delay: 0.45 }}
          style={{ border: '1px solid rgba(129,140,248,0.2)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} style={{ color: '#818cf8' }} />
            <h3 className="text-white font-bold text-sm">Team Pulse</h3>
            <motion.span className="ml-auto w-2 h-2 rounded-full bg-emerald-400"
              animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }} />
          </div>
          {pulse && (
            <>
              <div className="flex flex-col items-center py-4 flex-1">
                <div className="relative w-28 h-28">
                  <svg width="112" height="112" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="56" cy="56" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                    <motion.circle cx="56" cy="56" r="44" fill="none"
                      stroke={pulse.score >= 70 ? '#10b981' : pulse.score >= 50 ? '#6366f1' : '#f59e0b'}
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 44}
                      initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - pulse.score / 100) }}
                      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                      style={{ filter: `drop-shadow(0 0 8px ${pulse.score >= 70 ? '#10b981' : '#6366f1'})` }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span className="text-2xl font-black text-white"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                      {pulse.score}
                    </motion.span>
                    <span className="text-white/30 text-xs">/100</span>
                  </div>
                </div>
                <p className="text-white/60 text-sm font-semibold mt-3">
                  {pulse.score >= 80 ? 'Team is thriving!' : pulse.score >= 60 ? 'Feeling good' : 'Mixed signals'}
                </p>
                <p className="text-white/30 text-xs mt-1">{pulse.total} check-ins today</p>
              </div>
              <Link to="/pulse"
                className="w-full py-2.5 rounded-xl text-center text-sm font-bold transition-all mt-2 block"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.15)'}>
                Check in your mood →
              </Link>
            </>
          )}
        </motion.div>
      </div>

      {/* ── Bottom Row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Upcoming Celebrations — moved here from main grid */}
        <motion.div className="glass-card card-celebrations p-6"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_SOFT, delay: 0.5 }}>
          <SectionHeader icon={PartyPopper} color="#ec4899" title="Upcoming" link="/celebrations" />
          <div className="space-y-2">
            {upcoming.map((item, i) => (
              <motion.div key={item.id}
                className="flex items-center gap-3 p-3 rounded-2xl item-row"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING_SNAPPY, delay: 0.55 + i * 0.06 }}
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)', transition: { duration: 0.15 } }}>
                <Avatar photo={item.photo} initials={item.avatar} color={item.coverColor} size="sm" shape="circle" />
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm font-semibold truncate">{item.employeeName}</p>
                  <p className="text-white/35 text-xs">{item.type === 'birthday' ? 'Birthday' : `${item.years}yr Anniversary`}</p>
                </div>
                <DaysChip days={item.daysUntil} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Kudos */}
        <motion.div className="glass-card card-kudos p-6"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_SOFT, delay: 0.55 }}>
          <SectionHeader icon={Heart} color="#ec4899" title="Recent Kudos" link="/kudos" />
          <div className="space-y-3">
            {kudos.map((kudo, i) => (
              <motion.div key={kudo.id}
                className="p-4 rounded-2xl cursor-pointer group item-row"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING_SNAPPY, delay: 0.6 + i * 0.07 }}
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.055)', borderColor: `${kudo.badgeColor}30`, y: -2, transition: { duration: 0.15 } }}
                onClick={() => setSelectedKudo(kudo)}>
                <div className="flex items-start gap-3">
                  <Avatar photo={kudo.fromPhoto} initials={kudo.fromAvatar} color={kudo.fromColor} size="sm" shape="circle" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs mb-1.5">
                      <span className="text-white/80 font-bold">{kudo.fromName}</span>
                      <span className="text-white/25 mx-1">recognized</span>
                      <span className="text-white/80 font-bold">{kudo.toName}</span>
                    </p>
                    <p className="text-white/45 text-xs leading-relaxed line-clamp-2 italic">"{kudo.message}"</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: `${kudo.badgeColor}15`, color: kudo.badgeColor }}>
                        <BadgeIcon badge={kudo.badge} color={kudo.badgeColor} size={10} /> {kudo.badge}
                      </span>
                      <span className="text-white/20 text-xs opacity-0 group-hover:opacity-100 transition-opacity">Tap to read →</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Kudo Modal */}
      <AnimatePresence>
        {selectedKudo && <KudoModal kudo={selectedKudo} onClose={() => setSelectedKudo(null)} />}
      </AnimatePresence>

      {/* My Journey Modal */}
      <AnimatePresence>
        {showJourney && <MyJourneyModal user={user} onClose={() => setShowJourney(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}
