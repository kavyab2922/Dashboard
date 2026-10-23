import { useMemo } from 'react';
import { ArrowRight, ArrowUpRight, Award, BellRing, BookOpen, CalendarDays, CheckCircle2, ChevronRight, CirclePlay, Flame, Gift, GraduationCap, Heart, Megaphone, MessageCircle, PartyPopper, Sparkles, Star, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { birthdays, currentEmployee } from '../../data/employees';
import { formatDate } from '../../utils/format';
import { Avatar, Panel, PanelHeading, Tag } from '../common/UI';

export function DashboardMainGrid() {
  const { announcements, events, kudos, quickLinks, courses, savedCourses } = useApp();
  const pinned = announcements.filter((item) => item.pinned).slice(0, 2);
  const upcoming = [...events].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  const upcomingCourse = courses.find((course) => !savedCourses.includes(course.id)) || courses[0];

  return (
    <div className="dashboard-grid">
      {/* Row 1: Pinned Announcements (8 cols) + Today for you (4 cols) */}
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

      {/* Row 2: Daily Game Feature (7 cols) + Team Pulse (5 cols) */}
      <Panel className="game-feature-panel span-7">
        <div className="game-feature-copy">
          <Tag tone="mint">DAILY BRAIN RESET</Tag>
          <h2>Give your brain a little <em>playtime.</em></h2>
          <p>A fresh puzzle is ready for today. Step away for 3 minutes, clear your head, and return recharged.</p>
          <div className="game-feature-bottom-row">
            <Link to="/games" className="btn btn-primary">
              Play today's game <ArrowRight size={15}/>
            </Link>
            <div className="game-streak">
              <Flame size={15}/> <span>Streak: <strong>1 day</strong></span>
            </div>
          </div>
        </div>
        <div className="game-feature-art">
          <div className="game-art-grid">
            <span className="grid-cell-tile active">✦</span>
            <span className="grid-cell-tile">●</span>
            <span className="grid-cell-tile">◆</span>
            <span className="grid-cell-tile">▲</span>
            <span className="grid-cell-tile active">★</span>
            <span className="grid-cell-tile">■</span>
          </div>
          <div className="game-floating-chip chip-top"><Sparkles size={14}/></div>
          <div className="game-floating-chip chip-bottom"><span>3</span><small>MIN</small></div>
        </div>
      </Panel>

      <Panel className="team-pulse-panel span-5">
        <PanelHeading
          title="Team pulse"
          subtitle="Real-time workplace vibes"
          action={<span className="pulse-live"><i/> LIVE</span>}
        />
        <div className="pulse-stat-row">
          <div className="pulse-stat">
            <div className="pulse-number">24<span>/30</span></div>
            <p>Team members active</p>
            <div className="pulse-meter"><i style={{width:'80%'}}/></div>
          </div>
          <div className="pulse-stat">
            <div className="pulse-number">06</div>
            <p>Wins celebrated</p>
            <div className="pulse-meter meter-purple"><i style={{width:'62%'}}/></div>
          </div>
        </div>
        <div className="pulse-footer">
          <span className="mini-avatar-stack">
            <i className="avatar-chip">BK</i>
            <i className="avatar-chip">PM</i>
            <i className="avatar-chip">MN</i>
            <i className="avatar-chip extra">+4</i>
          </span>
          <span>Good things happen together.</span>
          <Heart size={15} className="pulse-heart"/>
        </div>
      </Panel>

      {/* Row 3: Growth Recommendation (7 cols) + Upcoming Events (5 cols) */}
      <Panel className="course-feature-panel span-7">
        <PanelHeading
          title="Picked for your growth"
          subtitle="Recommended learning pathway"
          action={<Link to="/learning" className="panel-action">Explore hub <ArrowRight size={14}/></Link>}
        />
        <div className="course-feature-body">
          {upcomingCourse.image ? (
            <div className="course-feature-thumb">
              <img src={upcomingCourse.image} alt={upcomingCourse.title} className="course-feature-img" loading="lazy" />
            </div>
          ) : (
            <div className="course-feature-logo">
              <BookOpen size={24}/>
              <span>LEARN</span>
            </div>
          )}
          <div className="course-feature-info">
            <div className="course-meta-tags">
              <Tag tone="blue">{upcomingCourse.level}</Tag>
              <span className="course-provider-tag">{upcomingCourse.provider}</span>
            </div>
            <h3>{upcomingCourse.title}</h3>
            <p>{upcomingCourse.description}</p>
            <div className="course-feature-meta">
              <span><GraduationCap size={13}/> {upcomingCourse.provider}</span>
              <span>{upcomingCourse.access}</span>
            </div>
          </div>
        </div>
        <Link to="/learning" className="course-explore-link">
          Explore your full learning list <ArrowRight size={14}/>
        </Link>
      </Panel>

      <Panel className="upcoming-panel span-5">
        <PanelHeading
          title="Coming up"
          subtitle="Scheduled events & gatherings"
          action={<Link to="/events" className="panel-action">Calendar <ArrowRight size={14}/></Link>}
        />
        {upcoming.length ? (
          <div className="upcoming-list">
            {upcoming.map((event) => (
              <Link to="/events" className="upcoming-item" key={event.id}>
                <div className={`event-date-tile event-${event.color || 'mint'}`}>
                  <strong>{new Date(`${event.date}T12:00:00`).getDate()}</strong>
                  <span>{new Date(`${event.date}T12:00:00`).toLocaleDateString('en', {month:'short'}).toUpperCase()}</span>
                </div>
                <div className="upcoming-event-copy">
                  <strong>{event.title}</strong>
                  <small><CalendarDays size={12}/> {event.time} <span>·</span> {event.category}</small>
                </div>
                <ArrowUpRight size={15}/>
              </Link>
            ))}
          </div>
        ) : (
          <p className="muted">No events scheduled yet.</p>
        )}
      </Panel>

      {/* Row 4: Recent Kudos (6 cols) + Quick Links (6 cols) */}
      <Panel className="kudos-panel span-6">
        <PanelHeading
          title="Recent kudos"
          subtitle="Peer-to-peer appreciation wall"
          action={<Link to="/recognition" className="panel-action">See feed <ArrowRight size={14}/></Link>}
        />
        <div className="kudos-list">
          {kudos.slice(0, 2).map((item) => (
            <div className="kudos-item" key={item.id}>
              <Avatar name={item.from} initials={item.initials} color={item.color}/>
              <div className="kudos-content-wrap">
                <div className="kudos-byline">
                  <strong>{item.from}</strong>
                  <span className="kudos-arrow">→</span>
                  <b>{item.to}</b>
                </div>
                <p>{item.message}</p>
                <div className="kudos-meta">
                  <span className="kudos-heart"><Heart size={12} fill="currentColor"/> {item.category}</span>
                  <span>{formatDate(item.date)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="quicklinks-panel span-6">
        <PanelHeading
          title="Quick links"
          subtitle="Everyday workspace essentials"
          action={<Link to="/quick-links" className="panel-action">All links <ArrowRight size={14}/></Link>}
        />
        <div className="quicklink-grid">
          {quickLinks.slice(0, 4).map((item, index) => {
            const icons = [CirclePlay, CalendarDays, Gift, BookOpen];
            const Icon = icons[index % icons.length];
            return (
              <Link to={item.url.startsWith('/') ? item.url : '/quick-links'} className="quicklink-mini" key={item.id}>
                <span className={`quicklink-mini-icon quicklink-tone-${index}`}>
                  <Icon size={17}/>
                </span>
                <div className="quicklink-info">
                  <strong>{item.title}</strong>
                  <small>{item.placeholder ? 'Portal shortcut' : item.description}</small>
                </div>
              </Link>
            );
          })}
        </div>
      </Panel>

      {/* Row 5: Featured Achievements (6 cols) + People to Celebrate (6 cols) */}
      <Panel className="achievements-panel span-6">
        <PanelHeading
          title="Featured achievements"
          subtitle="Milestones & unlocked badges"
          action={<Link to="/recognition" className="panel-action">View all <ArrowRight size={14}/></Link>}
        />
        <div className="featured-achievement">
          <div className="achievement-art achievement-art-purple">
            <div className="achievement-orbit"/>
            <div className="achievement-medal"><Award size={28}/></div>
          </div>
          <div className="achievement-copy">
            <Tag tone="purple">MILESTONE UNLOCKED</Tag>
            <h3>Curiosity in action</h3>
            <p>You completed a core learning track and demonstrated cross-functional initiative.</p>
            <div className="achievement-footer">
              <span><Star size={13} fill="currentColor"/> Learning Explorer</span>
              <span>Oct 12</span>
            </div>
          </div>
        </div>
        <div className="achievement-mini-row">
          <div className="mini-achievement-icon"><Sparkles size={16}/></div>
          <div>
            <strong>Team Player of the Month</strong>
            <small>Recognized for cross-team technical collaboration</small>
          </div>
          <span className="achievement-date">Sep 28</span>
        </div>
      </Panel>

      <Panel className="celebrations-panel span-6">
        <PanelHeading
          title="People to celebrate"
          subtitle="Birthdays & anniversaries this week"
          action={<Link to="/community" className="panel-action">Community <ArrowRight size={14}/></Link>}
        />
        <div className="celebration-list">
          {birthdays.slice(0, 3).map((person, index) => (
            <div className="celebration-item" key={person.id}>
              <Avatar name={person.name} initials={person.initials} color={person.color}/>
              <div className="celebration-info">
                <strong>{person.name}</strong>
                <small>{person.dateLabel}</small>
              </div>
              <span className="celebration-action">
                {index === 0 ? <Gift size={16}/> : <PartyPopper size={16}/>}
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
