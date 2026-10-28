import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, Flame, Hourglass, Lightbulb, PartyPopper, Trophy, X,
} from 'lucide-react';
import { dataApi } from '../services/api';
import { useApp } from '../context/AppContext';
import { Modal, Panel } from '../components/common/UI';
import {
  GameIcon, RulesPanel, StatChip, formatElapsed, useTimer, prefersReducedMotion,
} from '../components/games/common';
import GAME_COMPONENTS from '../components/games';

function GameSkeleton() {
  return (
    <div className="game-play-skeleton" aria-hidden="true">
      <div className="skeleton-bar skeleton-wide" />
      <div className="skeleton-bar" />
      <div className="skeleton-board" />
      <div className="skeleton-bar skeleton-short" />
    </div>
  );
}

export default function GamePlay() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useApp();

  const [loadError, setLoadError] = useState('');
  const [retryToken, setRetryToken] = useState(0);
  const [game, setGame] = useState(null);
  const [puzzle, setPuzzle] = useState(null);
  const [session, setSession] = useState(null);
  const [initialStats, setInitialStats] = useState(null);
  const [completion, setCompletion] = useState(null);
  const [celebrations, setCelebrations] = useState([]);
  const [hint, setHint] = useState('');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [busy, setBusy] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [loading, setLoading] = useState(true);

  const elapsed = useTimer(Boolean(puzzle) && !completion);
  const Board = GAME_COMPONENTS[gameId];

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [puzzlePayload, statsPayload] = await Promise.all([
        dataApi.dailyGames.puzzle(gameId),
        dataApi.dailyGames.stats().catch(() => null),
      ]);
      const data = puzzlePayload.data;
      setGame(data.game);
      setPuzzle(data.puzzle);
      setSession(data.session);
      setHintsUsed(Number(data.session?.hintsUsed) || 0);
      setCompletion(data.completion || null);
      setInitialStats(statsPayload ? statsPayload.data : null);
      setLoadError('');
    } catch (err) {
      setLoadError(err.message || 'This puzzle could not be loaded.');
      setGame(null);
      setPuzzle(null);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    load();
  }, [load, retryToken]);

  // Leaving the page entirely is an explicit action; Escape only closes dialogs
  // so a stray key press can never abandon a board mid-play.
  useEffect(() => {
    if (!confirmExit) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setConfirmExit(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [confirmExit]);

  const handleHint = useCallback(async () => {
    if (busy) return null;
    setBusy(true);
    try {
      const payload = await dataApi.dailyGames.hint(gameId);
      setHint(payload.data.hint || '');
      setHintsUsed(payload.data.hintsUsed || 0);
      if (session) setSession({ ...session, hintsUsed: payload.data.hintsUsed });
      return payload.data;
    } catch (err) {
      setHint(err.message || 'No more hints are available.');
      return null;
    } finally {
      setBusy(false);
    }
  }, [busy, gameId, session]);

  const handleCheck = useCallback(async (submission) => {
    setBusy(true);
    try {
      const payload = await dataApi.dailyGames.check(gameId, submission);
      if (payload.data.hintsUsed !== undefined) setHintsUsed(payload.data.hintsUsed);
      if (payload.data.clues) setPuzzle((current) => (current ? { ...current, revealedClues: payload.data.clues } : current));
      return payload.data;
    } catch (err) {
      return { valid: false, reason: err.message || 'That answer could not be checked.' };
    } finally {
      setBusy(false);
    }
  }, [gameId]);

  const handleComplete = useCallback(async (submission) => {
    setBusy(true);
    try {
      const payload = await dataApi.dailyGames.complete(gameId, submission);
      const data = payload.data;
      setCompletion(data.completion);
      setInitialStats(data.stats);
      setCelebrations(data.celebrations || []);
      if (data.stats?.status) setGame((current) => (current ? { ...current, status: 'completed' } : current));
      return { ok: true, data };
    } catch (err) {
      return { ok: false, message: err.message || 'That solution is not correct yet.' };
    } finally {
      setBusy(false);
    }
  }, [gameId]);

  const dismissCelebration = useCallback((eventKey) => {
    dataApi.dailyGames.acknowledge(eventKey).catch(() => {});
    setCelebrations((current) => current.filter((item) => item.eventKey !== eventKey));
  }, []);

  const exit = useCallback(() => {
    navigate('/games');
  }, [navigate]);

  const requestExit = useCallback(() => {
    if (!puzzle || completion) {
      exit();
      return;
    }
    setConfirmExit(true);
  }, [completion, exit, puzzle]);

  const best = initialStats?.personalBests?.[gameId] || null;
  const rules = game?.rules || [];
  const scoring = game?.scoring || [];

  const summary = useMemo(() => {
    if (!completion) return null;
    const playedMs = Number(completion.completion_ms || 0);
    return {
      score: Number(completion.score || 0),
      elapsedMs: playedMs,
      previousBest: best,
    };
  }, [best, completion]);

  if (loading && !puzzle) {
    return (
      <div className="game-play-page">
        <GameSkeleton />
        <span className="sr-only">Loading puzzle…</span>
      </div>
    );
  }

  if (loadError && !puzzle) {
    return (
      <div className="game-play-page">
        <div className="game-play-error" role="alert">
          <X size={22} aria-hidden="true" />
          <h2>We could not load this puzzle</h2>
          <p>{loadError}</p>
          <div className="game-play-error-actions">
            <button type="button" className="btn btn-primary" onClick={() => setRetryToken((value) => value + 1)}>
              Try again
            </button>
            <button type="button" className="btn btn-ghost" onClick={exit}>Back to games</button>
          </div>
        </div>
      </div>
    );
  }

  if (!Board || !puzzle) {
    return (
      <div className="game-play-page">
        <div className="game-play-error" role="alert">
          <X size={22} aria-hidden="true" />
          <h2>Game not found</h2>
          <p>This game is not part of the Daily Games line-up.</p>
          <button type="button" className="btn btn-primary" onClick={exit}>Back to games</button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-play-page">
      <header className="game-play-header">
        <button type="button" className="btn btn-ghost game-play-exit" onClick={requestExit}>
          <ArrowLeft size={16} aria-hidden="true" /> Exit
        </button>
        <span className={`game-play-icon tone-${game?.color || 'blue'}`}>
          <GameIcon name={game?.icon} size={20} />
        </span>
        <div className="game-play-title">
          <h1>{game?.title}</h1>
          <p>
            {game?.difficulty} · {game?.minutes} min · {game?.points} points
            {completion ? ' · completed' : ''}
          </p>
        </div>
        <div className="game-play-stats">
          <StatChip label="Time" value={completion ? formatElapsed(Number(completion.completion_ms) || 0) : formatElapsed(elapsed)} icon={Hourglass} />
          <StatChip label="Hints" value={`${hintsUsed}/${session?.maxHints ?? 5}`} icon={Lightbulb} />
          <StatChip label="Streak" value={`${initialStats?.currentStreak ?? 0}d`} icon={Flame} />
        </div>
      </header>

      <div className="game-play-body">
        <section className="game-play-main">
          {celebrations.length > 0 && (
            <div className="game-celebration" role="status">
              <PartyPopper size={18} aria-hidden="true" />
              <div>
                <strong>{celebrations[0].title}</strong>
                <p>{celebrations[0].message}</p>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Dismiss celebration"
                onClick={() => dismissCelebration(celebrations[0].eventKey)}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {completion ? (
            <Panel className="game-complete">
              <div className={`game-complete-badge ${prefersReducedMotion() ? '' : 'is-celebrating'}`}>
                <CheckCircle2 size={30} aria-hidden="true" />
              </div>
              <h2>Puzzle complete</h2>
              <p className="game-complete-sub">
                {game?.title} · {game?.difficulty}
              </p>

              <div className="game-complete-grid">
                <div className="game-complete-stat">
                  <Trophy size={17} aria-hidden="true" />
                  <strong>{summary?.score ?? Number(completion.score || 0)}</strong>
                  <span>points earned</span>
                </div>
                <div className="game-complete-stat">
                  <Hourglass size={17} aria-hidden="true" />
                  <strong>{formatElapsed(summary?.elapsedMs)}</strong>
                  <span>elapsed time</span>
                </div>
                <div className="game-complete-stat">
                  <Flame size={17} aria-hidden="true" />
                  <strong>{initialStats?.currentStreak ?? 0}</strong>
                  <span>day streak</span>
                </div>
                <div className="game-complete-stat">
                  <Trophy size={17} aria-hidden="true" />
                  <strong>{best ? best.score : summary?.score ?? 0}</strong>
                  <span>personal best</span>
                </div>
              </div>

              {session && (
                <p className="game-complete-hints">
                  <Lightbulb size={14} aria-hidden="true" />
                  {hintsUsed === 0 ? 'Finished without any hints — full points.' : `${hintsUsed} hint${hintsUsed > 1 ? 's' : ''} used (−${hintsUsed * 8}% each).`}
                </p>
              )}

              <div className="game-complete-actions">
                <button type="button" className="btn btn-primary" onClick={exit}>Back to Daily Games</button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setCompletion(null);
                    setCelebrations([]);
                    setHint('');
                    setRetryToken((value) => value + 1);
                  }}
                >
                  Replay the board
                </button>
              </div>
              <p className="game-complete-note">
                Points for this puzzle are already banked — replaying never awards duplicate points.
              </p>
            </Panel>
          ) : (
            <Panel className="game-board-panel">
              <Board
                puzzle={puzzle}
                onComplete={handleComplete}
                onCheck={handleCheck}
                onHint={handleHint}
                hint={hint}
                hintsUsed={hintsUsed}
                maxHints={session?.maxHints ?? 5}
                busy={busy}
              />
            </Panel>
          )}
        </section>

        <RulesPanel
          rules={rules}
          scoring={scoring}
          hint="Points are validated by the server the moment you finish — refreshes never award duplicates."
        />
      </div>

      <Modal
        open={confirmExit}
        onClose={() => setConfirmExit(false)}
        title="Leave this puzzle?"
        description="Your board is only kept while this page is open."
      >
        <div className="game-exit-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setConfirmExit(false)}>Keep playing</button>
          <button type="button" className="btn btn-primary" onClick={exit}>Leave puzzle</button>
        </div>
      </Modal>
    </div>
  );
}
