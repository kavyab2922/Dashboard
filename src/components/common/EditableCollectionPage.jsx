import { useEffect, useMemo, useRef, useState } from 'react';
import { AtSign, CalendarDays, ChevronDown, Edit3, ImagePlus, MapPin, Megaphone, Plus, Search, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { authApi } from '../../services/api';
import { Button, EmptyState, FormField, Modal, PageTitle, Panel, Tag } from './UI';
import { formatDate, getEventImage } from '../../utils/format';

const configurations = {
  announcements: { title: 'Announcements', description: 'Updates, reminders and important messages from your workplace.', noun: 'announcement', fields: [{ key: 'title', label: 'Title', required: true }, { key: 'description', label: 'Short description', required: true, type: 'textarea' }, { key: 'details', label: 'Full details', type: 'textarea' }, { key: 'category', label: 'Category', type: 'select', options: ['HR Update', 'Company News', 'Policy', 'Holiday', 'Important Notice'] }, { key: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Normal', 'High'] }, { key: 'date', label: 'Publication date', type: 'date' }] },
  events: { title: 'Upcoming events', description: 'Keep up with learning sessions, team moments and company activities.', noun: 'event', fields: [{ key: 'title', label: 'Event title', required: true }, { key: 'description', label: 'Description', required: true, type: 'textarea' }, { key: 'date', label: 'Date', required: true, type: 'date' }, { key: 'time', label: 'Time', required: true }, { key: 'venue', label: 'Venue / location', required: true }, { key: 'category', label: 'Category', type: 'select', options: ['Company', 'Community', 'Learning', 'Wellbeing', 'Holiday'] }, { key: 'rsvp', label: 'RSVP URL (optional)', type: 'url' }] },
  quickLinks: { title: 'Quick links', description: 'Keep your frequently used employee resources close at hand.', noun: 'quick link', fields: [{ key: 'title', label: 'Link name', required: true }, { key: 'description', label: 'Description', required: true }, { key: 'category', label: 'Category', type: 'select', options: ['HR', 'Benefits', 'Learning', 'Support', 'Tools'] }, { key: 'url', label: 'Destination URL or local path', required: true, type: 'url' }, { key: 'icon', label: 'Icon key' }] },
  contacts: { title: 'Quick Connect contacts', description: 'HR points of contact, sourced from the employee directory.', noun: 'contact', readOnly: true, fields: [] },
};

const EVENT_EDITOR_DRAFT_KEY = 'hrobit-event-editor-draft';
const ANNOUNCEMENT_EDITOR_DRAFT_KEY = 'hrobit-announcement-editor-draft';

function readDraft(key) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) || 'null');
    return saved?.open ? saved : null;
  } catch {
    return null;
  }
}

function readEventDraft() {
  return readDraft(EVENT_EDITOR_DRAFT_KEY);
}

function readAnnouncementDraft() {
  return readDraft(ANNOUNCEMENT_EDITOR_DRAFT_KEY);
}

function markEventManageOpen() {
  // Kept only for the Save Draft action; opening the page never enters manage mode.
}

function defaultItem(type) {
  const today = new Date().toISOString().slice(0, 10);
  if (type === 'announcements') return { title: '', description: '', details: '', category: 'HR Update', priority: 'Normal', date: today, relatedEvent: '', pinned: false, read: false };
  if (type === 'events') return { title: '', description: '', date: today, time: '12:00 PM', venue: '', category: 'Community', rsvp: '', color: 'mint', hosts: [] };
  if (type === 'quickLinks') return { title: '', description: '', category: 'HR', url: '', icon: 'Link2', placeholder: false };
  return { name: '', team: 'People & Culture', focus: '', email: '', location: '', extension: '' };
}

function CustomSelect({ value, options, onChange, ariaLabel }) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState('down');
  const selectRef = useRef(null);
  const selected = value || options[0];

  useEffect(() => {
    if (!open || !selectRef.current) return undefined;
    const updatePlacement = () => {
      const bounds = selectRef.current.getBoundingClientRect();
      const menuHeight = Math.min(240, options.length * 42 + 12);
      setPlacement(bounds.bottom + menuHeight > window.innerHeight - 12 ? 'up' : 'down');
    };
    updatePlacement();
    window.addEventListener('resize', updatePlacement);
    window.addEventListener('scroll', updatePlacement, true);
    return () => {
      window.removeEventListener('resize', updatePlacement);
      window.removeEventListener('scroll', updatePlacement, true);
    };
  }, [open, options.length]);

  return <div ref={selectRef} className={`custom-select is-${placement}`} onBlur={() => window.setTimeout(() => setOpen(false), 120)}>
    <button type="button" className={`custom-select-trigger ${open ? 'is-open' : ''}`} aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
      <span>{selected}</span><ChevronDown size={16} />
    </button>
    {open && <div className="custom-select-menu" role="listbox">
      {options.map((option) => <button type="button" key={option} className={`custom-select-option ${selected === option ? 'is-selected' : ''}`} role="option" aria-selected={selected === option} onClick={() => { onChange(option); setOpen(false); }}>
        <span>{option}</span>{selected === option && <span className="custom-select-check">✓</span>}
      </button>)}
    </div>}
  </div>;
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

function EventField({ field, form, setForm }) {
  return <FormField label={field.label} required={field.required}>
    {field.type === 'textarea' ? <textarea rows={4} required={field.required} value={form[field.key] || ''} onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))} />
      : field.type === 'select' ? <CustomSelect ariaLabel={field.label} options={field.options} value={form[field.key]} onChange={(value) => setForm((prev) => ({ ...prev, [field.key]: value }))} />
        : field.type === 'date' ? <DatePicker ariaLabel={field.label} required={field.required} value={form[field.key]} onChange={(value) => setForm((prev) => ({ ...prev, [field.key]: value }))} />
          : <input type={field.type || 'text'} required={field.required} value={form[field.key] || ''} onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))} />}
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
  const savedDraft = type === 'events' ? readEventDraft() : type === 'announcements' ? readAnnouncementDraft() : null;
  const [modalOpen, setModalOpen] = useState(Boolean(savedDraft));
  const [draftListOpen, setDraftListOpen] = useState(false);
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

  const filtered = useMemo(() => collection.filter((item) => Object.values(item).join(' ').toLowerCase().includes(search.toLowerCase()) && (filter === 'All' || (item.category || item.team || 'Other') === filter)), [collection, search, filter]);
  const filterOptions = [...new Set(collection.map((item) => item.category || item.team).filter(Boolean))];
  const today = new Date().toISOString().slice(0, 10);
  const upcomingEvents = events.filter((event) => event.date && event.date >= today);
  const clearEventDraft = () => { try { sessionStorage.removeItem(EVENT_EDITOR_DRAFT_KEY); } catch { /* storage may be unavailable */ } };
  const clearAnnouncementDraft = () => { try { sessionStorage.removeItem(ANNOUNCEMENT_EDITOR_DRAFT_KEY); } catch { /* storage may be unavailable */ } };
  const openCreate = () => { if (type === 'events') clearEventDraft(); if (type === 'announcements') clearAnnouncementDraft(); setEditingId(null); setImageError(''); setHostError(''); setHostName(''); setHostDropdownOpen(false); setRelatedEventDropdownOpen(false); setEventImageFile(null); setForm(defaultItem(type)); setModalOpen(true); };
  const openEdit = (item) => { if (type === 'events') clearEventDraft(); if (type === 'announcements') clearAnnouncementDraft(); setEditingId(item.id); setImageError(''); setHostError(''); setHostName(''); setHostDropdownOpen(false); setRelatedEventDropdownOpen(false); setEventImageFile(null); setForm({ ...defaultItem(type), ...item, hosts: Array.isArray(item.hosts) ? item.hosts : [] }); setModalOpen(true); };

  useEffect(() => {
    if (!modalOpen || (type !== 'events' && type !== 'announcements')) return undefined;
    try {
      const key = type === 'events' ? EVENT_EDITOR_DRAFT_KEY : ANNOUNCEMENT_EDITOR_DRAFT_KEY;
      const draftForm = type === 'events' ? { ...form, image: '' } : form;
      sessionStorage.setItem(key, JSON.stringify({ open: true, editingId, form: draftForm, updatedAt: new Date().toISOString() }));
    } catch { /* keep the form usable if storage is unavailable */ }
    return undefined;
  }, [type, modalOpen, editingId, form]);

  const handleEventImage = (file) => {
    setImageError('');
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return setImageError('Upload a JPG, PNG, or WebP image.');
    if (file.size > 7 * 1024 * 1024) return setImageError('Photo must be 7 MB or smaller.');
    const reader = new FileReader();
    reader.onload = () => { const image = new Image(); image.onload = () => { if (Math.abs((image.width / image.height) - (16 / 9)) > 0.01) return setImageError('Photo must use a 16:9 aspect ratio.'); setEventImageFile(file); setForm((prev) => ({ ...prev, image: reader.result })); }; image.onerror = () => setImageError('The selected photo could not be read.'); image.src = reader.result; };
    reader.onerror = () => setImageError('The selected photo could not be read.');
    reader.readAsDataURL(file);
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
    const missingRequired = config.fields.some((field) => field.required && !String(form[field.key] || '').trim());
    const holidayEvent = type === 'events' && form.category === 'Holiday';
    const missingHost = type === 'events' && !holidayEvent && !form.hosts?.length;
    if (missingRequired || (type === 'events' && (imageError || missingHost))) {
      if (missingHost) setHostError('Add at least one host before saving.');
      return;
    }
    setSaving(true);
    try {
      let payload = form;
      if (type === 'events' && eventImageFile) { setUploading(true); const uploaded = await authApi.uploadFile(eventImageFile); payload = { ...form, image: uploaded.url }; }
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
  const draftListEditor = <Modal open={draftListOpen} onClose={() => setDraftListOpen(false)} title={`${config.title} drafts`} description={`You have ${draftCount} saved ${config.noun}${draftCount === 1 ? '' : 's'}.`} className="draft-list-modal draft-list-fullscreen">
    <div className="draft-list-summary"><strong>{draftCount}</strong><span>{draftCount === 1 ? `saved ${config.noun}` : `saved ${config.noun}s`}</span></div>
    {hasDraft ? <button type="button" className="draft-list-item" onClick={() => { setDraftListOpen(false); setModalOpen(true); }}><span className="draft-list-item-icon">{type === 'events' ? <CalendarDays size={18} /> : <Megaphone size={18} />}</span><span className="draft-list-item-copy"><strong>{draftTitle}</strong><span>{draftDescription}</span><small>{draftList.updatedAt ? `Last edited ${formatDate(draftList.updatedAt, { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Saved draft'}</small></span><span className="draft-list-item-arrow">→</span></button> : <div className="draft-list-empty"><strong>No drafts yet</strong><span>Start creating a {config.noun} and it will appear here automatically.</span></div>}
  </Modal>;
  const eventFields = config.fields;
  const announcementEditor = <Modal open={modalOpen} onClose={() => setModalOpen(false)} closeOnLeft headerActions={<span className="event-draft-badge">Draft Mode</span>} className="event-fullscreen-modal announcement-fullscreen-modal" title={`${editingId ? 'Edit' : 'Create'} Announcement`} description="Fill in the details below to publish a clear workplace update.">
    <form id="announcement-editor-form" className="event-form announcement-form" onSubmit={save}>
      <div className="announcement-editor-grid">
        <section className="event-card announcement-editor-card announcement-main-card"><h3>Announcement details</h3><p className="event-section-description">Share the message employees need to see.</p><EventField field={config.fields[0]} form={form} setForm={setForm} /><EventField field={config.fields[1]} form={form} setForm={setForm} /><EventField field={config.fields[2]} form={form} setForm={setForm} /></section>
        <aside className="announcement-editor-side"><section className="event-card announcement-editor-card"><h3>Publishing settings</h3><EventField field={config.fields[3]} form={form} setForm={setForm} /><EventField field={config.fields[4]} form={form} setForm={setForm} /><EventField field={config.fields[5]} form={form} setForm={setForm} /><FormField label="Related event"><div ref={relatedEventSelectRef} className={`related-event-select is-${relatedEventDropdownPlacement}`} onBlur={() => window.setTimeout(() => setRelatedEventDropdownOpen(false), 120)}><button type="button" className={`related-event-trigger ${relatedEventDropdownOpen ? 'is-open' : ''}`} aria-haspopup="listbox" aria-expanded={relatedEventDropdownOpen} onClick={() => setRelatedEventDropdownOpen((open) => !open)}><span>{form.relatedEvent ? (() => { const selected = upcomingEvents.find((event) => String(event.id) === String(form.relatedEvent)); return selected ? <><strong>{selected.title}</strong>{selected.date && <small>{formatDate(selected.date)}</small>}</> : 'No related event'; })() : 'No related event'}</span><ChevronDown size={17} /></button>{relatedEventDropdownOpen && <div className="related-event-menu" role="listbox"><button type="button" className={`related-event-option ${!form.relatedEvent ? 'is-selected' : ''}`} role="option" aria-selected={!form.relatedEvent} onClick={() => { setForm((prev) => ({ ...prev, relatedEvent: '' })); setRelatedEventDropdownOpen(false); }}><span>No related event</span>{!form.relatedEvent && <span className="related-event-check">✓</span>}</button>{upcomingEvents.filter((event) => event.id && event.title).map((event) => <button type="button" className={`related-event-option ${String(form.relatedEvent) === String(event.id) ? 'is-selected' : ''}`} role="option" aria-selected={String(form.relatedEvent) === String(event.id)} key={event.id} onClick={() => { setForm((prev) => ({ ...prev, relatedEvent: event.id })); setRelatedEventDropdownOpen(false); }}><span><strong>{event.title}</strong>{event.date && <small>{formatDate(event.date)}</small>}</span>{String(form.relatedEvent) === String(event.id) && <span className="related-event-check">✓</span>}</button>)}</div>}</div></FormField></section><section className="event-card announcement-editor-card announcement-guidance"><h3>Before you publish</h3><p>Use a clear title and short description so the update is easy to scan.</p><p>Include full details when employees need extra context.</p></section></aside>
        <div className="event-form-footer"><Button variant="secondary" type="button" onClick={() => { clearAnnouncementDraft(); setModalOpen(false); }}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Publish announcement'}</Button></div>
      </div>
    </form>
  </Modal>;
  const eventEditor = <Modal open={modalOpen} onClose={() => setModalOpen(false)} closeOnLeft headerActions={<span className="event-draft-badge">Draft Mode</span>} className="event-fullscreen-modal" title="Create New Event" description="Fill in the details below to schedule, publish, and distribute your event.">
    <form id="event-editor-form" className="event-form" onSubmit={save}>
      <div className="event-form-grid">
        <section className="event-card event-card-hero"><h3>Event Cover &amp; Banner Photo</h3><p className="event-section-description">Upload high-resolution artwork to display across calendars and feeds.</p><div className="event-photo-upload"><div className={`event-photo-stage ${form.image ? 'has-photo' : ''}`}>{form.image ? <div className="event-photo-preview"><img src={form.image} alt="Event preview" /><button type="button" onClick={() => { setForm((prev) => ({ ...prev, image: '' })); setEventImageFile(null); }} aria-label="Remove event photo"><X size={15} /></button><label className="event-photo-replace">Replace photo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { handleEventImage(e.target.files?.[0]); e.target.value = ''; }} /></label></div> : <label className="event-photo-picker"><ImagePlus size={22} /><strong>Upload cover image</strong><span>Browse files</span><small>Recommended ratio 16:9 · PNG, JPG, or WEBP up to 7MB</small><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { handleEventImage(e.target.files?.[0]); e.target.value = ''; }} /></label>}</div>{imageError && <span className="event-photo-error">{imageError}</span>}</div><EventField field={eventFields[0]} form={form} setForm={setForm} /><div className="event-inline-fields"><EventField field={eventFields[5]} form={form} setForm={setForm} /><div className="event-field-placeholder" /></div></section>
        <aside className="event-sidebar" />
        <section className="event-card event-card-details"><h3>Date, Time &amp; Location</h3><p className="event-section-description">Specify schedule details and attendance venue or online room.</p><div className="event-two-fields"><EventField field={eventFields[2]} form={form} setForm={setForm} /><EventField field={eventFields[3]} form={form} setForm={setForm} /></div><EventField field={eventFields[4]} form={form} setForm={setForm} /></section>
        <section className="event-card event-card-description"><EventField field={eventFields[1]} form={form} setForm={setForm} /><h4>Key Speakers &amp; Hosts {!((form.category || '') === 'Holiday') && <><span className="required-mark" aria-hidden="true">*</span> <em>Required · Add at least one host</em></>}</h4><div className="event-host-add"><div ref={hostComboboxRef} className={`event-host-combobox is-dropdown-${hostDropdownPlacement}`}><input value={hostName} placeholder="Type to search hosts" aria-label="Search event host" aria-expanded={hostDropdownOpen} aria-autocomplete="list" onFocus={() => setHostDropdownOpen(true)} onKeyDown={(e) => { if (e.key === 'Escape') setHostDropdownOpen(false); }} onBlur={() => window.setTimeout(() => setHostDropdownOpen(false), 120)} onChange={(e) => { setHostName(e.target.value); setHostError(''); setHostDropdownOpen(true); }} />{hostDropdownOpen && <div className="event-host-dropdown" role="listbox">{(contacts || []).filter((employee) => employee.name?.trim()).filter((employee) => { const search = hostName.trim().toLowerCase(); const name = employee.name.trim().toLowerCase(); const role = employee.role?.toLowerCase() || ''; return !search || name.includes(search) || role.includes(search); }).filter((employee) => !(form.hosts || []).includes(employee.name)).map((employee) => <button type="button" key={employee.id} role="option" onMouseDown={(e) => e.preventDefault()} onClick={() => { setHostName(employee.name); setHostDropdownOpen(false); setHostError(''); }}><span className="event-host-avatar">{employee.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><span><strong>{employee.name}</strong><small>{employee.role || 'Employee'}</small></span></button>)}{!(contacts || []).some((employee) => { const search = hostName.trim().toLowerCase(); const name = employee.name?.trim().toLowerCase(); const role = employee.role?.toLowerCase() || ''; return name && (!search || name.includes(search) || role.includes(search)) && !(form.hosts || []).includes(employee.name); }) && <p>No matching employees found.</p>}</div>}</div><button type="button" onClick={() => { const name = hostName.trim(); if (!name) return setHostError('Select a host name.'); if (!(contacts || []).some((employee) => employee.name === name)) return setHostError('Select a host from the dropdown.'); if (form.hosts?.includes(name)) return setHostError('This host is already added.'); setForm((prev) => ({ ...prev, hosts: [...(prev.hosts || []), name] })); setHostName(''); setHostDropdownOpen(false); setHostError(''); }}>Add host</button></div>{hostError && <p className="event-host-error">{hostError}</p>}<div className="event-hosts">{(form.hosts || []).map((host, index) => <span key={`${host}-${index}`}><b>{host.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</b><strong>{host}</strong><button type="button" aria-label={`Remove ${host}`} onClick={() => setForm((prev) => ({ ...prev, hosts: prev.hosts.filter((_, hostIndex) => hostIndex !== index) }))}><X size={13} /></button></span>)}</div></section>
        <div className="event-form-footer"><Button variant="secondary" type="button" onClick={() => { if (type === 'events') markEventManageOpen(); setModalOpen(false); }}>Save Draft</Button><Button type="submit" disabled={saving || uploading || Boolean(imageError)}>{uploading ? 'Uploading photo…' : saving ? 'Saving…' : 'Publish Event'}</Button></div>
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
      {!readOnly && (
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
    {embedded && <div className="management-header-row"><div>{backAction}</div><div className="management-header-actions">{draftAction}{addAction}</div></div>}
    <PageTitle eyebrow={embedded ? 'MANAGEMENT' : 'PEOPLE & CULTURE'} title={config.title} description={config.description} actions={embedded ? null : <div className="management-header-actions">{draftAction}{addAction}</div>} />
    <Panel className={`collection-panel ${type === 'contacts' ? 'contacts-management-panel' : ''}`}><div className="collection-toolbar"><label className="inline-search"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${config.title.toLowerCase()}...`} /></label><select aria-label="Filter list" value={filter} onChange={(e) => setFilter(e.target.value)}><option>All</option>{filterOptions.map((option) => <option key={option}>{option}</option>)}</select><span className="collection-count">{filtered.length} {filtered.length === 1 ? 'item' : 'items'}</span></div>{collectionState.loading ? <p className="muted">Loading {config.title.toLowerCase()}…</p> : collectionState.error ? <div className="simple-empty"><strong>Unable to load {config.title.toLowerCase()}</strong><span>{collectionState.error}</span></div> : filtered.length === 0 ? <EmptyState icon={type === 'events' ? CalendarDays : Megaphone} title="No matching items" description="Try another search or add a new item to this list." action={readOnly ? null : <Button onClick={openCreate}><Plus size={15} /> Add {config.noun}</Button>} /> : type === 'contacts' ? <div className="contacts-grid">{filtered.map(renderContactCard)}</div> : type === 'events' ? <div className="managed-events-grid">{filtered.map(renderEventCard)}</div> : <div className="managed-list">{filtered.map((item) => <article className="managed-row" key={item.id}><span className={`managed-row-icon ${type}`}>{type === 'announcements' ? <Megaphone size={18} /> : <span>↗</span>}</span><div className="managed-row-main">{type === 'announcements' && <div className="managed-row-meta"><Tag tone={item.priority === 'High' ? 'rose' : item.priority === 'Low' ? 'gold' : 'blue'}>{item.category || 'Announcement'}</Tag>{item.date && <span>{formatDate(item.date, { month: 'short', day: 'numeric', year: 'numeric' })}</span>}</div>}<h3>{item.title || item.name}</h3><p>{item.description || item.focus || item.team || 'No description provided.'}</p></div>{!readOnly && <div className="managed-actions"><button className="icon-button" title={`Edit ${item.title || item.name}`} aria-label={`Edit ${item.title || item.name}`} onClick={() => openEdit(item)}><Edit3 size={16} /></button><button className="icon-button danger-icon" title={`Delete ${item.title || item.name}`} aria-label={`Delete ${item.title || item.name}`} onClick={() => remove(item)}><Trash2 size={16} /></button></div>}</article>)}</div>}</Panel>
    <p className="demo-inline-note">{readOnly ? 'Contacts are sourced from the employee directory and cannot be edited here.' : 'Changes are saved to the company database through the API.'}</p>
    {!readOnly && (type === 'events' ? eventEditor : type === 'announcements' ? announcementEditor : <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`${editingId ? 'Edit' : 'Add'} ${config.noun}`} description="Fill in the details for this item."><form className="form-stack" onSubmit={save}>{config.fields.map((field) => <EventField key={field.key} field={field} form={form} setForm={setForm} />)}<div className="modal-actions"><Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add'}</Button></div></form></Modal>)}
  </>;
}
