import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Clock3, ExternalLink, MapPin, Rows3, Users, X } from 'lucide-react';
import EditableCollectionPage, { canRestoreAfterRefresh, isEditorOpen, markRestoreUsed } from '../components/common/EditableCollectionPage';
import { Button, Modal, PageTitle, Panel, Tag } from '../components/common/UI';
import { useApp } from '../context/AppContext';
import { formatDate, getEventImage } from '../utils/format';

const EVENT_MANAGE_KEY = 'hrobit-event-manage-open';

export default function Events() {
  const { events, eventsState, isHrAdmin, setToast } = useApp();
  const [view, setView] = useState('list');
  const [selectedEvent, setSelectedEvent] = useState(null);
  // Stay in the manage view across a browser refresh; opening the page from a link shows the events page.
  const [manage, setManage] = useState(() => {
    if (!canRestoreAfterRefresh('events-page')) return false;
    try { return sessionStorage.getItem(EVENT_MANAGE_KEY) === 'true' || isEditorOpen('events'); } catch { return false; }
  });
  useEffect(() => {
    markRestoreUsed('events-page');
    // If the refresh didn't land in the manage view, Manage events must not reopen an old editor.
    if (!manage) markRestoreUsed('events-editor');
  }, []);
  const setManageView = (nextValue) => {
    setManage(nextValue);
    try {
      if (nextValue) sessionStorage.setItem(EVENT_MANAGE_KEY, 'true');
      else sessionStorage.removeItem(EVENT_MANAGE_KEY);
    } catch { /* storage may be unavailable */ }
  };

  // The sidebar link fires this event so it can leave the manage view.
  useEffect(() => {
    const showList = () => setManageView(false);
    window.addEventListener('hrobit:show-events-list', showList);
    return () => window.removeEventListener('hrobit:show-events-list', showList);
  }, []);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const upcomingEvents = useMemo(
    () => events.filter((event) => event.date >= todayKey).sort((a, b) => a.date.localeCompare(b.date)),
    [events, todayKey]
  );
  const monthLabel = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(calendarMonth);
  const calendarDays = useMemo(() => {
    const firstDay = (calendarMonth.getDay() + 6) % 7;
    return Array.from({ length: 42 }, (_, index) => {
      const day = index - firstDay + 1;
      return new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    }).map((date) => {
      // Local date key: toISOString() is UTC and shifts every event a day late east of UTC (e.g. India).
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      return {
        date,
        dateKey,
        inMonth: date.getMonth() === calendarMonth.getMonth(),
        events: upcomingEvents.filter((item) => item.date === dateKey),
      };
    });
  }, [calendarMonth, upcomingEvents]);

  if (manage) return (
    <>
      <EditableCollectionPage
        type="events"
        embedded
        backAction={<button type="button" className="icon-button back-icon-button" aria-label="Back to events" title="Back to events" onClick={() => setManageView(false)}><ArrowLeft size={18} /></button>}
      />
    </>
  );

  const openRsvp = (event) => {
    if (event.rsvp && /^https?:\/\//i.test(event.rsvp)) {
      window.open(event.rsvp, '_blank', 'noopener,noreferrer');
    } else {
      setToast('No join link has been provided for this event.');
    }
  };

  // Cards open the details pop-up; Enter/Space do the same for keyboard users.
  const cardProps = (event) => ({
    role: 'button',
    tabIndex: 0,
    'aria-label': `View details for ${event.title}`,
    onClick: () => setSelectedEvent(event),
    onKeyDown: (keyEvent) => {
      if (keyEvent.target !== keyEvent.currentTarget) return;
      if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
        keyEvent.preventDefault();
        setSelectedEvent(event);
      }
    },
  });

  return (
    <>
      <PageTitle
        eyebrow="MAKE TIME FOR CONNECTION"
        title="Upcoming events"
        description="Company townhalls, technical deep dives, wellness workshops and team gatherings."
        actions={isHrAdmin ? <Button variant="secondary" onClick={() => setManageView(true)}>Manage events</Button> : null}
      />

      <div className="events-hero">
        <div className="events-hero-copy">
          <Tag tone="blue">SCHEDULED GATHERINGS</Tag>
          <h2>There's always something around the corner.</h2>
          <p>
            Join live discussions, cross-functional demos, and personal wellness breaks. Add sessions to your calendar with one click.
          </p>
        </div>
        <div className="events-hero-number">
          <strong>{upcomingEvents.length.toString().padStart(2,'0')}</strong>
          <span>UPCOMING EVENTS</span>
        </div>
      </div>

      <div className="events-toolbar">
        <div>
          <h2>Event calendar</h2>
          <p>Browse upcoming schedules and details at a glance.</p>
        </div>
        <div className="view-switch">
          <button type="button" aria-pressed={view === 'list'} className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
            <Rows3 size={16}/> <span>List view</span>
          </button>
          <button type="button" aria-pressed={view === 'calendar'} className={view === 'calendar' ? 'active' : ''} onClick={() => setView('calendar')}>
            <CalendarDays size={16}/> <span>Month view</span>
          </button>
        </div>
      </div>

      {eventsState.loading ? (
        <Panel><p className="muted">Loading events…</p></Panel>
      ) : eventsState.error ? (
        <Panel><p className="muted">Unable to load events: {eventsState.error}</p></Panel>
      ) : view === 'list' ? (
        <div className="events-list">
          {upcomingEvents.map((event) => (
            <Panel className="event-card is-clickable" key={event.id} {...cardProps(event)}>
              <div className="event-card-thumb">
                <img src={getEventImage(event)} alt={event.title} className="event-thumb-img" loading="lazy" />
                  <div className={`event-date-tile event-${event.color || 'mint'}`}>
                    <strong>{new Date(`${event.date}T12:00:00`).getDate()}</strong>
                    <span>{new Date(`${event.date}T12:00:00`).toLocaleDateString('en',{month:'short'}).toUpperCase()}</span>
                  </div>
              </div>
              <div className="event-card-main">
                <div className="event-card-top">
                  <Tag tone={event.category === 'Learning' ? 'purple' : event.category === 'Wellbeing' ? 'mint' : 'blue'}>
                    {event.category}
                  </Tag>
                  <span className="event-date-full">
                    {formatDate(event.date, {weekday:'short',month:'short',day:'numeric'})}
                  </span>
                </div>
                <h3>{event.title}</h3>
                {event.description && event.description.trim().toLowerCase() !== String(event.title || '').trim().toLowerCase() && <p>{event.description}</p>}
                <div className="event-card-meta">
                  <span><Clock3 size={14}/> {event.time}</span>
                  <span><MapPin size={14}/> {event.venue}</span>
                </div>
                {/* Holidays and other events without a link have nothing to join. */}
                {event.rsvp && (
                  <div className="event-card-action">
                    <Button size="sm" onClick={(clickEvent) => { clickEvent.stopPropagation(); openRsvp(event); }}>
                      Join <ExternalLink size={13}/>
                    </Button>
                  </div>
                )}
              </div>
            </Panel>
          ))}
          {upcomingEvents.length === 0 && (
            <Panel><p className="muted">No events currently scheduled.</p></Panel>
          )}
        </div>
      ) : (
        <Panel className="calendar-panel">
          <div className="calendar-month-head">
            <div>
              <span>YOUR AGENDA</span>
              <h2>{monthLabel}</h2>
              <p>{upcomingEvents.length} upcoming {upcomingEvents.length === 1 ? 'event' : 'events'} scheduled</p>
            </div>
            <div className="calendar-month-actions">
              <button type="button" className="calendar-nav-button" aria-label="Previous month" onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
                <ChevronLeft size={17}/>
              </button>
              <button type="button" className="calendar-today-button" onClick={() => setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1))}>Today</button>
              <button type="button" className="calendar-nav-button" aria-label="Next month" onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
                <ChevronRight size={17}/>
              </button>
            </div>
          </div>
          <div className="calendar-grid">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day) => (
              <div className="calendar-weekday" key={day}>{day}</div>
            ))}
            {calendarDays.map(({ date, dateKey, inMonth, events: dayEvents }) => {
              const isToday = dateKey === todayKey;
              return (
                <div className={`calendar-day ${!inMonth ? 'outside-month' : ''} ${isToday ? 'today' : ''}`} key={dateKey}>
                  <span className="calendar-day-number">{date.getDate()}</span>
                  {dayEvents.map((event) => (
                    <button type="button" title={event.title} className="calendar-event-dot" key={event.id} onClick={() => setSelectedEvent(event)}>
                      {event.title}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      <EventDetailsModal event={selectedEvent} todayKey={todayKey} onClose={() => setSelectedEvent(null)} onRsvp={openRsvp} />
    </>
  );
}

function daysAwayLabel(dateKey, todayKey) {
  const days = Math.round((new Date(`${dateKey}T12:00:00`) - new Date(`${todayKey}T12:00:00`)) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return days > 1 ? `In ${days} days` : null;
}

function EventDetailsModal({ event, todayKey, onClose, onRsvp }) {
  if (!event) return null;
  const hosts = (Array.isArray(event.hosts) ? event.hosts : []).map((host) => (typeof host === 'string' ? host : host?.name)).filter(Boolean);
  const description = String(event.description || '').trim();
  const showDescription = description && description.toLowerCase() !== String(event.title || '').trim().toLowerCase();
  const when = daysAwayLabel(event.date, todayKey);

  return (
    <Modal open onClose={onClose} title={event.title} className="event-details-modal" hideClose>
      <div className="event-details-cover">
        <img src={getEventImage(event)} alt="" />
        <button type="button" className="event-details-close" aria-label="Close" onClick={onClose}><X size={18} /></button>
        <div className="event-details-cover-copy">
          <Tag tone={event.category === 'Learning' ? 'purple' : event.category === 'Wellbeing' ? 'mint' : 'blue'}>{event.category}</Tag>
          <h2>{event.title}</h2>
          {when && <span className="event-details-when">{when}</span>}
        </div>
      </div>

      <div className="event-details-body">
        <div className="event-details-facts">
          <div><CalendarDays size={17} /><span><small>Date</small><strong>{formatDate(event.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</strong></span></div>
          <div><Clock3 size={17} /><span><small>Time</small><strong>{event.time || 'To be announced'}</strong></span></div>
          <div><MapPin size={17} /><span><small>Location</small><strong>{event.venue || 'To be announced'}</strong></span></div>
          {hosts.length > 0 && <div><Users size={17} /><span><small>{hosts.length === 1 ? 'Host' : 'Hosts'}</small><strong>{hosts.join(', ')}</strong></span></div>}
        </div>

        {showDescription && (
          <section className="event-details-section">
            <h3>About this event</h3>
            <p>{description}</p>
          </section>
        )}

        <div className="event-details-actions">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          {event.rsvp && <Button onClick={() => onRsvp(event)}>Join <ExternalLink size={14} /></Button>}
        </div>
      </div>
    </Modal>
  );
}
