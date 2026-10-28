import { useCallback, useMemo, useRef, useState } from 'react';
import { Bell, ChevronDown, Command, Menu, Moon, Palette, Search, Sun, X, CheckCheck, Megaphone, CalendarDays, Award, ArrowUpRight, Check, Activity, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import useClickOutside from '../../hooks/useClickOutside';
import { Avatar, Button, Modal } from '../common/UI';
import RoleSwitch from '../common/RoleSwitch';

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
    notifications, markNotificationRead, markAllNotificationsRead, setToast, endSession
  } = useApp();

  const displayName = user?.name || 'Employee';
  const displayInitials = user?.initials || displayName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const navigate = useNavigate();

  // One ref per navbar dropdown (trigger + panel) for outside-click closing.
  const searchRef = useRef(null);
  const paletteRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const dropdownRefs = useMemo(() => [searchRef, paletteRef, notifRef, profileRef], []);

  const unread = notifications.filter((item) => !item.read).length;

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
            {unread > 0 && <i>{unread}</i>}
          </button>
          {notifOpen && (
            <div className="popover-panel notification-panel">
              <div className="popover-header">
                <div>
                  <strong>Notifications</strong>
                  <small>{unread} unread updates</small>
                </div>
                <button className="text-link" onClick={() => { markAllNotificationsRead().catch((err) => setToast(err.message || 'Unable to update notifications.')); }}>
                  <CheckCheck size={14} /> Mark all read
                </button>
              </div>
              {notifications.length ? (
                notifications.map((item) => (
                  <button
                    key={item.id}
                    className={`notification-row ${!item.read ? 'unread' : ''}`}
                    onClick={() => {
                      markNotificationRead(item.id).catch((err) => setToast(err.message || 'Unable to update notification.'));
                      setNotifOpen(false);
                      navigate(item.type === 'event' ? '/events' : item.type === 'kudos' ? '/recognition' : '/announcements');
                    }}
                  >
                    <span className={`notification-symbol ${item.type}`}>
                      {item.type === 'event' ? <CalendarDays size={16} /> : item.type === 'kudos' ? <Award size={16} /> : <Megaphone size={16} />}
                    </span>
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.detail}</small>
                      <em>{item.time}</em>
                    </span>
                    {!item.read && <span className="unread-dot" />}
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
        title="Log out?"
        description="Are you sure you want to log out of HROrbit?"
        className="logout-confirm-modal"
        hideClose
      >
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setLogoutConfirmOpen(false)}>
            Cancel
          </Button>
          <Button onClick={confirmLogout}>
            <LogOut size={14} /> Log out
          </Button>
        </div>
      </Modal>
    </>
  );
}
