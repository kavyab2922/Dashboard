import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { authApi, dataApi, getToken } from '../services/api';
import { normalizeUser } from '../utils/user';

const AppContext = createContext(null);
const STORAGE_KEY = 'hrobit-demo-state-v1';

function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function savePrefs(prefs) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); }
  catch { /* preferences remain in memory if storage is unavailable */ }
}

/** Loads a backend collection and refreshes whenever the session changes. */
function useCollection(loader, enabled = true, sessionVersion = 0) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!enabled) {
      setItems([]);
      setError('');
      setLoading(false);
      return [];
    }
    const requestToken = getToken();
    setLoading(true);
    try {
      const payload = await loader();
      if (requestToken !== getToken()) return [];
      const data = Array.isArray(payload?.data) ? payload.data : [];
      setItems(data);
      setError('');
      return data;
    } catch (err) {
      if (requestToken !== getToken()) return [];
      if (err?.status === 401 || err?.status === 404) {
        setError('Your session has ended. Please sign in again.');
      } else {
        setError(err.message || 'Unable to load data from the server.');
      }
      return [];
    } finally {
      if (requestToken === getToken()) setLoading(false);
    }
  }, [loader, enabled]);

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setError('');
      setLoading(false);
      return;
    }
    refresh();
  }, [refresh, enabled, sessionVersion]);

  return { items, setItems, loading, error, refresh };
}

export function AppProvider({ children }) {
  const prefs = useMemo(loadPrefs, []);

  // Tracks whether a session exists (updated after login/logout)
  const [sessionActive, setSessionActive] = useState(() => Boolean(getToken()));
  const [sessionVersion, setSessionVersion] = useState(0);

  // UI preferences (not business data) stay in local storage
  const [theme, setTheme] = useState(prefs.theme || 'light');
  const [colorTheme, setColorTheme] = useState(prefs.colorTheme || 'sapphire');
  const [role, setRoleState] = useState(prefs.role || 'Employee');
  const [savedCourses, setSavedCourses] = useState(prefs.savedCourses || []);
  const [joinedGroups, setJoinedGroups] = useState(prefs.joinedGroups || []);
  const [toast, setToast] = useState('');

  // Current signed-in user (from the database via /auth/me)
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hrobit-auth-user') || 'null'); }
    catch { return null; }
  });
  const [userLoading, setUserLoading] = useState(() => Boolean(getToken()));
  const [sessionEnded, setSessionEnded] = useState(false);

  // Server-granted access role (from the JWT / database via /auth/me).
  // The active mode can never exceed what the signed-in account is authorized for.
  const accessRole = user?.access_role || 'Employee';
  const canUseHrAdmin = accessRole === 'HR Admin';
  const isHrAdmin = role === 'HR Admin' && canUseHrAdmin;

  /** Validates against the granted access role; returns false when not allowed. */
  const setRole = useCallback((nextRole) => {
    if (nextRole === 'HR Admin' && !canUseHrAdmin) return false;
    setRoleState(nextRole);
    return true;
  }, [canUseHrAdmin]);

  // Drop an HR Admin mode the signed-in account is not entitled to
  // (e.g. a stale preference left behind by a previous session).
  useEffect(() => {
    if (userLoading) return;
    if (role === 'HR Admin' && !canUseHrAdmin) setRoleState('Employee');
  }, [userLoading, role, canUseHrAdmin]);

  const endSession = useCallback(() => {
    localStorage.removeItem('hrobit-auth-token');
    localStorage.removeItem('hrobit-auth-user');
    setUser(null);
    setSessionActive(false);
    setSessionEnded(true);
  }, []);

  const refreshUser = useCallback(async () => {
    const requestToken = getToken();
    if (!requestToken) { setUser(null); setUserLoading(false); return null; }
    setUserLoading(true);
    try {
      const rawUser = await authApi.profile();
      if (requestToken !== getToken()) return null;
      const nextUser = normalizeUser(rawUser.user);
      setUser(nextUser);
      localStorage.setItem('hrobit-auth-user', JSON.stringify(nextUser));
      return nextUser;
    } catch (err) {
      if (requestToken !== getToken()) return null;
      if (err?.status === 401) {
        endSession();
      } else {
        // Keep the last known user on transient errors, but surface nothing fake.
        setToast(err.message || 'Unable to refresh your profile.');
      }
      return null;
    } finally {
      if (requestToken === getToken()) setUserLoading(false);
    }
  }, [endSession]);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  // Called by the Login page after a successful sign-in
  const startSession = useCallback((nextUser) => {
    const normalized = normalizeUser(nextUser);
    setSessionEnded(false);
    setSessionActive(true);
    setUser(normalized);
    setUserLoading(false);
    if (normalized) localStorage.setItem('hrobit-auth-user', JSON.stringify(normalized));
    setSessionVersion((version) => version + 1);
    refreshUser();
  }, [refreshUser]);

  // --- Collections (load only what the active route needs) ---
  const { pathname } = useLocation();
  const enabled = sessionActive && !sessionEnded;
  const routeIs = (...paths) => paths.includes(pathname);
  const routeEnabled = (...paths) => enabled && routeIs(...paths);

  const announcementsLoader = useCallback(() => dataApi.announcements.list(), []);
  const eventsLoader = useCallback(() => dataApi.events.list(), []);
  const quickLinksLoader = useCallback(() => dataApi.quickLinks.list(), []);
  const contactsLoader = useCallback(() => dataApi.contacts.list(), []);
  const kudosLoader = useCallback(() => dataApi.kudos.list(), []);
  const notificationsLoader = useCallback(() => dataApi.notifications.list(), []);
  const coursesLoader = useCallback(() => dataApi.courses.list(), []);
  const faqsLoader = useCallback(() => dataApi.faqs.list(), []);
  const gamesLoader = useCallback(() => dataApi.games.list(), []);
  const employeesLoader = useCallback(() => dataApi.employees.list(), []);
  const celebrationsLoader = useCallback(() => dataApi.celebrations.list(), []);

  const adminRoute = routeEnabled('/admin');
  const announcements = useCollection(announcementsLoader, routeEnabled('/', '/announcements') || adminRoute, sessionVersion);
  const events = useCollection(eventsLoader, routeEnabled('/', '/events', '/announcements') || adminRoute, sessionVersion);
  const quickLinks = useCollection(quickLinksLoader, routeEnabled('/', '/quick-links') || adminRoute, sessionVersion);
  const contacts = useCollection(contactsLoader, routeEnabled('/', '/events', '/hr-contacts') || adminRoute, sessionVersion);
  const kudos = useCollection(kudosLoader, routeEnabled('/') || adminRoute, sessionVersion);
  const notifications = useCollection(notificationsLoader, enabled, sessionVersion);
  const courses = useCollection(coursesLoader, routeEnabled('/', '/learning') || adminRoute, sessionVersion);
  const faqs = useCollection(faqsLoader, routeEnabled('/faq') || adminRoute, sessionVersion);
  const games = useCollection(gamesLoader, routeEnabled('/games') || adminRoute, sessionVersion);
  const employees = useCollection(employeesLoader, routeEnabled('/hr-contacts') || adminRoute, sessionVersion);
  const celebrations = useCollection(celebrationsLoader, routeEnabled('/') || adminRoute, sessionVersion);

  // --- CRUD helpers: persist to the database, then refresh from the server ---
  const run = useCallback(async (action, refresh) => {
    const result = await action();
    await refresh();
    return result;
  }, []);

  const saveAnnouncement = useCallback((form, id) =>
    run(() => (id ? dataApi.announcements.update(id, form) : dataApi.announcements.create(form)), announcements.refresh), [run, announcements.refresh]);
  const removeAnnouncement = useCallback((id) =>
    run(() => dataApi.announcements.remove(id), announcements.refresh), [run, announcements.refresh]);
  const setAnnouncementRead = useCallback((id, read) =>
    run(() => dataApi.announcements.update(id, { read }), announcements.refresh), [run, announcements.refresh]);

  const saveEvent = useCallback((form, id) =>
    run(() => (id ? dataApi.events.update(id, form) : dataApi.events.create(form)), events.refresh), [run, events.refresh]);
  const removeEvent = useCallback((id) =>
    run(() => dataApi.events.remove(id), events.refresh), [run, events.refresh]);

  const saveQuickLink = useCallback((form, id) =>
    run(() => (id ? dataApi.quickLinks.update(id, form) : dataApi.quickLinks.create(form)), quickLinks.refresh), [run, quickLinks.refresh]);
  const removeQuickLink = useCallback((id) =>
    run(() => dataApi.quickLinks.remove(id), quickLinks.refresh), [run, quickLinks.refresh]);

  const addKudos = useCallback(async (item) => {
    const result = await dataApi.kudos.create(item);
    await kudos.refresh();
    return result;
  }, [kudos.refresh]);

  const markNotificationRead = useCallback(async (id) => {
    await dataApi.notifications.markRead(id);
    await notifications.refresh();
  }, [notifications.refresh]);

  const markAllNotificationsRead = useCallback(async () => {
    await dataApi.notifications.markAllRead();
    await notifications.refresh();
  }, [notifications.refresh]);

  const updateProfile = useCallback(async (changes) => {
    await authApi.updateProfile(changes);
    await refreshUser();
  }, [refreshUser]);

  // --- Preferences persistence (UI settings only) ---
  useEffect(() => {
    savePrefs({ theme, colorTheme, role, savedCourses, joinedGroups });
  }, [theme, colorTheme, role, savedCourses, joinedGroups]);

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

  const toggleSavedCourse = (id) => setSavedCourses((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);

  const value = {
    // session
    user, userLoading, sessionEnded, sessionVersion, startSession, refreshUser, updateProfile, endSession,
    // collections: { items, loading, error, refresh }
    announcements: announcements.items, announcementsState: announcements,
    events: events.items, eventsState: events,
    quickLinks: quickLinks.items, quickLinksState: quickLinks,
    contacts: contacts.items, contactsState: contacts,
    kudos: kudos.items, kudosState: kudos,
    notifications: notifications.items, notificationsState: notifications,
    courses: courses.items, coursesState: courses,
    faqs: faqs.items, faqsState: faqs,
    games: games.items, gamesState: games,
    employees: employees.items, employeesState: employees,
    celebrations: celebrations.items, celebrationsState: celebrations,
    // mutations
    saveAnnouncement, removeAnnouncement, setAnnouncementRead,
    saveEvent, removeEvent,
    saveQuickLink, removeQuickLink,
    addKudos, markNotificationRead, markAllNotificationsRead,
    // local preferences
    savedCourses, toggleSavedCourse,
    joinedGroups, setJoinedGroups,
    theme, setTheme, colorTheme, setColorTheme, role, setRole,
    accessRole, canUseHrAdmin, isHrAdmin,
    toast, setToast,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
