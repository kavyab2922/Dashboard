import { ArrowUpRight, Award, CalendarDays, Heart, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const items = [
  {
    title: 'My achievements',
    value: '08',
    caption: '2 unlocked this quarter',
    icon: Award,
    tone: 'purple',
    to: '/recognition',
    badge: '+2 this month',
  },
  {
    title: 'Kudos received',
    value: '12',
    caption: 'Recent peer appreciation',
    icon: Heart,
    tone: 'rose',
    to: '/recognition',
    badge: '3 new',
  },
  {
    title: 'PTO & leave balance',
    value: '14.5',
    suffix: 'days',
    caption: 'Available annual vacation',
    icon: CalendarDays,
    tone: 'blue',
    to: '/quick-links',
    badge: 'Approved',
  },
];

export default function SummaryCards() {
  return (
    <div className="summary-grid">
      {items.map((item) => (
        <Link to={item.to} className="summary-card" key={item.title}>
          <div className="summary-card-top">
            <span className={`summary-icon tone-${item.tone}`}>
              <item.icon size={20} />
            </span>
            <span className={`summary-trend-pill tone-${item.tone}`}>
              <TrendingUp size={12} /> {item.badge}
            </span>
          </div>
          <div className="summary-value">
            {item.value}
            {item.suffix && <small>{item.suffix}</small>}
          </div>
          <h3>{item.title}</h3>
          <p>{item.caption}</p>
          <span className="summary-arrow">
            <ArrowUpRight size={16} />
          </span>
        </Link>
      ))}
    </div>
  );
}
