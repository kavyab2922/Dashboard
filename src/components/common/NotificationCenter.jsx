import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, X, Heart, Trophy, Cake, Megaphone, CalendarCheck, CheckCircle, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

/* ── Static smart notifications based on app data ───────────── */
const buildNotifications = () => {
  const today = new Date();
  const todayKey = today.toISOString().split('T')[0];
  const streak = JSON.parse(localStorage.getItem('pulseStreak') || '{"count":0,"lastDate":""}');
  const pulseToday = !!localStorage.getItem(`pulse_${todayKey}`);
  const lastKudoSeen = localStorage.getItem('lastKudoSeen');

  const notifs = [
    {
      id: 'birthday-today',
      type: 'celebration',
      icon: Cake,
      color: '#ec4899',
      title: "🎂 It's Ananya Iyer's Birthday!",
      sub: 'Send her a celebration message today',
      link: '/celebrations',
      time: 'Today',
      read: false,
      priority: 'high',
    },
    {
      id: 'kudos-received',
      type: 'kudos',
      icon: Heart,
      color: '#f43f5e',
      title: 'Priya Menon recognized you! 🎉',
      sub: '"The way you handled the incident was phenomenal!"',
      link: '/kudos',
      time: '2h ago',
      read: lastKudoSeen === todayKey,
      priority: 'high',
    },
    {
      id: 'pulse-reminder',
      type: 'pulse',
      icon: Flame,
      color: '#6366f1',
      title: pulseToday ? `🔥 ${streak.count}-day streak! Keep it up!` : '💙 Check in your pulse today',
      sub: pulseToday ? 'Your mood has been recorded. See you tomorrow!' : 'Takes 10 seconds · Completely anonymous',
      link: '/pulse',
      time: 'Daily',
      read: pulseToday,
      priority: pulseToday ? 'low' : 'high',
    },
    {
      id: 'anniversary',
      type: 'celebration',
      icon: Trophy,
      color: '#f59e0b',
      title: "🏆 Vikram Singh's 8-Year Anniversary!",
      sub: 'In 15 days — plan something special',
      link: '/celebrations',
      time: '15 days',
      read: false,
      priority: 'medium',
    },
    {
      id: 'ld-budget',
      type: 'policy',
      icon: CalendarCheck,
      color: '#10b981',
      title: '📚 L&D Budget resets March 31!',
      sub: '₹50,000 to use before April 1st — submit requests now',
      link: '/policies',
      time: '29 days left',
      read: false,
      priority: 'medium',
    },
    {
      id: 'new-announcement',
      type: 'announcement',
      icon: Megaphone,
      color: '#3b82f6',
      title: '📢 New flexible work hours from March 1',
      sub: 'Choose start time between 8–11 AM. Core hours: 11–4 PM.',
      link: '/announcements',
      time: '1 day ago',
      read: false,
      priority: 'medium',
    },
    {
      id: 'leave-approved',
      type: 'leave',
      icon: CheckCircle,
      color: '#34d399',
      title: '✅ Your leave has been approved',
      sub: 'March 10–12 approved by Priya Menon',
      link: '/leaves',
      time: '3h ago',
      read: true,
      priority: 'low',
    },
  ];

  return notifs;
};

/* ── Notification Item ─────────────────────────────────────── */
function NotifItem({ notif, onRead }) {
  return (
    <Link to={notif.link} onClick={() => onRead(notif.id)}
      className="flex items-start gap-3 px-4 py-3.5 transition-all duration-200 group relative"
      style={!notif.read ? { background: 'rgba(99,102,241,0.06)' } : {}}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
      onMouseLeave={e => e.currentTarget.style.background = !notif.read ? 'rgba(99,102,241,0.06)' : ''}
    >
      {/* Unread dot */}
      {!notif.read && (
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
          style={{ background: notif.color }} />
      )}

      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${notif.color}18`, border: `1px solid ${notif.color}25` }}>
        <notif.icon size={14} style={{ color: notif.color }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${notif.read ? 'text-white/50' : 'text-white/85 font-semibold'}`}>
          {notif.title}
        </p>
        <p className="text-white/35 text-xs mt-0.5 line-clamp-2 leading-relaxed">{notif.sub}</p>
        <p className="text-xs mt-1 font-medium" style={{ color: `${notif.color}80` }}>{notif.time}</p>
      </div>
    </Link>
  );
}

/* ── Main Component ────────────────────────────────────────── */
export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [panelPos, setPanelPos] = useState({ top: 0, right: 0 });
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    setNotifs(buildNotifications());
  }, []);

  const computePos = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPanelPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
  };

  const handleOpen = () => {
    computePos();
    setOpen(o => !o);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on resize or scroll OUTSIDE the panel
  useEffect(() => {
    if (!open) return;
    const onResize = () => setOpen(false);
    const onScroll = (e) => {
      // Don't close if the scroll happened inside the notification panel
      if (panelRef.current && panelRef.current.contains(e.target)) return;
      setOpen(false);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open]);

  const unreadCount = notifs.filter(n => !n.read).length;
  const highPriority = notifs.filter(n => n.priority === 'high' && !n.read);

  const markRead = (id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (id === 'kudos-received') localStorage.setItem('lastKudoSeen', new Date().toISOString().split('T')[0]);
  };

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={triggerRef}
        onClick={handleOpen}
        className="relative p-2 rounded-xl transition-all hover:bg-white/8 text-white/50 hover:text-white"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-black text-white px-1"
            style={{
              background: highPriority.length > 0 ? 'linear-gradient(135deg, #ef4444, #f43f5e)' : '#6366f1',
              boxShadow: highPriority.length > 0 ? '0 0 10px rgba(239,68,68,0.6)' : '0 0 10px rgba(99,102,241,0.5)',
              animation: highPriority.length > 0 ? 'pulse 2s ease-in-out infinite' : 'none',
            }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel — rendered via portal so it sits above ALL page content (confetti, floating emojis, etc.) */}
      {open && createPortal(
        <div
          ref={panelRef}
          className="w-80 sm:w-96 animate-scale-in"
          style={{
            position: 'fixed',
            top: panelPos.top,
            right: panelPos.right,
            zIndex: 99999,
            background: 'var(--bg-surface)',          /* fully opaque — nothing bleeds through */
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '20px',
            boxShadow: '0 24px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(99,102,241,0.15)',
          }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Bell size={15} style={{ color: '#818cf8' }} />
              <span className="text-white font-bold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full font-black"
                  style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead}
                  className="text-xs text-white/35 hover:text-primary-400 transition-colors font-medium">
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)}
                className="text-white/30 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* High priority section */}
          {highPriority.length > 0 && (
            <div className="px-4 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-white/25 mb-1">Needs Attention</p>
            </div>
          )}

          {/* Notification list */}
          <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
            {notifs.map(notif => (
              <NotifItem key={notif.id} notif={notif} onRead={markRead} />
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-white/5">
            <Link to="/announcements" onClick={() => setOpen(false)}
              className="text-xs text-center w-full block font-semibold transition-colors"
              style={{ color: 'rgba(139,92,246,0.7)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(139,92,246,0.7)'}
            >
              View all announcements →
            </Link>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
