import { useEffect, useMemo, useState } from 'react';
import { MessageCircle, PartyPopper, RefreshCw, Sparkles, Sun } from 'lucide-react';
import { Avatar, Button, Panel, PanelHeading } from '../common/UI';
import { useApp } from '../../context/AppContext';
import { useLocation } from 'react-router-dom';
import { dataApi } from '../../services/api';
import MoodMessageComposer from './MoodMessageComposer';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'celebrating', label: 'Celebrating' },
  { id: 'support', label: 'Sending Support' },
];
const REACTIONS = ['🎉', '👏', '❤️', '✨', '🥳'];
const MOOD_META = {
  amazing: { emoji: '😄', label: 'Amazing' }, happy: { emoji: '😊', label: 'Happy' }, calm: { emoji: '😌', label: 'Calm' },
  okay: { emoji: '😐', label: 'Okay' }, sad: { emoji: '😔', label: 'Sad' }, stressed: { emoji: '😫', label: 'Stressed' },
};

export default function TeamMoodSection() {
  const [moods, setMoods] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [composerMood, setComposerMood] = useState(null);
  const [messages, setMessages] = useState([]);
  const [busyReaction, setBusyReaction] = useState('');
  const { setToast, refreshNotifications } = useApp();
  const location = useLocation();

  const loadMessages = async () => {
    try {
      const response = await dataApi.moods.messages();
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setToast(err.message || 'Unable to load moment messages.');
    }
  };

  const refresh = async () => {
    setLoading(true); setError('');
    try {
      const [moodResponse] = await Promise.all([dataApi.moods.team(), loadMessages()]);
      setMoods(Array.isArray(moodResponse.data) ? moodResponse.data : []);
    } catch (err) { setError(err.message || 'Unable to load shared team moods.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { refresh(); }, []);
  useEffect(() => {
    const targetId = new URLSearchParams(location.search).get('moment');
    if (!targetId || loading) return;
    document.getElementById(`moment-${targetId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [location.search, loading]);

  const visibleMoods = useMemo(() => moods.filter((item) => filter === 'all' || (filter === 'celebrating' ? item.isPositive : item.isSupport)), [moods, filter]);
  const react = async (moodId, reaction) => {
    const key = `${moodId}-${reaction}`; if (busyReaction) return;
    const current = moods.find((item) => item.id === moodId)?.reactions?.find((entry) => entry.reaction === reaction);
    const remove = Boolean(current?.reacted);
    setBusyReaction(key);
    try {
      await dataApi.moods.react(moodId, reaction, remove);
      setMoods((items) => items.map((item) => {
        if (item.id !== moodId) return item;
        const reactions = [...(item.reactions || [])];
        const existing = reactions.find((entry) => entry.reaction === reaction);
        if (existing) { existing.count = Math.max(0, existing.count + (remove ? -1 : 1)); existing.reacted = !remove; }
        else if (!remove) reactions.push({ reaction, count: 1, reacted: true });
        return { ...item, reactions: reactions.filter((entry) => entry.count > 0) };
      }));
      await refreshNotifications?.();
    } catch (err) { setToast(err.message || 'Unable to update reaction.'); }
    finally { setBusyReaction(''); }
  };

  return <Panel className="team-mood-panel">
    <PanelHeading title="Colleagues' Moments" subtitle="Only moments people chose to share are shown here." action={<button className="icon-button" type="button" aria-label="Refresh shared moods" onClick={refresh} disabled={loading}><RefreshCw size={16}/></button>}/>
    <div className="team-mood-toolbar" role="tablist" aria-label="Team mood filters">{FILTERS.map((item) => <button type="button" role="tab" aria-selected={filter === item.id} key={item.id} className={`team-mood-filter ${filter === item.id ? 'active' : ''}`} onClick={() => setFilter(item.id)}>{item.label}</button>)}</div>
    {loading ? <div className="team-mood-skeleton" aria-label="Loading shared moods"><span/><span/><span/></div> : error ? <div className="team-mood-empty"><p>{error}</p><Button variant="secondary" onClick={refresh}>Try again</Button></div> : visibleMoods.length === 0 ? <div className="team-mood-empty"><Sparkles size={23}/><strong>No shared moments yet</strong><p>When colleagues opt in, their moments will appear here.</p></div> : <div className="team-mood-grid">{visibleMoods.map((item) => {
      const meta = MOOD_META[item.mood] || MOOD_META.okay;
      const itemMessages = messages.filter((message) => message.moodId === String(item.id));
      return <article id={`moment-${item.id}`} className={`team-mood-card ${item.isPositive ? 'celebration-card' : 'support-card'}`} key={item.id}>
        {item.isPositive && <div className="mood-confetti" aria-hidden="true"><i/><i/><i/><i/><i/></div>}
        <div className="team-mood-card-header"><Avatar name={item.employee.name} initials={item.employee.initials} src={item.employee.avatar} color="mint"/><div><strong>{item.employee.name}</strong><small>{meta.emoji} Feeling {meta.label.toLowerCase()}</small></div></div>
        <p className="team-mood-message">{item.isPositive ? "Let's celebrate this moment!" : 'Sending a little care their way can make a difference.'}</p>
        {item.isPositive ? <div className="team-mood-actions"><Button size="small" onClick={() => setComposerMood(item)}><PartyPopper size={14}/> Celebrate</Button><button type="button" className="text-link" onClick={() => setComposerMood(item)}><MessageCircle size={14}/> Send a message</button></div> : <Button variant="secondary" size="small" onClick={() => setComposerMood(item)}><Sun size={14}/> Send some sunshine</Button>}
        <div className="mood-reactions" aria-label="React to this moment">{REACTIONS.map((reaction) => { const reactionData = item.reactions?.find((entry) => entry.reaction === reaction); return <button type="button" className={reactionData?.reacted ? 'reacted' : ''} key={reaction} disabled={Boolean(busyReaction)} aria-label={`${reactionData?.reacted ? 'Remove' : 'Send'} ${reaction} reaction`} onClick={() => react(item.id, reaction)}>{reaction}<small>{reactionData?.count || ''}</small></button>; })}</div>
        {itemMessages.length > 0 && <div className="team-mood-comments" aria-label="Messages for this moment">{itemMessages.map((message) => <div className="team-mood-comment" key={message.id}><Avatar name={message.sender} src={message.senderAvatar} color="violet"/><div><strong>{message.sender}</strong><p>{message.message}</p><time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleString()}</time></div></div>)}</div>}
      </article>;
    })}</div>}
    <MoodMessageComposer mood={composerMood} open={Boolean(composerMood)} onClose={() => setComposerMood(null)} onSent={async () => { await Promise.all([refresh(), refreshNotifications?.()]); }} setToast={setToast}/>
  </Panel>;
}
