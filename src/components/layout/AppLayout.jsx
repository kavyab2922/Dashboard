import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import FAQChatbot from '../chatbot/FAQChatbot';
import BirthdayModal from '../birthdays/BirthdayModal';
import { useApp } from '../../context/AppContext';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { toast, apiOnline } = useApp();
  return <div className="app-shell">
    <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
    <Header />
    <div className="main-shell"><main className="main-content"><AnimatePresence mode="wait"><motion.div key={location.pathname} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: .15 }}><Outlet /></motion.div></AnimatePresence><footer className="app-footer"><span>© 2026 HROrbit · Employee experience</span><span><span className="footer-status-dot" /> {apiOnline ? 'Connected to API' : 'Offline · showing local fallback data'}</span></footer></main></div>
    <FAQChatbot />
    <BirthdayModal />
    <AnimatePresence>{toast && <motion.div className="toast-message" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}><span>✓</span>{toast}</motion.div>}</AnimatePresence>
  </div>;
}