import { useState } from 'react';
import { Award, Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageTitle, Button, Modal, FormField } from '../components/common/UI';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import EventsShowcase from '../components/dashboard/EventsShowcase';
import SummaryCards from '../components/dashboard/SummaryCards';
import { DashboardMainGrid } from '../components/dashboard/DashboardWidgets';
import { useApp } from '../context/AppContext';
import { currentEmployee, employees } from '../data/employees';

export default function Dashboard() {
  const { addKudos, kudos, announcements, events } = useApp();
  const [kudosOpen, setKudosOpen] = useState(false);
  const [recipient, setRecipient] = useState('e2');
  const [category, setCategory] = useState('Teamwork');
  const [message, setMessage] = useState('');
  const submitKudos = (event) => {
    event.preventDefault();
    const person = employees.find((item) => item.id === recipient);
    if (!person || message.trim().length < 5) return;
    addKudos({ from: currentEmployee.name, to: person.name, category, message: message.trim(), initials: currentEmployee.initials, color: currentEmployee.color });
    setMessage(''); setKudosOpen(false);
  };
  return <><PageTitle eyebrow="YOUR SPACE, YOUR PACE" title="Your dashboard" description="A thoughtful snapshot of what's happening around you." actions={<Link className="btn btn-secondary" to="/admin"><Sparkles size={15}/> Demo admin</Link>}/><WelcomeBanner onKudos={() => setKudosOpen(true)}/><div className="dashboard-top-row"><EventsShowcase/><SummaryCards/></div><DashboardMainGrid/><Modal open={kudosOpen} onClose={() => setKudosOpen(false)} title="Give someone Kudos" description="A few kind words can brighten someone's day."><form className="form-stack" onSubmit={submitKudos}><FormField label="Who are you celebrating?"><select value={recipient} onChange={(e) => setRecipient(e.target.value)}>{employees.filter((person) => person.id !== currentEmployee.id).map((person) => <option key={person.id} value={person.id}>{person.name} · {person.team}</option>)}</select></FormField><FormField label="Recognition theme"><select value={category} onChange={(e) => setCategory(e.target.value)}>{['Teamwork','Ownership','Customer focus','Curiosity','Kindness','Creative thinking'].map((item) => <option key={item}>{item}</option>)}</select></FormField><FormField label="Your message"><textarea required minLength={5} maxLength={400} rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell them what you appreciated..."/><small>{message.length}/400 characters</small></FormField><div className="modal-actions"><Button variant="secondary" type="button" onClick={() => setKudosOpen(false)}>Cancel</Button><Button type="submit"><Heart size={15}/> Send Kudos</Button></div></form></Modal></>;
}