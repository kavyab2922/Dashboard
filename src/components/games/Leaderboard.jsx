import { useEffect, useState } from 'react';
import { Flame, Medal, Trophy } from 'lucide-react';
import { dataApi } from '../../services/api';
import { Avatar } from '../common/UI';

const PERIODS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'all', label: 'All Time' },
];

const MEDALS = ['gold', 'silver', 'bronze'];

function Placeholder({ label }) {
  return (
    <div className="champions-placeholder">
      <Trophy size={18} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

/**
 * Compact top-three podium. Reused by the Daily Games page and the small
 * dashboard widget so both always render identical, server-owned rankings.
 */
export function ChampionsPodium({ period = 'all', compact = false }) {
  const [state, setState] = useState({ loading: true, error: '', champions: [], me: null });
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((current) => ({ ...current, loading: true, error: '' }));
    dataApi.dailyGames.champions(period)
      .then((payload) => {
        if (cancelled) return;
        setState({ loading: false, error: '', champions: payload.data.champions || [], me: payload.data.me });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ loading: false, error: err.message || 'Unable to load the leaderboard.', champions: [], me: null });
      });
    return () => {
      cancelled = true;
    };
  }, [period, retryToken]);

  if (state.loading) {
    return (
      <div className="champions-podium">
        {[0, 1, 2].map((index) => (
          <div className="champion-card is-loading" key={index}>
            <span className="skeleton-avatar" />
            <span className="skeleton-bar" />
            <span className="skeleton-bar skeleton-short" />
          </div>
        ))}
      </div>
    );
  }

  if (state.error) {
    return <div className="leaderboard-error"><p className="muted">Unable to load champions: {state.error}</p><button type="button" className="btn btn-secondary" onClick={() => setRetryToken((value) => value + 1)}>Retry</button></div>;
  }

  if (!state.champions.length) {
    return <Placeholder label="No completions yet — finish a game to open the leaderboard." />;
  }

  return (
    <div className={`champions-podium ${compact ? 'is-compact' : ''}`}>
      {state.champions.map((person, index) => (
        <div className={`champion-card rank-${index + 1}`} key={person.employeeKey || person.name}>
          <span className={`champion-rank champion-${MEDALS[index]}`}>
            <Medal size={14} aria-hidden="true" />
            <span>{index + 1}</span>
          </span>
          <Avatar name={person.name} initials={person.initials} color={person.color || 'blue'} src={person.avatar} size="lg" />
          <div className="champion-copy">
            <strong>{person.name}</strong>
            <span className="champion-points">{person.points} pts</span>
            <span className="champion-streak">
              <Flame size={12} aria-hidden="true" /> {person.streak} day streak
            </span>
          </div>
        </div>
      ))}
      {state.me && (
        <p className="champions-your-rank">
          You are ranked <strong>#{state.me.rank}</strong> with {state.me.points} points.
        </p>
      )}
    </div>
  );
}

/** Full ranking table with period filters and the signed-in row highlighted. */
export function LeaderboardTable({ period, onPeriodChange, limit = 25 }) {
  const [state, setState] = useState({ loading: true, error: '', rows: [], me: null });
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((current) => ({ ...current, loading: true, error: '' }));
    dataApi.dailyGames.leaderboard(period)
      .then((payload) => {
        if (cancelled) return;
        setState({ loading: false, error: '', rows: payload.data.rows || [], me: payload.data.me });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ loading: false, error: err.message || 'Unable to load the leaderboard.', rows: [], me: null });
      });
    return () => {
      cancelled = true;
    };
  }, [period, retryToken]);

  const rows = state.rows.slice(0, limit);

  return (
    <div className="leaderboard">
      <div className="leaderboard-filters" role="tablist" aria-label="Leaderboard period">
        {PERIODS.map((option) => (
          <button
            type="button"
            role="tab"
            key={option.id}
            aria-selected={period === option.id}
            className={`filter-chip ${period === option.id ? 'is-active' : ''}`}
            onClick={() => onPeriodChange(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {state.loading ? (
        <div className="leaderboard-skeleton">
          {[0, 1, 2, 3].map((index) => <div className="skeleton-bar" key={index} />)}
        </div>
      ) : state.error ? (
        <div className="leaderboard-error"><p className="muted">Unable to load the leaderboard: {state.error}</p><button type="button" className="btn btn-secondary" onClick={() => setRetryToken((value) => value + 1)}>Retry</button></div>
      ) : rows.length === 0 ? (
        <p className="muted">No completions recorded for this period yet.</p>
      ) : (
        <div className="leaderboard-table-wrap">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">Employee</th>
                <th scope="col">Points</th>
                <th scope="col">Streak</th>
                <th scope="col">Games</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.employeeKey} className={row.isMe ? 'is-me' : ''}>
                  <td>
                    <span className={`leaderboard-rank ${row.rank <= 3 ? `champion-${MEDALS[row.rank - 1]}` : 'champion-plain'}`}>
                      {row.rank}
                    </span>
                  </td>
                  <td>
                    <span className="leaderboard-person">
                      <Avatar name={row.name} initials={row.initials} color={row.color || 'blue'} src={row.avatar} />
                      <span>
                        <strong>{row.name}</strong>
                        {row.isMe && <small>You</small>}
                      </span>
                    </span>
                  </td>
                  <td>{row.points}</td>
                  <td>{row.streak}d</td>
                  <td>{row.gamesInPeriod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {state.me && (
        <div className="leaderboard-you">
          <span>Your position</span>
          <strong>#{state.me.rank}</strong>
          <span>{state.me.points} points · {state.me.streak} day streak · {state.me.gamesCompleted} games</span>
        </div>
      )}
    </div>
  );
}

export default ChampionsPodium;
