import { CalendarDays, Heart, Quote } from 'lucide-react';
import { resolveAssetUrl } from '../../services/api';
import { formatDate } from '../../utils/format';
import { Avatar, Tag } from '../common/UI';

export default function KudosCard({ item }) {
  const recipientMeta = [item.toRole, item.toTeam].filter(Boolean).join(' · ');

  return (
    <article className="kudos-card">
      <header className="kudos-card-head">
        <Avatar
          name={item.to}
          initials={item.toInitials}
          color={item.color}
          size="xl"
          src={resolveAssetUrl(item.toAvatar)}
        />
        <div className="kudos-card-person">
          <strong>{item.to}</strong>
          {recipientMeta && <small>{recipientMeta}</small>}
        </div>
        <time className="kudos-card-date" dateTime={item.date || undefined}>
          <CalendarDays size={14} />
          {formatDate(item.date, { month: 'short', day: 'numeric', year: 'numeric' })}
        </time>
      </header>

      <div className="kudos-card-message">
        <Quote size={22} aria-hidden="true" />
        <p>{item.message}</p>
      </div>

      <footer className="kudos-card-footer">
        <Tag tone="rose"><Heart size={12} fill="currentColor" /> {item.category}</Tag>
        <span className="kudos-card-sender">From <strong>{item.from}</strong></span>
      </footer>
    </article>
  );
}
