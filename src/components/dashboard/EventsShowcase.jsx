import { useState, useEffect } from 'react';
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/format';

export default function EventsShowcase() {
  const { events, eventsState } = useApp();
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (sorted.length === 0) return undefined;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % sorted.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [sorted.length]);

  if (sorted.length === 0) {
    return (
      <div className="events-showcase empty">
        <div className="events-showcase-head">
          <div className="events-showcase-title">
            <span className="events-showcase-icon"><CalendarDays size={22}/></span>
            <div>
              <h2>Upcoming & Recent Events</h2>
              <p>Celebrating moments, milestones and togetherness</p>
            </div>
          </div>
          <Link to="/events" className="btn btn-primary btn-sm">View all events <ArrowRight size={14}/></Link>
        </div>
        <div className="events-showcase-empty">
          {eventsState.loading ? 'Loading events…' : eventsState.error ? `Unable to load events: ${eventsState.error}` : 'No events scheduled yet.'}
        </div>
      </div>
    );
  }

  const featured = sorted[active];

  return (
    <div className="events-showcase">
      <div className="events-showcase-head">
        <div className="events-showcase-title">
          <span className="events-showcase-icon"><CalendarDays size={22}/></span>
          <div>
            <h2>Upcoming & Recent Events</h2>
            <p>Celebrating moments, milestones and togetherness</p>
          </div>
        </div>
        <Link to="/events" className="events-showcase-cta">
          View all events <ArrowRight size={14}/>
        </Link>
      </div>

      <div className="events-showcase-body">
        <button
          className="events-carousel-arrow events-carousel-prev"
          onClick={() => setActive((prev) => (prev - 1 + sorted.length) % sorted.length)}
          aria-label="Previous event"
        >
          <ChevronLeft size={22}/>
        </button>

        <div className="events-featured-card">
          <div className="events-featured-media">
            {featured.image ? (
              <img src={featured.image} alt={featured.title} className="events-featured-img" loading="lazy" />
            ) : (
              <div className="events-featured-img" aria-hidden="true" />
            )}
            <div className="events-featured-overlay" />
            <span className="events-featured-date">
              <CalendarDays size={13}/> {formatDate(featured.date, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div className="events-featured-content">
            <h3>{featured.title}</h3>
            <p>{featured.description}</p>
            <div className="events-featured-meta">
              {featured.venue && <span><MapPin size={14}/> {featured.venue}</span>}
            </div>
            <Link to={`/events`} className="events-featured-cta">
              View Photos <ArrowRight size={14}/>
            </Link>
          </div>
        </div>

        <button
          className="events-carousel-arrow events-carousel-next"
          onClick={() => setActive((prev) => (prev + 1) % sorted.length)}
          aria-label="Next event"
        >
          <ChevronRight size={22}/>
        </button>
      </div>

    </div>
  );
}
