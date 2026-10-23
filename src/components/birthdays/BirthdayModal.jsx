import { useEffect, useState } from 'react';
import { Cake, PartyPopper, Sparkles, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { isSameMonthDay } from '../../utils/format';
import { useApp } from '../../context/AppContext';

export default function BirthdayModal() {
  const { currentEmployee } = useApp();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener('hrobit-open-birthday', handleOpen);

    const today = new Date();
    const dismissedKey = `hrobit-birthday-dismissed-${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    if (currentEmployee.birthday && isSameMonthDay(currentEmployee.birthday, today) && !sessionStorage.getItem(dismissedKey)) {
      setOpen(true);
    }

    return () => window.removeEventListener('hrobit-open-birthday', handleOpen);
  }, [currentEmployee]);

  const dismiss = () => {
    const today = new Date();
    sessionStorage.setItem(
      `hrobit-birthday-dismissed-${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`,
      'yes'
    );
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="birthday-backdrop">
      <motion.div
        className="birthday-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Birthday celebration"
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
      >
        <button className="birthday-close" aria-label="Dismiss message" onClick={dismiss}>
          <X size={18} />
        </button>

        <div className="birthday-header-badge">
          <PartyPopper size={14} />
          <span>TEAM CELEBRATION</span>
        </div>

        <div className="birthday-illustration">
          <div className="birthday-cake-ring">
            <Cake size={44} />
          </div>
        </div>

        <h2>Happy Birthday, {currentEmployee.name.split(' ')[0]}! 🎉</h2>
        <p>
          Wishing you an incredible year ahead packed with bold ideas, meaningful accomplishments, and good vibes from all of us at HROrbit.
        </p>

        <div className="birthday-signoff">— From your team & workplace community</div>

        <button className="btn btn-primary birthday-cta" onClick={dismiss}>
          Thank you, everyone! <Sparkles size={16} />
        </button>
      </motion.div>
    </div>
  );
}
