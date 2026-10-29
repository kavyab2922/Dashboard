import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Cake, PartyPopper, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CONFETTI_PARTICLES = Array.from({ length: 24 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  delay: `${(index % 8) * 0.55}s`,
  duration: `${5.8 + (index % 5) * 0.7}s`,
  color: ['#60a5fa', '#34d399', '#fbbf24', '#fb7185', '#c084fc', '#22d3ee'][index % 6],
  size: `${5 + (index % 3) * 2}px`,
  shape: ['2px', '50%', '1px'][index % 3],
}));

export function BirthdayConfettiLayer({ className = '' }) {
  return (
    <div className={`birthday-confetti-layer ${className}`.trim()} aria-hidden="true">
      {CONFETTI_PARTICLES.map((particle) => (
        <span
          key={particle.id}
          className="birthday-confetti-particle"
          style={{
            '--confetti-left': particle.left,
            '--confetti-delay': particle.delay,
            '--confetti-duration': particle.duration,
            '--confetti-color': particle.color,
            '--confetti-size': particle.size,
            '--confetti-shape': particle.shape,
          }}
        />
      ))}
    </div>
  );
}

function getTodayKey(prefix) {
  const today = new Date();
  return `${prefix}-${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

function getEmployeeId(employee) {
  return employee?.id ?? employee?.employeeId ?? employee?.employee_id;
}

function getEmployeeName(employee) {
  return (
    employee?.name ||
    employee?.fullName ||
    employee?.full_name ||
    [employee?.firstName || employee?.first_name, employee?.lastName || employee?.last_name].filter(Boolean).join(' ').trim() ||
    'Employee'
  );
}

function formatBirthdayDate(value) {
  if (typeof value !== 'string') return 'Birthday today';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return 'Birthday today';
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric' }).format(date);
}

function readSessionFlag(key) {
  try {
    return sessionStorage.getItem(key) === 'yes';
  } catch {
    return false;
  }
}

function writeSessionFlag(key) {
  try {
    sessionStorage.setItem(key, 'yes');
  } catch {
    // Continue if browser storage is unavailable.
  }
}

export default function BirthdayModal({ birthdays = [], loaded = false, error = null, onPersonalDismissed }) {
  const { user } = useApp();
  const birthdaysToday = birthdays;

  const [showPersonalPopup, setShowPersonalPopup] = useState(false);

  const userId = getEmployeeId(user);

  const personalBirthday = birthdaysToday.find((birthday) => {
    const birthdayId = getEmployeeId(birthday);
    return userId != null && birthdayId != null && String(birthdayId) === String(userId);
  }) || null;
  const hasPersonalBirthday = Boolean(personalBirthday);

  const personalDismissKey = getTodayKey(
    `hrobit-birthday-dismissed-${userId ?? 'user'}`
  );

  useEffect(() => {
    if (!loaded) return;

    const personalDismissed = readSessionFlag(personalDismissKey);

    setShowPersonalPopup(hasPersonalBirthday && !personalDismissed);
    if (personalDismissed) onPersonalDismissed?.();
  }, [
    loaded,
    hasPersonalBirthday,
    personalDismissKey,
    birthdaysToday,
  ]);

  function dismissPersonal() {
    writeSessionFlag(personalDismissKey);
    setShowPersonalPopup(false);
    onPersonalDismissed?.();
  }

  useEffect(() => {
    if (!showPersonalPopup) return;

    function handleKeyDown(event) {
      if (event.key === 'Escape') dismissPersonal();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPersonalPopup, personalDismissKey]);

  if (!loaded) return null;

  return (
    <AnimatePresence>
      {showPersonalPopup && (
        <PersonalBirthdayPopup
          key="personal-birthday"
          user={user}
          birthday={personalBirthday}
          dismiss={dismissPersonal}
        />
      )}
    </AnimatePresence>
  );
}

function PersonalBirthdayPopup({ user, birthday, dismiss }) {
  const employee = birthday;
  const name = getEmployeeName(employee || user);
  const firstName = name.split(' ')[0];
  const initials = employee?.initials || name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const avatarUrl = employee?.avatar || employee?.avatarUrl || employee?.profileImage || employee?.profile_image || null;
  const role = employee?.role || employee?.designation || 'Team member';
  const team = employee?.team || employee?.department || 'HROrbit team';
  const dob = employee?.dob || employee?.birthday;

  return (
    <motion.div
      className="birthday-backdrop birthday-backdrop-personal"
      onClick={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        className="birthday-modal birthday-modal-personal"
        role="dialog"
        aria-modal="true"
        aria-label="Birthday celebration"
        initial={{ opacity: 0, scale: 0.82, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 18 }}
        transition={{ type: 'spring', damping: 23, stiffness: 260 }}
      >
        <BirthdayConfettiLayer />
        <div className="birthday-glow birthday-glow-one" />
        <div className="birthday-glow birthday-glow-two" />
        <div className="birthday-confetti-dots" aria-hidden="true">
          <i /><i /><i /><i /><i /><i />
        </div>
        <div className="birthday-balloons" aria-hidden="true">
          <span className="birthday-balloon birthday-balloon-one" />
          <span className="birthday-balloon birthday-balloon-two" />
          <span className="birthday-balloon birthday-balloon-three" />
        </div>
        <button type="button" className="birthday-close" aria-label="Close birthday celebration" onClick={dismiss}>
          <X size={18} />
        </button>

        <div className="birthday-hero">
          <div className="birthday-header-badge"><PartyPopper size={15} /><span>YOUR SPECIAL DAY</span></div>
          <div className="birthday-illustration">
            <motion.div className="birthday-cake-ring" animate={{ y: [0, -7, 0], rotate: [0, 2, -2, 0] }} transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}>
              <Cake size={58} strokeWidth={1.8} />
            </motion.div>
            <span className="birthday-sparkle birthday-sparkle-one">✦</span>
            <span className="birthday-sparkle birthday-sparkle-two">✧</span>
            <span className="birthday-sparkle birthday-sparkle-three">✦</span>
          </div>
        </div>

        <div className="birthday-profile">
          <div className="birthday-profile-ring">
            {avatarUrl ? <img src={avatarUrl} alt={`${name}'s profile`} /> : <span>{initials || 'E'}</span>}
          </div>
          <span className="birthday-profile-check">✓</span>
        </div>

        <div className="birthday-copy">
          <span className="birthday-kicker">A MESSAGE FROM YOUR HROrbit TEAM</span>
          <h2>Happy Birthday, {firstName}!</h2>
          <p>Today is all about celebrating you. May the year ahead bring you joy, exciting opportunities, and plenty of moments worth celebrating.</p>
          <div className="birthday-details">
            <span><strong>{formatBirthdayDate(dob)}</strong><small>Birthday</small></span>
            <span><strong>{role}</strong><small>{team}</small></span>
          </div>
        </div>

        <div className="birthday-signoff"><Sparkles size={14} /> You make HROrbit brighter every day <Sparkles size={14} /></div>
        <button type="button" className="birthday-cta birthday-cta-grand" onClick={dismiss}>Thank you, everyone! <Sparkles size={16} /></button>
      </motion.div>
    </motion.div>
  );
}

function BirthdayNotificationsPanel({ birthdays, dismiss }) {
  if (!birthdays.length) return null;

  return (
    <motion.div
      className="birthday-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          dismiss();
        }
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="birthday-notifications-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Birthday notifications"
        initial={{ opacity: 0, y: 15, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
      >
        <BirthdayConfettiLayer />
        <div className="birthday-panel-header">
          <div>
            <span className="birthday-panel-eyebrow">
              <Cake size={14} />
              TODAY'S CELEBRATIONS
            </span>

            <h2>
              {birthdays.length} Birthday
              {birthdays.length === 1 ? '' : 's'} Today
            </h2>
          </div>

          <button
            type="button"
            className="birthday-close"
            aria-label="Close birthday notifications"
            onClick={dismiss}
          >
            <X size={18} />
          </button>
        </div>

        <div className="birthday-list">
          {birthdays.map((birthday, index) => {
            const name = getEmployeeName(birthday);

            const initials =
              birthday.initials ||
              name
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0])
                .join('')
                .toUpperCase();

            const avatarUrl = birthday.avatar || birthday.avatarUrl || birthday.profileImage || birthday.profile_image || null;
            const role = birthday.role || birthday.designation || 'Team member';
            const team = birthday.team || birthday.department || 'HROrbit team';

            return (
              <div
                key={getEmployeeId(birthday) ?? `${name}-${index}`}
                className="birthday-notification-item"
              >
                <div className="birthday-avatar">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={`${name}'s profile`}
                      className="birthday-avatar-img"
                      loading="lazy"
                    />
                  ) : (
                    <span
                      className={`avatar ${
                        birthday.color ? `avatar-${birthday.color}` : ''
                      }`}
                    >
                      {initials || 'E'}
                    </span>
                  )}
                </div>

                <div className="birthday-info">
                  <strong>{name}</strong>
                  <p className="birthday-message">
                    It's {name}'s birthday today! Wish them a wonderful day. 🎂
                  </p>
                  <small className="birthday-meta">{role} · {team} · {formatBirthdayDate(birthday.dob || birthday.birthday)}</small>
                </div>

                <div className="birthday-icons" aria-hidden="true">
                  <PartyPopper size={15} />
                  <Sparkles size={15} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="birthday-panel-footer">
          <span>Make someone's day a little brighter!</span>
          <span aria-hidden="true">🎉</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
