import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award, CheckCircle2, Clock, Flame, Gauge, Play, Sparkles, Star, Trophy, X,
} from 'lucide-react';
import { dataApi } from '../services/api';
import { EmptyState, PageTitle, Panel, PanelHeading } from '../components/common/UI';
import { GameIcon, GAME_TONES } from '../components/games/common';
import { ChampionsPodium, LeaderboardTable } from '../components/games/Leaderboard';

const FILTERS = [
  { id: 'all', label: 'All Games' },
  { id: 'not_played', label: 'Not Played' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'favorites', label: 'Favorites' },
];

const STATUS_LABEL = {
  completed: 'Completed',
  in_progress: 'In progress',
  not_played: 'Not played',
};

const FAVORITES_KEY = 'hrobit-daily-game-favorites';

function readFavorites() {
  try {
    const raw = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function GameCard({ game, favorite, onToggleFavorite, onPlay }) {
  const tone = GAME_TONES[game.color] || 'slate';
  const cta = game.status === 'completed' ? 'Play again' : game.status === 'in_progress' ? 'Continue' : 'Play';

  return (
    <article className={`game-card status-${game.status}`}>
      <div className="game-card-top">
        <span className={`game-card-icon tone-${tone}`}>
          <GameIcon name={game.icon} size={20} />
        </span>
        <span className={`game-card-status status-${game.status}`}>
          {game.status === 'completed' && <CheckCircle2 size={13} aria-hidden="true" />}
          {STATUS_LABEL[game.status] || 'Not played'}
        </span>
        <button
          type="button"
          className={`game-card-fav ${favorite ? 'is-on' : ''}`}
          aria-pressed={favorite}
          aria-label={favorite ? `Remove ${game.title} from favorites` : `Add ${game.title} to favorites`}
          onClick={() => onToggleFavorite(game.id)}
        >
          <Star size={15} fill={favorite ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
      </div>

      <h3>{game.title}</h3>
      <p className="game-card-desc">{game.description}</p>

      <ul className="game-card-meta">
        <li><Gauge size={13} aria-hidden="true" /> {game.difficulty}</li>
        <li><Clock size={13} aria-hidden="true" /> {game.minutes} min</li>
        <li><Sparkles size={13} aria-hidden="true" /> {game.points} pts</li>
      </ul>

      <div className="game-card-foot">
        <span className="game-card-best">
          {game.best ? `Best ${game.best.score}` : 'No score yet'}
        </span>
        <button type="button" className={`btn ${game.status === 'completed' ? 'btn-secondary' : 'btn-primary'}`} onClick={() => onPlay(game.id)}>
          <Play size={14} aria-hidden="true" /> {cta}
        </button>
      </div>
    </article>
  );
}

function HeaderStat({ icon: Icon, label, value, hint }) {
  return (
    <div className="games-stat">
      <span className="games-stat-icon"><Icon size={16} aria-hidden="true" /></span>
      <span className="games-stat-copy">
        <strong>{value}</strong>
        <small>{label}</small>
      </span>
      {hint && <small className="games-stat-hint">{hint}</small>}
    </div>
  );
}

export default function Games() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [period, setPeriod] = useState('all');
  const [favorites, setFavorites] = useState(readFavorites);
  const [celebrations, setCelebrations] = useState([]);
  const [retryToken, setRetryToken] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [listPayload, celebrationPayload] = await Promise.all([
        dataApi.dailyGames.list(),
        dataApi.dailyGames.celebrations().catch(() => ({ data: [] })),
      ]);
      setGames(listPayload.data || []);
      setStats(listPayload.stats || null);
      setCelebrations(celebrationPayload.data || []);
    } catch (err) {
      setError(err.message || 'Unable to load the Daily Games line-up.');
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, retryToken]);

  const toggleFavorite = useCallback((gameId) => {
    setFavorites((current) => {
      const next = current.includes(gameId) ? current.filter((id) => id !== gameId) : [...current, gameId];
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      } catch {
        /* favorites stay in memory when storage is unavailable */
      }
      return next;
    });
  }, []);

  const dismissCelebration = useCallback((eventKey) => {
    dataApi.dailyGames.acknowledge(eventKey).catch(() => {});
    setCelebrations((current) => current.filter((item) => item.eventKey !== eventKey));
  }, []);

  const visibleGames = useMemo(() => {
    if (filter === 'favorites') return games.filter((game) => favorites.includes(game.id));
    if (filter === 'all') return games;
    return games.filter((game) => game.status === filter);
  }, [favorites, filter, games]);

  const completedToday = stats?.completedToday ?? 0;
  const totalGames = stats?.totalGames ?? games.length ?? 8;
  const progress = totalGames ? Math.round((completedToday / totalGames) * 100) : 0;

  const playGame = (gameId) => navigate(`/games/${gameId}`);

  return (
    <div className="games-page">
      <PageTitle
        eyebrow="DAILY BRAIN BREAK"
        title="Daily Games"
        description="Take a break. Challenge your mind. Celebrate your progress."
      />

      <section className="games-header" aria-label="Your Daily Games statistics">
        <div className="games-header-stats">
          <HeaderStat icon={Flame} label="Current streak" value={`${stats?.currentStreak ?? 0} day${(stats?.currentStreak ?? 0) === 1 ? '' : 's'}`} hint={stats?.longestStreak ? `Best ${stats.longestStreak}` : ''} />
          <HeaderStat icon={Trophy} label="Total points" value={stats?.totalPoints ?? 0} hint={stats?.todayPoints ? `+${stats.todayPoints} today` : ''} />
          <HeaderStat icon={CheckCircle2} label="Completed today" value={completedToday} hint={stats?.totalCompleted ? `${stats.totalCompleted} all time` : ''} />
          <div className="games-stat games-stat-progress">
            <span className="games-stat-icon"><Award size={16} aria-hidden="true" /></span>
            <span className="games-stat-copy">
              <strong>{completedToday} of {totalGames}</strong>
              <small>Today&apos;s progress</small>
            </span>
            <span className="games-progress" role="progressbar" aria-valuenow={completedToday} aria-valuemin={0} aria-valuemax={totalGames} aria-label="Today's progress">
              <i style={{ width: `${progress}%` }} />
            </span>
          </div>
        </div>
      </section>

      {celebrations.length > 0 && (
        <div className="game-celebration" role="status">
          <Trophy size={18} aria-hidden="true" />
          <div>
            <strong>{celebrations[0].title}</strong>
            <p>{celebrations[0].message}</p>
          </div>
          <button type="button" className="icon-button" aria-label="Dismiss celebration" onClick={() => dismissCelebration(celebrations[0].eventKey)}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="games-section-head">
        <div>
          <h2>Choose your challenge</h2>
          <p>Eight original puzzles · no sign-up, no redirects</p>
        </div>
        <div className="games-filters" role="tablist" aria-label="Filter games">
          {FILTERS.map((option) => (
            <button
              type="button"
              role="tab"
              key={option.id}
              aria-selected={filter === option.id}
              className={`filter-chip ${filter === option.id ? 'is-active' : ''}`}
              onClick={() => setFilter(option.id)}
            >
              {option.label}
              {option.id === 'favorites' && favorites.length > 0 ? ` (${favorites.length})` : ''}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="games-grid" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, index) => (
            <div className="game-card is-skeleton" key={index}>
              <div className="skeleton-bar" />
              <div className="skeleton-bar skeleton-short" />
              <div className="skeleton-bar" />
              <div className="skeleton-bar skeleton-short" />
            </div>
          ))}
        </div>
      ) : error ? (
        <Panel className="games-error">
          <EmptyState
            icon={Gauge}
            title="The Daily Games list is unavailable"
            description={error}
            action={
              <button type="button" className="btn btn-primary" onClick={() => setRetryToken((value) => value + 1)}>
                Try again
              </button>
            }
          />
        </Panel>
      ) : visibleGames.length === 0 ? (
        <Panel>
          <EmptyState
            icon={Star}
            title={filter === 'favorites' ? 'No favorites yet' : 'Nothing in this filter'}
            description={filter === 'favorites'
              ? 'Tap the star on any game card to keep it here.'
              : 'Try another filter to find a puzzle to play.'}
            action={<button type="button" className="btn btn-secondary" onClick={() => setFilter('all')}>Show all games</button>}
          />
        </Panel>
      ) : (
        <div className="games-grid">
          {visibleGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              favorite={favorites.includes(game.id)}
              onToggleFavorite={toggleFavorite}
              onPlay={playGame}
            />
          ))}
        </div>
      )}

      <section className="games-champions" aria-label="Daily Games Champions">
        <Panel>
          <PanelHeading
            title="Daily Games Champions"
            subtitle="Top three employees across the whole organization"
            action={<span className="games-chip-live"><i /> LIVE</span>}
          />
          <ChampionsPodium period="all" />
        </Panel>

        <Panel>
          <PanelHeading
            title="Full leaderboard"
            subtitle="Rank by points, then streak, then games completed"
          />
          <LeaderboardTable period={period} onPeriodChange={setPeriod} />
        </Panel>
      </section>
    </div>
  );
}
