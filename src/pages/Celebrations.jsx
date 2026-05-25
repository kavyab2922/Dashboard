import { useState, useEffect, useRef, useCallback } from 'react';
import { Cake, Award, TrendingUp, Sparkles, Calendar, Star, Send, CheckCircle, MessageCircle } from 'lucide-react';
import { celebrationsAPI } from '../services/api';
import { format, parseISO } from 'date-fns';
import Avatar from '../components/common/Avatar';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────────────────────
   Confetti Engine
───────────────────────────────────────────────────────────── */
const COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#a855f7','#f43f5e','#fbbf24','#34d399','#60a5fa'];
const SHAPES = ['circle','square','triangle'];

function randomBetween(a, b) { return a + Math.random() * (b - a); }

function useConfetti() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);
  const runningRef = useRef(false);

  const createParticle = (x, y) => ({
    x, y,
    vx: randomBetween(-8, 8),
    vy: randomBetween(-18, -6),
    size: randomBetween(6, 14),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    opacity: 1,
    rotation: randomBetween(0, 360),
    rotationSpeed: randomBetween(-8, 8),
    gravity: 0.45,
    life: 1,
    decay: randomBetween(0.012, 0.022),
  });

  const drawParticle = (ctx, p) => {
    ctx.save();
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);

    if (p.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.shape === 'square') {
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    } else {
      ctx.beginPath();
      ctx.moveTo(0, -p.size / 2);
      ctx.lineTo(p.size / 2, p.size / 2);
      ctx.lineTo(-p.size / 2, p.size / 2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  };

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    particlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.99;
      p.rotation += p.rotationSpeed;
      p.life -= p.decay;
      p.opacity = Math.max(0, p.life);
      drawParticle(ctx, p);
    });

    if (particlesRef.current.length > 0) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      runningRef.current = false;
    }
  }, []);

  const burst = useCallback((x, y, count = 80) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    for (let i = 0; i < count; i++) {
      particlesRef.current.push(createParticle(x, y));
    }

    if (!runningRef.current) {
      runningRef.current = true;
      rafRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  const fullBurst = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const points = [
      { x: canvas.width * 0.2, y: canvas.height * 0.3 },
      { x: canvas.width * 0.5, y: canvas.height * 0.25 },
      { x: canvas.width * 0.8, y: canvas.height * 0.3 },
    ];
    points.forEach((p, i) => {
      setTimeout(() => burst(p.x, p.y, 100), i * 150);
    });
  }, [burst]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return { canvasRef, burst, fullBurst };
}

/* ─────────────────────────────────────────────────────────────
   Floating Emoji Background
───────────────────────────────────────────────────────────── */
const FLOAT_EMOJIS = ['🎉','🎊','🎈','🎂','🥳','✨','🎁','🌟','🎀','🍾','💫','🎶'];

function FloatingEmojis() {
  const items = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    emoji: FLOAT_EMOJIS[i % FLOAT_EMOJIS.length],
    left: `${randomBetween(2, 96)}%`,
    delay: `${randomBetween(0, 10)}s`,
    duration: `${randomBetween(12, 22)}s`,
    size: `${randomBetween(16, 28)}px`,
    opacity: randomBetween(0.06, 0.18),
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {items.map(item => (
        <span
          key={item.id}
          className="absolute select-none"
          style={{
            left: item.left,
            bottom: '-60px',
            fontSize: item.size,
            opacity: item.opacity,
            animation: `floatUp ${item.duration} ${item.delay} ease-in-out infinite`,
          }}
        >
          {item.emoji}
        </span>
      ))}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Streamers Banner (hero area)
───────────────────────────────────────────────────────────── */
function Streamers() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="absolute top-0"
          style={{
            left: `${10 + i * 9}%`,
            width: '3px',
            height: `${randomBetween(30, 80)}px`,
            background: `linear-gradient(180deg, ${COLORS[i % COLORS.length]}, transparent)`,
            borderRadius: '999px',
            animation: `streamerFall ${randomBetween(2, 4)}s ${randomBetween(0, 2)}s ease-in-out infinite alternate`,
            opacity: 0.5,
          }}
        />
      ))}
      <style>{`
        @keyframes streamerFall {
          0%   { transform: translateY(-20px) rotate(-5deg); opacity: 0.3; }
          100% { transform: translateY(20px) rotate(5deg); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Days Chip
───────────────────────────────────────────────────────────── */
function DaysChip({ days }) {
  if (days === 0) return (
    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black"
      style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(52,211,153,0.2))', color: '#34d399', border: '1px solid rgba(16,185,129,0.4)', boxShadow: '0 0 16px rgba(16,185,129,0.3)', animation: 'pulse 2s ease-in-out infinite' }}>
      🎉 Today!
    </span>
  );
  if (days === 1) return (
    <span className="badge text-xs font-bold px-3 py-1.5"
      style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}>
      Tomorrow
    </span>
  );
  if (days <= 7) return (
    <span className="badge text-xs font-bold px-3 py-1.5"
      style={{ background: 'rgba(251,146,60,0.15)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.25)' }}>
      {days} days
    </span>
  );
  return (
    <span className="badge text-xs px-3 py-1.5"
      style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
      {days}d away
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   Wish Box — send a wish with confetti burst
───────────────────────────────────────────────────────────── */
const QUICK_WISHES = {
  birthday: [
    'Happy Birthday! 🎂 Hope your day is as amazing as you are!',
    'Wishing you a fantastic birthday and a wonderful year ahead! 🎉',
    'Happy Birthday! 🥳 Thank you for everything you bring to the team!',
    'Many happy returns of the day! 🌟 You deserve all the happiness!',
  ],
  anniversary: [
    'Congratulations on this milestone! 🏆 Thank you for your dedication!',
    'Happy Work Anniversary! 🎊 Your contributions mean the world to us!',
    'Another year of excellence! 🌟 So grateful to have you on the team!',
    'Cheers to another amazing year together! 🥂 Here\'s to many more!',
  ],
  promotion: [
    'Congratulations on your promotion! 🚀 So well deserved!',
    'Onward and upward! 🌟 Can\'t wait to see all you accomplish in your new role!',
    'You earned every bit of this! 🏆 Congratulations and best of luck!',
  ],
};

function WishBox({ person, type, onBurst, color, cardRef }) {
  const wishedKey = `wished_${type}_${person.id}`;
  const [wished, setWished] = useState(() => !!localStorage.getItem(wishedKey));
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const templates = QUICK_WISHES[type] || QUICK_WISHES.birthday;

  const handleSend = async () => {
    if (!message.trim()) { toast.error('Write a wish first! 💬'); return; }
    setSending(true);
    await new Promise(r => setTimeout(r, 600));
    setSending(false);
    setWished(true);
    setOpen(false);
    localStorage.setItem(wishedKey, '1');

    // Burst confetti from the CENTER of the person's card
    if (cardRef?.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 3;
      // Triple burst for celebration effect
      onBurst(cx, cy, 100);
      setTimeout(() => onBurst(cx - 60, cy + 20, 60), 150);
      setTimeout(() => onBurst(cx + 60, cy + 20, 60), 300);
    }

    toast.success(`🎉 Wish sent to ${person.employeeName}!`);
  };

  if (wished) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-2xl mt-3"
        style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)' }}>
        <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
        <span className="text-emerald-400 text-xs font-bold">You wished {person.employeeName.split(' ')[0]}! 🎉</span>
      </div>
    );
  }

  return (
    <div className="mt-3">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold w-full justify-center transition-all hover:scale-105 active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${color}20, ${color}10)`,
            border: `1px solid ${color}35`,
            color: color,
            boxShadow: `0 4px 16px ${color}18`,
          }}
        >
          <MessageCircle size={13} />
          Send Wishes 🎉
        </button>
      ) : (
        <div className="rounded-2xl overflow-hidden"
          style={{ border: `1px solid ${color}30`, background: `${color}07` }}>
          {/* Quick pick templates */}
          <div className="p-3 pb-2">
            <p className="text-white/35 text-[10px] font-bold uppercase tracking-wider mb-2">Quick wishes</p>
            <div className="flex flex-col gap-1">
              {templates.map((t, i) => (
                <button key={i}
                  onClick={() => setMessage(t)}
                  className="text-left text-xs px-2.5 py-1.5 rounded-xl transition-all truncate"
                  style={message === t
                    ? { background: `${color}20`, color, border: `1px solid ${color}30` }
                    : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.07)' }
                  }
                  onMouseEnter={e => { if (message !== t) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                  onMouseLeave={e => { if (message !== t) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Text input */}
          <div className="px-3 pb-3">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={`Write your wish for ${person.employeeName.split(' ')[0]}…`}
              rows={2}
              className="input-field resize-none text-xs w-full mt-2"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button onClick={() => { setOpen(false); setMessage(''); }}
                className="flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                Cancel
              </button>
              <button onClick={() => handleSend()} disabled={sending || !message.trim()}
                className="flex-1 py-1.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all"
                style={{
                  background: message.trim() ? `linear-gradient(135deg, ${color}, ${color}bb)` : 'rgba(255,255,255,0.06)',
                  boxShadow: message.trim() ? `0 4px 16px ${color}40` : 'none',
                  color: message.trim() ? 'white' : 'rgba(255,255,255,0.2)',
                }}>
                {sending
                  ? <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  : <><Send size={11} /> Send 🎉</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Birthday Card
───────────────────────────────────────────────────────────── */
function BirthdayCard({ person, index, onCelebrate, onBurst }) {
  const isToday = person.daysUntil === 0;
  const cardRef = useRef(null);

  return (
    <div
      ref={cardRef}
      className="glass-card overflow-hidden group"
      style={{
        transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
        border: isToday ? '1px solid rgba(236,72,153,0.4)' : '1px solid rgba(255,255,255,0.08)',
        boxShadow: isToday ? '0 0 40px rgba(236,72,153,0.15)' : 'none',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px ${person.coverColor}25`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = isToday ? '0 0 40px rgba(236,72,153,0.15)' : ''; }}
    >
      {/* Gradient top bar */}
      <div className="h-2" style={{ background: `linear-gradient(90deg, ${person.coverColor}, #ec4899, #f59e0b)` }} />

      {/* Today badge */}
      {isToday && (
        <div className="flex items-center justify-between px-5 py-2"
          style={{ background: 'linear-gradient(90deg, rgba(236,72,153,0.15), transparent)', borderBottom: '1px solid rgba(236,72,153,0.15)' }}>
          <span className="text-xs font-black text-pink-400 uppercase tracking-widest flex items-center gap-1.5">
            <span style={{ animation: 'spin 2s linear infinite', display:'inline-block' }}>🎉</span>
            Celebrating Today!
          </span>
          <span className="text-xs text-pink-400/60">Click to celebrate</span>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-shrink-0">
            <div style={isToday ? { animation: 'ring-pulse 2s ease-in-out infinite', borderRadius: '18px' } : {}}>
              <Avatar photo={person.photo} initials={person.avatar} color={person.coverColor} size="lg" />
            </div>
            <span className="absolute -bottom-2 -right-2 text-2xl drop-shadow-xl"
              style={{ animation: isToday ? 'bounce-emoji 1s ease-in-out infinite' : 'none' }}>
              🎂
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-black text-base">{person.employeeName}</h3>
            <p className="text-white/45 text-xs mt-0.5">{person.role}</p>
            <p className="text-xs mt-1 font-bold" style={{ color: person.coverColor }}>{person.department}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <DaysChip days={person.daysUntil} />
            <span className="text-white/25 text-xs">{format(parseISO(person.date), 'MMM d')}</span>
          </div>
        </div>

        {/* Age display - clean, no confusing bar */}
        <div className="flex items-center gap-2 mb-4 px-1">
          <span className="text-white/30 text-xs">Turning</span>
          <span className="font-black text-base" style={{ color: person.coverColor }}>{person.age}</span>
          <span className="text-white/30 text-xs">years old 🎂</span>
        </div>

        {/* Message */}
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl"
          style={{ background: `${person.coverColor}0a`, border: `1px solid ${person.coverColor}15` }}>
          <Sparkles size={13} style={{ color: person.coverColor }} className="mt-0.5 flex-shrink-0" />
          <p className="text-white/55 text-xs leading-relaxed italic">{person.message}</p>
        </div>

        <WishBox person={person} type="birthday" onBurst={onBurst} color={person.coverColor} cardRef={cardRef} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Anniversary Card
───────────────────────────────────────────────────────────── */
function AnniversaryCard({ person, index, onCelebrate, onBurst }) {
  const cardRef = useRef(null);
  const isToday = person.daysUntil === 0;
  const milestone = person.years >= 5;

  return (
    <div
      ref={cardRef}
      className="glass-card overflow-hidden group"
      style={{
        transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
        border: milestone ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.08)',
        boxShadow: milestone ? '0 0 30px rgba(245,158,11,0.1)' : 'none',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(245,158,11,0.2)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = milestone ? '0 0 30px rgba(245,158,11,0.1)' : ''; }}
      onClick={e => isToday && onCelebrate(e)}
    >
      <div className="h-2" style={{ background: 'linear-gradient(90deg, #f59e0b, #fb923c, #fbbf24)' }} />

      {milestone && (
        <div className="flex items-center gap-2 px-5 py-2"
          style={{ background: 'rgba(245,158,11,0.08)', borderBottom: '1px solid rgba(245,158,11,0.12)' }}>
          <Star size={12} className="text-amber-400 fill-current" />
          <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
            {person.years >= 10 ? '🏆 Decade Club' : person.years >= 5 ? '⭐ 5-Year Legend' : 'Milestone'}
          </span>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-shrink-0">
            <Avatar photo={person.photo} initials={person.avatar} color={person.coverColor} size="lg" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #fb923c)', boxShadow: '0 4px 16px rgba(245,158,11,0.6)', animation: milestone ? 'ring-pulse-gold 2s ease-in-out infinite' : 'none' }}>
              {person.years}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-black text-base">{person.employeeName}</h3>
            <p className="text-white/45 text-xs mt-0.5">{person.role}</p>
            <p className="text-xs mt-1 font-black text-amber-400">
              🏆 {person.years} Year{person.years > 1 ? 's' : ''} with us
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <DaysChip days={person.daysUntil} />
            <span className="text-white/25 text-xs">{format(parseISO(person.date), 'MMM d')}</span>
          </div>
        </div>

        {/* Years timeline dots */}
        <div className="flex items-center gap-1.5 mb-4">
          {Array.from({ length: Math.min(person.years, 10) }).map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full"
              style={{
                background: i < person.years
                  ? `linear-gradient(90deg, #f59e0b, #fb923c)`
                  : 'rgba(255,255,255,0.06)',
                transition: `all 0.3s ease ${i * 80}ms`,
              }} />
          ))}
          {person.years > 10 && <span className="text-amber-400 text-xs font-bold">+{person.years - 10}</span>}
        </div>

        <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl"
          style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
          <Award size={13} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-white/55 text-xs leading-relaxed italic">{person.message}</p>
        </div>

        <WishBox person={person} type="anniversary" onBurst={onBurst} color="#f59e0b" cardRef={cardRef} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Promotion Card
───────────────────────────────────────────────────────────── */
function PromotionCard({ person, index, onCelebrate, onBurst }) {
  const cardRef = useRef(null);
  return (
    <div
      ref={cardRef}
      className="glass-card overflow-hidden group"
      style={{
        transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
        border: '1px solid rgba(16,185,129,0.2)',
        boxShadow: '0 0 24px rgba(16,185,129,0.08)',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(16,185,129,0.25)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 0 24px rgba(16,185,129,0.08)'; }}
    >
      <div className="h-2" style={{ background: 'linear-gradient(90deg, #10b981, #34d399, #6ee7b7)' }} />

      <div className="flex items-center gap-2 px-5 py-2"
        style={{ background: 'rgba(16,185,129,0.07)', borderBottom: '1px solid rgba(16,185,129,0.1)' }}>
        <TrendingUp size={12} className="text-emerald-400" />
        <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Promotion 🚀</span>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-shrink-0">
            <Avatar photo={person.photo} initials={person.avatar} color={person.coverColor} size="lg" />
            <span className="absolute -bottom-2 -right-2 text-2xl drop-shadow-xl"
              style={{ animation: 'bounce-emoji 1.5s ease-in-out infinite' }}>
              🚀
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-black text-base">{person.employeeName}</h3>
            <p className="text-white/40 text-xs">{person.department}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-white/30 text-xs line-through">{person.oldRole}</span>
              <div className="flex items-center gap-1">
                <TrendingUp size={11} className="text-emerald-400" />
              </div>
              <span className="text-emerald-400 text-xs font-black">{person.newRole}</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl"
          style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>
          <Sparkles size={13} className="text-emerald-400 mt-0.5 flex-shrink-0" />
          <p className="text-white/55 text-xs leading-relaxed italic">{person.message}</p>
        </div>

        <WishBox person={person} type="promotion" onBurst={onBurst} color="#10b981" cardRef={cardRef} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────────────────── */
export default function Celebrations() {
  const [data, setData] = useState({ birthdays: [], anniversaries: [], promotions: [] });
  const [activeTab, setActiveTab] = useState('birthdays');
  const [loading, setLoading] = useState(true);
  const [celebrationMsg, setCelebrationMsg] = useState('');
  const { canvasRef, burst, fullBurst } = useConfetti();

  useEffect(() => {
    celebrationsAPI.getAll().then(res => {
      setData(res);
      setLoading(false);
      // Auto-burst if someone is celebrating today
      const todayPeople = [...res.birthdays, ...res.workAnniversaries].filter(p => p.daysUntil === 0);
      if (todayPeople.length > 0) {
        setTimeout(() => {
          fullBurst();
          setCelebrationMsg(`🎉 Happy Birthday, ${todayPeople[0].employeeName}!`);
          setTimeout(() => setCelebrationMsg(''), 4000);
        }, 800);
      }
    }).catch(() => setLoading(false));
  }, []);

  const handleCelebrate = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 3;
    burst(x, y, 120);
    setCelebrationMsg('🎊 Woohoo! Celebrating! 🎊');
    setTimeout(() => setCelebrationMsg(''), 3000);
  }, [burst]);


  const tabs = [
    { id: 'birthdays',    label: 'Birthdays',    icon: Cake,       count: data.birthdays.length,    color: '#ec4899' },
    { id: 'anniversaries',label: 'Anniversaries',icon: Award,      count: data.anniversaries.length, color: '#f59e0b' },
    { id: 'promotions',   label: 'Promotions',   icon: TrendingUp, count: data.promotions.length,   color: '#10b981' },
  ];

  const upcomingSoon = [...(data.birthdays || []), ...(data.anniversaries || [])]
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .filter(i => i.daysUntil <= 7);

  const todayCount = upcomingSoon.filter(i => i.daysUntil === 0).length;

  return (
    <>
      {/* Canvas for confetti */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50"
        style={{ width: '100vw', height: '100vh' }}
      />

      {/* Floating emojis background */}
      <FloatingEmojis />

      {/* Celebration toast message */}
      {celebrationMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-scale-in"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.95), rgba(168,85,247,0.95))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '999px',
            padding: '12px 28px',
            boxShadow: '0 20px 60px rgba(99,102,241,0.5)',
            color: 'white',
            fontWeight: 800,
            fontSize: '16px',
            letterSpacing: '-0.3px',
          }}>
          {celebrationMsg}
        </div>
      )}

      <div className="space-y-7 animate-fade-in relative z-10">

        {/* ── Hero Header ─────────────────────────────────── */}
        <div className="relative overflow-hidden glass-card p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(236,72,153,0.12) 0%, rgba(99,102,241,0.08) 50%, rgba(245,158,11,0.1) 100%)',
            border: '1px solid rgba(236,72,153,0.2)',
            boxShadow: '0 8px 60px rgba(236,72,153,0.1)',
          }}>
          <Streamers />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.25)', animation: 'bounce-emoji 2s ease-in-out infinite' }}>
                  🎊
                </div>
                <div>
                  <h1 className="text-white text-2xl sm:text-3xl font-black tracking-tight"
                    style={{ background: 'linear-gradient(135deg, #f472b6, #fbbf24, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Celebrations
                  </h1>
                  <p className="text-white/40 text-sm">Honoring every milestone, big and small</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold"
                  style={{ background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.2)', color: '#f472b6' }}>
                  <Cake size={13} /> {data.birthdays.length} Birthdays
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold"
                  style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24' }}>
                  <Award size={13} /> {data.anniversaries.length} Anniversaries
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold"
                  style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }}>
                  <TrendingUp size={13} /> {data.promotions.length} Promotions
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Today's Celebrations Banner ─────────────────── */}
        {upcomingSoon.length > 0 && (
          <div className="glass-card p-5 relative overflow-hidden animate-slide-up"
            style={{ border: '1px solid rgba(236,72,153,0.25)', background: 'rgba(236,72,153,0.04)' }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 0% 50%, rgba(236,72,153,0.08), transparent 60%)' }} />

            <div className="relative z-10 flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-400"
                style={{ animation: 'pulse 1.5s ease-in-out infinite', boxShadow: '0 0 8px rgba(244,114,182,0.8)' }} />
              <span className="text-pink-400 font-black text-sm uppercase tracking-wider">
                {todayCount > 0 ? `🎂 Celebrating Today!` : 'Coming Up This Week'}
              </span>
            </div>

            <div className="relative z-10 flex flex-wrap gap-2">
              {upcomingSoon.map(item => (
                <div key={item.id}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl transition-all hover:scale-105 cursor-pointer"
                  style={{
                    background: item.daysUntil === 0
                      ? 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(245,158,11,0.15))'
                      : 'rgba(255,255,255,0.04)',
                    border: item.daysUntil === 0
                      ? '1px solid rgba(236,72,153,0.3)'
                      : '1px solid rgba(255,255,255,0.08)',
                  }}
                  onClick={e => handleCelebrate({ currentTarget: e.currentTarget })}
                >
                  <Avatar photo={item.photo} initials={item.avatar} color={item.coverColor} size="xs" shape="circle" />
                  <div>
                    <p className="text-white/85 text-xs font-bold">{item.employeeName}</p>
                    <p className="text-white/35 text-xs">
                      {item.type === 'birthday' ? '🎂' : '🎊'}{' '}
                      {item.daysUntil === 0 ? 'Today!' : `In ${item.daysUntil}d`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tabs ────────────────────────────────────────── */}
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200"
              style={activeTab === tab.id
                ? { background: `${tab.color}18`, border: `1px solid ${tab.color}35`, color: tab.color, boxShadow: `0 4px 24px ${tab.color}25, 0 0 0 1px ${tab.color}15` }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }
              }
            >
              <tab.icon size={15} />
              {tab.label}
              <span className="text-xs px-1.5 py-0.5 rounded-full font-black"
                style={activeTab === tab.id
                  ? { background: `${tab.color}25`, color: tab.color }
                  : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }
                }>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Content Grid ────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card h-52 shimmer" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTab === 'birthdays'     && data.birthdays.map((b, i)    => <BirthdayCard    key={b.id} person={b} index={i} onCelebrate={handleCelebrate} onBurst={burst} />)}
            {activeTab === 'anniversaries' && data.anniversaries.map((a, i) => <AnniversaryCard key={a.id} person={a} index={i} onCelebrate={handleCelebrate} onBurst={burst} />)}
            {activeTab === 'promotions'    && data.promotions.map((p, i)    => <PromotionCard   key={p.id} person={p} index={i} onCelebrate={handleCelebrate} onBurst={burst} />)}
          </div>
        )}

        {!loading && ((activeTab === 'birthdays' && data.birthdays.length === 0) ||
          (activeTab === 'anniversaries' && data.anniversaries.length === 0) ||
          (activeTab === 'promotions' && data.promotions.length === 0)) && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4" style={{ animation: 'bounce-emoji 2s ease-in-out infinite' }}>🎈</div>
            <p className="text-white/25">Nothing here yet — celebrations coming soon!</p>
          </div>
        )}
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes bounce-emoji {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes ring-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(236,72,153,0.5); }
          50%       { box-shadow: 0 0 0 8px rgba(236,72,153,0); }
        }
        @keyframes ring-pulse-gold {
          0%, 100% { box-shadow: 0 4px 16px rgba(245,158,11,0.6); }
          50%       { box-shadow: 0 4px 32px rgba(245,158,11,0.9), 0 0 0 8px rgba(245,158,11,0.1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
