import { useEffect, useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageTitle, Button, Modal, FormField } from '../components/common/UI';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import EventsShowcase from '../components/dashboard/EventsShowcase';
import SummaryCards from '../components/dashboard/SummaryCards';
import { DashboardMainGrid } from '../components/dashboard/DashboardWidgets';
import { useApp } from '../context/AppContext';
import { dataApi } from '../services/api';

export default function Dashboard() {
  const { addKudos, user, employees, employeesState, setToast } = useApp();
  const [kudosOpen, setKudosOpen] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [category, setCategory] = useState('Teamwork');
  const [message, setMessage] = useState('');

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setSummaryLoading(true);
    dataApi.dashboard.summary()
      .then((response) => { if (!cancelled) { setSummary(response.data || null); setSummaryError(''); } })
      .catch((err) => { if (!cancelled) setSummaryError(err.message || 'Unable to load dashboard summary.'); })
      .finally(() => { if (!cancelled) setSummaryLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const colleagues = employees.filter((person) => !user?.id || String(person.id) !== String(user.id));

  useEffect(() => {
    if (!recipient && colleagues.length > 0) setRecipient(colleagues[0].id);
  }, [colleagues, recipient]);

  const submitKudos = async (event) => {
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
      setKudosOpen(false);
    } catch (err) {
      setToast(err.message || 'Unable to send kudos.');
    }
  };

  return <><PageTitle eyebrow="YOUR SPACE, YOUR PACE" title="Your dashboard" description="A thoughtful snapshot of what's happening around you." actions={<Link className="btn btn-secondary" to="/admin"><Sparkles size={15}/> Demo admin</Link>}/><WelcomeBanner onKudos={() => setKudosOpen(true)}/><div className="dashboard-top-row"><EventsShowcase/><SummaryCards summary={summary} loading={summaryLoading} error={summaryError}/></div><DashboardMainGrid summary={summary} summaryLoading={summaryLoading} summaryError={summaryError}/><Modal open={kudosOpen} onClose={() => setKudosOpen(false)} title="Give someone Kudos" description="A few kind words can brighten someone's day."><form className="form-stack" onSubmit={submitKudos}><FormField label="Who are you celebrating?">{employeesState.loading ? <p className="muted">Loading colleagues…</p> : colleagues.length === 0 ? <p className="muted">No colleagues available yet.</p> : <select value={recipient} onChange={(e) => setRecipient(e.target.value)}>{colleagues.map((person) => <option key={person.id} value={person.id}>{person.name}{person.team ? ` · ${person.team}` : ''}</option>)}</select>}</FormField><FormField label="Recognition theme"><select value={category} onChange={(e) => setCategory(e.target.value)}>{['Teamwork','Ownership','Customer focus','Curiosity','Kindness','Creative thinking'].map((item) => <option key={item}>{item}</option>)}</select></FormField><FormField label="Your message"><textarea required minLength={5} maxLength={400} rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell them what you appreciated..."/><small>{message.length}/400 characters</small></FormField><div className="modal-actions"><Button variant="secondary" type="button" onClick={() => setKudosOpen(false)}>Cancel</Button><Button type="submit" disabled={employeesState.loading || colleagues.length === 0}><Heart size={15}/> Send Kudos</Button></div></form></Modal></>;
}
