import { ArrowUpRight, Award, Heart, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SummaryCards({ summary, loading, error }) {
  const achievements = summary?.achievements;
  const kudosReceived = summary?.kudosReceived;

  const items = [
    {
      title: 'My achievements',
      value: achievements?.value ?? null,
      caption: error ? 'Unable to load summary' : (achievements?.caption || 'No achievement records'),
      icon: Award,
      tone: 'purple',
      to: '/recognition',
      badge: achievements?.badge || null,
    },
    {
      title: 'Kudos received',
      value: kudosReceived?.value ?? null,
      caption: error ? 'Unable to load summary' : (kudosReceived?.caption || 'No kudos recorded yet'),
      icon: Heart,
      tone: 'rose',
      to: '/recognition',
      badge: kudosReceived?.badge || null,
    },
  ];

  return (
    <div className="summary-grid">
      {items.map((item) => (
        <Link to={item.to} className="summary-card" key={item.title}>
          <div className="summary-card-top">
            <span className={`summary-icon tone-${item.tone}`}>
              <item.icon size={20} />
            </span>
            {item.badge && (
              <span className={`summary-trend-pill tone-${item.tone}`}>
                <TrendingUp size={12} /> {item.badge}
              </span>
            )}
          </div>
          <div className="summary-value">
            {loading ? '…' : (item.value ?? '—')}
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
