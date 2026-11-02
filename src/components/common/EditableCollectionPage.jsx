import { useEffect, useMemo, useRef, useState } from 'react';
import { AtSign, CalendarDays, ChevronDown, Clock3, Edit3, ImagePlus, MapPin, Megaphone, Plus, Search, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { authApi, dataApi } from '../../services/api';
import { Button, EmptyState, FormField, Modal, PageTitle, Panel, Select, Tag } from './UI';
import { formatDate, getEventImage } from '../../utils/format';

const configurations = {
  announcements: { title: 'Announcements', description: 'Updates, reminders and important messages from your workplace.', noun: 'announcement', fields: [{ key: 'title', label: 'Title', required: true }, { key: 'description', label: 'Short description', required: true, type: 'textarea' }, { key: 'details', label: 'Full details', type: 'textarea' }, { key: 'category', label: 'Category', type: 'select', options: ['HR Update', 'Company News', 'Policy', 'Holiday', 'Important Notice'] }, { key: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Normal', 'High'] }, { key: 'date', label: 'Publication date', type: 'date' }] },
  events: { title: 'Upcoming events', description: 'Keep up with learning sessions, team moments and company activities.', noun: 'event', fields: [{ key: 'title', label: 'Event title', required: true }, { key: 'description', label: 'Description', required: true, type: 'textarea' }, { key: 'date', label: 'Date', required: true, type: 'date' }, { key: 'time', label: 'Time', required: true, type: 'time' }, { key: 'venue', label: 'Venue / location', required: true }, { key: 'category', label: 'Category', type: 'select', options: ['Company', 'Community', 'Learning', 'Wellbeing', 'Holiday'] }, { key: 'rsvp', label: 'RSVP URL (optional)', type: 'url' }] },
  quickLinks: { title: 'Quick links', description: 'Keep your frequently used employee resources close at hand.', noun: 'quick link', fields: [{ key: 'title', label: 'Link name', required: true }, { key: 'description', label: 'Description', required: true }, { key: 'category', label: 'Category', type: 'select', options: ['HR', 'Benefits', 'Learning', 'Support', 'Tools'] }, { key: 'url', label: 'Destination URL or local path', required: true, type: 'url' }, { key: 'icon', label: 'Icon key' }] },
  contacts: { title: 'Quick Connect contacts', description: 'HR points of contact, sourced from the employee directory.', noun: 'contact', readOnly: true, fields: [] },
};

const EVENT_EDITOR_DRAFT_KEY = 'hrobit-event-editor-draft';
const ANNOUNCEMENT_EDITOR_DRAFT_KEY = 'hrobit-announcement-editor-draft';
const EVENT_MANAGE_KEY = 'hrobit-event-manage-open';
const ANNOUNCEMENT_MANAGE_KEY = 'hrobit-announcement-manage-open';

function markEventManageOpen() {
  try { sessionStorage.setItem(EVENT_MANAGE_KEY, 'true'); } catch { /* storage may be unavailable */ }
}

// A draft keeps its form data after the editor closes; `open` marks an editor that
// was open when the page was refreshed, so a reload returns to it.
function readDraft(key) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) || 'null');
    return saved && saved.form ? saved : null;
  } catch {
    return null;
  }
}

function setDraftOpen(key, open) {
  try {
    const saved = readDraft(key);
    if (saved && saved.open !== open) sessionStorage.setItem(key, JSON.stringify({ ...saved, open }));
  } catch { /* storage may be unavailable */ }
}

// The manage view and an open editor are restored only after a browser refresh of that
// page; arriving from a link (sidebar, dashboard) always shows the normal page.
const restoredKeys = new Set();
export function canRestoreAfterRefresh(key) {
  if (restoredKeys.has(key)) return false;
  try {
    const navigation = performance.getEntriesByType('navigation')[0];
    return navigation?.type === 'reload' && new URL(navigation.name).pathname === window.location.pathname;
  } catch {
    return false;
  }
}
// Called from an effect (not the state initializer) so React StrictMode's double init still restores.
export function markRestoreUsed(key) {
  restoredKeys.add(key);
}

export function isEditorOpen(type) {
  const key = type === 'events' ? EVENT_EDITOR_DRAFT_KEY : type === 'announcements' ? ANNOUNCEMENT_EDITOR_DRAFT_KEY : null;
  return Boolean(key && readDraft(key)?.open);
}

function readEventDraft() {
  return readDraft(EVENT_EDITOR_DRAFT_KEY);
}

function readAnnouncementDraft() {
  return readDraft(ANNOUNCEMENT_EDITOR_DRAFT_KEY);
}

function defaultItem(type) {
  const today = new Date().toISOString().slice(0, 10);
  if (type === 'announcements') return { title: '', description: '', details: '', category: 'HR Update', priority: 'Normal', date: today, relatedEvent: '', pinned: false, read: false };
  if (type === 'events') return { title: '', description: '', date: today, time: '12:00 PM', venue: '', category: 'Community', rsvp: '', color: 'mint', hosts: [] };
  if (type === 'quickLinks') return { title: '', description: '', category: 'HR', url: '', icon: 'Link2', placeholder: false };
  return { name: '', team: 'People & Culture', focus: '', email: '', location: '', extension: '' };
}

function DatePicker({ value, onChange, ariaLabel, required }) {
  const selectedDate = value ? new Date(`${value}T12:00:00`) : new Date();
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState('down');
  const [viewDate, setViewDate] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const pickerRef = useRef(null);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((firstDay + daysInMonth) / 7) * 7 }, (_, index) => {
    const day = index - firstDay + 1;
    return day > 0 && day <= daysInMonth ? new Date(year, month, day) : null;
  });
  const formatValue = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const displayValue = value ? selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select date';

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => { if (!pickerRef.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  useEffect(() => {
    if (value) setViewDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [value]);

  useEffect(() => {
    if (!open || !pickerRef.current) return undefined;
    const updatePlacement = () => {
      const bounds = pickerRef.current.getBoundingClientRect();
      setPlacement(bounds.bottom + 330 > window.innerHeight - 12 ? 'up' : 'down');
    };
    updatePlacement();
    window.addEventListener('resize', updatePlacement);
    window.addEventListener('scroll', updatePlacement, true);
    return () => {
      window.removeEventListener('resize', updatePlacement);
      window.removeEventListener('scroll', updatePlacement, true);
    };
  }, [open]);

  return <div ref={pickerRef} className={`custom-date-picker is-${placement}`}>
    <button type="button" className={`custom-date-trigger ${open ? 'is-open' : ''}`} aria-label={ariaLabel} aria-expanded={open} onClick={() => setOpen((current) => !current)}>
      <span>{displayValue}</span><CalendarDays size={16} />
    </button>
    {required && <input className="custom-date-required" tabIndex={-1} required={!value} value={value || ''} onChange={() => {}} aria-hidden="true" />}
    {open && <div className="custom-date-menu">
      <div className="custom-date-header"><button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} aria-label="Previous month">‹</button><strong>{viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong><button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} aria-label="Next month">›</button></div>
      <div className="custom-date-weekdays">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day}>{day}</span>)}</div>
      <div className="custom-date-grid">{cells.map((date, index) => date ? <button type="button" key={date.toISOString()} className={value === formatValue(date) ? 'is-selected' : ''} onClick={() => { onChange(formatValue(date)); setOpen(false); }}>{date.getDate()}</button> : <span key={`empty-${index}`} />)}</div>
      <button type="button" className="custom-date-today" onClick={() => { const today = new Date(); onChange(formatValue(today)); setViewDate(new Date(today.getFullYear(), today.getMonth(), 1)); setOpen(false); }}>Today</button>
    </div>}
  </div>;
}

// Event times are stored as display text ("12:00 PM"); the native picker works in 24h "HH:mm".
function toPickerTime(value) {
  const match = String(value || '').trim().match(/^(\d{1,2}):(\d{2})\s*([ap]m)?$/i);
  if (!match) return '';
  let hours = Number(match[1]) % 24;
  const meridiem = match[3]?.toLowerCase();
  if (meridiem === 'pm' && hours < 12) hours += 12;
  if (meridiem === 'am' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${match[2]}`;
}

function toDisplayTime(value) {
  const [hours, minutes] = value.split(':').map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`;
}

// Event and holiday covers: JPG/PNG/WebP, up to 10 MB, 16:9. Resolves with a preview data URL.
const MAX_EVENT_PHOTO_SIZE = 10 * 1024 * 1024; // keep in sync with the backend upload limit

function readEventPhoto(file) {
  return new Promise((resolve, reject) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return reject(new Error('Upload a JPG, PNG, or WebP image.'));
    if (file.size > MAX_EVENT_PHOTO_SIZE) return reject(new Error('Photo must be 10 MB or smaller.'));
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => (Math.abs((image.width / image.height) - (16 / 9)) > 0.01 ? reject(new Error('Photo must use a 16:9 aspect ratio.')) : resolve(reader.result));
      image.onerror = () => reject(new Error('The selected photo could not be read.'));
      image.src = reader.result;
    };
    reader.onerror = () => reject(new Error('The selected photo could not be read.'));
    return reader.readAsDataURL(file);
  });
}

function EventField({ field, form, setForm }) {
  return <FormField label={field.label} required={field.required} hint={field.hint}>
    {field.type === 'time' ? <input type="time" required={field.required} value={toPickerTime(form[field.key])} onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value ? toDisplayTime(e.target.value) : '' }))} />
      : field.type === 'textarea' ? <textarea rows={field.rows || 4} required={field.required} placeholder={field.placeholder} value={form[field.key] || ''} onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))} />
      : field.type === 'select' ? <Select ariaLabel={field.label} options={field.options} value={form[field.key]} onChange={(value) => setForm((prev) => ({ ...prev, [field.key]: value }))} />
        : field.type === 'date' ? <DatePicker ariaLabel={field.label} required={field.required} value={form[field.key]} onChange={(value) => setForm((prev) => ({ ...prev, [field.key]: value }))} />
          : <input type={field.type || 'text'} required={field.required} placeholder={field.placeholder} value={form[field.key] || ''} onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))} />}
  </FormField>;
}

export default function EditableCollectionPage({ type = 'announcements', embedded = false, backAction = null, autoOpenCreate = false, onCreateOpened }) {
  const config = configurations[type];
  const { announcements, announcementsState, saveAnnouncement, removeAnnouncement, events, eventsState, saveEvent, removeEvent, quickLinks, quickLinksState, saveQuickLink, removeQuickLink, contacts, contactsState, setToast, isHrAdmin } = useApp();
  const collection = type === 'announcements' ? announcements : type === 'events' ? events : type === 'quickLinks' ? quickLinks : contacts;
  const collectionState = type === 'announcements' ? announcementsState : type === 'events' ? eventsState : type === 'quickLinks' ? quickLinksState : contactsState;
  const readOnly = Boolean(config.readOnly) || !isHrAdmin;
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const savedEventDraft = type === 'events' ? readEventDraft() : null;
  const savedAnnouncementDraft = type === 'announcements' ? readAnnouncementDraft() : null;
  const savedDraft = savedEventDraft || savedAnnouncementDraft;
  // Reopen the editor only after a refresh; closed drafts are resumed from the Drafts button.
  const [modalOpen, setModalOpen] = useState(() => canRestoreAfterRefresh(`${type}-editor`) && Boolean(savedDraft?.open));
  useEffect(() => { markRestoreUsed(`${type}-editor`); }, [type]);
  const [draftListOpen, setDraftListOpen] = useState(false);
  const [confirmDraftDelete, setConfirmDraftDelete] = useState(false);
  const [editingId, setEditingId] = useState(savedDraft?.editingId || null);
  const [form, setForm] = useState(() => savedDraft?.form || defaultItem(type));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState('');
  const [eventImageFile, setEventImageFile] = useState(null);
  const [hostName, setHostName] = useState('');
  const [hostDropdownOpen, setHostDropdownOpen] = useState(false);
  const [hostDropdownPlacement, setHostDropdownPlacement] = useState('down');
  const hostComboboxRef = useRef(null);
  const [hostError, setHostError] = useState('');
  const [relatedEventDropdownOpen, setRelatedEventDropdownOpen] = useState(false);
  const [relatedEventDropdownPlacement, setRelatedEventDropdownPlacement] = useState('down');
  const relatedEventSelectRef = useRef(null);

  // Local date, not UTC, so events on today's date stay listed in every timezone.
  const todayDate = new Date();
  const today = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
  // Past events drop out of the managed list, matching the Upcoming events page.
  const filtered = useMemo(() => collection.filter((item) => (type !== 'events' || !item.date || item.date >= today) && Object.values(item).join(' ').toLowerCase().includes(search.toLowerCase()) && (filter === 'All' || (item.category || item.team || 'Other') === filter)), [collection, search, filter, type, today]);
  const filterOptions = [...new Set(collection.map((item) => item.category || item.team).filter(Boolean))];
  const upcomingEvents = events.filter((event) => event.date && event.date >= today);
  const clearEventDraft = () => { try { sessionStorage.removeItem(EVENT_EDITOR_DRAFT_KEY); } catch { /* storage may be unavailable */ } };
  const clearAnnouncementDraft = () => { try { sessionStorage.removeItem(ANNOUNCEMENT_EDITOR_DRAFT_KEY); } catch { /* storage may be unavailable */ } };
  const markManageOpen = () => { try { sessionStorage.setItem(type === 'events' ? EVENT_MANAGE_KEY : ANNOUNCEMENT_MANAGE_KEY, 'true'); } catch { /* storage may be unavailable */ } };
  const openCreate = () => { if (type === 'events' || type === 'announcements') markManageOpen(); if (type === 'events') clearEventDraft(); if (type === 'announcements') clearAnnouncementDraft(); setEditingId(null); setImageError(''); setHostError(''); setHostName(''); setHostDropdownOpen(false); setRelatedEventDropdownOpen(false); setEventImageFile(null); setForm(defaultItem(type)); setModalOpen(true); };
  const openEdit = (item) => { if (type === 'events' || type === 'announcements') markManageOpen(); if (type === 'events') clearEventDraft(); if (type === 'announcements') clearAnnouncementDraft(); setEditingId(item.id); setImageError(''); setHostError(''); setHostName(''); setHostDropdownOpen(false); setRelatedEventDropdownOpen(false); setEventImageFile(null); setForm({ ...defaultItem(type), ...item, hosts: Array.isArray(item.hosts) ? item.hosts : [] }); setModalOpen(true); };

  const draftKey = type === 'events' ? EVENT_EDITOR_DRAFT_KEY : type === 'announcements' ? ANNOUNCEMENT_EDITOR_DRAFT_KEY : null;
  useEffect(() => {
    if (!draftKey) return undefined;
    if (!modalOpen) { setDraftOpen(draftKey, false); return undefined; }
    try {
      // Unsaved uploads are large data URLs, so only an already-saved cover URL is kept in the draft.
      const draftForm = type === 'events' && form.image?.startsWith('data:') ? { ...form, image: '' } : form;
      sessionStorage.setItem(draftKey, JSON.stringify({ open: true, editingId, form: draftForm, updatedAt: new Date().toISOString() }));
    } catch { /* keep the form usable if storage is unavailable */ }
    return undefined;
  }, [type, draftKey, modalOpen, editingId, form]);

  // Leaving the page inside the app closes the editor; a browser refresh skips this and reopens it.
  useEffect(() => () => { if (draftKey) setDraftOpen(draftKey, false); }, [draftKey]);

  const handleEventImage = (file) => {
    setImageError('');
    if (!file) return;
    readEventPhoto(file)
      .then((dataUrl) => { setEventImageFile(file); setForm((prev) => ({ ...prev, image: dataUrl })); })
      .catch((err) => setImageError(err.message));
  };

  // Holiday covers: holidays come from the HR calendar, so only their cover photo is editable here.
  const [coverHoliday, setCoverHoliday] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [coverError, setCoverError] = useState('');
  const [coverSaving, setCoverSaving] = useState(false);
  const openCoverEditor = (holiday) => { setCoverHoliday(holiday); setCoverFile(null); setCoverPreview(''); setCoverError(''); };
  const closeCoverEditor = () => { if (!coverSaving) setCoverHoliday(null); };
  const pickHolidayCover = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setCoverError('');
    readEventPhoto(file)
      .then((dataUrl) => { setCoverFile(file); setCoverPreview(dataUrl); })
      .catch((err) => setCoverError(err.message));
  };
  const saveHolidayCover = async (reset = false) => {
    setCoverSaving(true);
    try {
      const image = reset ? '' : (await authApi.uploadFile(coverFile)).url;
      await dataApi.events.setHolidayCover(String(coverHoliday.id).replace('holiday-', ''), image);
      await eventsState.refresh();
      setToast(reset ? 'Holiday cover reset to the default.' : 'Holiday cover updated.');
      setCoverHoliday(null);
    } catch (err) {
      setCoverError(err.message || 'Unable to save the cover photo.');
    } finally {
      setCoverSaving(false);
    }
  };

  useEffect(() => { if (autoOpenCreate && !readOnly) { openCreate(); onCreateOpened?.(); } }, [autoOpenCreate, readOnly]);
  useEffect(() => {
    if (!hostDropdownOpen || !hostComboboxRef.current) return undefined;
    const updateHostDropdownPlacement = () => {
      const bounds = hostComboboxRef.current.getBoundingClientRect();
      const dropdownHeight = Math.min(196, 4 * 46 + 12);
      setHostDropdownPlacement(bounds.bottom + dropdownHeight > window.innerHeight - 12 ? 'up' : 'down');
    };
    updateHostDropdownPlacement();
    window.addEventListener('resize', updateHostDropdownPlacement);
    window.addEventListener('scroll', updateHostDropdownPlacement, true);
    return () => {
      window.removeEventListener('resize', updateHostDropdownPlacement);
      window.removeEventListener('scroll', updateHostDropdownPlacement, true);
    };
  }, [hostDropdownOpen]);

  useEffect(() => {
    if (!relatedEventDropdownOpen || !relatedEventSelectRef.current) return undefined;
    const updateRelatedEventPlacement = () => {
      const bounds = relatedEventSelectRef.current.getBoundingClientRect();
      const dropdownHeight = Math.min(250, Math.max(1, upcomingEvents.filter((event) => event.id && event.title).length + 1) * 44 + 12);
      setRelatedEventDropdownPlacement(bounds.bottom + dropdownHeight > window.innerHeight - 12 ? 'up' : 'down');
    };
    updateRelatedEventPlacement();
    window.addEventListener('resize', updateRelatedEventPlacement);
    window.addEventListener('scroll', updateRelatedEventPlacement, true);
    return () => {
      window.removeEventListener('resize', updateRelatedEventPlacement);
      window.removeEventListener('scroll', updateRelatedEventPlacement, true);
    };
  }, [relatedEventDropdownOpen, upcomingEvents.length]);

  const save = async (event) => {
    event.preventDefault();
    // The browser already blocks empty required inputs; this also catches whitespace-only values.
    const missingField = config.fields.find((field) => field.required && !String(form[field.key] || '').trim());
    if (missingField) return setToast(`${missingField.label} is required.`);
    if (type === 'events') {
      const now = new Date();
      const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      if (!editingId && form.date < localToday) return setToast('Choose today or a future date for a new event.');
      if (imageError) return setToast(imageError);
      if (form.category !== 'Holiday' && !form.hosts?.length) {
        setHostError('Add at least one host before saving.');
        hostComboboxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        hostComboboxRef.current?.querySelector('input')?.focus({ preventScroll: true });
        return undefined;
      }
    }
    setSaving(true);
    try {
      let payload = form;
      if (type === 'events' && eventImageFile) { setUploading(true); const uploaded = await authApi.uploadFile(eventImageFile); payload = { ...form, image: uploaded.url }; }
      // Only send the cover when it changed, so editing never re-validates an existing image.
      const original = editingId ? collection.find((item) => String(item.id) === String(editingId)) : null;
      if (type === 'events' && !eventImageFile && original && (payload.image || '') === (original.image || '')) {
        payload = { ...payload };
        delete payload.image;
      }
      if (type === 'announcements') await saveAnnouncement(payload, editingId); else if (type === 'events') await saveEvent(payload, editingId); else await saveQuickLink(payload, editingId);
      if (type === 'events') clearEventDraft();
      if (type === 'announcements') clearAnnouncementDraft();
      setModalOpen(false); setToast(`${config.noun[0].toUpperCase()}${config.noun.slice(1)} ${editingId ? 'updated' : 'added'}.`);
    } catch (err) { setToast(err.message || 'Unable to save changes.'); } finally { setUploading(false); setSaving(false); }
  };

  const remove = async (item) => {
    if (!window.confirm(`Remove “${item.title || item.name}” from the ${config.noun} list?`)) return;
    try { if (type === 'announcements') await removeAnnouncement(item.id); else if (type === 'events') await removeEvent(item.id); else await removeQuickLink(item.id); setToast(`${config.noun[0].toUpperCase()}${config.noun.slice(1)} removed.`); } catch (err) { setToast(err.message || 'Unable to remove the item.'); }
  };

  const addAction = readOnly ? null : <Button onClick={openCreate}><Plus size={16} /> Add {config.noun}</Button>;
  const hasDraft = (type === 'events' && Boolean(readEventDraft())) || (type === 'announcements' && Boolean(readAnnouncementDraft()));
  const draftCount = hasDraft ? 1 : 0;
  const draftAction = (type === 'events' || type === 'announcements') && !readOnly ? <Button variant="secondary" className="draft-events-button" onClick={() => setDraftListOpen(true)}>Drafts ({draftCount})</Button> : null;
  const draftList = type === 'events' ? readEventDraft() : type === 'announcements' ? readAnnouncementDraft() : null;
  const draftTitle = draftList?.form?.title?.trim() || `Untitled ${config.noun}`;
  const draftDescription = draftList?.form?.description?.trim() || 'No description added yet.';
  const deleteDraft = () => {
    if (type === 'events') clearEventDraft(); else clearAnnouncementDraft();
    // Reset the editor state that was loaded from the draft so it can't be resumed.
    setEditingId(null); setEventImageFile(null); setImageError(''); setHostError(''); setForm(defaultItem(type));
    setConfirmDraftDelete(false);
    setToast('Draft deleted.');
  };
  const draftListEditor = <Modal open={draftListOpen} onClose={() => { setDraftListOpen(false); setConfirmDraftDelete(false); }} title={`${config.title} drafts`} description={`You have ${draftCount} saved ${config.noun}${draftCount === 1 ? '' : 's'}.`} className="draft-list-modal draft-list-fullscreen">
    <div className="draft-list-summary"><strong>{draftCount}</strong><span>{draftCount === 1 ? `saved ${config.noun}` : `saved ${config.noun}s`}</span></div>
    {hasDraft ? <div className="draft-list-row"><button type="button" className="draft-list-item" onClick={() => { setDraftListOpen(false); setModalOpen(true); }}><span className="draft-list-item-icon">{type === 'events' ? <CalendarDays size={18} /> : <Megaphone size={18} />}</span><span className="draft-list-item-copy"><strong>{draftTitle}</strong><span>{draftDescription}</span><small>{draftList.updatedAt ? `Last edited ${formatDate(draftList.updatedAt, { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Saved draft'}</small></span><span className="draft-list-item-arrow">→</span></button><div className="draft-list-delete">{confirmDraftDelete ? <><span>Delete this draft?</span><Button size="sm" variant="secondary" type="button" onClick={() => setConfirmDraftDelete(false)}>Keep</Button><Button size="sm" type="button" className="btn-danger" onClick={deleteDraft}>Delete</Button></> : <button type="button" className="icon-button danger-icon" aria-label="Delete draft" title="Delete draft" onClick={() => setConfirmDraftDelete(true)}><Trash2 size={16} /></button>}</div></div> : <div className="draft-list-empty"><strong>No drafts yet</strong><span>Start creating a {config.noun} and it will appear here automatically.</span></div>}
  </Modal>;
  const fieldByKey = (key) => config.fields.find((field) => field.key === key);
  const initialsOf = (name) => name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const statusChip = <span className={`pf-status ${editingId ? 'is-editing' : ''}`}>{editingId ? 'Editing' : 'Draft'}</span>;
  const formSection = (step, title, description, children) => <section className="pf-section">
    <header className="pf-section-head"><span className="pf-step">{step}</span><div><h3>{title}</h3>{description && <p>{description}</p>}</div></header>
    <div className="pf-section-body">{children}</div>
  </section>;

  // Announcement editor --------------------------------------------------------
  const selectedRelatedEvent = upcomingEvents.find((event) => String(event.id) === String(form.relatedEvent));
  const relatedEventPicker = <FormField label="Related event" hint="Link an upcoming event this update refers to.">
    <div ref={relatedEventSelectRef} className={`related-event-select is-${relatedEventDropdownPlacement}`} onBlur={() => window.setTimeout(() => setRelatedEventDropdownOpen(false), 120)}>
      <button type="button" className={`related-event-trigger ${relatedEventDropdownOpen ? 'is-open' : ''}`} aria-haspopup="listbox" aria-expanded={relatedEventDropdownOpen} onClick={() => setRelatedEventDropdownOpen((open) => !open)}><span>{selectedRelatedEvent ? <><strong>{selectedRelatedEvent.title}</strong>{selectedRelatedEvent.date && <small>{formatDate(selectedRelatedEvent.date)}</small>}</> : 'No related event'}</span><ChevronDown size={17} /></button>
      {relatedEventDropdownOpen && <div className="related-event-menu" role="listbox">
        <button type="button" className={`related-event-option ${!form.relatedEvent ? 'is-selected' : ''}`} role="option" aria-selected={!form.relatedEvent} onClick={() => { setForm((prev) => ({ ...prev, relatedEvent: '' })); setRelatedEventDropdownOpen(false); }}><span>No related event</span>{!form.relatedEvent && <span className="related-event-check">✓</span>}</button>
        {upcomingEvents.filter((event) => event.id && event.title).map((event) => <button type="button" className={`related-event-option ${String(form.relatedEvent) === String(event.id) ? 'is-selected' : ''}`} role="option" aria-selected={String(form.relatedEvent) === String(event.id)} key={event.id} onClick={() => { setForm((prev) => ({ ...prev, relatedEvent: event.id })); setRelatedEventDropdownOpen(false); }}><span><strong>{event.title}</strong>{event.date && <small>{formatDate(event.date)}</small>}</span>{String(form.relatedEvent) === String(event.id) && <span className="related-event-check">✓</span>}</button>)}
      </div>}
    </div>
  </FormField>;
  const announcementPreview = <section className="pf-preview">
    <span className="pf-preview-label">Live preview</span>
    <article className="pf-preview-card">
      <div className="pf-preview-meta"><Tag tone={form.priority === 'High' ? 'rose' : form.priority === 'Low' ? 'gold' : 'blue'}>{form.category || 'Announcement'}</Tag>{form.date && <span>{formatDate(form.date, { month: 'short', day: 'numeric', year: 'numeric' })}</span>}{form.priority === 'High' && <span className="pf-preview-priority">High priority</span>}</div>
      <h4>{form.title?.trim() || 'Your announcement title'}</h4>
      <p>{form.description?.trim() || 'The short description appears here in the announcements feed.'}</p>
    </article>
  </section>;
  const announcementEditor = <Modal open={modalOpen} onClose={() => setModalOpen(false)} closeOnLeft className="pro-form-modal" title={editingId ? 'Edit announcement' : 'New announcement'} description={editingId ? 'Update this announcement and save your changes.' : 'Write a clear workplace update for employees.'}
    headerActions={<div className="pf-header-actions">{statusChip}<Button variant="secondary" type="button" onClick={() => { clearAnnouncementDraft(); setModalOpen(false); }}>Cancel</Button><Button type="submit" form="announcement-editor-form" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Publish'}</Button></div>}>
    <form id="announcement-editor-form" className="pf-body" onSubmit={save}>
      <div className="pf-layout">
        <div className="pf-main">
          {formSection(1, 'Content', 'What employees will read in the feed and the full story.', <>
            <EventField field={{ ...fieldByKey('title'), hint: 'Keep it short and specific.' }} form={form} setForm={setForm} />
            <EventField field={{ ...fieldByKey('description'), hint: 'Shown in the feed — one or two sentences.' }} form={form} setForm={setForm} />
            <EventField field={{ ...fieldByKey('details'), rows: 8, hint: 'Optional. Shown when someone opens the full story.' }} form={form} setForm={setForm} />
          </>)}
        </div>
        <aside className="pf-aside">
          {formSection(2, 'Publishing', 'How and when this update appears.', <>
            <div className="pf-grid-2"><EventField field={fieldByKey('category')} form={form} setForm={setForm} /><EventField field={fieldByKey('priority')} form={form} setForm={setForm} /></div>
            <EventField field={fieldByKey('date')} form={form} setForm={setForm} />
            {relatedEventPicker}
          </>)}
          {announcementPreview}
        </aside>
      </div>
    </form>
  </Modal>;

  // Event editor ---------------------------------------------------------------
  const hostSearch = hostName.trim().toLowerCase();
  const hostOptions = (contacts || []).filter((employee) => {
    const name = employee.name?.trim().toLowerCase();
    const role = employee.role?.toLowerCase() || '';
    return name && (!hostSearch || name.includes(hostSearch) || role.includes(hostSearch)) && !(form.hosts || []).includes(employee.name);
  });
  const addHost = () => {
    const name = hostName.trim();
    if (!name) return setHostError('Select a host name.');
    if (!(contacts || []).some((employee) => employee.name === name)) return setHostError('Select a host from the dropdown.');
    if (form.hosts?.includes(name)) return setHostError('This host is already added.');
    setForm((prev) => ({ ...prev, hosts: [...(prev.hosts || []), name] }));
    setHostName(''); setHostDropdownOpen(false); setHostError('');
  };
  const hostsRequired = (form.category || '') !== 'Holiday';
  const hostPicker = <>
    <div className="event-host-add">
      <div ref={hostComboboxRef} className={`event-host-combobox is-dropdown-${hostDropdownPlacement}`}>
        <input value={hostName} placeholder="Search employees by name or role" aria-label="Search event host" aria-expanded={hostDropdownOpen} aria-autocomplete="list" onFocus={() => setHostDropdownOpen(true)} onKeyDown={(e) => { if (e.key === 'Escape') setHostDropdownOpen(false); }} onBlur={() => window.setTimeout(() => setHostDropdownOpen(false), 120)} onChange={(e) => { setHostName(e.target.value); setHostError(''); setHostDropdownOpen(true); }} />
        {hostDropdownOpen && <div className="event-host-dropdown" role="listbox">
          {hostOptions.map((employee) => <button type="button" key={employee.id} role="option" onMouseDown={(e) => e.preventDefault()} onClick={() => { setHostName(employee.name); setHostDropdownOpen(false); setHostError(''); }}><span className="event-host-avatar">{initialsOf(employee.name)}</span><span><strong>{employee.name}</strong><small>{employee.role || 'Employee'}</small></span></button>)}
          {!hostOptions.length && <p>No matching employees found.</p>}
        </div>}
      </div>
      <button type="button" onClick={addHost}><Plus size={15} /> Add host</button>
    </div>
    {hostError && <p className="event-host-error">{hostError}</p>}
    {(form.hosts || []).length ? <div className="event-hosts">{form.hosts.map((host, index) => <span key={`${host}-${index}`}><b>{initialsOf(host)}</b><strong>{host}</strong><button type="button" aria-label={`Remove ${host}`} onClick={() => setForm((prev) => ({ ...prev, hosts: prev.hosts.filter((_, hostIndex) => hostIndex !== index) }))}><X size={13} /></button></span>)}</div>
      : <p className="pf-empty-note">{hostsRequired ? 'No hosts added yet.' : 'Hosts are optional for holidays.'}</p>}
  </>;
  const pickEventImage = (e) => { handleEventImage(e.target.files?.[0]); e.target.value = ''; };
  const coverUploader = <section className="pf-section">
    <header className="pf-section-head"><span className="pf-step"><ImagePlus size={15} /></span><div><h3>Cover image</h3><p>16:9 · JPG, PNG or WebP · up to 10 MB</p></div></header>
    <div className="pf-section-body">
      {form.image ? <div className="pf-cover has-image">
        <img src={form.image} alt="Event cover preview" />
        <div className="pf-cover-actions">
          <label className="btn btn-secondary btn-sm">Replace<input type="file" accept="image/jpeg,image/png,image/webp" onChange={pickEventImage} /></label>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setForm((prev) => ({ ...prev, image: '' })); setEventImageFile(null); }}><Trash2 size={14} /> Remove</button>
        </div>
      </div> : <label className="pf-cover">
        <ImagePlus size={22} /><strong>Upload a cover image</strong><span>Click to browse your files</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pickEventImage} />
      </label>}
      {imageError && <p className="pf-error">{imageError}</p>}
    </div>
  </section>;
  const eventDate = form.date ? new Date(`${form.date}T12:00:00`) : null;
  const eventPreview = <section className="pf-preview">
    <span className="pf-preview-label">Live preview</span>
    <article className="pf-preview-card">
      <div className="pf-preview-image"><img src={getEventImage(form)} alt="" />{eventDate && <span className="pf-preview-date"><strong>{eventDate.getDate()}</strong>{eventDate.toLocaleDateString('en', { month: 'short' }).toUpperCase()}</span>}</div>
      <div className="pf-preview-meta"><Tag tone={form.category === 'Learning' ? 'purple' : form.category === 'Wellbeing' ? 'mint' : 'blue'}>{form.category || 'Event'}</Tag></div>
      <h4>{form.title?.trim() || 'Your event title'}</h4>
      <p>{form.description?.trim() || 'The event description appears here.'}</p>
      <div className="pf-preview-facts">{form.time && <span><Clock3 size={13} /> {form.time}</span>}<span><MapPin size={13} /> {form.venue?.trim() || 'Venue'}</span></div>
    </article>
  </section>;
  const eventEditor = <Modal open={modalOpen} onClose={() => setModalOpen(false)} closeOnLeft className="pro-form-modal" title={editingId ? 'Edit event' : 'New event'} description={editingId ? 'Update the details below and save your changes.' : 'Schedule an event and share it with your colleagues.'}
    headerActions={<div className="pf-header-actions">{statusChip}<Button variant="secondary" type="button" onClick={() => { if (type === 'events') markEventManageOpen(); setModalOpen(false); }}>Save draft</Button><Button type="submit" form="event-editor-form" disabled={saving || uploading || Boolean(imageError)}>{uploading ? 'Uploading photo…' : saving ? 'Saving…' : editingId ? 'Save changes' : 'Publish event'}</Button></div>}>
    <form id="event-editor-form" className="pf-body" onSubmit={save}>
      <div className="pf-layout">
        <div className="pf-main">
          {formSection(1, 'Event details', 'What the event is about.', <>
            <EventField field={fieldByKey('title')} form={form} setForm={setForm} />
            <EventField field={{ ...fieldByKey('description'), rows: 5 }} form={form} setForm={setForm} />
            <EventField field={fieldByKey('category')} form={form} setForm={setForm} />
          </>)}
          {formSection(2, 'Date, time & location', 'When and where people should join.', <>
            <div className="pf-grid-2"><EventField field={fieldByKey('date')} form={form} setForm={setForm} /><EventField field={fieldByKey('time')} form={form} setForm={setForm} /></div>
            <EventField field={{ ...fieldByKey('venue'), placeholder: 'Room, office or meeting link' }} form={form} setForm={setForm} />
            <EventField field={{ ...fieldByKey('rsvp'), placeholder: 'https://', hint: 'Used by the Join button on the event card.' }} form={form} setForm={setForm} />
          </>)}
          {formSection(3, <>Hosts &amp; speakers{hostsRequired && <b className="required-mark" aria-hidden="true">*</b>}</>, hostsRequired ? 'Add at least one person leading this event.' : 'Optional for holidays.', hostPicker)}
        </div>
        <aside className="pf-aside">
          {coverUploader}
          {eventPreview}
        </aside>
      </div>
    </form>
  </Modal>;

  const renderEventCard = (item) => (
    <article className={`managed-event-card ${item.image ? 'has-event-photo' : ''}`} key={item.id}>
      <div className="managed-event-photo"><img src={getEventImage(item)} alt="" loading="lazy" /></div>
      <div className={`managed-event-date event-${item.color || 'mint'}`}>
        <strong>{item.date ? new Date(`${item.date}T12:00:00`).getDate() : '—'}</strong>
        <span>{item.date ? new Date(`${item.date}T12:00:00`).toLocaleDateString('en', { month: 'short' }).toUpperCase() : 'DATE'}</span>
      </div>
      <div className="managed-event-content">
        <div className="managed-event-heading">
          <Tag tone={item.category === 'Learning' ? 'purple' : item.category === 'Wellbeing' ? 'mint' : 'blue'}>{item.category || 'Event'}</Tag>
          {item.date && <span className="managed-event-full-date">{formatDate(item.date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>}
        </div>
        <h3>{item.title}</h3>
        <p>{item.description || 'No description provided.'}</p>
        <div className="managed-event-meta">
          {item.time && <span>{item.time}</span>}
          {item.venue && <span>{item.venue}</span>}
        </div>
      </div>
      {/* Company holidays come from the HR holiday calendar and can't be edited here. */}
      {!readOnly && String(item.id).startsWith('holiday-') && (
        <div className="managed-event-actions">
          <span className="managed-event-source" title="Holiday dates and names are managed in the HROrbit holiday calendar.">From holiday calendar</span>
          <button className="icon-button" aria-label={`Change cover for ${item.title}`} title="Change cover photo" onClick={() => openCoverEditor(item)}><ImagePlus size={16} /></button>
        </div>
      )}
      {!readOnly && !String(item.id).startsWith('holiday-') && (
        <div className="managed-event-actions">
          <button className="icon-button" aria-label={`Edit ${item.title}`} onClick={() => openEdit(item)}><Edit3 size={16} /></button>
          <button className="icon-button danger-icon" aria-label={`Delete ${item.title}`} onClick={() => remove(item)}><Trash2 size={16} /></button>
        </div>
      )}
    </article>
  );
  const renderContactCard = (item) => <article className="contact-card" key={item.id}><div className="contact-card-body"><h3>{item.name}</h3>{item.role && <p className="contact-role">{item.role}</p>}<p>{item.focus || 'General employee support'}</p>{item.location && <div className="contact-detail-row"><MapPin size={14} /> {item.location}</div>}<div className="contact-detail-row"><AtSign size={14} /> {item.email || 'No email on file'}</div></div></article>;

  return <>
    {draftListEditor}
    {coverHoliday && <Modal open onClose={closeCoverEditor} title="Holiday cover photo" description={`${coverHoliday.title} · ${formatDate(coverHoliday.date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}`} className="holiday-cover-modal">
      <div className="holiday-cover-body">
        <div className="holiday-cover-preview"><img src={coverPreview || getEventImage(coverHoliday)} alt={`${coverHoliday.title} cover preview`} /></div>
        <label className="btn btn-secondary btn-sm holiday-cover-pick">
          <ImagePlus size={15} /> {coverPreview ? 'Choose another photo' : 'Upload new cover'}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pickHolidayCover} />
        </label>
        <p className="holiday-cover-hint">16:9 · JPG, PNG or WebP · up to 10 MB. The holiday's name and date stay as they are in the HR calendar.</p>
        {coverError && <p className="pf-error">{coverError}</p>}
      </div>
      <div className="holiday-cover-actions">
        {coverHoliday.hasCustomCover && <Button variant="secondary" type="button" onClick={() => saveHolidayCover(true)} disabled={coverSaving}>Reset to default</Button>}
        <span />
        <Button variant="secondary" type="button" onClick={closeCoverEditor} disabled={coverSaving}>Cancel</Button>
        <Button type="button" onClick={() => saveHolidayCover(false)} disabled={coverSaving || !coverFile}>{coverSaving ? 'Saving…' : 'Save cover'}</Button>
      </div>
    </Modal>}
    {embedded && <div className="management-header-row"><div>{backAction}</div><div className="management-header-actions">{draftAction}{addAction}</div></div>}
    <PageTitle eyebrow={embedded ? 'MANAGEMENT' : 'PEOPLE & CULTURE'} title={config.title} description={config.description} actions={embedded ? null : <div className="management-header-actions">{draftAction}{addAction}</div>} />
    <Panel className={`collection-panel ${type === 'contacts' ? 'contacts-management-panel' : ''}`}><div className="collection-toolbar"><label className="inline-search"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${config.title.toLowerCase()}...`} /></label><Select className="collection-filter" ariaLabel="Filter by category" value={filter} onChange={setFilter} options={[{ value: "All", label: "All categories" }, ...filterOptions]} /><span className="collection-count">{filtered.length} {filtered.length === 1 ? 'item' : 'items'}</span></div>{collectionState.loading ? <p className="muted">Loading {config.title.toLowerCase()}…</p> : collectionState.error ? <div className="simple-empty"><strong>Unable to load {config.title.toLowerCase()}</strong><span>{collectionState.error}</span></div> : filtered.length === 0 ? <EmptyState icon={type === 'events' ? CalendarDays : Megaphone} title="No matching items" description="Try another search or add a new item to this list." action={readOnly ? null : <Button onClick={openCreate}><Plus size={15} /> Add {config.noun}</Button>} /> : type === 'contacts' ? <div className="contacts-grid">{filtered.map(renderContactCard)}</div> : type === 'events' ? <div className="managed-events-grid">{filtered.map(renderEventCard)}</div> : <div className="managed-list">{filtered.map((item) => <article className="managed-row" key={item.id}><span className={`managed-row-icon ${type}`}>{type === 'announcements' ? <Megaphone size={18} /> : <span>↗</span>}</span><div className="managed-row-main">{type === 'announcements' && <div className="managed-row-meta"><Tag tone={item.priority === 'High' ? 'rose' : item.priority === 'Low' ? 'gold' : 'blue'}>{item.category || 'Announcement'}</Tag>{item.date && <span>{formatDate(item.date, { month: 'short', day: 'numeric', year: 'numeric' })}</span>}</div>}<h3>{item.title || item.name}</h3><p>{item.description || item.focus || item.team || 'No description provided.'}</p></div>{!readOnly && <div className="managed-actions"><button className="icon-button" title={`Edit ${item.title || item.name}`} aria-label={`Edit ${item.title || item.name}`} onClick={() => openEdit(item)}><Edit3 size={16} /></button><button className="icon-button danger-icon" title={`Delete ${item.title || item.name}`} aria-label={`Delete ${item.title || item.name}`} onClick={() => remove(item)}><Trash2 size={16} /></button></div>}</article>)}</div>}</Panel>
    <p className="demo-inline-note">{readOnly ? 'Contacts are sourced from the employee directory and cannot be edited here.' : 'Changes are saved to the company database through the API.'}</p>
    {!readOnly && (type === 'events' ? eventEditor : type === 'announcements' ? announcementEditor : <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`${editingId ? 'Edit' : 'Add'} ${config.noun}`} description="Fill in the details for this item."><form className="form-stack" onSubmit={save}>{config.fields.map((field) => <EventField key={field.key} field={field} form={form} setForm={setForm} />)}<div className="modal-actions"><Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add'}</Button></div></form></Modal>)}
  </>;
}
