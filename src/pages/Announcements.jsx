import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Bookmark, CalendarDays, Megaphone, Pin, Search, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import EditableCollectionPage, { canRestoreAfterRefresh, isEditorOpen, markRestoreUsed } from '../components/common/EditableCollectionPage';
import { PageTitle, Panel, Tag, Button, Modal, PanelHeading } from '../components/common/UI';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/format';

const ANNOUNCEMENT_MANAGE_KEY = 'hrobit-announcement-manage-open';

export default function Announcements() {
  const { announcements, announcementsState, events, eventsState, setAnnouncementRead, isHrAdmin, setToast } = useApp();
  // Stay in the manage view across a browser refresh; opening the page from a link shows the feed.
  const [manage, setManageState] = useState(() => {
    if (!canRestoreAfterRefresh('announcements-page')) return false;
    try { return sessionStorage.getItem(ANNOUNCEMENT_MANAGE_KEY) === 'true' || isEditorOpen('announcements'); } catch { return false; }
  });
  useEffect(() => {
    markRestoreUsed('announcements-page');
    // If the refresh didn't land in the manage view, Manage posts must not reopen an old editor.
    if (!manage) markRestoreUsed('announcements-editor');
  }, []);
  const setManage = (nextValue) => {
    setManageState(nextValue);
    try {
      if (nextValue) sessionStorage.setItem(ANNOUNCEMENT_MANAGE_KEY, 'true');
      else sessionStorage.removeItem(ANNOUNCEMENT_MANAGE_KEY);
    } catch { /* storage may be unavailable */ }
  };
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  // Keep the feed correct even when an older cached API response is displayed.
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  // The next 5 upcoming events (including holidays) are announced in the feed alongside posts.
  const upcomingEventItems = events
    .filter((event) => event.date && event.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)
    .map((event) => ({
      id: `event-${event.id}`,
      title: event.title,
      description: event.description,
      details: [event.time, event.venue].filter(Boolean).join(' · '),
      category: event.category || 'Event',
      date: event.date,
      image: event.image,
      read: true,
      isEvent: true,
    }));
  const currentAnnouncements = [...announcements.filter((item) => !item.date || item.date >= today), ...upcomingEventItems]
    .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || (a.date || '').localeCompare(b.date || ''));
  const feedLoading = announcementsState.loading || eventsState.loading;
  const feedError = announcementsState.error || eventsState.error;
  const filters = ['All', ...new Set(currentAnnouncements.map((item) => item.category))];
  const unreadCount = currentAnnouncements.filter((item) => !item.read).length;
  const pinnedCount = currentAnnouncements.filter((item) => item.pinned).length;
  const latestDate = currentAnnouncements.reduce((latest, item) => (item.date && item.date > latest ? item.date : latest), '');
  const filtered = currentAnnouncements.filter((item) =>
    `${item.title} ${item.description} ${item.details}`.toLowerCase().includes(search.toLowerCase()) &&
    (category === 'All' || item.category === category)
  );

  const toggleRead = async (item) => {
    try {
      await setAnnouncementRead(item.id, !item.read);
      setToast('Announcement state updated.');
    } catch (err) {
      setToast(err.message || 'Unable to update the announcement.');
    }
  };

  // The sidebar link fires this event so it can leave the manage view.
  useEffect(() => {
    const showFeed = () => setManage(false);
    window.addEventListener('hrobit:show-announcements-feed', showFeed);
    return () => window.removeEventListener('hrobit:show-announcements-feed', showFeed);
  }, []);

  if (manage) return (
    <EditableCollectionPage
      type="announcements"
      embedded
      backAction={<button type="button" className="icon-button back-icon-button" aria-label="Back to announcements" title="Back to announcements" onClick={() => setManage(false)}><ArrowLeft size={18} /></button>}
    />
  );

  return (
    <>
      <PageTitle
        eyebrow="THE LATEST FROM YOUR WORKPLACE"
        title="Announcements"
        description="A shared space for company milestones, executive updates, cultural news and essential workforce notices."
        actions={isHrAdmin ? <Button onClick={() => setManage(true)}>Manage posts</Button> : null}
      />

      <section className="announcement-feature">
        <div className="announcement-feature-text">
          <span className="announcement-feature-icon" aria-hidden="true"><Megaphone size={22}/></span>
          <div>
            <Tag tone="mint">IN THE LOOP</Tag>
            <h2>Stay connected to what matters.</h2>
            <p>Company news, policy updates and important notices — all in one place.</p>
          </div>
        </div>
        <dl className="announcement-stats">
          <div><dt>Updates</dt><dd>{currentAnnouncements.length}</dd></div>
          <div className={unreadCount ? 'is-highlight' : ''}><dt>Unread</dt><dd>{unreadCount}</dd></div>
          <div><dt>Pinned</dt><dd>{pinnedCount}</dd></div>
          <div><dt>Latest</dt><dd>{latestDate ? formatDate(latestDate, { month: 'short', day: 'numeric' }) : '—'}</dd></div>
        </dl>
      </section>

      <Panel className="announcement-feed-panel">
        <div className="feed-toolbar">
          <label className="inline-search">
            <Search size={16}/>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search announcements..."/>
          </label>
          <div className="filter-chip-row">
            {filters.map((filter) => (
              <button
                className={`filter-chip ${category === filter ? 'selected' : ''}`}
                key={filter}
                onClick={() => setCategory(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="announcement-feed">
          {feedLoading && (
            <div className="simple-empty">
              <Search size={22}/>
              <strong>Loading announcements…</strong>
              <span>Fetching the latest updates from the server.</span>
            </div>
          )}
          {feedError && (
            <div className="simple-empty">
              <Search size={22}/>
              <strong>Unable to load announcements</strong>
              <span>{feedError}</span>
            </div>
          )}
          {!feedLoading && !feedError && filtered.map((item) => (
            <article className={`feed-announcement ${!item.read ? 'feed-unread' : ''}`} key={item.id}>
              {item.image && (
                <div className="feed-announcement-thumb">
                  <img src={item.image} alt={item.title} className="feed-thumb-img" loading="lazy" />
                </div>
              )}
              <div className="feed-announcement-body">
                <div className="feed-meta">
                  <Tag tone={item.category === 'Holiday' ? 'gold' : item.category === 'Company News' ? 'purple' : 'blue'}>
                    {item.category}
                  </Tag>
                  {item.pinned && <span className="pinned-label"><Pin size={12}/> Pinned</span>}
                  <span>{formatDate(item.date, {month:'short',day:'numeric',year:'numeric'})}</span>
                  {!item.read && <span className="unread-label">NEW</span>}
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="feed-announcement-actions">
                  <button className="text-link" onClick={() => setSelected(item)}>
                    Read full story <ArrowUpRight size={14}/>
                  </button>
                  {item.isEvent ? (
                    <Link to="/events" className="mark-read-button">
                      <CalendarDays size={14}/> View in calendar
                    </Link>
                  ) : (
                    <button className="mark-read-button" onClick={() => toggleRead(item)}>
                      {item.read ? 'Mark unread' : 'Mark as read'}
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
          {!feedLoading && !feedError && filtered.length === 0 && (
            <div className="simple-empty">
              <Search size={22}/>
              <strong>No updates found</strong>
              <span>Try another keyword or category filter.</span>
            </div>
          )}
        </div>
      </Panel>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title || 'Announcement'}
        description={selected ? `${selected.category} · ${formatDate(selected.date, {month:'long',day:'numeric',year:'numeric'})}` : ''}
        wide
        className="announcement-detail-modal"
      >
        <div className="announcement-detail">
          {selected?.image && (
            <div className="announcement-modal-cover">
              <img src={selected.image} alt={selected.title} className="announcement-modal-img" />
            </div>
          )}
          <p className="announcement-detail-lead">{selected?.description}</p>
          <p>{selected?.details || 'Official documentation will be available directly in your employee documents.'}</p>
          <div className="announcement-detail-footer">
            <span>HROrbit Verified Announcement</span>
            <Button variant="secondary" onClick={() => setSelected(null)}>Close</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
