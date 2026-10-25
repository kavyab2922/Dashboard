import { useMemo, useState } from 'react';
import { CalendarDays, Edit3, Megaphone, Plus, Search, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button, EmptyState, FormField, Modal, PageTitle, Panel, Tag } from './UI';
import { formatDate } from '../../utils/format';

const configurations = {
  announcements: { title: 'Announcements', description: 'Updates, reminders and important messages from your workplace.', noun: 'announcement', fields: [{key:'title',label:'Title',required:true},{key:'description',label:'Short description',required:true,type:'textarea'},{key:'details',label:'Full details',type:'textarea'},{key:'category',label:'Category',type:'select',options:['HR Update','Company News','Policy','Holiday','Important Notice']},{key:'priority',label:'Priority',type:'select',options:['Low','Normal','High']},{key:'date',label:'Publication date',type:'date'}] },
  events: { title: 'Upcoming events', description: 'Keep up with learning sessions, team moments and company activities.', noun: 'event', fields: [{key:'title',label:'Event title',required:true},{key:'description',label:'Description',required:true,type:'textarea'},{key:'date',label:'Date',type:'date'},{key:'time',label:'Time',required:true},{key:'venue',label:'Venue / location'},{key:'category',label:'Category',type:'select',options:['Company','Community','Learning','Wellbeing','Holiday']},{key:'rsvp',label:'RSVP URL (optional)',type:'url'}] },
  quickLinks: { title: 'Quick links', description: 'Keep your frequently used employee resources close at hand.', noun: 'quick link', fields: [{key:'title',label:'Link name',required:true},{key:'description',label:'Description',required:true},{key:'category',label:'Category',type:'select',options:['HR','Benefits','Learning','Support','Tools']},{key:'url',label:'Destination URL or local path',required:true,type:'url'},{key:'icon',label:'Icon key'}] },
  contacts: { title: 'Quick Connect contacts', description: 'HR points of contact, sourced from the employee directory.', noun: 'contact', readOnly: true, fields: [] },
};

function defaultItem(type) {
  const today = new Date().toISOString().slice(0,10);
  if (type === 'announcements') return { title:'', description:'', details:'', category:'HR Update', priority:'Normal', date:today, pinned:false, read:false };
  if (type === 'events') return { title:'', description:'', date:today, time:'12:00 PM', venue:'', category:'Community', rsvp:'', color:'mint' };
  if (type === 'quickLinks') return { title:'', description:'', category:'HR', url:'', icon:'Link2', placeholder:false };
  return { name:'', team:'People & Culture', focus:'', email:'', location:'', extension:'' };
}

export default function EditableCollectionPage({ type = 'announcements', embedded = false }) {
  const config = configurations[type];
  const {
    announcements, announcementsState, saveAnnouncement, removeAnnouncement,
    events, eventsState, saveEvent, removeEvent,
    quickLinks, quickLinksState, saveQuickLink, removeQuickLink,
    contacts, contactsState, setToast, isHrAdmin,
  } = useApp();

  const collection = type === 'announcements' ? announcements : type === 'events' ? events : type === 'quickLinks' ? quickLinks : contacts;
  const collectionState = type === 'announcements' ? announcementsState : type === 'events' ? eventsState : type === 'quickLinks' ? quickLinksState : contactsState;
  const readOnly = Boolean(config.readOnly) || !isHrAdmin;

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultItem(type));
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => collection.filter((item) => {
    const content = Object.values(item).join(' ').toLowerCase();
    const matchesSearch = content.includes(search.toLowerCase());
    const category = item.category || item.team || 'Other';
    return matchesSearch && (filter === 'All' || category === filter);
  }), [collection, search, filter]);
  const filterOptions = [...new Set(collection.map((item) => item.category || item.team).filter(Boolean))];

  const openCreate = () => { setEditingId(null); setForm(defaultItem(type)); setModalOpen(true); };
  const openEdit = (item) => { setEditingId(item.id); setForm({ ...defaultItem(type), ...item }); setModalOpen(true); };

  const save = async (event) => {
    event.preventDefault();
    if (config.fields.some((field) => field.required && !String(form[field.key] || '').trim())) return;
    setSaving(true);
    try {
      if (type === 'announcements') await saveAnnouncement(form, editingId);
      else if (type === 'events') await saveEvent(form, editingId);
      else await saveQuickLink(form, editingId);
      setModalOpen(false);
      setToast(`${config.noun[0].toUpperCase()}${config.noun.slice(1)} ${editingId ? 'updated' : 'added'}.`);
    } catch (err) {
      setToast(err.message || 'Unable to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Remove “${item.title || item.name}” from the ${config.noun} list?`)) return;
    try {
      if (type === 'announcements') await removeAnnouncement(item.id);
      else if (type === 'events') await removeEvent(item.id);
      else await removeQuickLink(item.id);
      setToast(`${config.noun[0].toUpperCase()}${config.noun.slice(1)} removed.`);
    } catch (err) {
      setToast(err.message || 'Unable to remove the item.');
    }
  };

  return <><PageTitle eyebrow={embedded ? 'MANAGEMENT' : 'PEOPLE & CULTURE'} title={config.title} description={config.description} actions={readOnly ? null : <Button onClick={openCreate}><Plus size={16}/> Add {config.noun}</Button>}/><Panel className="collection-panel"><div className="collection-toolbar"><label className="inline-search"><Search size={16}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${config.title.toLowerCase()}...`}/></label><select aria-label="Filter list" value={filter} onChange={(e) => setFilter(e.target.value)}><option>All</option>{filterOptions.map((option) => <option key={option}>{option}</option>)}</select><span className="collection-count">{filtered.length} {filtered.length === 1 ? 'item' : 'items'}</span></div>
    {collectionState.loading ? <p className="muted" style={{padding:'1.5rem'}}>Loading {config.title.toLowerCase()}…</p>
      : collectionState.error ? <div className="simple-empty"><strong>Unable to load {config.title.toLowerCase()}</strong><span>{collectionState.error}</span></div>
      : filtered.length === 0 ? <EmptyState icon={type === 'events' ? CalendarDays : Megaphone} title="No matching items" description="Try another search or add a new item to this list." action={readOnly ? null : <Button onClick={openCreate}><Plus size={15}/> Add {config.noun}</Button>}/> : <div className="managed-list">{filtered.map((item) => <article className="managed-row" key={item.id}><span className={`managed-row-icon ${type}`}>{type === 'events' ? <CalendarDays size={18}/> : type === 'announcements' ? <Megaphone size={18}/> : type === 'contacts' ? <span>{item.initials || item.name?.slice(0,1)}</span> : <span>↗</span>}</span><div className="managed-row-main"><div className="managed-title-line"><h3>{item.title || item.name}</h3>{item.priority && <Tag tone={item.priority === 'High' ? 'rose' : item.priority === 'Low' ? 'slate' : 'blue'}>{item.priority} priority</Tag>}{item.pinned && <Tag tone="purple">Pinned</Tag>}{item.url?.startsWith('#placeholder-') && <Tag tone="amber">Placeholder link</Tag>}</div><p>{item.description || item.focus || item.team || 'No description provided.'}</p><div className="managed-meta">{(item.category || item.team) && <span>{item.category || item.team}</span>}{item.date && <span>{formatDate(item.date, {month:'short',day:'numeric',year:'numeric'})}</span>}{item.time && <span>{item.time}</span>}{item.email && <span>{item.email}</span>}</div></div>{!readOnly && <div className="managed-actions"><button className="icon-button" aria-label={`Edit ${item.title || item.name}`} onClick={() => openEdit(item)}><Edit3 size={16}/></button><button className="icon-button danger-icon" aria-label={`Delete ${item.title || item.name}`} onClick={() => remove(item)}><Trash2 size={16}/></button></div>}</article>)}</div>}</Panel>
    <p className="demo-inline-note">{readOnly && !config.readOnly ? 'Switch to HR Admin mode to manage this content. Changes are saved to the company database through the API.' : readOnly ? 'Contacts are sourced from the employee directory (HR departments and roles) and cannot be edited here.' : 'Changes are saved to the company database through the API.'}</p>
    {!readOnly && <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`${editingId ? 'Edit' : 'Add'} ${config.noun}`} description="Fill in the details for this item."><form className="form-stack" onSubmit={save}>{config.fields.map((field) => <FormField key={field.key} label={field.label}>{field.type === 'textarea' ? <textarea rows={3} required={field.required} value={form[field.key] || ''} onChange={(e) => setForm((prev) => ({...prev, [field.key]: e.target.value}))}/> : field.type === 'select' ? <select value={form[field.key] || field.options[0]} onChange={(e) => setForm((prev) => ({...prev, [field.key]:e.target.value}))}>{field.options.map((option) => <option key={option}>{option}</option>)}</select> : <input type={field.type || 'text'} required={field.required} value={form[field.key] || ''} onChange={(e) => setForm((prev) => ({...prev, [field.key]:e.target.value}))}/>}</FormField>)}<div className="modal-actions"><Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add'}</Button></div></form></Modal>}</>;
}
