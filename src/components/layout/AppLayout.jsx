import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import FAQChatbot from '../chatbot/FAQChatbot';
import { useApp } from '../../context/AppContext';
import { getToken } from '../../services/api';

const titles = {
  '/': 'Dashboard', '/announcements': 'Announcements', '/events': 'Upcoming events', '/quick-links': 'Quick links',
  '/hr-contacts': 'Quick Connect', '/faq': 'HR FAQ assistant', '/games': 'Daily games', '/learning': 'Learning hub',
  '/recognition': 'Kudos & recognition', '/community': 'Employee community', '/profile': 'My profile', '/settings': 'Settings', '/admin': 'Admin console',
};

const SIDEBAR_PINNED_KEY = 'hrobit-sidebar-pinned';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pinned, setPinned] = useState(() => localStorage.getItem(SIDEBAR_PINNED_KEY) === 'true');
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(SIDEBAR_PINNED_KEY) !== 'true');
  const location = useLocation();
  const { toast, sessionEnded } = useApp();
  const title = titles[location.pathname] || 'Employee hub';

  useEffect(() => {
    localStorage.setItem(SIDEBAR_PINNED_KEY, String(pinned));
  }, [pinned]);

  const handlePinToggle = () => {
    setPinned((currentPinned) => {
      const nextPinned = !currentPinned;
      if (nextPinned) setCollapsed(false);
      return nextPinned;
    });
  };

  if (sessionEnded || !getToken()) return <Navigate to="/login" replace />;

  return <div className={`app-shell ${collapsed && !pinned ? 'sidebar-is-collapsed' : ''}`}>
    <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} collapsed={collapsed} pinned={pinned} onPinToggle={handlePinToggle} onToggle={() => setCollapsed((currentCollapsed) => !currentCollapsed)} onAutoCollapse={() => { if (!pinned) setCollapsed(true); }} />
    <Header pageTitle={title} onMenuClick={() => setMobileOpen(true)} />
    <div className="main-shell"><main className="main-content"><AnimatePresence mode="wait"><motion.div key={location.pathname} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: .15 }}><Outlet /></motion.div></AnimatePresence><footer className="app-footer"><span>© 2026 HROrbit · Employee experience platform</span><span><span className="footer-status-dot" /> Connected to HROrbit API</span></footer></main></div>
    <FAQChatbot />
    <AnimatePresence>{toast && <motion.div className="toast-message" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}><span>✓</span>{toast}</motion.div>}</AnimatePresence>
  </div>;
}