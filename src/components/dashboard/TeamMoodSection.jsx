import { useEffect, useMemo, useRef, useState } from 'react';
import { Heart, MessageCircle, PartyPopper, RefreshCw, Sparkles, Sun } from 'lucide-react';
import { Avatar, Button, Panel, PanelHeading } from '../common/UI';
import { useApp } from '../../context/AppContext';
import { dataApi } from '../../services/api';
import MoodMessageComposer from './MoodMessageComposer';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'celebrating', label: 'Celebrating' },
  { id: 'support', label: 'Sending Support' },
];
const REACTIONS = ['🎉', '👏', '✨', '🥳'];
const MOOD_META = {
  amazing: { emoji: '😄', label: 'Amazing' }, happy: { emoji: '😊', label: 'Happy' }, calm: { emoji: '😌', label: 'Calm' },
  okay: { emoji: '😐', label: 'Okay' }, sad: { emoji: '😔', label: 'Sad' }, stressed: { emoji: '😫', label: 'Stressed' },
};

function formatTimestamp(value) {
  if (!value) return '';
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function TeamMoodSection() {
  const [moods, setMoods] = useState([]);
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState('');
  const [composerMood, setComposerMood] = useState(null);
  const [busyAction, setBusyAction] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const cardRefs = useRef(new Map());
  const { setToast } = useApp();

  const refresh = async () => {
    setLoading(true); setError('');
    try {
      const response = await dataApi.moods.team();
      setMoods(Array.isArray(response.data) ? response.data : []);
    } catch (err) { setError(err.message || 'Unable to load shared team moods.'); }
    finally { setLoading(false); }
  };

  const refreshMessages = async () => {
    setMessagesLoading(true);
    try {
      const response = await dataApi.moods.messages();
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (err) { setToast(err.message || 'Unable to load moment messages.'); }
    finally { setMessagesLoading(false); }
  };

  useEffect(() => { refresh(); refreshMessages(); }, []);

  useEffect(() => {
    const momentId = new URLSearchParams(window.location.search).get('moment');
    if (!momentId) return undefined;
    setExpandedComments((current) => ({ ...current, [momentId]: true }));
    const timer = window.setTimeout(() => cardRefs.current.get(momentId)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
    return () => window.clearTimeout(timer);
  }, [moods.length]);

  const visibleMoods = useMemo(() => moods.filter((item) => filter === 'all' || (filter === 'celebrating' ? item.isPositive : item.isSupport)), [moods, filter]);
  const messagesByMood = useMemo(() => messages.reduce((groups, message) => {
    groups[message.moodId] = [...(groups[message.moodId] || []), message];
    return groups;
  }, {}), [messages]);

  const react = async (moodId, reaction) => {
    if (busyAction) return;
    const key = `${moodId}-${reaction}`; setBusyAction(key);
    try {
      const response = await dataApi.moods.react(moodId, reaction);
      if (!response.data?.added) return;
      setMoods((items) => items.map((item) => {
        if (item.id !== moodId) return item;
        const reactions = [...(item.reactions || [])];
        const existing = reactions.find((entry) => entry.reaction === reaction);
        if (existing) existing.count += 1;
        else reactions.push({ reaction, count: 1 });
        return { ...item, reactions };
      }));
    } catch (err) { setToast(err.message || 'Unable to send reaction.'); }
    finally { setBusyAction(''); }
  };

  const toggleLike = async (item) => {
    if (busyAction) return;
    setBusyAction(`like-${item.id}`);
    try {
      const response = await dataApi.moods.toggleLike(item.id);
      const result = response.data || {};
      setMoods((items) => items.map((current) => current.id === item.id
        ? { ...current, likeCount: Number(result.likeCount ?? current.likeCount ?? 0), likedByViewer: Boolean(result.liked) }
        : current));
    } catch (err) { setToast(err.message || 'Unable to update like.'); }
    finally { setBusyAction(''); }
  };

  return <Panel className="team-mood-panel">
    <PanelHeading title="Colleagues' Moments" subtitle="Only moments people chose to share are shown here." action={<button className="icon-button" type="button" aria-label="Refresh shared moods" onClick={() => { refresh(); refreshMessages(); }} disabled={loading}><RefreshCw size={16}/></button>}/>
    <div className="team-mood-toolbar" role="tablist" aria-label="Team mood filters">{FILTERS.map((item) => <button type="button" role="tab" aria-selected={filter === item.id} key={item.id} className={`team-mood-filter ${filter === item.id ? 'active' : ''}`} onClick={() => setFilter(item.id)}>{item.label}</button>)}</div>
    {loading ? <div className="team-mood-skeleton" aria-label="Loading shared moods"><span/><span/><span/></div> : error ? <div className="team-mood-empty"><p>{error}</p><Button variant="secondary" onClick={refresh}>Try again</Button></div> : visibleMoods.length === 0 ? <div className="team-mood-empty"><Sparkles size={23}/><strong>No shared moments yet</strong><p>When colleagues opt in, their moments will appear here.</p></div> : <div className="team-mood-grid">{visibleMoods.map((item) => {
      const meta = MOOD_META[item.mood] || MOOD_META.okay;
      const itemMessages = messagesByMood[item.id] || [];
      const commentsOpen = Boolean(expandedComments[item.id]);
      return <article className={`team-mood-card ${item.isPositive ? 'celebration-card' : 'support-card'}`} key={item.id} id={`moment-${item.id}`} ref={(node) => { if (node) cardRefs.current.set(item.id, node); else cardRefs.current.delete(item.id); }}>
        {item.isPositive && <div className="mood-confetti" aria-hidden="true"><i/><i/><i/><i/><i/></div>}
        <div className="team-mood-card-header"><Avatar name={item.employee.name} initials={item.employee.initials} src={item.employee.avatar} color="mint"/><div><strong>{item.employee.name}</strong><small>{meta.emoji} Feeling {meta.label.toLowerCase()}</small></div></div>
        <p className="team-mood-message">{item.isPositive ? "Let's celebrate this moment!" : 'Sending a little care their way can make a difference.'}</p>
        <div className="team-mood-actions">
          {item.isPositive ? <Button size="small" onClick={() => setComposerMood(item)}><PartyPopper size={14}/> Celebrate</Button> : <Button variant="secondary" size="small" onClick={() => setComposerMood(item)}><Sun size={14}/> Send some sunshine</Button>}
          <button type="button" className="text-link" onClick={() => setExpandedComments((current) => ({ ...current, [item.id]: !commentsOpen }))}><MessageCircle size={14}/> {itemMessages.length ? `${itemMessages.length} messages` : 'Message'}</button>
        </div>
        <div className="mood-social-actions">
          <button type="button" className={`mood-like-button ${item.likedByViewer ? 'liked' : ''}`} disabled={Boolean(busyAction)} onClick={() => toggleLike(item)} aria-pressed={Boolean(item.likedByViewer)}><Heart size={15} fill={item.likedByViewer ? 'currentColor' : 'none'}/> {item.likeCount || 0} {item.likeCount === 1 ? 'Like' : 'Likes'}</button>
          <div className="mood-reactions" aria-label="Send a reaction">{REACTIONS.map((reaction) => <button type="button" key={reaction} disabled={Boolean(busyAction)} aria-label={`Send ${reaction} reaction`} onClick={() => react(item.id, reaction)}>{reaction}<small>{item.reactions?.find((entry) => entry.reaction === reaction)?.count || ''}</small></button>)}</div>
        </div>
        {commentsOpen && <div className="mood-comments" aria-label={`Messages for ${item.employee.name}`}>
          {messagesLoading ? <small className="muted">Loading messages…</small> : itemMessages.length === 0 ? <small className="muted">No messages yet.</small> : itemMessages.map((message) => <div className="mood-comment" key={message.id}><Avatar name={message.sender?.name} src={message.sender?.avatar} size="sm"/><div><strong>{message.sender?.name || 'A colleague'}</strong><p>{message.message}</p><time>{formatTimestamp(message.createdAt)}</time></div></div>)}
          <Button size="small" variant="secondary" onClick={() => setComposerMood(item)}><MessageCircle size={14}/> Add a message</Button>
        </div>}
      </article>;
    })}</div>}
    <MoodMessageComposer mood={composerMood} open={Boolean(composerMood)} onClose={() => setComposerMood(null)} onSent={() => { refresh(); refreshMessages(); }} setToast={setToast}/>
  </Panel>;
}
