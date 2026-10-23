import { ArrowUpRight, Award, Heart, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function StatsColumn() {
  const { dashboardSummary } = useApp();

  const items = [
    {
      title: 'My achievements',
      value: dashboardSummary?.achievements?.value || '08',
      caption: dashboardSummary?.achievements?.caption || '2 unlocked this quarter',
      icon: Award,
      tone: 'purple',
      to: '/recognition',
      badge: dashboardSummary?.achievements?.badge || '+2 this month',
    },
    {
      title: 'Kudos received',
      value: dashboardSummary?.kudosReceived?.value || '01',
      caption: dashboardSummary?.kudosReceived?.caption || 'Recent peer appreciation',
      icon: Heart,
      tone: 'rose',
      to: '/recognition',
      badge: dashboardSummary?.kudosReceived?.badge || '1 new',
    },
  ];

  return (
    <div className="stats-column">
      {items.map((item) => (
        <Link to={item.to} className="stats-card" key={item.title}>
          <div className="stats-card-top">
            <span className={`stats-icon tone-${item.tone}`}>
              <item.icon size={22} />
            </span>
            <span className={`stats-trend tone-${item.tone}`}>
              <TrendingUp size={12} /> {item.badge}
            </span>
          </div>
          <div className="stats-value">{item.value}</div>
          <h3>{item.title}</h3>
          <p>{item.caption}</p>
          <span className="stats-arrow"><ArrowUpRight size={18}/></span>
        </Link>
      ))}
    </div>
  );
}
