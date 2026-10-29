import { useMemo, useState } from 'react';
import { ArrowUpRight, CalendarDays, Check, Compass, Gamepad2, Heart, Mountain, Music, Palette, Search, Sprout, Users } from 'lucide-react';
import { Avatar, EmptyState, PageTitle, Tag, Button } from '../components/common/UI';
import { useApp } from '../context/AppContext';

const groups = [
  { id: 'g1', name: 'Creative Corner', type: 'Arts & Ideas', description: 'A place to trade visual inspiration, UI sketches, creative writing and weekend side projects.', icon: Palette, tone: 'purple', next: 'Prompt of the week', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=85' },
  { id: 'g2', name: 'Move & Recharge', type: 'Wellbeing', description: 'Daily movement breaks, 5k run clubs, walking meetings and low-pressure wellness accountability.', icon: Sprout, tone: 'mint', next: 'Midweek recharge run', image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=85' },
  { id: 'g3', name: 'Weekend Explorers', type: 'Outdoors', description: 'Swap hiking trails, camping spots, local weekend road trips and hidden countryside spots.', icon: Mountain, tone: 'gold', next: 'Local trail recommendations', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=85' },
  { id: 'g4', name: 'Music Exchange', type: 'Music & Culture', description: 'Discover new indie tracks, trade focus playlists, discuss vinyl records and share concert plans.', icon: Music, tone: 'rose', next: 'Focus playlist collaborative swap', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=85' },
  { id: 'g5', name: 'Puzzle People', type: 'Games & Puzzles', description: 'Quick daily word connections, crossword speedruns, chess tactics and logic riddles.', icon: Gamepad2, tone: 'blue', next: 'Weekly speed chess tournament', image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=85' },
  { id: 'g6', name: 'Curiosity Club', type: 'Books & Science', description: 'Share non-fiction book summaries, tech articles, podcast gems and cross-disciplinary learnings.', icon: Compass, tone: 'teal', next: 'Monthly book discussion', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=85' },
];

function CommunityCard({ group, joined, onToggle }) {
  const [imageFailed, setImageFailed] = useState(false);
  const Icon = group.icon;

  return (
    <article className="community-club-card">
      <div className="community-club-cover">
        {group.image && !imageFailed ? (
          <img src={group.image} alt="" loading="lazy" onError={() => setImageFailed(true)} />
        ) : (
          <div className={`community-club-cover-fallback tone-${group.tone}`}><Icon size={34} /></div>
        )}
        <div className="community-club-cover-overlay" />
        <span className={`community-club-icon tone-${group.tone}`} aria-hidden="true"><Icon size={19} /></span>
        <span className="community-club-type">{group.type}</span>
      </div>
      <div className="community-club-body">
        <div className="community-club-heading">
          <div><h3>{group.name}</h3><span><Users size={13} /> Employee-led circle</span></div>
        </div>
        <p>{group.description}</p>
        <div className="community-next-activity">
          <span className="community-next-icon"><CalendarDays size={15} /></span>
          <div><small>UP NEXT</small><strong>{group.next}</strong></div>
        </div>
        <div className="community-card-footer">
          <span className="community-club-status">{joined ? 'You are a member' : 'Open to everyone'}</span>
          <Button variant={joined ? 'secondary' : 'primary'} size="sm" onClick={() => onToggle(group)}>
            {joined ? <><Check size={14} /> Joined</> : <>Join club <ArrowUpRight size={14} /></>}
          </Button>
        </div>
      </div>
    </article>
  );
}

export default function Community() {
  const { joinedGroups, setJoinedGroups, setToast, user } = useApp();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const categories = useMemo(() => ['All', ...new Set(groups.map((group) => group.type))], []);
  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return groups.filter((group) => {
      const matchesFilter = filter === 'All' || group.type === filter;
      const searchable = `${group.name} ${group.type} ${group.description} ${group.next}`.toLowerCase();
      return matchesFilter && (!query || searchable.includes(query));
    });
  }, [filter, search]);

  const toggleJoin = (group) => {
    const joined = joinedGroups.includes(group.id);
    setJoinedGroups((items) => joined ? items.filter((id) => id !== group.id) : [...items, group.id]);
    setToast(joined ? `Left ${group.name}` : `Joined ${group.name}! Welcome to the club.`);
  };

  const clearFilters = () => { setFilter('All'); setSearch(''); };
  const displayName = user?.name || 'Your profile';

  return (
    <div className="community-page">
      <PageTitle
        eyebrow="CONNECT & BELONG"
        title="Employee Community"
        description="Connect, share, and celebrate together through employee-led interest circles."
        actions={<div className="community-header-count"><strong>{joinedGroups.length}</strong><span>clubs joined</span></div>}
      />

      <section className="community-hero" aria-labelledby="community-hero-title">
        <div className="community-hero-copy">
          <Tag tone="teal">BETTER TOGETHER</Tag>
          <h2 id="community-hero-title">Find your people beyond the org chart.</h2>
          <p>Discover welcoming spaces to explore shared interests, recharge with colleagues, and make meaningful connections across teams.</p>
          <div className="community-stats"><span><strong>{groups.length}</strong> active circles</span><span><strong>{joinedGroups.length}</strong> joined by you</span></div>
        </div>
        <div className="community-hero-art" aria-hidden="true"><Heart size={28} /><span /><span /><span /></div>
      </section>

      <section className="community-composer" aria-label="Community introduction">
        <Avatar name={displayName} initials={user?.initials} src={user?.avatar} color={user?.color || 'blue'} size="sm" />
        <div className="community-composer-copy"><strong>What are you curious about?</strong><span>Join a circle to share ideas, activities, and inspiration with colleagues.</span></div>
        <span className="community-composer-note">Start by joining a club below</span>
      </section>

      <section className="community-explore" aria-labelledby="community-explore-title">
        <div className="community-toolbar">
          <div><span className="community-section-label">YOUR COMMUNITY</span><h2 id="community-explore-title">Explore interest circles</h2><p>Pick an interest and join the conversation.</p></div>
          <label className="community-search"><Search size={16} aria-hidden="true" /><span className="sr-only">Search communities</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search circles or topics" />{search && <button type="button" aria-label="Clear community search" onClick={() => setSearch('')}>×</button>}</label>
        </div>
        <div className="community-filter-row" role="tablist" aria-label="Community categories">
          {categories.map((item) => <button type="button" role="tab" aria-selected={filter === item} key={item} className={`community-filter-chip ${filter === item ? 'selected' : ''}`} onClick={() => setFilter(item)}>{item}</button>)}
        </div>
      </section>

      <div className="community-content-layout">
        <div className="community-club-grid">
          {visible.map((group) => <CommunityCard key={group.id} group={group} joined={joinedGroups.includes(group.id)} onToggle={toggleJoin} />)}
          {visible.length === 0 && <div className="community-empty"><EmptyState icon={Search} title="No circles found" description="Try a different topic or clear your filters to explore every community." action={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>} /></div>}
        </div>
        <aside className="community-side-panel">
          <div className="community-side-heading"><span className="community-side-icon"><Heart size={16} /></span><div><span className="community-section-label">COMMUNITY NOTE</span><h2>Make room for belonging</h2></div></div>
          <p>Every circle is employee-led and open to everyone, regardless of level, role, or department.</p>
          <div className="community-side-list"><div><span>01</span><strong>Choose an interest</strong></div><div><span>02</span><strong>Join the circle</strong></div><div><span>03</span><strong>Show up as yourself</strong></div></div>
        </aside>
      </div>
    </div>
  );
}
