import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Map, Star, TrendingUp, Award, Cake, BookOpen, Zap, ChevronDown, Rocket, BarChart2 } from 'lucide-react';
import Avatar from '../components/common/Avatar';
import { format, parseISO, differenceInDays, differenceInYears } from 'date-fns';
import api from '../services/api';
import toast from 'react-hot-toast';

const TYPE_CONFIG = {
  joined:     { icon: Zap,        color: '#6366f1', label: 'Joined',       GlyphIcon: Rocket    },
  promotion:  { icon: TrendingUp, color: '#10b981', label: 'Promotion',    GlyphIcon: BarChart2 },
  anniversary:{ icon: Cake,       color: '#ec4899', label: 'Anniversary',  GlyphIcon: Cake      },
  skill:      { icon: BookOpen,   color: '#3b82f6', label: 'Skill Growth', GlyphIcon: BookOpen  },
  award:      { icon: Award,      color: '#f59e0b', label: 'Recognition',  GlyphIcon: Award     },
  milestone:  { icon: Star,       color: '#a855f7', label: 'Milestone',    GlyphIcon: Star      },
};

/* ── Animated number (years/days) ─────────────────────────── */
function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return inView;
}

/* ── Timeline Event Card ───────────────────────────────────── */
function EventCard({ event, index, isLast }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  const cfg = TYPE_CONFIG[event.type] || TYPE_CONFIG.milestone;

  return (
    <div ref={ref} className="relative flex gap-5"
      style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateX(0)' : 'translateX(-20px)', transition: `opacity 0.5s ease ${index * 80}ms, transform 0.5s ease ${index * 80}ms` }}>

      {/* Timeline spine */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 40 }}>
        {/* Event dot */}
        <div className="relative z-10 w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
          style={{
            background: event.highlight ? `linear-gradient(135deg, ${event.color}, ${event.color}bb)` : `${event.color}18`,
            border: `2px solid ${event.color}${event.highlight ? 'ff' : '40'}`,
            boxShadow: event.highlight ? `0 0 20px ${event.color}60` : 'none',
          }}>
          <span style={{ filter: event.highlight ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none' }}>
            {event.icon}
          </span>
        </div>
        {/* Connecting line */}
        {!isLast && (
          <div className="flex-1 w-0.5 mt-2" style={{ background: `linear-gradient(180deg, ${event.color}40, rgba(255,255,255,0.05))`, minHeight: 32 }} />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-8 ${isLast ? 'pb-0' : ''}`}>
        <div className={`glass-card p-4 transition-all duration-300 ${event.highlight ? 'ring-1' : ''}`}
          style={{
            border: `1px solid ${event.highlight ? event.color + '35' : 'rgba(255,255,255,0.07)'}`,
            boxShadow: event.highlight ? `0 8px 32px ${event.color}15` : 'none',
            ...(event.highlight ? { background: `linear-gradient(135deg, ${event.color}08, rgba(255,255,255,0.02))` } : {}),
          }}>

          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge text-[10px] font-bold"
                  style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}25` }}>
                  <cfg.GlyphIcon size={9} className="inline mr-0.5" /> {cfg.label}
                </span>
                {event.badge && (
                  <span className="badge text-[10px] font-black"
                    style={{ background: `${event.color}20`, color: event.color, border: `1px solid ${event.color}35` }}>
                    {event.badge}
                  </span>
                )}
                {event.highlight && (
                  <span className="badge text-[10px] font-black"
                    style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}>
                    ✦ Key Moment
                  </span>
                )}
              </div>
              <h3 className={`mt-1.5 font-bold leading-snug ${event.highlight ? 'text-white text-base' : 'text-white/80 text-sm'}`}>
                {event.title}
              </h3>
            </div>
            <span className="text-white/25 text-xs flex-shrink-0 mt-0.5">
              {format(parseISO(event.date), 'MMM yyyy')}
            </span>
          </div>

          {/* Story text */}
          <p className="text-white/50 text-sm leading-relaxed">{event.description}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Employee Selector Card ────────────────────────────────── */
function EmployeeTab({ journey, active, onClick }) {
  const years = differenceInYears(new Date(), parseISO(journey.joinDate));
  return (
    <button onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-left w-full"
      style={active
        ? { background: `${journey.coverColor}15`, border: `1px solid ${journey.coverColor}30`, boxShadow: `0 4px 20px ${journey.coverColor}15` }
        : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }
      }
    >
      <Avatar photo={journey.photo} initials={journey.avatar} color={journey.coverColor} size="sm" shape="circle" />
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-bold truncate ${active ? 'text-white' : 'text-white/60'}`}>{journey.employeeName}</p>
        <p className="text-white/30 text-xs truncate">{journey.role} · {years}yr</p>
      </div>
      {active && <ChevronDown size={14} style={{ color: journey.coverColor, flexShrink: 0, transform: 'rotate(-90deg)' }} />}
    </button>
  );
}

/* ── Main Page ─────────────────────────────────────────────── */
export default function Journey() {
  const [journeys, setJourneys] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/journeys').then(d => {
      setJourneys(d);
      setSelected(d[0]);
      setLoading(false);
    }).catch(() => { toast.error('Failed to load'); setLoading(false); });
  }, []);

  useEffect(() => {
  }, [selected]);

  const handleSelect = (j) => { setSelected(j); };

  if (loading) {
    return <div className="flex justify-center h-64 items-center">
      <div className="w-10 h-10 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
    </div>;
  }

  const events = selected?.events || [];
  const years = selected ? differenceInYears(new Date(), parseISO(selected.joinDate)) : 0;
  const highlights = events.filter(e => e.highlight).length;

  return (
    <div className="space-y-7 animate-fade-in">

      {/* Hero */}
      <div className="relative overflow-hidden glass-card p-7"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.06))', border: '1px solid rgba(99,102,241,0.18)' }}>
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full pointer-events-none opacity-10"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent)', filter: 'blur(30px)' }} />
        <div className="relative z-10">
          <h1 className="text-white text-2xl font-black tracking-tight mb-1"
            style={{ background: 'linear-gradient(135deg, #a5b4fc, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Employee Journey Platform
          </h1>
          <p className="text-white/40 text-sm">Every career has a story. This is where we tell it.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Sidebar — employee selector */}
        <div className="space-y-3">
          <p className="text-white/30 text-xs font-bold uppercase tracking-wider px-1">Choose a Journey</p>
          {journeys.map(j => (
            <EmployeeTab key={j.employeeId} journey={j} active={selected?.employeeId === j.employeeId} onClick={() => handleSelect(j)} />
          ))}
        </div>

        {/* Main journey */}
        {selected && (
          <div className="lg:col-span-3 space-y-6">

            {/* Profile hero */}
            <div className="glass-card overflow-hidden"
              style={{ border: `1px solid ${selected.coverColor}25` }}>
              <div className="h-20 relative"
                style={{ background: `linear-gradient(135deg, ${selected.coverColor}30, ${selected.coverColor}08)` }}>
                <div className="absolute inset-0 opacity-15"
                  style={{ backgroundImage: `radial-gradient(circle at 15% 50%, ${selected.coverColor}, transparent 60%)` }} />
              </div>
              <div className="px-6 pb-5">
                <div className="-mt-8 flex items-end justify-between gap-4">
                  <div className="border-4 rounded-2xl flex-shrink-0" style={{ borderColor: '#080714' }}>
                    <Avatar photo={selected.photo} initials={selected.avatar} color={selected.coverColor} size="xl" />
                  </div>
                  {/* Play button */}
                  {/* <button onClick={handlePlay} disabled={playing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm mb-1 transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: playing ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg, ${selected.coverColor}, ${selected.coverColor}bb)`,
                      color: playing ? 'rgba(255,255,255,0.3)' : 'white',
                      boxShadow: playing ? 'none' : `0 4px 20px ${selected.coverColor}40`,
                    }}>
                    <Play size={14} className={playing ? 'animate-pulse' : ''} />
                    {playing ? 'Playing story…' : 'Play Story'}
                  </button> */}
                </div>

                <div className="mt-3">
                  <h2 className="text-white text-xl font-black">{selected.employeeName}</h2>
                  <p className="text-white/45 text-sm">{selected.role} · {selected.department}</p>
                  <p className="text-white/55 text-sm mt-3 leading-relaxed italic max-w-lg">
                    "{selected.story}"
                  </p>
                </div>

                {/* Stats */}
                <div className="flex gap-6 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  {[
                    { label: 'Years at OfficeVerse', value: years, color: selected.coverColor },
                    { label: 'Key Moments',          value: highlights, color: '#fbbf24' },
                    { label: 'Total Events',          value: events.length, color: '#a5b4fc' },
                  ].map(s => (
                    <div key={s.label}>
                      <p className="font-black text-2xl" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-white/30 text-xs">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Type legend */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                <span key={key} className="badge text-xs flex items-center gap-1"
                  style={{ background: `${cfg.color}12`, color: cfg.color, border: `1px solid ${cfg.color}22` }}>
                  <cfg.GlyphIcon size={10} /> {cfg.label}
                </span>
              ))}
            </div>

            {/* Timeline */}
            <div className="space-y-0">
              {events.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} isLast={i === events.length - 1} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
