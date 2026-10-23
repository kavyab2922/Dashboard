import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import FAQChatbot from '../chatbot/FAQChatbot';
import BirthdayModal from '../birthdays/BirthdayModal';
import { useApp } from '../../context/AppContext';
import { getToken } from '../../services/api';

const titles = {
  '/': 'Dashboard', '/announcements': 'Announcements', '/events': 'Upcoming events', '/quick-links': 'Quick links',
  '/hr-contacts': 'Quick Connect', '/faq': 'HR FAQ assistant', '/games': 'Daily games', '/learning': 'Learning hub',
  '/recognition': 'Kudos & recognition', '/community': 'Employee community', '/profile': 'My profile', '/settings': 'Settings', '/admin': 'Demo admin',
};

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { toast, sessionEnded } = useApp();
  const title = titles[location.pathname] || 'Employee hub';

  if (sessionEnded || !getToken()) return <Navigate to="/login" replace />;

  return <div className={`app-shell ${collapsed ? 'sidebar-is-collapsed' : ''}`}>
    <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
    <Header pageTitle={title} onMenuClick={() => setMobileOpen(true)} />
    <div className="main-shell"><main className="main-content"><AnimatePresence mode="wait"><motion.div key={location.pathname} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: .15 }}><Outlet /></motion.div></AnimatePresence><footer className="app-footer"><span>© 2026 HROrbit · Employee experience platform</span><span><span className="footer-status-dot" /> Connected to HROrbit API</span></footer></main></div>
    <FAQChatbot />
    <BirthdayModal />
    <AnimatePresence>{toast && <motion.div className="toast-message" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}><span>✓</span>{toast}</motion.div>}</AnimatePresence>
  </div>;
}