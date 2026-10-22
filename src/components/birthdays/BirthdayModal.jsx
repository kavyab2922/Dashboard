import { useEffect, useState } from 'react';
import { Cake, PartyPopper, Sparkles, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { currentEmployee } from '../../data/employees';
import { isSameMonthDay } from '../../utils/format';

export default function BirthdayModal() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const today = new Date();
    const dismissedKey = `hrobit-birthday-dismissed-${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    if (isSameMonthDay(currentEmployee.birthday, today) && !sessionStorage.getItem(dismissedKey)) setOpen(true);
  }, []);
  const dismiss = () => {
    const today = new Date();
    sessionStorage.setItem(`hrobit-birthday-dismissed-${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`, 'yes');
    setOpen(false);
  };
  if (!open) return null;
  return <div className="birthday-backdrop"><motion.div className="birthday-modal" role="dialog" aria-modal="true" aria-label="Birthday celebration" initial={{ opacity: 0, scale: .85, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', damping: 18 }}><button className="birthday-close" aria-label="Dismiss birthday message" onClick={dismiss}><X size={18} /></button><div className="birthday-spark sparkle-one"><Sparkles size={22} /></div><div className="birthday-spark sparkle-two"><PartyPopper size={23} /></div><div className="birthday-illustration"><div className="birthday-orbit orbit-one"/><div className="birthday-orbit orbit-two"/><span className="birthday-cake"><Cake size={43} /></span><span className="birthday-confetti confetti-a">✦</span><span className="birthday-confetti confetti-b">✧</span><span className="birthday-confetti confetti-c">●</span></div><span className="birthday-kicker">A LITTLE REASON TO CELEBRATE</span><h2>Happy Birthday, {currentEmployee.name.split(' ')[0]}! 🎉</h2><p>Wishing you a wonderful year filled with good moments, fresh ideas, and plenty of reasons to smile.</p><div className="birthday-signoff">— Your HROrbit people community</div><button className="btn btn-primary birthday-cta" onClick={dismiss}>Thank you, everyone <Sparkles size={16} /></button></motion.div></div>;
}