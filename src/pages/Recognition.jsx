import { useEffect, useState } from 'react';
import { Award, Gift, Heart, MessageCircle, Send, Sparkles, Star, Trophy, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Avatar, Button, FormField, Modal, PageTitle, Panel, PanelHeading, Tag } from '../components/common/UI';
import { formatDate } from '../utils/format';

export default function Recognition() {
  const { kudos, kudosState, addKudos, user, employees, employeesState, setToast } = useApp();
  const [open, setOpen] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [category, setCategory] = useState('Teamwork');
  const [message, setMessage] = useState('');

  const colleagues = employees.filter((person) => !user?.id || String(person.id) !== String(user.id));

  useEffect(() => {
    if (!recipient && colleagues.length > 0) setRecipient(colleagues[0].id);
  }, [colleagues, recipient]);

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const kudosThisMonth = kudos.filter((item) => item.date && item.date.startsWith(thisMonth)).length;
  const peopleCelebrated = new Set(kudos.map((item) => item.to).filter(Boolean)).size;

  const submit = async (event) => {
    event.preventDefault();
    const person = colleagues.find((item) => item.id === recipient);
    if (!person || message.trim().length < 5) return;
    try {
      await addKudos({
        from: user?.name || 'Employee',
        to: person.name,
        category,
        message: message.trim(),
        initials: user?.initials,
        color: user?.color || 'blue',
      });
      setToast('Kudos sent. Thank you for the appreciation!');
      setMessage('');
      setOpen(false);
    } catch (err) {
      setToast(err.message || 'Unable to send kudos.');
    }
  };

  return <><PageTitle eyebrow="NOTICE THE GOOD, SHARE THE GOOD" title="Kudos & recognition" description="A space to celebrate effort, care and the wins we create together." actions={<Button onClick={() => setOpen(true)}><Heart size={15}/> Give Kudos</Button>}/><div className="recognition-hero"><div className="recognition-hero-copy"><Tag tone="rose">A LITTLE APPRECIATION GOES A LONG WAY</Tag><h2>Celebrate the people who make work better.</h2><p>Give a teammate a shout-out and add a little appreciation to their day.</p><Button variant="white" onClick={() => setOpen(true)}><Gift size={16}/> Send appreciation</Button></div><div className="recognition-hero-art"><div className="recognition-medal medal-a"><Award size={24}/></div><div className="recognition-medal medal-b"><Heart size={22} fill="currentColor"/></div><div className="recognition-medal medal-c"><Star size={21} fill="currentColor"/></div><div className="recognition-art-orbit"/><span>✦</span></div></div><div className="recognition-summary-grid"><Panel><span className="recognition-summary-icon icon-rose"><Heart size={18}/></span><strong>{kudosState.loading ? '…' : kudosThisMonth}</strong><p>Kudos shared this month <small>From the recognition feed</small></p></Panel><Panel><span className="recognition-summary-icon icon-purple"><Trophy size={18}/></span><strong>—</strong><p>Achievements unlocked <small>Not tracked in the database</small></p></Panel><Panel><span className="recognition-summary-icon icon-blue"><Users size={18}/></span><strong>{kudosState.loading ? '…' : peopleCelebrated}</strong><p>People celebrated <small>In this feed</small></p></Panel></div><div className="recognition-content-grid"><Panel className="recognition-feed-panel"><PanelHeading title="Appreciation feed" subtitle="Good things are worth sharing" action={<Tag tone="mint">{kudos.length} kudos</Tag>}/>{kudosState.loading ? <p className="muted" style={{padding:'1.5rem'}}>Loading kudos feed…</p> : kudosState.error ? <div className="simple-empty"><strong>Unable to load the kudos feed</strong><span>{kudosState.error}</span></div> : <div className="recognition-feed">{kudos.map((item) => <article className="recognition-post" key={item.id}><div className="recognition-post-head"><Avatar name={item.from} initials={item.initials} color={item.color}/><div><strong>{item.from}</strong><small>recognized <b>{item.to}</b></small></div><span>{formatDate(item.date)}</span></div><div className="recognition-message"><span className="recognition-quote">“</span><p>{item.message}</p></div><div className="recognition-post-footer"><Tag tone="rose"><Heart size={12} fill="currentColor"/> {item.category}</Tag><span><MessageCircle size={14}/> Shared appreciation</span></div></article>)}</div>}</Panel><Panel className="recognition-aside"><div className="recognition-aside-illustration"><span><Sparkles size={23}/></span><i>✦</i><b>✧</b></div><h3>Good work deserves to be seen.</h3><p>Specific, thoughtful appreciation helps people understand the difference they made.</p><div className="kudos-prompt"><strong>Try a kudos prompt</strong><p>“I appreciated how you… It helped because…”</p><button onClick={() => setOpen(true)}>Write a kudos <Send size={14}/></button></div><div className="demo-content-note">Peer recognition feed · stored in the company database</div></Panel></div><Modal open={open} onClose={() => setOpen(false)} title="Give someone Kudos" description="Tell them what made a difference."><form className="form-stack" onSubmit={submit}><FormField label="Celebrate a teammate">{employeesState.loading ? <p className="muted">Loading colleagues…</p> : colleagues.length === 0 ? <p className="muted">No colleagues available yet.</p> : <select value={recipient} onChange={(e)=>setRecipient(e.target.value)}>{colleagues.map((person)=><option key={person.id} value={person.id}>{person.name}{person.team ? ` · ${person.team}` : ''}</option>)}</select>}</FormField><FormField label="Recognition theme"><select value={category} onChange={(e)=>setCategory(e.target.value)}>{['Teamwork','Ownership','Customer focus','Curiosity','Kindness','Creative thinking'].map((item)=><option key={item}>{item}</option>)}</select></FormField><FormField label="Your message"><textarea value={message} onChange={(e)=>setMessage(e.target.value)} required minLength={5} maxLength={400} rows={4} placeholder="What did they do that mattered?"/></FormField><div className="modal-actions"><Button type="button" variant="secondary" onClick={()=>setOpen(false)}>Cancel</Button><Button type="submit" disabled={employeesState.loading || colleagues.length === 0}><Send size={15}/> Send Kudos</Button></div></form></Modal></>;
}
