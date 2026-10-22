import { ArrowUpRight, Award, CalendarDays, Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const items = [
  { title: 'My achievements', value: '08', caption: '2 added this quarter', icon: Award, tone: 'purple', to: '/recognition', trend: '+2' },
  { title: 'Kudos received', value: '12', caption: 'You make a difference', icon: Heart, tone: 'rose', to: '/recognition', trend: '+3' },
  { title: 'My leave balance', value: '14.5', suffix: 'days', caption: 'Demo balance · not live', icon: CalendarDays, tone: 'blue', to: '/quick-links', trend: null },
];

export default function SummaryCards() {
  return <div className="summary-grid">{items.map((item) => <Link to={item.to} className="summary-card" key={item.title}><div className="summary-card-top"><span className={`summary-icon tone-${item.tone}`}><item.icon size={19} /></span>{item.trend ? <span className="summary-trend"><Sparkles size={12} /> {item.trend}</span> : <span className="summary-chip">DEMO</span>}</div><div className="summary-value">{item.value}<small>{item.suffix}</small></div><h3>{item.title}</h3><p>{item.caption}</p><span className="summary-arrow"><ArrowUpRight size={15} /></span></Link>)}</div>;
}