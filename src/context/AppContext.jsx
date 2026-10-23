import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { initialAnnouncements } from '../data/announcements';
import { initialEvents } from '../data/events';
import { initialQuickLinks } from '../data/quickLinks';
import { currentEmployee as fallbackEmployee, employees as fallbackEmployees, hrContacts, birthdays as fallbackBirthdays } from '../data/employees';
import { initialKudos } from '../data/kudos';
import { initialNotifications } from '../data/notifications';
import { courses as courseCatalogue } from '../data/courses';
import { faqs as fallbackFaqs } from '../data/faqs';
import { games as fallbackGames } from '../data/games';
import { api, getToken, setToken as persistToken, settledData } from '../services/api';

const AppContext = createContext(null);
const PREFS_KEY = 'hrobit-prefs-v1';

function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}'); }
  catch { return {}; }
}

function mapUser(user) {
  if (!user) return fallbackEmployee;
  const name = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || fallbackEmployee.name;
  const initials = user.initials || name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  return {
    ...fallbackEmployee,
    ...user,
    id: String(user.id ?? fallbackEmployee.id),
    name,
    role: user.role || user.designation || fallbackEmployee.role,
    team: user.team || user.department || fallbackEmployee.team,
    email: user.email || user.official_email || fallbackEmployee.email,
    location: user.location || fallbackEmployee.location,
    birthday: user.dob || user.birthday || fallbackEmployee.birthday,
    joined: user.joined || fallbackEmployee.joined,
    initials,
    color: user.color || 'blue',
    avatar: user.avatar || fallbackEmployee.avatar,
    cover: user.cover || fallbackEmployee.cover,
    bio: user.bio || fallbackEmployee.bio || 'Passionate about crafting intuitive, scalable enterprise interfaces.',
    interests: user.interests || ['Design Systems', 'React & TypeScript', 'PostgreSQL', 'User Experience', 'Cloud'],
  };
}

export function AppProvider({ children }) {
  const persisted = useMemo(loadPrefs, []);
  const [token, setTokenState] = useState(() => getToken());
  const [currentEmployee, setCurrentEmployee] = useState(fallbackEmployee);
  const [employees, setEmployees] = useState(fallbackEmployees);
  const [celebrations, setCelebrations] = useState(fallbackBirthdays);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [events, setEvents] = useState(initialEvents);
  const [quickLinks, setQuickLinks] = useState(initialQuickLinks);
  const [contacts, setContacts] = useState(hrContacts);
  const [kudos, setKudos] = useState(initialKudos);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [courses, setCourses] = useState(courseCatalogue);
  const [faqs, setFaqs] = useState(fallbackFaqs);
  const [games, setGames] = useState(fallbackGames);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [savedCourses, setSavedCourses] = useState(persisted.savedCourses || []);
  const [joinedGroups, setJoinedGroups] = useState(persisted.joinedGroups || []);
  const [theme, setTheme] = useState(persisted.theme || 'light');
  const [colorTheme, setColorTheme] = useState(persisted.colorTheme || 'sapphire');
  const [role, setRole] = useState(persisted.role || 'Employee');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState(false);

  const setSessionToken = (next) => {
    persistToken(next);
    setTokenState(next || '');
  };

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({
        savedCourses, joinedGroups, theme, colorTheme, role,
      }));
    } catch {
      /* prefs stay in memory if storage is unavailable */
    }
  }, [savedCourses, joinedGroups, theme, colorTheme, role]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.color = colorTheme;
  }, [colorTheme]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const refreshWorkspace = useCallback(async () => {
    const health = await settledData(api.health(), null);
    setApiOnline(Boolean(health?.status === 'ok'));

    if (getToken()) {
      try {
        const me = await api.me();
        const mapped = mapUser(me.user);
        setCurrentEmployee(mapped);
        if (mapped.role === 'HR Admin') setRole('HR Admin');
      } catch {
        setSessionToken('');
        setCurrentEmployee(fallbackEmployee);
      }
    }

    const [
      employeeList, celebrationList, contactList, announcementList, eventList,
      linkList, kudoList, notificationList, courseList, faqList, gameList, summary,
    ] = await Promise.all([
      settledData(api.employees(), fallbackEmployees),
      settledData(api.celebrations(), fallbackBirthdays),
      settledData(api.hrContacts(), hrContacts),
      settledData(api.announcements(), initialAnnouncements),
      settledData(api.events(), initialEvents),
      settledData(api.quickLinks(), initialQuickLinks),
      settledData(api.kudos(), initialKudos),
      settledData(api.notifications(), initialNotifications),
      settledData(api.courses(), courseCatalogue),
      settledData(api.faqs(), fallbackFaqs),
      settledData(api.games(), fallbackGames),
      settledData(api.dashboardSummary(), null),
    ]);

    setEmployees(employeeList);
    setCelebrations(celebrationList);
    setContacts(contactList);
    setAnnouncements(announcementList);
    setEvents(eventList);
    setQuickLinks(linkList);
    setKudos(kudoList);
    setNotifications(notificationList);
    setCourses(courseList);
    setFaqs(faqList);
    setGames(gameList);
    setDashboardSummary(summary);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await refreshWorkspace();
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [token, refreshWorkspace]);

  const login = async (email) => {
    const result = await api.login(email);
    setSessionToken(result.token);
    setCurrentEmployee(mapUser(result.user));
    if (result.user?.role) setRole(result.user.role === 'HR Admin' ? 'HR Admin' : 'Employee');
    setToast(`Welcome back, ${result.user?.name || 'there'}.`);
    return result;
  };

  const logout = () => {
    setSessionToken('');
    setCurrentEmployee(fallbackEmployee);
    setToast('Signed out.');
  };

  const markRead = async (id) => {
    setNotifications((items) => items.map((item) => item.id === id ? { ...item, read: true } : item));
    try { await api.markNotificationRead(id); }
    catch { /* optimistic update already applied */ }
  };

  const markAllRead = async () => {
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    try { await api.markAllNotificationsRead(); }
    catch { /* optimistic update already applied */ }
  };

  const toggleSavedCourse = (id) => setSavedCourses((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);

  const addKudos = async (item) => {
    const optimistic = { ...item, id: `k-${Date.now()}`, date: new Date().toISOString().slice(0, 10) };
    setKudos((items) => [optimistic, ...items]);
    try {
      const result = await api.createKudo(item);
      setKudos((items) => [result.data, ...items.filter((entry) => entry.id !== optimistic.id)]);
      setToast('Kudos sent.');
    } catch {
      setToast('Could not save kudos to the server. Showing it locally for now.');
    }
  };

  const saveCollectionItem = async (type, item, editingId) => {
    const writers = {
      announcements: { create: api.createAnnouncement, update: api.updateAnnouncement, set: setAnnouncements },
      events: { create: api.createEvent, update: api.updateEvent, set: setEvents },
      quickLinks: { create: api.createQuickLink, update: api.updateQuickLink, set: setQuickLinks },
    };
    const writer = writers[type];
    if (!writer) {
      const setter = type === 'contacts' ? setContacts : null;
      if (!setter) return item;
      const normalized = { ...item, id: editingId || `${type}-${Date.now()}` };
      setter((items) => editingId ? items.map((entry) => entry.id === editingId ? normalized : entry) : [normalized, ...items]);
      setToast('Contact saved locally. HR contacts are loaded from the directory API.');
      return normalized;
    }
    if (type === 'events' && String(editingId || item.id || '').startsWith('holiday-')) {
      setToast('Company holidays are read-only.');
      return item;
    }
    try {
      const result = editingId
        ? await writer.update(editingId, item)
        : await writer.create(item);
      const saved = result.data;
      writer.set((items) => editingId
        ? items.map((entry) => entry.id === editingId ? saved : entry)
        : [saved, ...items]);
      setToast(`${type === 'quickLinks' ? 'Quick link' : type.slice(0, -1)} ${editingId ? 'updated' : 'added'}.`);
      return saved;
    } catch (err) {
      setToast(err.message || 'Could not save to the server.');
      throw err;
    }
  };

  const removeCollectionItem = async (type, item) => {
    const removers = {
      announcements: { remove: api.deleteAnnouncement, set: setAnnouncements },
      events: { remove: api.deleteEvent, set: setEvents },
      quickLinks: { remove: api.deleteQuickLink, set: setQuickLinks },
    };
    const remover = removers[type];
    if (!remover) {
      if (type === 'contacts') {
        setContacts((items) => items.filter((entry) => entry.id !== item.id));
        setToast('Contact removed from this session.');
      }
      return;
    }
    if (type === 'events' && String(item.id).startsWith('holiday-')) {
      setToast('Company holidays are read-only.');
      return;
    }
    try {
      await remover.remove(item.id);
      remover.set((items) => items.filter((entry) => entry.id !== item.id));
      setToast('Removed.');
    } catch (err) {
      setToast(err.message || 'Could not delete on the server.');
    }
  };

  const updateProfile = async (payload) => {
    await api.updateProfile(payload);
    const me = await api.me();
    setCurrentEmployee(mapUser(me.user));
    setToast('Profile details updated.');
  };

  const value = {
    token, loading, apiOnline, login, logout,
    currentEmployee, employees, celebrations, dashboardSummary,
    announcements, setAnnouncements, events, setEvents, quickLinks, setQuickLinks, contacts, setContacts,
    kudos, setKudos, notifications, setNotifications, savedCourses, toggleSavedCourse,
    joinedGroups, setJoinedGroups, theme, setTheme, colorTheme, setColorTheme, role, setRole, toast, setToast,
    markRead, markAllRead, addKudos, courses, faqs, games,
    saveCollectionItem, removeCollectionItem, updateProfile, refreshWorkspace,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
