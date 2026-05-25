import { useState, useEffect } from 'react';
import { Trophy, Heart, Star, Award, Sparkles, Filter, X, Zap, Activity, TrendingUp, CheckCircle } from 'lucide-react';
import Avatar from '../components/common/Avatar';
import { achievementsAPI } from '../services/api';
import { useLocation } from 'react-router-dom';

const BADGE_ICON_MAP = {
  'Trophy': Trophy, 'Star': Star, 'Sparkles': Sparkles, 'Award': Award,
  'Rocket': Zap, 'Diamond': Star, 'Heart': Heart, 'Shield': CheckCircle,
  'Hero': CheckCircle, 'Innovator': Zap, 'Insights': Activity,
  'Culture': Heart, 'Impact': TrendingUp, 'Rising Star': Star, 'Mentor': Sparkles,
};
function BadgeIcon({ badge, color, size = 14 }) {
  const Icon = BADGE_ICON_MAP[badge] || Star;
  return <Icon size={size} style={{ color }} />;
}
import PageLoader from '../components/common/PageLoader';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const CATEGORIES = ['all', 'Innovation', 'Leadership', 'Excellence', 'Technical Excellence', 'Business Impact', 'Culture', 'Community'];

const categoryGrad = {
  Innovation:            ['#6366f1','#8b5cf6'],
  Leadership:            ['#8b5cf6','#a78bfa'],
  Excellence:            ['#ec4899','#f43f5e'],
  'Technical Excellence':['#14b8a6','#06b6d4'],
  'Business Impact':     ['#3b82f6','#6366f1'],
  Culture:               ['#f43f5e','#fb923c'],
  Community:             ['#10b981','#34d399'],
};

function AchievementCard({ ach, index }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(ach.likes);
  const grad = categoryGrad[ach.category] || ['#6366f1','#8b5cf6'];

  const handleLike = async (e) => {
    e.stopPropagation();
    if (liked) return;
    try {
      const res = await achievementsAPI.like(ach.id);
      setLikes(res.likes);
      setLiked(true);
      toast.success('👏 Cheered!');
    } catch { toast.error('Try again'); }
  };

  return (
    <div
      className="glass-card overflow-hidden group cursor-pointer animate-slide-up"
      style={{
        animationDelay: `${index * 60}ms`,
        transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = `0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px ${ach.coverColor}25`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Card Top Bar */}
      <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${grad[0]}, ${grad[1]})` }} />

      {/* Featured Banner */}
      {ach.featured && (
        <div className="flex items-center gap-2 px-5 py-2.5"
          style={{ background: `linear-gradient(90deg, ${grad[0]}15, transparent)`, borderBottom: `1px solid ${grad[0]}15` }}>
          <Star size={12} style={{ color: grad[0] }} className="fill-current" />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: grad[0] }}>Featured</span>
          <Sparkles size={12} style={{ color: grad[1] }} className="ml-auto opacity-60" />
        </div>
      )}

      <div className="p-5">
        {/* Author */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative flex-shrink-0">
            <Avatar photo={ach.photo} initials={ach.avatar} color={ach.coverColor} size="lg" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center drop-shadow-lg"
              style={{ background: `${ach.badgeColor}20`, border: `1px solid ${ach.badgeColor}40` }}>
              <BadgeIcon badge={ach.badge} color={ach.badgeColor} size={14} />
            </div>
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="text-white font-black text-sm leading-snug line-clamp-2 group-hover:text-white transition-colors">
              {ach.title}
            </h3>
            <p className="text-white/45 text-xs mt-1">{ach.employeeName} · {ach.department}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-white/50 text-xs leading-relaxed line-clamp-3 mb-4">{ach.description}</p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2">
            <span className="badge text-xs font-bold"
              style={{ background: `${grad[0]}15`, color: grad[0], border: `1px solid ${grad[0]}25` }}>
              {ach.category}
            </span>
            <span className="text-white/20 text-xs">{format(parseISO(ach.date), 'MMM d')}</span>
          </div>
          <button onClick={handleLike}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
            style={liked
              ? { background: 'rgba(236,72,153,0.2)', color: '#f472b6', border: '1px solid rgba(236,72,153,0.3)' }
              : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }
            }
          >
            <Heart size={12} className={liked ? 'fill-current' : ''} />
            {likes}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Spotlight() {
  const [achievements, setAchievements] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const filterEmployee = location.state?.filterEmployee;
  const filterName = location.state?.employeeName;

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      let data = await achievementsAPI.getAll(activeCategory !== 'all' ? { category: activeCategory } : {});
      if (filterEmployee) data = data.filter(a => a.employeeId === filterEmployee);
      setAchievements(data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAchievements(); }, [activeCategory, filterEmployee]);

  const featured = achievements.filter(a => a.featured);
  const rest     = achievements.filter(a => !a.featured);

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        {filterEmployee && filterName && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl mb-2"
          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)' }}>
          <span className="text-white/60 text-sm">Showing achievements for <span className="text-white font-bold">{filterName}</span></span>
          <button onClick={() => window.history.replaceState({}, '')} className="ml-auto text-white/30 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
      )}
      <div>
          <h1 className="section-title flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(251,146,60,0.1))', boxShadow: '0 4px 16px rgba(245,158,11,0.2)' }}>
              <Trophy size={20} style={{ color: '#fbbf24' }} />
            </div>
            <span className="gradient-text-gold">Employee Spotlight</span>
          </h1>
          <p className="text-white/35 text-sm mt-2 ml-14">{achievements.length} recognitions across {[...new Set(achievements.map(a=>a.department))].length} departments</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold hidden sm:flex"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24' }}>
          <Award size={14} /> Hall of Fame
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => {
          const grad = categoryGrad[cat] || ['#6366f1','#8b5cf6'];
          const active = activeCategory === cat;
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${!active ? 'spotlight-filter-inactive' : ''}`}
              style={active
                ? { background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`, color: 'white', boxShadow: `0 4px 20px ${grad[0]}40` }
                : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.07)' }
              }
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            >
              {cat === 'all' ? '✨ All' : cat}
            </button>
          );
        })}
      </div>

      <PageLoader loading={loading}>
        <>
          {featured.length > 0 && activeCategory === 'all' && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Star size={14} style={{ color: '#fbbf24' }} className="fill-current" />
                <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Featured Recognitions</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {featured.map((ach, i) => <AchievementCard key={ach.id} ach={ach} index={i} />)}
              </div>
            </div>
          )}
          {(activeCategory !== 'all' ? achievements : rest).length > 0 && (
            <div>
              {activeCategory === 'all' && (
                <div className="flex items-center gap-2 mb-4">
                  <Award size={14} className="text-white/30" />
                  <span className="text-white/30 text-xs font-bold uppercase tracking-widest">All Recognitions</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(activeCategory !== 'all' ? achievements : rest).map((ach, i) => (
                  <AchievementCard key={ach.id} ach={ach} index={i} />
                ))}
              </div>
            </div>
          )}
          {!loading && achievements.length === 0 && (
            <div className="text-center py-20">
              <Trophy size={48} style={{ color: 'rgba(255,255,255,0.07)' }} className="mx-auto mb-4" />
              <p className="text-white/25 text-sm">No achievements in this category yet.</p>
            </div>
          )}
        </>
      </PageLoader>
    </div>
  );
}
