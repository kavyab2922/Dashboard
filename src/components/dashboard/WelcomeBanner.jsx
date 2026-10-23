import { ArrowRight, CalendarDays, Gift, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getGreeting } from '../../utils/format';
import { useApp } from '../../context/AppContext';

export default function WelcomeBanner({ onKudos }) {
  const { currentEmployee, celebrations, dashboardSummary } = useApp();
  const today = new Date();
  const date = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }).format(today);

  return (
    <section className="welcome-banner">
      <div className="welcome-glow-orb glow-top-right" />
      <div className="welcome-glow-orb glow-bottom-left" />

      <div className="welcome-copy">
        <div className="welcome-date-badge">
          <span className="welcome-live-dot" />
          <span>{date}</span>
          <span className="date-separator">/</span>
          <span className="badge-orbit-label">WORKSPACE PORTAL</span>
        </div>

        <h2>
          {getGreeting()}, {currentEmployee.name.split(' ')[0]} <span className="greeting-sparkle">✦</span>
        </h2>
        <p>
          Welcome back to your employee hub. Catch up on announcements, recognize colleagues, and access everyday tools.
        </p>

        <div className="welcome-actions">
          <button className="btn btn-white" onClick={onKudos}>
            <Gift size={16} /> Send Kudos
          </button>
          <Link className="btn btn-glass" to="/recognition">
            View Recognition Feed <ArrowRight size={16} />
          </Link>
        </div>

        <div className="welcome-footnote">
          <Sparkles size={14} /> <span>Your team celebrated {dashboardSummary?.pulse?.winsCelebrated ?? 6} achievements this week.</span>
        </div>
      </div>

      <div className="welcome-side-widget">
        <div className="welcome-stat-card">
          <div className="welcome-card-header">
            <span className="welcome-card-icon"><Star size={18} /></span>
            <span className="welcome-card-label">TEAM SPOTLIGHT</span>
          </div>
          <strong>Every contribution counts.</strong>
          <p>Collaborate, grow, and shape what's next together.</p>
        </div>

        <div className="welcome-celebration-pill">
          <span className="mini-avatar-stack">
            <i className="avatar-chip">MN</i>
            <i className="avatar-chip">BK</i>
            <i className="avatar-chip">PM</i>
          </span>
          <div className="celebration-text">
            <strong>{celebrations.length} upcoming celebrations</strong>
            <small>Recognize milestones with your team</small>
          </div>
        </div>
      </div>
    </section>
  );
}
