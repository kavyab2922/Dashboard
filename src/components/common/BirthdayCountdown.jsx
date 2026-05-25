import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Heart, Send, X, MessageCircle, Cake, Sparkles, Star, Zap, Clock, Flame } from 'lucide-react';
import { createPortal } from 'react-dom';
import { employeesAPI } from '../../services/api';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────────────────────
   Hook: useBirthdayCountdown
   - birthday: "YYYY-MM-DD" string
   - Updates every second, auto-clears on unmount
───────────────────────────────────────────────────────────── */
export function useBirthdayCountdown(birthday) {
  const compute = useCallback(() => {
    if (!birthday) return null;

    const now = new Date();
    const [, mm, dd] = birthday.split('-').map(Number);

    // Check if TODAY is the birthday (same month + day regardless of time)
    const isTodayBirthday = now.getMonth() === mm - 1 && now.getDate() === dd;

    if (isTodayBirthday) {
      return {
        hours: 0, minutes: 0, seconds: 0, totalSec: 0,
        isBirthday: true, isWithin24h: true,
        isWithin1h: true, isWithin10min: true, isWithin5min: true,
        percentRemaining: 0,
      };
    }

    // Build this year's birthday (midnight)
    let bday = new Date(now.getFullYear(), mm - 1, dd, 0, 0, 0, 0);

    // If birthday midnight already passed this year, use next year
    if (bday <= now) {
      bday = new Date(now.getFullYear() + 1, mm - 1, dd, 0, 0, 0, 0);
    }

    const diffMs   = bday - now;
    const totalSec = Math.max(0, Math.floor(diffMs / 1000));
    const hours    = Math.floor(totalSec / 3600);
    const minutes  = Math.floor((totalSec % 3600) / 60);
    const seconds  = totalSec % 60;

    const isWithin24h   = diffMs > 0 && diffMs <= 24 * 60 * 60 * 1000;
    const isWithin1h    = diffMs > 0 && diffMs <= 60 * 60 * 1000;
    const isWithin10min = diffMs > 0 && diffMs <= 10 * 60 * 1000;
    const isWithin5min  = diffMs > 0 && diffMs <= 5  * 60 * 1000;

    const percentRemaining = isWithin24h
      ? Math.round((diffMs / (24 * 60 * 60 * 1000)) * 100)
      : 0;

    return {
      hours, minutes, seconds, totalSec,
      isBirthday: false, isWithin24h, isWithin1h, isWithin10min, isWithin5min,
      percentRemaining,
    };
  }, [birthday]);

  const [state, setState] = useState(() => compute());

  useEffect(() => {
    setState(compute());
    const id = setInterval(() => setState(compute()), 1000);
    return () => clearInterval(id);
  }, [compute]);

  return state;
}

/* ─────────────────────────────────────────────────────────────
   Confetti canvas burst
───────────────────────────────────────────────────────────── */
function useConfettiBurst() {
  const fire = useCallback((x, y, count = 100) => {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99999;';
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx    = canvas.getContext('2d');
    const colors = ['#f472b6','#fbbf24','#34d399','#818cf8','#fb923c','#60a5fa'];

    const particles = Array.from({ length: count }, () => ({
      x, y,
      vx:   (Math.random() - 0.5) * 14,
      vy:   Math.random() * -16 - 4,
      size: Math.random() * 7 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1, life: 1,
      decay:   Math.random() * 0.02 + 0.012,
      gravity: 0.5,
      rot: Math.random() * 360,
      rs:  (Math.random() - 0.5) * 9,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += p.gravity;
        p.rot += p.rs; p.life -= p.decay; p.opacity = Math.max(0, p.life);
        if (p.life <= 0) return;
        alive = true;
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle   = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.55);
        ctx.restore();
      });
      if (alive) requestAnimationFrame(draw);
      else        document.body.removeChild(canvas);
    };
    draw();
  }, []);
  return fire;
}

/* ─────────────────────────────────────────────────────────────
   Circular Progress Ring (SVG)
───────────────────────────────────────────────────────────── */
function ProgressRing({ percent, color }) {
  const r = 52, circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;

  return (
    <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
      <motion.circle cx="60" cy="60" r={r} fill="none"
        stroke={color} strokeWidth="7" strokeLinecap="round"
        strokeDasharray={circ}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   Animated Digit Block
   - Flips on every value change
───────────────────────────────────────────────────────────── */
function DigitBlock({ value, label, color }) {
  const padded = String(value).padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={padded}
            className="absolute text-2xl font-black tabular-nums"
            style={{ color }}
            initial={{ y: -28, opacity: 0 }}
            animate={{ y: 0,   opacity: 1 }}
            exit={  { y:  28, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {padded}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/35">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Teammate Wishes Modal — shown when user clicks "See Wishes"
───────────────────────────────────────────────────────────── */
const WISH_MESSAGES = [
  "Wishing you all the happiness in the world today!",
  "Happy Birthday! May this year bring you tons of joy and success!",
  "Hope your day is as wonderful as you are!",
  "Cheers to another year of awesomeness!",
  "Sending you the warmest birthday wishes!",
  "May all your dreams come true this year!",
  "You're a rockstar — happy birthday!",
  "Another year wiser, stronger, and more amazing!",
];

function WishesModal({ user, onClose, fire }) {
  const [employees, setEmployees] = useState([]);
  const [wishes, setWishes]       = useState([]);
  const [myWish, setMyWish]       = useState('');
  const [sent, setSent]           = useState(false);

  useEffect(() => {
    // Fire confetti burst on modal open
    const cx = window.innerWidth / 2, cy = window.innerHeight * 0.25;
    fire(cx, cy, 130);
    setTimeout(() => fire(cx - 150, cy + 60, 80), 280);
    setTimeout(() => fire(cx + 150, cy + 60, 80), 560);

    // Load teammates and generate mock wishes
    employeesAPI.getAll().then(emps => {
      const teammates = emps.filter(e => e.id !== (user?.id || 'emp001'));
      setEmployees(teammates);
      const generated = teammates.map((emp, i) => ({
        id:      emp.id,
        name:    emp.name,
        photo:   emp.photo,
        avatar:  emp.avatar,
        color:   emp.coverColor,
        message: WISH_MESSAGES[i % WISH_MESSAGES.length],
        liked:   false,
      }));
      setWishes(generated);
    }).catch(() => {});
  }, []);

  const handleLike = (id) => {
    setWishes(w => w.map(wish =>
      wish.id === id ? { ...wish, liked: !wish.liked } : wish
    ));
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!myWish.trim()) return;
    // Fire a small confetti on send
    fire(window.innerWidth / 2, window.innerHeight / 2, 60);
    setSent(true);
    toast.success('🎉 Your wish was sent!');
    setMyWish('');
  };

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(16px)' }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-lg overflow-hidden flex flex-col"
        style={{ maxHeight: '85vh', background: 'rgb(10,8,24)', border: '1px solid rgba(236,72,153,0.3)', borderRadius: 24, boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 60px rgba(236,72,153,0.15)' }}
        initial={{ scale: 0.88, y: 30, opacity: 0 }}
        animate={{ scale: 1,    y: 0,  opacity: 1 }}
        exit={{    scale: 0.92, y: 10, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Gradient top bar */}
        <div className="h-1.5 flex-shrink-0" style={{ background: 'linear-gradient(90deg, #ec4899, #8b5cf6, #f59e0b)' }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <motion.div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.3)' }}
              animate={{ rotate: [0,12,-12,0], scale:[1,1.1,1] }} transition={{ duration:1.5, repeat:Infinity }}>
              <Cake size={18} style={{ color: '#f472b6' }} />
            </motion.div>
            <div>
              <h3 className="text-white font-black text-sm">Birthday Wishes</h3>
              <p className="text-white/30 text-xs">{wishes.length} teammates sending love</p>
            </div>
          </div>
          <motion.button onClick={onClose} whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="p-1.5 rounded-xl text-white/30 hover:text-white hover:bg-white/8 transition-colors">
            <X size={16} />
          </motion.button>
        </div>

        {/* Birthday person photo + message */}
        <div className="flex-shrink-0 py-5 px-6 text-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(236,72,153,0.04)' }}>
          {user?.photo && (
            <div className="flex justify-center mb-3">
              <motion.div
                className="relative"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden"
                  style={{ border: '3px solid rgba(236,72,153,0.6)', boxShadow: '0 0 30px rgba(236,72,153,0.35), 0 8px 24px rgba(0,0,0,0.5)' }}>
                  <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                </div>
                {/* Floating decorations */}
                {[{ color: '#f472b6', delay: 0 }, { color: '#fbbf24', delay: 0.4 }, { color: '#a5b4fc', delay: 0.8 }].map((d, i) => (
                  <motion.div key={i} className="absolute pointer-events-none"
                    style={{ top: `${-6 + i * 10}px`, right: `${-10 + i * 4}px` }}
                    animate={{ y: [0, -5, 0], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: d.delay }}>
                    <Star size={10} style={{ color: d.color }} className="fill-current" />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}
          <motion.p
            className="text-white/70 text-sm font-semibold"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            Wishing you many more happy returns of the day,
          </motion.p>
          <motion.p
            className="font-black text-base mt-0.5"
            style={{ background: 'linear-gradient(135deg, #f472b6, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          >
            {user?.name?.split(' ')[0]}! 🎉
          </motion.p>
          <motion.p
            className="text-white/35 text-xs mt-2"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          >
            Your team celebrates you today — wishing you an amazing year ahead!
          </motion.p>
        </div>

        {/* Wishes list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {wishes.map((wish, i) => (
            <motion.div key={wish.id}
              className="flex items-start gap-3 p-3.5 rounded-2xl"
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.06, type: 'spring', stiffness: 200, damping: 24 }}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0"
                style={{ border: `2px solid ${wish.color}50` }}>
                {wish.photo
                  ? <img src={wish.photo} alt={wish.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-xs font-black"
                      style={{ background: `${wish.color}30`, color: wish.color }}>{wish.avatar}</div>
                }
              </div>
              {/* Message */}
              <div className="flex-1 min-w-0">
                <p className="text-white/80 text-xs font-bold mb-0.5">{wish.name}</p>
                <p className="text-white/50 text-xs leading-relaxed italic">"{wish.message}"</p>
              </div>
              {/* Like */}
              <button onClick={() => handleLike(wish.id)}
                className="flex-shrink-0 p-1.5 rounded-xl transition-all"
                style={wish.liked
                  ? { background: 'rgba(244,63,94,0.18)', color: '#f87171' }
                  : { color: 'rgba(255,255,255,0.2)' }
                }>
                <Heart size={13} className={wish.liked ? 'fill-current' : ''} />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Send your wish */}
        <div className="flex-shrink-0 px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(99,102,241,0.04)' }}>
          {sent ? (
            <motion.div
              className="flex items-center gap-2 justify-center py-2"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            >
              <span className="text-emerald-400 text-sm font-bold">✓ Sent!</span>
              <button onClick={() => setSent(false)} className="text-white/30 text-xs hover:text-white/60 transition-colors">Send another</button>
            </motion.div>
          ) : (
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                value={myWish}
                onChange={e => setMyWish(e.target.value)}
                placeholder="Reply"
                className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <motion.button type="submit" whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                className="px-4 py-2.5 rounded-xl font-bold text-sm text-white flex items-center gap-1.5 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', boxShadow: '0 4px 16px rgba(236,72,153,0.35)' }}>
                <Send size={14} /> Send
              </motion.button>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

/* ─────────────────────────────────────────────────────────────
   Birthday Mode — shown when timer hits 00:00:00
───────────────────────────────────────────────────────────── */
function BirthdayModeCard({ user, fire }) {
  const [showWishes, setShowWishes]   = useState(false);
  const [floatingWishes, setFloatingWishes] = useState([]);
  const [likedIds, setLikedIds]       = useState(new Set());

  useEffect(() => {
    // Auto-fire triple burst on mount
    const cx = window.innerWidth / 2, cy = window.innerHeight * 0.35;
    fire(cx, cy, 120);
    setTimeout(() => fire(cx - 120, cy + 40, 80), 300);
    setTimeout(() => fire(cx + 120, cy + 40, 80), 600);

    // Load teammates for floating bubbles
    employeesAPI.getAll().then(emps => {
      const teammates = emps.filter(e => e.id !== (user?.id || 'emp001'));
      setFloatingWishes(teammates.map((emp, i) => ({
        id: emp.id, name: emp.name, photo: emp.photo,
        avatar: emp.avatar, color: emp.coverColor,
        message: WISH_MESSAGES[i % WISH_MESSAGES.length],
      })));
    }).catch(() => {});
  }, []);

  // Show up to 6 bubbles inline (2 cols × 3 rows); rest go in modal
  const VISIBLE = 6;
  const visibleWishes = floatingWishes.slice(0, VISIBLE);
  const extraCount   = Math.max(0, floatingWishes.length - VISIBLE);

  return (
    <>
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1,    opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="relative overflow-hidden rounded-3xl px-8 py-7"
        style={{
          background: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(99,102,241,0.15), rgba(245,158,11,0.1))',
          border:     '1px solid rgba(236,72,153,0.5)',
          boxShadow:  '0 0 50px rgba(236,72,153,0.25), 0 0 80px rgba(99,102,241,0.1)',
        }}
      >
        {/* Floating decorative icons spread across card */}
        {[
          { color: '#f472b6', top: '10%',  left: '3%',  delay: 0    },
          { color: '#fbbf24', top: '65%',  left: '12%', delay: 0.4  },
          { color: '#a5b4fc', top: '15%',  left: '84%', delay: 0.8  },
          { color: '#34d399', top: '72%',  left: '92%', delay: 1.2  },
        ].map(({ color, top, left, delay }, i) => (
          <motion.div key={i} className="absolute pointer-events-none"
            style={{ top, left }}
            animate={{ y: [0, -10, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, delay, ease: 'easeInOut' }}>
            <Sparkles size={14} style={{ color }} />
          </motion.div>
        ))}

        {/* Main horizontal layout */}
        <div className="relative z-10 flex items-center gap-8">

          {/* Left — photo */}
          {user?.photo && (
            <motion.div
              className="relative flex-shrink-0"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="w-32 h-32 rounded-2xl overflow-hidden"
                style={{ border: '3px solid rgba(236,72,153,0.7)', boxShadow: '0 0 32px rgba(236,72,153,0.4), 0 8px 24px rgba(0,0,0,0.5)' }}>
                <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
              </div>
              {[{ color: '#f472b6', delay: 0 }, { color: '#fbbf24', delay: 0.5 }].map((d, i) => (
                <motion.div key={i} className="absolute pointer-events-none"
                  style={{ top: `${-6 + i * 10}px`, right: `${-10 + i * 4}px` }}
                  animate={{ y: [0, -6, 0], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity, delay: d.delay }}>
                  <Star size={10} style={{ color: d.color }} className="fill-current" />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Centre — text + button */}
          <div className="flex-shrink-0" style={{ minWidth: 220 }}>
            <motion.div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-2"
              style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.25), rgba(245,158,11,0.15))', border: '1px solid rgba(236,72,153,0.4)', boxShadow: '0 0 16px rgba(236,72,153,0.3)' }}
              animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
              <Cake size={20} style={{ color: '#f472b6' }} strokeWidth={1.5} />
            </motion.div>

            <motion.h3 className="text-white text-xl font-black mb-1 tracking-tight"
              style={{ background: 'linear-gradient(135deg, #f472b6, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🎉 Happy Birthday, {user?.name?.split(' ')[0]}!
            </motion.h3>

            <p className="text-white/45 text-xs italic mb-4">
              "Wishing you many more happy returns of the day!"
            </p>

            <motion.button
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              onClick={() => setShowWishes(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #ec4899, #f59e0b)', boxShadow: '0 6px 20px rgba(236,72,153,0.5)' }}
            >
              <MessageCircle size={15} />
              See Wishes
            </motion.button>
          </div>

          {/* Right — floating teammate wish bubbles (2-column grid) */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-2 gap-2">
              {visibleWishes.map((wish, i) => {
                const liked = likedIds.has(wish.id);
                return (
                  <motion.div
                    key={wish.id}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl cursor-pointer"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 200, damping: 24 }}
                    whileHover={{ y: -2, transition: { duration: 0.15 } }}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    onClick={() => setShowWishes(true)}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
                      style={{ border: `2px solid ${wish.color}60` }}>
                      {wish.photo
                        ? <img src={wish.photo} alt={wish.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-[10px] font-black"
                            style={{ background: `${wish.color}30`, color: wish.color }}>{wish.avatar}</div>
                      }
                    </div>
                    {/* Name + message */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 text-xs font-bold truncate">{wish.name}</p>
                      <p className="text-white/45 text-[11px] truncate italic">"{wish.message}"</p>
                    </div>
                    {/* Heart — stop propagation so click doesn't open modal */}
                    <motion.button
                      whileTap={{ scale: 1.4 }}
                      className="flex-shrink-0 p-1 rounded-lg transition-colors"
                      style={liked
                        ? { color: '#f43f5e' }
                        : { color: 'rgba(255,255,255,0.25)' }
                      }
                      onClick={e => {
                        e.stopPropagation();
                        setLikedIds(prev => {
                          const next = new Set(prev);
                          next.has(wish.id) ? next.delete(wish.id) : next.add(wish.id);
                          return next;
                        });
                      }}
                    >
                      <Heart size={13} className={liked ? 'fill-current' : ''} />
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>

            {/* +N more pill */}
            {extraCount > 0 && (
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                onClick={() => setShowWishes(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold mt-2"
                style={{ background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.25)', color: '#f472b6' }}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              >
                <MessageCircle size={11} /> +{extraCount} more wishes
              </motion.button>
            )}
          </div>

        </div>
      </motion.div>

      <AnimatePresence>
        {showWishes && (
          <WishesModal user={user} onClose={() => setShowWishes(false)} fire={fire} />
        )}
      </AnimatePresence>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main BirthdayCountdownCard
───────────────────────────────────────────────────────────── */
export default function BirthdayCountdownCard({ user }) {
  const countdown   = useBirthdayCountdown(user?.birthday);
  const fire        = useConfettiBurst();
  const [notifyTeam, setNotifyTeam] = useState(false);
  const cardRef     = useRef(null);

  const handleNotify = () => {
    setNotifyTeam(n => !n);
    toast(!notifyTeam
      ? 'Team will be notified on your birthday!'
      : 'Team notification cancelled.'
    );
  };

  // Don't render if birthday not within 24h and not birthday itself
  if (!countdown) return null;
  if (!countdown.isWithin24h && !countdown.isBirthday) return null;

  const { hours, minutes, seconds, percentRemaining,
          isBirthday, isWithin1h, isWithin10min, isWithin5min } = countdown;

  // Dynamic accent color based on urgency
  const accentColor = isWithin5min  ? '#f43f5e'
                    : isWithin10min ? '#f97316'
                    : isWithin1h    ? '#fbbf24'
                    :                 '#ec4899';

  // Border glow: pulsing, intensifies as birthday nears
  const glowIntensity = isWithin5min ? 0.7 : isWithin10min ? 0.5 : isWithin1h ? 0.35 : 0.25;

  // Shake class for < 10 min
  const shouldShake = isWithin10min && !isBirthday;

  if (isBirthday) {
    return (
      <div className="col-span-full">
        <BirthdayModeCard user={user} fire={fire} />
      </div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      className="relative overflow-hidden rounded-3xl"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      transition={{ type: 'spring', stiffness: 180, damping: 22 }}
      style={{
        background: `linear-gradient(135deg, ${accentColor}12, rgba(99,102,241,0.08))`,
        border:     `1.5px solid ${accentColor}${Math.round(glowIntensity * 99).toString(16)}`,
        boxShadow:  `0 0 32px ${accentColor}${Math.round(glowIntensity * 60).toString(16)}, 0 8px 40px rgba(0,0,0,0.35)`,
      }}
    >
      {/* Pulsing glow ring */}
      <motion.div className="absolute inset-0 rounded-3xl pointer-events-none"
        animate={{ opacity: [0, glowIntensity * 0.6, 0] }}
        transition={{ duration: isWithin5min ? 1.2 : isWithin10min ? 1.8 : 2.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ boxShadow: `inset 0 0 30px ${accentColor}40` }}
      />

      {/* Floating background cake icon */}
      <motion.div
        className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none select-none"
        animate={{ rotate: [0, 8, -8, 0], y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
        <Cake size={96} strokeWidth={1} style={{ color: 'white' }} />
      </motion.div>

      <div className="relative z-10 p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}35` }}
              animate={isWithin5min
                ? { y: [0, -6, 0], rotate: [0, 10, -10, 0] }
                : { y: [0, -4, 0] }
              }
              transition={{ duration: isWithin5min ? 0.8 : 2.5, repeat: Infinity, ease: 'easeInOut' }}>
              <Cake size={20} style={{ color: accentColor }} strokeWidth={1.8} />
            </motion.div>
            <div>
              <p className="text-white font-black text-sm leading-tight">Your Birthday is Coming!</p>
              <p className="text-white/40 text-xs mt-0.5">Get ready to celebrate 🎉</p>
            </div>
          </div>

          {/* Urgency badge */}
          <motion.span
            className="badge text-[10px] font-black flex-shrink-0"
            style={{ background: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}35` }}
            animate={{ scale: isWithin10min ? [1, 1.08, 1] : [1] }}
            transition={{ duration: 1.2, repeat: Infinity }}>
            {isWithin5min  ? 'Almost!' :
             isWithin10min ? 'Very Soon!' :
             isWithin1h    ? '< 1 Hour' :
                             `< 24 Hours`}
          </motion.span>
        </div>

        {/* Main timer + ring */}
        <div className="flex items-center justify-between gap-4">

          {/* Circular progress ring */}
          <div className="relative flex-shrink-0">
            <ProgressRing percent={percentRemaining} color={accentColor} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-black tabular-nums" style={{ color: accentColor }}>
                {100 - percentRemaining}%
              </span>
              <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider">elapsed</span>
            </div>
          </div>

          {/* Digit countdown */}
          <div className="flex-1">
            <motion.div
              className="flex items-center justify-center gap-2"
              animate={shouldShake ? {
                x: [0, -4, 4, -3, 3, -2, 2, 0],
              } : {}}
              transition={shouldShake ? { duration: 0.6, repeat: Infinity, repeatDelay: 2 } : {}}
            >
              <DigitBlock value={hours}   label="HRS"  color={accentColor} />
              <span className="text-2xl font-black mb-4" style={{ color: `${accentColor}60` }}>:</span>
              <DigitBlock value={minutes} label="MIN"  color={accentColor} />
              <span className="text-2xl font-black mb-4" style={{ color: `${accentColor}60` }}>:</span>
              <DigitBlock value={seconds} label="SEC"  color={accentColor} />
            </motion.div>

            {/* Progress bar */}
            <div className="h-1 rounded-full overflow-hidden mt-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div className="h-full rounded-full"
                animate={{ width: `${100 - percentRemaining}%` }}
                transition={{ duration: 1, ease: 'linear' }}
                style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80)`, boxShadow: `0 0 8px ${accentColor}` }}
              />
            </div>
            <p className="text-white/25 text-[10px] text-center mt-1.5 font-medium">
              {100 - percentRemaining}% of 24 hours elapsed
            </p>
          </div>
        </div>

        {/* Tooltip hint */}
        <div className="mt-4 px-3 py-2 rounded-xl text-center"
          style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}18` }}>
          <p className="text-white/50 text-xs italic">
            "Your special day is almost here!" 🥳 Hang tight, {user?.name?.split(' ')[0]}!
          </p>
        </div>

        {/* Notify Team toggle */}
        <div className="flex items-center justify-between mt-4 pt-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            {notifyTeam
              ? <Bell size={13} style={{ color: accentColor }} />
              : <BellOff size={13} className="text-white/30" />
            }
            <span className="text-white/50 text-xs font-medium">Notify Team</span>
            <span className="text-white/25 text-[10px]">(mock)</span>
          </div>
          <button onClick={handleNotify}
            className="relative w-10 h-5 rounded-full transition-all duration-300"
            style={{ background: notifyTeam ? `linear-gradient(135deg, ${accentColor}, #8b5cf6)` : 'rgba(255,255,255,0.1)' }}>
            <motion.span
              className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow"
              animate={{ left: notifyTeam ? '22px' : '2px' }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
