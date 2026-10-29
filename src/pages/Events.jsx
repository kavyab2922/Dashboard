import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Clock3, ExternalLink, MapPin, Rows3 } from 'lucide-react';
import EditableCollectionPage, { canRestoreAfterRefresh, isEditorOpen, markRestoreUsed } from '../components/common/EditableCollectionPage';
import { Button, PageTitle, Panel, Tag } from '../components/common/UI';
import { useApp } from '../context/AppContext';
import { formatDate, getEventImage } from '../utils/format';

const EVENT_MANAGE_KEY = 'hrobit-event-manage-open';

export default function Events() {
  const { events, eventsState, isHrAdmin, setToast } = useApp();
  const [view, setView] = useState('list');
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
    }).map((date) => ({
      date,
      inMonth: date.getMonth() === calendarMonth.getMonth(),
      event: upcomingEvents.find((item) => item.date === date.toISOString().slice(0, 10)),
    }));
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
      setToast('No RSVP link has been provided for this event.');
    }
  };

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
            <Panel className="event-card" key={event.id}>
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
                <p>{event.description}</p>
                <div className="event-card-meta">
                  <span><Clock3 size={14}/> {event.time}</span>
                  <span><MapPin size={14}/> {event.venue}</span>
                </div>
                <div className="event-card-action">
                  <Button size="sm" onClick={() => openRsvp(event)}>
                    RSVP / Join <ExternalLink size={13}/>
                  </Button>
                </div>
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
            {calendarDays.map(({ date, inMonth, event }) => {
              const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
              const isToday = dateKey === todayKey;
              return (
                <div className={`calendar-day ${!inMonth ? 'outside-month' : ''} ${isToday ? 'today' : ''}`} key={dateKey}>
                  <span className="calendar-day-number">{date.getDate()}</span>
                  {event && (
                    <button type="button" title={event.title} className="calendar-event-dot" onClick={() => openRsvp(event)}>
                      {event.title}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Panel>
      )}
    </>
  );
}
