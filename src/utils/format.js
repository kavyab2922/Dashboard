export function formatDate(value, options = { month: 'short', day: 'numeric' }) {
  if (!value) return 'Date to be confirmed';
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat('en', options).format(parsed);
}

export function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function isSameMonthDay(dateString, date = new Date()) {
  if (!dateString) return false;
  const parsed = new Date(`${dateString}T12:00:00`);
  return parsed.getMonth() === date.getMonth() && parsed.getDate() === date.getDate();
}

const DEFAULT_EVENT_IMAGES = {
  Company: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=85',
  Community: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=85',
  Learning: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=85',
  Wellbeing: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=85',
  Holiday: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85',
};

export function getEventImage(event) {
  return event?.image || DEFAULT_EVENT_IMAGES[event?.category] || DEFAULT_EVENT_IMAGES.Company;
}

export function safeOpen(url) {
  if (!url || url.startsWith('#placeholder-')) return false;
  if (url.startsWith('/')) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:' && parsed.protocol !== 'mailto:') return false;
    if (parsed.protocol === 'mailto:') window.location.href = url;
    else window.open(parsed.href, '_blank', 'noopener,noreferrer');
    return true;
  } catch {
    return false;
  }
}
