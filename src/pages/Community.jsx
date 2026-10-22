import { useState } from 'react';
import { ArrowUpRight, CalendarDays, Check, Compass, Gamepad2, Heart, Mountain, Music, Palette, Sprout, Users } from 'lucide-react';
import { PageTitle, Panel, Tag, Button } from '../components/common/UI';
import { useApp } from '../context/AppContext';

const groups = [
  {
    id: 'g1',
    name: 'Creative Corner',
    type: 'Arts & Ideas',
    members: 42,
    description: 'A place to trade visual inspiration, UI sketches, creative writing and weekend side projects.',
    icon: Palette,
    tone: 'purple',
    next: 'Prompt of the week',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'g2',
    name: 'Move & Recharge',
    type: 'Wellbeing',
    members: 58,
    description: 'Daily movement breaks, 5k run clubs, walking meetings and low-pressure wellness accountability.',
    icon: Sprout,
    tone: 'mint',
    next: 'Midweek recharge run',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'g3',
    name: 'Weekend Explorers',
    type: 'Outdoors',
    members: 31,
    description: 'Swap hiking trails, camping spots, local weekend road trips and hidden countryside spots.',
    icon: Mountain,
    tone: 'gold',
    next: 'Local trail recommendations',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'g4',
    name: 'Music Exchange',
    type: 'Music & Culture',
    members: 26,
    description: 'Discover new indie tracks, trade focus playlists, discuss vinyl records and share concert plans.',
    icon: Music,
    tone: 'rose',
    next: 'Focus playlist collaborative swap',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'g5',
    name: 'Puzzle People',
    type: 'Games & Puzzles',
    members: 36,
    description: 'Quick daily word connections, crossword speedruns, chess tactics and logic riddles.',
    icon: Gamepad2,
    tone: 'blue',
    next: 'Weekly speed chess tournament',
    image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'g6',
    name: 'Curiosity Club',
    type: 'Books & Science',
    members: 47,
    description: 'Share non-fiction book summaries, tech articles, podcast gems and cross-disciplinary learnings.',
    icon: Compass,
    tone: 'teal',
    next: 'Monthly book discussion',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=85',
  },
];

export default function Community() {
  const { joinedGroups, setJoinedGroups, setToast } = useApp();
  const [filter, setFilter] = useState('All');
  const categories = ['All', ...new Set(groups.map((group) => group.type))];
  const visible = groups.filter((group) => filter === 'All' || group.type === filter);

  const toggleJoin = (group) => {
    const joined = joinedGroups.includes(group.id);
    setJoinedGroups((items) => joined ? items.filter((id) => id !== group.id) : [...items, group.id]);
    setToast(joined ? `Left ${group.name}` : `Joined ${group.name}! Welcome to the club.`);
  };

  return (
    <>
      <PageTitle
        eyebrow="FIND YOUR PEOPLE"
        title="Employee community"
        description="Shared interests, social clubs and collaborative circles that bring our workplace culture to life."
      />

      <div className="community-hero">
        <div className="community-hero-copy">
          <Tag tone="purple">BETTER TOGETHER</Tag>
          <h2>Work is more than just work.</h2>
          <p>
            Connect with colleagues across teams who share your passions. Join a club, take part in weekly activities, and make meaningful connections.
          </p>
          <div className="community-stats">
            <span><strong>{groups.length}</strong> active interest clubs</span>
            <span><strong>{joinedGroups.length}</strong> joined by you</span>
          </div>
        </div>
      </div>

      <div className="community-toolbar">
        <div>
          <h2>Explore communities</h2>
          <p>Pick an interest and join the conversation.</p>
        </div>
        <div className="filter-chip-row">
          {categories.map((item) => (
            <button
              key={item}
              className={`filter-chip ${filter === item ? 'selected' : ''}`}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="community-grid">
        {visible.map((group) => {
          const Icon = group.icon;
          const joined = joinedGroups.includes(group.id);
          return (
            <Panel className="community-card" key={group.id}>
              <div className="community-card-banner">
                {group.image && (
                  <img src={group.image} alt={group.name} className="community-banner-img" loading="lazy" />
                )}
                <div className="community-banner-overlay" />
                <span className="community-card-icon"><Icon size={20}/></span>
                <span className="community-group-type">{group.type}</span>
              </div>
              <div className="community-card-body">
                <div className="community-group-heading">
                  <h3>{group.name}</h3>
                  <span className="community-member-count">
                    <Users size={13}/> {group.members + (joined ? 1 : 0)}
                  </span>
                </div>
                <p>{group.description}</p>
                <div className="community-next-activity">
                  <span><CalendarDays size={14}/></span>
                  <div>
                    <small>UP NEXT</small>
                    <strong>{group.next}</strong>
                  </div>
                </div>
                <div className="community-card-footer">
                  <span className="community-demo-tag">Community Club</span>
                  <Button
                    variant={joined ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => toggleJoin(group)}
                  >
                    {joined ? <><Check size={14}/> Joined</> : <>Join club <ArrowUpRight size={14}/></>}
                  </Button>
                </div>
              </div>
            </Panel>
          );
        })}
      </div>

      <Panel className="community-guideline">
        <span><Heart size={18}/></span>
        <div>
          <strong>Inclusive, welcoming spaces for all employees.</strong>
          <p>Communities are employee-led and open to everyone regardless of level or department.</p>
        </div>
      </Panel>
    </>
  );
}
