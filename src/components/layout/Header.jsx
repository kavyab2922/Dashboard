import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Cake, ChevronDown, Command, Menu, Moon, Palette, Search, Sun, X, Megaphone, CalendarDays, Award, ArrowUpRight, Check, Activity, LogOut } from 'lucide-react';
import { useBirthdayNotifications } from '../../hooks/useBirthdayNotifications';
import { dataApi, resolveAssetUrl } from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import useClickOutside from '../../hooks/useClickOutside';
import { Avatar, Button, Modal } from '../common/UI';
import RoleSwitch from '../common/RoleSwitch';
import BirthdayModal, { BirthdayConfettiLayer } from '../birthdays/BirthdayModal';

const palettes = [
  { id: 'sapphire', label: 'Sapphire Blue', color: '#2563eb', desc: 'Enterprise Tech' },
  { id: 'emerald', label: 'Emerald Mint', color: '#059669', desc: 'Wellness & Growth' },
  { id: 'violet', label: 'Iris Violet', color: '#7c3aed', desc: 'Modern & Creative' },
  { id: 'amber', label: 'Honey Amber', color: '#d97706', desc: 'Warm & Dynamic' },
];

export default function Header({ pageTitle, onMenuClick }) {
  const {
    theme, setTheme, colorTheme, setColorTheme, role,
    user,
    announcements, events, quickLinks, contacts, courses,
    notifications, notificationsState, markNotificationRead, markAllNotificationsRead, setToast, endSession,
    sessionVersion,
  } = useApp();
  const {
    birthdaysToday,
    loaded: birthdaysLoaded,
    error: birthdaysError,
    refresh: refreshBirthdays,
  } = useBirthdayNotifications(sessionVersion);
  const [personalBirthdayDismissed, setPersonalBirthdayDismissed] = useState(false);
  const hasPersonalBirthday = birthdaysToday.some((birthday) => {
    const birthdayId = birthday?.id ?? birthday?.employee_id ?? birthday?.employeeId;
    const userId = user?.id ?? user?.employee_id ?? user?.employeeId;
    return birthdayId != null && userId != null && String(birthdayId) === String(userId);
  });

  const displayName = user?.name || 'Employee';
  const displayInitials = user?.initials || displayName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [birthdayReadOverrides, setBirthdayReadOverrides] = useState({});
  const [notificationReadOverrides, setNotificationReadOverrides] = useState({});
  const [markingReadId, setMarkingReadId] = useState(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const autoOpenedUnreadRef = useRef('');
  const navigate = useNavigate();

  // One ref per navbar dropdown (trigger + panel) for outside-click closing.
  const searchRef = useRef(null);
  const paletteRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const dropdownRefs = useMemo(() => [searchRef, paletteRef, notifRef, profileRef], []);

  const today = new Date();
  const birthdayDayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const birthdayNotifications = useMemo(() => birthdaysToday.map((employee, index) => {
    const id = employee.notificationId || `birthday-${birthdayDayKey}-${employee.id ?? index}`;
    return {
      id,
      type: 'birthday',
      title: `${employee.name}'s birthday`,
      detail: `Wish ${employee.name} a wonderful birthday today!`,
      time: 'Today',
      read: birthdayReadOverrides[id] ?? Boolean(employee.read),
      employee,
    };
  }), [birthdaysToday, birthdayDayKey, birthdayReadOverrides]);
  const displayedNotifications = useMemo(() => {
    const merged = [
      ...birthdayNotifications,
      ...notifications.map((item) => ({
        ...item,
        read: notificationReadOverrides[item.id] ?? Boolean(item.read),
      })),
    ];
    return Array.from(new Map(merged.map((item) => [String(item.id), item])).values());
  }, [birthdayNotifications, notifications, notificationReadOverrides]);
  const unread = displayedNotifications.filter((item) => !item.read).length;

  useEffect(() => {
    setBirthdayReadOverrides((current) => {
      const validIds = new Set(birthdayNotifications.map((item) => item.id));
      const next = Object.fromEntries(Object.entries(current).filter(([id]) => validIds.has(id)));
      return Object.keys(next).length === Object.keys(current).length ? current : next;
    });
  }, [birthdayNotifications]);

  useEffect(() => {
    setNotificationReadOverrides((current) => {
      const validIds = new Set(notifications.map((item) => String(item.id)));
      const next = Object.fromEntries(
        Object.entries(current).filter(([id]) => validIds.has(String(id)))
      );
      return Object.keys(next).length === Object.keys(current).length ? current : next;
    });
  }, [notifications]);

  useEffect(() => {
    setBirthdayReadOverrides({});
    setNotificationReadOverrides({});
  }, [sessionVersion]);

  const hasUnreadNotifications = unread > 0;
  const unreadNotificationKey = displayedNotifications
    .filter((item) => !item.read)
    .map((item) => String(item.id))
    .sort()
    .join('|');

  useEffect(() => {
    if (!hasUnreadNotifications) {
      autoOpenedUnreadRef.current = '';
    }
  }, [hasUnreadNotifications, sessionVersion]);

  useEffect(() => {
    const notificationsReady = !notificationsState.loading;
    const birthdaysReady = birthdaysLoaded || Boolean(birthdaysError);
    if (!notificationsReady || !birthdaysReady || !hasUnreadNotifications) return;
    if (hasPersonalBirthday && !personalBirthdayDismissed) return;
    if (autoOpenedUnreadRef.current === unreadNotificationKey) return;

    autoOpenedUnreadRef.current = unreadNotificationKey;
    setNotifOpen(true);
  }, [
    notificationsState.loading,
    birthdaysLoaded,
    birthdaysError,
    hasUnreadNotifications,
    unreadNotificationKey,
    hasPersonalBirthday,
    personalBirthdayDismissed,
  ]);

  const results = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    const all = [
      ...announcements.map((item) => ({ title: item.title, subtitle: 'Announcement', to: '/announcements' })),
      ...events.map((item) => ({ title: item.title, subtitle: 'Event', to: '/events' })),
      ...quickLinks.map((item) => ({ title: item.title, subtitle: 'Quick link', to: '/quick-links' })),
      ...contacts.map((item) => ({ title: item.name, subtitle: item.team, to: '/hr-contacts' })),
      ...courses.map((item) => ({ title: item.title, subtitle: item.provider, to: '/learning' })),
    ];
    return all.filter((item) => `${item.title} ${item.subtitle}`.toLowerCase().includes(query)).slice(0, 7);
  }, [search, announcements, events, quickLinks, contacts, courses]);

  const goResult = (to) => {
    navigate(to);
    setSearch('');
    setSearchOpen(false);
  };

  const markAllRead = async () => {
    if (markingAllRead || !hasUnreadNotifications) return;

    setMarkingAllRead(true);
    const unreadBirthdayNotifications = birthdayNotifications.filter((item) => !item.read);
    const unreadNotifications = notifications.filter((item) => !item.read);
    const notificationIds = unreadNotifications.map((item) => item.id);
    const birthdayEmployeeIds = unreadBirthdayNotifications
      .map((item) => item.employee?.id)
      .filter((id) => id != null);

    try {
      await Promise.all([
        markAllNotificationsRead(notificationIds),
        birthdayEmployeeIds.length
          ? dataApi.birthdays.markAllRead(birthdayEmployeeIds)
          : Promise.resolve(),
      ]);

      // Apply only the IDs captured when the action started. A notification
      // created afterward remains unread and is not hidden by this action.
      setBirthdayReadOverrides((current) => ({
        ...current,
        ...Object.fromEntries(unreadBirthdayNotifications.map((item) => [item.id, true])),
      }));
      setNotificationReadOverrides((current) => ({
        ...current,
        ...Object.fromEntries(unreadNotifications.map((item) => [String(item.id), true])),
      }));
      await refreshBirthdays();
    } catch (err) {
      // The server remains the source of truth after a partial or failed
      // request; refreshes remove any stale local state rather than guessing.
      await refreshBirthdays().catch(() => {});
      setToast(err.message || 'Unable to mark all notifications as read.');
    } finally {
      setMarkingAllRead(false);
    }
  };

  const closeAll = useCallback(() => {
    setNotifOpen(false);
    setProfileOpen(false);
    setPaletteOpen(false);
    setSearchOpen(false);
  }, []);

  // Close the open dropdown when clicking anywhere outside it or its trigger.
  useClickOutside(dropdownRefs, searchOpen || paletteOpen || notifOpen || profileOpen, closeAll);

  const confirmLogout = () => {
    endSession();
    setLogoutConfirmOpen(false);
    closeAll();
    navigate('/login', { replace: true });
  };

  // Esc dismisses the log-out confirmation.
  useEffect(() => {
    if (!logoutConfirmOpen) return undefined;
    const onKeyDown = (event) => { if (event.key === 'Escape') setLogoutConfirmOpen(false); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [logoutConfirmOpen]);

  return (
    <>
      <header className="topbar">
        <button
          type="button"
          className="icon-button mobile-menu"
          aria-label="Open navigation menu"
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </button>

      <Link to="/" className="topbar-brand pading-left-10">
        <span className="topbar-brand-mark"><Activity size={21} strokeWidth={2.6} /></span>
        <span className="topbar-brand-name">HROrbit</span>
      </Link>

      <div className="topbar-tools">
        {/* Global Search */}
        <div ref={searchRef} className={`global-search-wrap ${searchOpen ? 'searching' : ''}`}>
          <Search size={17} />
          <input
            aria-label="Search HROrbit"
            value={search}
            onFocus={() => { closeAll(); setSearchOpen(true); }}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search anything..."
            onKeyDown={(event) => {
              if (event.key === 'Escape') { setSearchOpen(false); setSearch(''); }
              if (event.key === 'Enter' && results[0]) goResult(results[0].to);
            }}
          />
          {searchOpen && (
            <>
              <button className="search-dismiss" aria-label="Close search" onClick={() => { setSearchOpen(false); setSearch(''); }}>
                <X size={14} />
              </button>
              <div className="search-results">
                {search.trim() ? (
                  results.length ? (
                    results.map((item, index) => (
                      <button className="search-result" key={`${item.title}-${index}`} onClick={() => goResult(item.to)}>
                        <span className="search-result-icon"><Search size={14} /></span>
                        <span>
                          <strong>{item.title}</strong>
                          <small>{item.subtitle}</small>
                        </span>
                        <ArrowUpRight size={14} />
                      </button>
                    ))
                  ) : (
                    <div className="search-no-results">No matches found. Try another keyword.</div>
                  )
                ) : (
                  <div className="search-tip">Search announcements, events, people, links and learning resources.</div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Color Palette Switcher */}
        <div ref={paletteRef} className="topbar-popover-wrap">
          <button
            className={`icon-button palette-button ${paletteOpen ? 'active' : ''}`}
            aria-label="Choose color theme"
            title="Choose brand color scheme"
            onClick={() => { closeAll(); setPaletteOpen(!paletteOpen); }}
          >
            <Palette size={18} />
          </button>
          {paletteOpen && (
            <div className="popover-panel palette-popover">
              <div className="popover-header">
                <div>
                  <strong>Color Theme</strong>
                  <small>Customize workspace accent</small>
                </div>
              </div>
              <div className="palette-list">
                {palettes.map((p) => (
                  <button
                    key={p.id}
                    className={`palette-item ${(colorTheme || 'sapphire') === p.id ? 'active' : ''}`}
                    onClick={() => {
                      setColorTheme(p.id);
                      setPaletteOpen(false);
                      setToast(`Theme accent updated to ${p.label}`);
                    }}
                  >
                    <span className="palette-swatch" style={{ background: p.color }} />
                    <div className="palette-info">
                      <strong>{p.label}</strong>
                      <small>{p.desc}</small>
                    </div>
                    {(colorTheme || 'sapphire') === p.id && <Check size={16} className="palette-check" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="topbar-popover-wrap">
          <button
            className={`icon-button notification-button ${notifOpen ? 'active' : ''}`}
            aria-label={`Notifications, ${unread} unread`}
            onClick={() => { closeAll(); setNotifOpen(!notifOpen); }}
          >
            <Bell size={19} />
            {hasUnreadNotifications && <i className="notification-unread-dot" aria-hidden="true" />}
          </button>
          {notifOpen && (
            <div className={`popover-panel notification-panel ${birthdayNotifications.length ? 'birthday-notification-popup' : ''}`}>
              <div className="popover-header">
                <BirthdayConfettiLayer className="notification-header-confetti" />
                <div>
                  <strong>Notifications</strong>
                  <small>{unread} unread updates</small>
                </div>
                <button
                  type="button"
                  className="notification-mark-all"
                  disabled={markingAllRead || !hasUnreadNotifications}
                  onClick={markAllRead}
                >
                  {markingAllRead ? 'Updating…' : 'Mark all read'}
                </button>

              </div>
              {birthdaysError && !birthdayNotifications.length && (
                <div className="notification-data-warning" role="status">
                  Birthday notifications are temporarily unavailable.
                </div>
              )}
              {displayedNotifications.length ? (
                displayedNotifications.map((item) => (
                  <button
                    key={item.id}
                    className={`notification-row ${item.type === 'birthday' ? 'birthday-notification' : ''} ${!item.read ? 'unread' : ''}`}
                    onClick={async () => {
                      if (item.type === 'birthday') {
                        if (markingReadId) return;
                        const employeeId = item.employee?.id;
                        const previous = birthdayReadOverrides[item.id];
                        setMarkingReadId(item.id);
                        setBirthdayReadOverrides((current) => ({ ...current, [item.id]: true }));
                        try {
                          await dataApi.birthdays.markRead(employeeId);
                          await refreshBirthdays();
                        } catch (err) {
                          setBirthdayReadOverrides((current) => {
                            const next = { ...current };
                            if (previous === undefined) delete next[item.id];
                            else next[item.id] = previous;
                            return next;
                          });
                          setToast(err.message || 'Unable to update birthday notification.');
                        } finally {
                          setMarkingReadId(null);
                        }
                        return;
                      }
                      const previous = notificationReadOverrides[item.id];
                      setNotificationReadOverrides((current) => ({ ...current, [item.id]: true }));
                      try {
                        await markNotificationRead(item.id);
                        navigate(item.type === 'event' ? '/events' : item.type === 'kudos' ? '/recognition' : '/announcements');
                      } catch (err) {
                        setNotificationReadOverrides((current) => {
                          const next = { ...current };
                          if (previous === undefined) delete next[item.id];
                          else next[item.id] = previous;
                          return next;
                        });
                        setToast(err.message || 'Unable to update notification.');
                      }
                    }}
                  >
                    <span className={`notification-symbol ${item.type}`}>
                      {item.type === 'birthday' ? (
                        item.employee?.avatar ? <img src={resolveAssetUrl(item.employee.avatar)} alt="" className="birthday-notification-avatar" /> : <Cake size={16} />
                      ) : item.type === 'event' ? <CalendarDays size={16} /> : item.type === 'kudos' ? <Award size={16} /> : <Megaphone size={16} />}
                    </span>
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.detail}</small>
                      <em>{item.time}</em>
                    </span>
                    {item.type === 'birthday' ? <span className="birthday-notification-cake" aria-label="Birthday cake">🎂</span> : !item.read && <span className="unread-dot" />}
                  </button>
                ))
              ) : (
                <div className="search-no-results">You're all caught up.</div>
              )}
              <button className="popover-footer" onClick={() => { setNotifOpen(false); setToast('You are viewing the latest notifications.'); }}>
                You're all caught up <span>✓</span>
              </button>
            </div>
          )}
        </div>

        {/* Personal birthday celebration */}
        <BirthdayModal
          birthdays={birthdaysToday}
          loaded={birthdaysLoaded}
          error={birthdaysError}
          onPersonalDismissed={() => setPersonalBirthdayDismissed(true)}
        />

        {/* Dark/Light Theme Toggle */}
        <button
          className="icon-button theme-button"
          aria-label="Toggle theme"
          title="Toggle theme"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Profile Trigger */}
        <div ref={profileRef} className="topbar-popover-wrap">
          <button
            className="profile-trigger"
            onClick={() => { closeAll(); setProfileOpen(!profileOpen); }}
          >
            <Avatar name={displayName} initials={displayInitials} color="blue" src={user?.avatar} />
            <span className="profile-trigger-copy">
              <strong>{displayName}</strong>
              <small>{role} </small>
            </span>
            <ChevronDown size={15} />
          </button>
          {profileOpen && (
            <div className="popover-panel profile-menu">
              <div className="profile-menu-top">
                <Avatar name={displayName} initials={displayInitials} color="blue" size="lg" src={user?.avatar}/>
                <div className="profile-menu-info">
                  <strong>{displayName}</strong>
                  <small>{user?.role || user?.team || 'Employee'}</small>
                </div>
              </div>
              <button onClick={() => { navigate('/profile'); setProfileOpen(false); }}>
                My profile <ArrowUpRight size={14} />
              </button>
              <RoleSwitch onSwitched={() => setProfileOpen(false)} />
              <button
                className="profile-menu-logout"
                onClick={() => {
                  setProfileOpen(false);
                  setLogoutConfirmOpen(true);
                }}
              >
                Logout <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
      </header>

      <Modal
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        title="Log out of HROrbit?"
        className="logout-confirm-modal"
        hideClose
      >
        <div className="logout-confirm">
          <span className="logout-confirm-icon" aria-hidden="true"><LogOut size={22} /></span>
          <h2>Log out of HROrbit?</h2>
          <p>You're signed in as <strong>{displayName}</strong>. You'll need to sign in again to continue.</p>
          <div className="logout-confirm-actions">
            <Button variant="secondary" autoFocus onClick={() => setLogoutConfirmOpen(false)}>
              Cancel
            </Button>
            <Button className="btn-danger" onClick={confirmLogout}>
              <LogOut size={15} /> Log out
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
