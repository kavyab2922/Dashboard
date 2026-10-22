import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { initialAnnouncements } from '../data/announcements';
import { initialEvents } from '../data/events';
import { initialQuickLinks } from '../data/quickLinks';
import { hrContacts } from '../data/employees';
import { initialKudos } from '../data/kudos';
import { initialNotifications } from '../data/notifications';
import { courses as courseCatalogue } from '../data/courses';

const AppContext = createContext(null);
const STORAGE_KEY = 'hrobit-demo-state-v1';

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

export function AppProvider({ children }) {
  const persisted = useMemo(loadState, []);
  const [announcements, setAnnouncements] = useState(persisted.announcements || initialAnnouncements);
  const [events, setEvents] = useState(persisted.events || initialEvents);
  const [quickLinks, setQuickLinks] = useState(persisted.quickLinks || initialQuickLinks);
  const [contacts, setContacts] = useState(persisted.contacts || hrContacts);
  const [kudos, setKudos] = useState(persisted.kudos || initialKudos);
  const [notifications, setNotifications] = useState(persisted.notifications || initialNotifications);
  const [savedCourses, setSavedCourses] = useState(persisted.savedCourses || []);
  const [joinedGroups, setJoinedGroups] = useState(persisted.joinedGroups || []);
  const [theme, setTheme] = useState(persisted.theme || 'light');
  const [role, setRole] = useState(persisted.role || 'Employee');
  const [toast, setToast] = useState('');

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ announcements, events, quickLinks, contacts, kudos, notifications, savedCourses, joinedGroups, theme, role })); } catch { /* demo state remains in memory if storage is unavailable */ }
  }, [announcements, events, quickLinks, contacts, kudos, notifications, savedCourses, joinedGroups, theme, role]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const markRead = (id) => setNotifications((items) => items.map((item) => item.id === id ? { ...item, read: true } : item));
  const markAllRead = () => setNotifications((items) => items.map((item) => ({ ...item, read: true })));
  const toggleSavedCourse = (id) => setSavedCourses((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const addKudos = (item) => {
    setKudos((items) => [{ ...item, id: `k-${Date.now()}`, date: new Date().toISOString().slice(0, 10) }, ...items]);
    setToast('Kudos added to the demo feed.');
  };

  const value = {
    announcements, setAnnouncements, events, setEvents, quickLinks, setQuickLinks, contacts, setContacts,
    kudos, setKudos, notifications, setNotifications, savedCourses, toggleSavedCourse,
    joinedGroups, setJoinedGroups, theme, setTheme, role, setRole, toast, setToast,
    markRead, markAllRead, addKudos, courses: courseCatalogue,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}