import { ArrowRight, CalendarDays, Gift, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getGreeting } from '../../utils/format';
import { useApp } from '../../context/AppContext';

export default function WelcomeBanner({ onKudos }) {
  const { user, celebrations, celebrationsState, kudos } = useApp();
  const today = new Date();
  const date = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }).format(today);

  const firstName = (user?.name || 'Employee').split(' ')[0];
  const upcomingCelebrations = celebrations.length;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyKudos = kudos.filter((item) => item.date && new Date(`${item.date}T12:00:00`) >= weekAgo).length;

  const chipInitials = celebrations.slice(0, 3).map((person) => person.initials);

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
          {getGreeting()}, {firstName} <span className="greeting-sparkle">✦</span>
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
          <Sparkles size={14} /> <span>
            {weeklyKudos > 0
              ? `Your team celebrated ${weeklyKudos} ${weeklyKudos === 1 ? 'win' : 'wins'} of appreciation this week.`
              : 'No kudos recorded this week yet — be the first to recognize someone.'}
          </span>
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
          {chipInitials.length > 0 && (
            <span className="mini-avatar-stack">
              {chipInitials.map((initials, index) => (
                <i className="avatar-chip" key={`${initials}-${index}`}>{initials}</i>
              ))}
            </span>
          )}
          <div className="celebration-text">
            <strong>
              {celebrationsState.loading
                ? 'Loading celebrations…'
                : celebrationsState.error
                  ? 'Celebrations unavailable'
                  : `${upcomingCelebrations} upcoming celebration${upcomingCelebrations === 1 ? '' : 's'}`}
            </strong>
            <small>{celebrationsState.error ? 'Unable to load from the server' : 'Recognize milestones with your team'}</small>
          </div>
        </div>
      </div>
    </section>
  );
}
