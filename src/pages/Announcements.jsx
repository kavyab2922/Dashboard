import { useState } from 'react';
import { ArrowUpRight, Bookmark, CalendarDays, Megaphone, Pin, Search, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import EditableCollectionPage from '../components/common/EditableCollectionPage';
import { Panel, Tag, Button, Modal, PanelHeading } from '../components/common/UI';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/format';

export default function Announcements() {
  const { announcements, setAnnouncements, role, setToast } = useApp();
  const [manage, setManage] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filters = ['All', ...new Set(announcements.map((item) => item.category))];
  const filtered = announcements.filter((item) =>
    `${item.title} ${item.description} ${item.details}`.toLowerCase().includes(search.toLowerCase()) &&
    (category === 'All' || item.category === category)
  );

  const toggleRead = (id) => {
    setAnnouncements((items) => items.map((item) => item.id === id ? { ...item, read: !item.read } : item));
    setToast('Announcement state updated.');
  };

  if (manage) return (
    <>
      <EditableCollectionPage type="announcements" embedded/>
      <div className="back-to-feed">
        <Button variant="secondary" onClick={() => setManage(false)}>← Back to announcements feed</Button>
      </div>
    </>
  );

  return (
    <>
      <div className="announcement-feature">
        <div className="announcement-feature-text">
          <Tag tone="mint">IN THE LOOP</Tag>
          <h2>Stay connected to what matters.</h2>
          <p>
            Read key company announcements, save time on policy updates, and stay informed on high-impact team developments.
          </p>
          <div className="announcement-feature-meta">
            <span><Megaphone size={14}/> {announcements.length} updates</span>
            <span><CalendarDays size={14}/> Updated weekly</span>
          </div>
        </div>
      </div>

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
          {role === 'HR Admin' ? <Button onClick={() => setManage(true)}>Manage posts</Button> : <Button variant="secondary" onClick={() => setManage(true)}>Demo manage view</Button>}
        </div>

        <div className="announcement-feed">
          {filtered.map((item) => (
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
                  <button className="mark-read-button" onClick={() => toggleRead(item.id)}>
                    {item.read ? 'Mark unread' : 'Mark as read'}
                  </button>
                </div>
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
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
