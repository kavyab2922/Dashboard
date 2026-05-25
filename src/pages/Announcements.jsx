import { useState, useEffect } from 'react';
import { Megaphone, Heart, Pin, Eye, Filter, Plus, X } from 'lucide-react';
import Avatar from '../components/common/Avatar';
import PageLoader from '../components/common/PageLoader';

const authorPhotos = {
  MN: 'https://randomuser.me/api/portraits/women/33.jpg',
  AT: 'https://randomuser.me/api/portraits/men/75.jpg',
  CE: 'https://randomuser.me/api/portraits/men/68.jpg',
  HL: 'https://randomuser.me/api/portraits/women/62.jpg',
  IT: 'https://randomuser.me/api/portraits/men/45.jpg',
};
import { announcementsAPI } from '../services/api';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

function PriorityBadge({ priority }) {
  const styles = {
    high: 'bg-red-500/15 text-red-400 border-red-500/20',
    medium: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  };
  return (
    <span className={`badge border text-xs ${styles[priority] || styles.low}`}>
      {priority}
    </span>
  );
}

function AnnouncementCard({ announcement, onLike }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(announcement.likes);
  const [expanded, setExpanded] = useState(false);

  const handleLike = async () => {
    if (liked) return;
    try {
      const res = await announcementsAPI.like(announcement.id);
      setLikes(res.likes);
      setLiked(true);
    } catch {
      toast.error('Failed to like');
    }
  };

  return (
    <div className={`glass-card hover:border-white/15 transition-all duration-300 overflow-hidden ${
      announcement.pinned ? 'ring-1 ring-primary-500/25' : ''
    }`}>
      {announcement.pinned && (
        <div className="flex items-center gap-2 px-5 py-2 bg-primary-500/8 border-b border-primary-500/15">
          <Pin size={12} className="text-primary-400" />
          <span className="text-primary-400 text-xs font-semibold tracking-wide">Pinned</span>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <Avatar
              photo={authorPhotos[announcement.authorAvatar]}
              initials={announcement.authorAvatar}
              color={announcement.authorColor}
              size="md"
              shape="circle"
            />
            <div>
              <p className="text-white/80 text-sm font-medium">{announcement.author}</p>
              <p className="text-white/40 text-xs">{announcement.authorRole}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <PriorityBadge priority={announcement.priority} />
            <span
              className="badge text-xs"
              style={{
                background: `${announcement.categoryColor}15`,
                color: announcement.categoryColor,
                border: `1px solid ${announcement.categoryColor}25`
              }}
            >
              {announcement.category}
            </span>
          </div>
        </div>

        <h3 className="text-white font-semibold text-base mb-2 leading-snug">{announcement.title}</h3>

        <p className={`text-white/55 text-sm leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
          {announcement.content}
        </p>

        {announcement.content.length > 600 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-primary-400 text-sm hover:text-primary-300 mt-2 transition-colors"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}

        {announcement.tags && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {announcement.tags.map(tag => (
              <span key={tag} className="text-xs text-white/30 bg-white/4 px-2 py-0.5 rounded-full border border-white/5">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-3 text-white/30 text-xs">
            <span className="flex items-center gap-1">
              <Eye size={13} /> {announcement.views}
            </span>
            <span>{formatDistanceToNow(parseISO(announcement.date), { addSuffix: true })}</span>
          </div>
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all ${
              liked
                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/20'
                : 'bg-white/5 text-white/40 hover:text-pink-400 hover:bg-pink-500/10 border border-white/5'
            }`}
          >
            <Heart size={14} className={liked ? 'fill-current' : ''} />
            <span>{likes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activePriority, setActivePriority] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCategory !== 'all') params.category = activeCategory;
      if (activePriority !== 'all') params.priority = activePriority;

      const [data, cats] = await Promise.all([
        announcementsAPI.getAll(params),
        announcementsAPI.getCategories(),
      ]);
      setAnnouncements(data);
      setCategories(['all', ...cats]);
    } catch {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [activeCategory, activePriority]);

  const pinned = announcements.filter(a => a.pinned);
  const regular = announcements.filter(a => !a.pinned);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Megaphone size={24} className="text-blue-400" />
            Announcements
          </h1>
          <p className="text-white/40 text-sm mt-1">{announcements.length} updates from HR & leadership</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Filter size={16} className="text-white/30" />
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all capitalize ${
                activeCategory === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10 border border-white/5'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'high', 'medium', 'low'].map(p => (
            <button
              key={p}
              onClick={() => setActivePriority(p)}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-all ${
                activePriority === p
                  ? 'bg-primary-600/80 text-white'
                  : 'bg-white/5 text-white/40 hover:text-white/70 border border-white/5'
              }`}
            >
              {p === 'all' ? 'All Priority' : p}
            </button>
          ))}
        </div>
      </div>

      <PageLoader loading={loading}>
        <div className="space-y-6">
          {pinned.length > 0 && (
            <div>
              <h2 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                <Pin size={12} /> Pinned
              </h2>
              <div className="space-y-4">
                {pinned.map(ann => <AnnouncementCard key={ann.id} announcement={ann} />)}
              </div>
            </div>
          )}
          {regular.length > 0 && (
            <div>
              {pinned.length > 0 && (
                <h2 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Recent</h2>
              )}
              <div className="space-y-4">
                {regular.map(ann => <AnnouncementCard key={ann.id} announcement={ann} />)}
              </div>
            </div>
          )}
          {!loading && announcements.length === 0 && (
            <div className="text-center py-16">
              <Megaphone size={40} className="text-white/15 mx-auto mb-3" />
              <p className="text-white/30">No announcements found.</p>
            </div>
          )}
        </div>
      </PageLoader>
    </div>
  );
}
