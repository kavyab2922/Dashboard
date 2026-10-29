import { useCallback, useEffect, useRef, useState } from 'react';
import { dataApi, resolveAssetUrl } from '../services/api';

function parseDateOnly(value) {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.slice(0, 10));
  if (!match) return null;

  const [, year, month, day] = match;
  const numericYear = Number(year);
  const numericMonth = Number(month);
  const numericDay = Number(day);
  const calendarDate = new Date(numericYear, numericMonth - 1, numericDay);
  if (
    numericMonth < 1 || numericMonth > 12 ||
    numericDay < 1 || numericDay > 31 ||
    calendarDate.getFullYear() !== numericYear ||
    calendarDate.getMonth() !== numericMonth - 1 ||
    calendarDate.getDate() !== numericDay
  ) return null;

  return { value: `${year}-${month}-${day}`, month: numericMonth, day: numericDay };
}

function getEmployeeId(employee) {
  const id = employee?.id ?? employee?.employee_id ?? employee?.employeeId;
  return id === null || id === undefined || id === '' ? null : String(id);
}

function getEmployeeName(employee) {
  return employee?.name ||
    [employee?.first_name, employee?.last_name].filter(Boolean).join(' ').trim() ||
    'Employee';
}

function getInitials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'E';
}

export function useBirthdayNotifications(sessionVersion = 0) {
  const [birthdaysToday, setBirthdaysToday] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const requestSequence = useRef(0);

  const refresh = useCallback(async (signal) => {
    const today = new Date();
    const requestId = ++requestSequence.current;
    setLoaded(false);
    setError(null);

    try {
      const response = await dataApi.birthdays.today(today.getMonth() + 1, today.getDate());
      if (signal?.cancelled || requestId !== requestSequence.current) return [];

      const records = Array.isArray(response?.data) ? response.data : [];
      const unique = new Map();

      records.forEach((employee) => {
        const id = getEmployeeId(employee);
        const dob = parseDateOnly(employee?.dob ?? employee?.birthday);
        if (!id || !dob || dob.month !== today.getMonth() + 1 || dob.day !== today.getDate()) return;

        const name = getEmployeeName(employee);
        if (unique.has(id)) return;

        unique.set(id, {
          ...employee,
          id,
          name,
          dob: dob.value,
          birthday: dob.value,
          notificationId: employee?.notificationId || `birthday-${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}-${id}`,
          read: Boolean(employee?.read),
          avatar: resolveAssetUrl(employee?.profile_picture_url || employee?.avatar || employee?.avatarUrl || null),
          initials: employee?.initials || getInitials(name),
          role: employee?.role || employee?.designation || 'Team member',
          team: employee?.team || employee?.department || 'HROrbit team',
          color: employee?.color || 'blue',
        });
      });

      const nextBirthdays = Array.from(unique.values());
      setBirthdaysToday(nextBirthdays);
      return nextBirthdays;
    } catch (requestError) {
      if (!signal?.cancelled && requestId === requestSequence.current) {
        setBirthdaysToday([]);
        setError(requestError);
        console.error('Failed to fetch birthday notifications:', requestError);
      }
      throw requestError;
    } finally {
      if (!signal?.cancelled && requestId === requestSequence.current) setLoaded(true);
    }
  }, []);

  useEffect(() => {
    const signal = { cancelled: false };
    refresh(signal).catch(() => {});
    return () => { signal.cancelled = true; };
  }, [refresh, sessionVersion]);

  return { birthdaysToday, loaded, error, refresh: () => refresh() };
}
