import { ArrowRight, BellRing, CalendarDays, ChevronRight, GraduationCap, Megaphone, Sparkles, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/format';
import { Panel, PanelHeading } from '../common/UI';

export function DashboardMainGrid() {
  const { announcements, quickLinks } = useApp();
  const pinned = announcements.filter((item) => item.pinned).slice(0, 2);

  return (
    <div className="dashboard-grid">
      <Panel className="announcements-panel span-8">
        <PanelHeading
          title="Pinned announcements"
          subtitle="The latest verified updates from your workplace"
          action={<Link to="/announcements" className="panel-action">All updates <ArrowRight size={14}/></Link>}
        />
        {pinned.length ? (
          <div className="announcement-list">
            {pinned.map((item, index) => (
              <Link to="/announcements" className="announcement-item" key={item.id}>
                <span className={`announcement-symbol announcement-symbol-${index}`}>
                  <Megaphone size={18}/>
                </span>
                <span className="announcement-copy">
                  <span className="announcement-meta">
                    <span className="badge-chip">{item.category}</span>
                    <i>·</i>
                    <span>{formatDate(item.date)}</span>
                  </span>
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </span>
                <ChevronRight size={16} className="announcement-chevron"/>
              </Link>
            ))}
          </div>
        ) : (
          <p className="muted">No pinned announcements yet.</p>
        )}
        <div className="announcement-note">
          <BellRing size={14}/> Keep an eye out for updates that matter to your team.
        </div>
      </Panel>

      <Panel className="today-panel span-4">
        <PanelHeading
          title="Today for you"
          subtitle="Quick personal actions"
          action={<span className="today-spark"><Sparkles size={15}/></span>}
        />
        <div className="today-list">
          <Link to="/games" className="today-item">
            <span className="today-icon today-game"><Zap size={18}/></span>
            <span>
              <strong>Daily brain break</strong>
              <small>A fresh 3-minute puzzle awaits</small>
            </span>
            <ChevronRight size={15}/>
          </Link>
          <Link to="/learning" className="today-item">
            <span className="today-icon today-learning"><GraduationCap size={18}/></span>
            <span>
              <strong>Learn something new</strong>
              <small>Pick a path that sparks curiosity</small>
            </span>
            <ChevronRight size={15}/>
          </Link>
          <Link to="/community" className="today-item">
            <span className="today-icon today-community"><Users size={18}/></span>
            <span>
              <strong>Find your people</strong>
              <small>Explore teams and shared interests</small>
            </span>
            <ChevronRight size={15}/>
          </Link>
        </div>
      </Panel>
    </div>
  );
}
