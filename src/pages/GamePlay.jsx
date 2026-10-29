import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Award, CheckCircle2, Flame, Hourglass, Lightbulb, PartyPopper, Trophy, X,
} from 'lucide-react';
import { dataApi } from '../services/api';
import { useApp } from '../context/AppContext';
import { Modal, Panel } from '../components/common/UI';
import {
  GameIcon, RulesPanel, StatChip, formatElapsed, useTimer, prefersReducedMotion,
} from '../components/games/common';
import GAME_COMPONENTS from '../components/games';
import GameIconRain from '../components/games/GameIconRain';
import VictoryBlast from '../components/games/VictoryBlast';

const DAILY_GAME_ORDER = ['sudoku', 'quiz', 'word', 'trivia'];
const DIFFICULTIES = ['easy', 'medium', 'hard', 'expert', 'master'];

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
  const [duplicateCompletion, setDuplicateCompletion] = useState(false);
  const [showVictoryBlast, setShowVictoryBlast] = useState(false);
  const [celebrations, setCelebrations] = useState([]);
  const [hint, setHint] = useState('');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [busy, setBusy] = useState(false);
  const [completionSubmitting, setCompletionSubmitting] = useState(false);
  const [nextLevelLoading, setNextLevelLoading] = useState(false);
  const [nextLevelError, setNextLevelError] = useState('');
  const [confirmExit, setConfirmExit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState(() => new URLSearchParams(window.location.search).get('difficulty') || 'easy');
  const [level, setLevel] = useState(() => Math.max(1, Number(new URLSearchParams(window.location.search).get('level')) || 1));

  const elapsed = useTimer(Boolean(puzzle) && !completion);
  const Board = GAME_COMPONENTS[gameId];

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [puzzlePayload, statsPayload] = await Promise.all([
        dataApi.dailyGames.puzzle(gameId, { difficulty, level }),
        dataApi.dailyGames.stats().catch(() => null),
      ]);
      const data = puzzlePayload.data;
      setGame(data.game);
      setPuzzle(data.puzzle);
      setDifficulty(data.puzzle.difficulty || difficulty);
      setLevel(Number(data.puzzle.level) || level);
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
  }, [difficulty, gameId, level]);

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
      const payload = await dataApi.dailyGames.hint(gameId, { puzzleId: puzzle?.id, difficulty, level });
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
  }, [busy, difficulty, gameId, level, puzzle?.id, session]);

  const handleCheck = useCallback(async (submission) => {
    setBusy(true);
    try {
      const payload = await dataApi.dailyGames.check(gameId, submission, { puzzleId: puzzle?.id, difficulty, level });
      if (payload.data.hintsUsed !== undefined) setHintsUsed(payload.data.hintsUsed);
      if (payload.data.clues) setPuzzle((current) => (current ? { ...current, revealedClues: payload.data.clues } : current));
      return payload.data;
    } catch (err) {
      return { valid: false, reason: err.message || 'That answer could not be checked.' };
    } finally {
      setBusy(false);
    }
  }, [difficulty, gameId, level, puzzle?.id]);

  const handleComplete = useCallback(async (submission) => {
    if (completionSubmitting || completion || busy) return { ok: false, message: 'Completion is already being processed.' };
    setCompletionSubmitting(true);
    setBusy(true);
    try {
      const payload = await dataApi.dailyGames.complete(gameId, submission, { puzzleId: puzzle?.id, difficulty, level });
      const data = payload.data;
      if (!data?.valid) return { ok: false, message: data?.message || 'That solution is not correct yet.' };
      const isDuplicate = Boolean(data.duplicate);
      setCompletion(data.completion);
      setDuplicateCompletion(isDuplicate);
      setInitialStats(data.stats || data.progress || initialStats);
      const rewardKey = `hrobit-victory:${gameId}:${data.completion?.created_at || data.completion?.completion_ms || 'completed'}`;
      let alreadyCelebrated = false;
      try { alreadyCelebrated = sessionStorage.getItem(rewardKey) === 'shown'; } catch { /* storage may be unavailable */ }
      if (!isDuplicate && !alreadyCelebrated) {
        try { sessionStorage.setItem(rewardKey, 'shown'); } catch { /* animation still works without storage */ }
      }
      setShowVictoryBlast(true);
      setCelebrations(data.celebrations || []);
      if (data.stats?.status) setGame((current) => (current ? { ...current, status: 'completed' } : current));
      return { ok: true, data };
    } catch (err) {
      return { ok: false, message: err.message || 'That solution is not correct yet.' };
    } finally {
      setBusy(false);
      setCompletionSubmitting(false);
    }
  }, [busy, completion, completionSubmitting, difficulty, gameId, initialStats, level, puzzle?.id]);

  const closeVictoryBlast = useCallback(() => setShowVictoryBlast(false), []);

  const dismissCelebration = useCallback((eventKey) => {
    dataApi.dailyGames.acknowledge(eventKey).catch(() => {});
    setCelebrations((current) => current.filter((item) => item.eventKey !== eventKey));
  }, []);

  const exit = useCallback((event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    setConfirmExit(false);
    setShowVictoryBlast(false);
    setCelebrations([]);
    setCompletion(null);
    setPuzzle(null);
    setSession(null);
    setHint('');
    setHintsUsed(0);
    setBusy(false);
    setCompletionSubmitting(false);
    setNextLevelLoading(false);
    setNextLevelError('');
    navigate('/games', { replace: true });
  }, [navigate]);

  const selectDifficulty = (nextDifficulty) => {
    setCompletion(null);
    setHint('');
    setHintsUsed(0);
    setLevel(1);
    setDifficulty(nextDifficulty);
  };

  const nextLevel = async () => {
    if (busy || completionSubmitting || nextLevelLoading) return;
    const targetLevel = level + 1;
    setNextLevelLoading(true);
    setNextLevelError('');
    try {
      const [puzzlePayload, statsPayload] = await Promise.all([
        dataApi.dailyGames.puzzle(gameId, { difficulty, level: targetLevel }),
        dataApi.dailyGames.stats().catch(() => null),
      ]);
      const data = puzzlePayload.data;
      setGame(data.game);
      setPuzzle(data.puzzle);
      setDifficulty(data.puzzle.difficulty || difficulty);
      setLevel(Number(data.puzzle.level) || targetLevel);
      setSession(data.session);
      setHintsUsed(Number(data.session?.hintsUsed) || 0);
      setInitialStats(statsPayload ? statsPayload.data : initialStats);
      setCompletion(null);
      setDuplicateCompletion(false);
      setShowVictoryBlast(false);
      setCelebrations([]);
      setHint('');
    } catch (err) {
      setNextLevelError(err.message || 'The next level could not be loaded. Please retry.');
    } finally {
      setNextLevelLoading(false);
    }
  };

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
    const hasScore = completion.score !== undefined && completion.score !== null;
    const hasElapsed = completion.completion_ms !== undefined && completion.completion_ms !== null;
    return {
      score: hasScore ? Number(completion.score) : null,
      elapsedMs: hasElapsed ? Number(completion.completion_ms) : null,
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
      <GameIconRain gameId={gameId} icon={game?.icon} intensity="subtle" className="game-play-rain" />
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
            {difficulty} · {game?.minutes} min · {game?.points} points · level {level}
            {completion ? ' · completed' : ''}
          </p>
        </div>
        <div className="game-play-options" aria-label="Puzzle options">
          <label htmlFor="game-difficulty">Difficulty</label>
          <select id="game-difficulty" value={difficulty} onChange={(event) => selectDifficulty(event.target.value)} disabled={busy || Boolean(completion)}>
            {DIFFICULTIES.map((option) => <option key={option} value={option}>{option[0].toUpperCase() + option.slice(1)}</option>)}
          </select>
          <span>Level {level}</span>
        </div>
        <div className="game-play-stats">
          <StatChip label="Time" value={completion ? (completion.completion_ms != null ? formatElapsed(completion.completion_ms) : '—') : formatElapsed(elapsed)} icon={Hourglass} />
          <StatChip label="Hints" value={session ? `${hintsUsed}/${session.maxHints}` : '—'} icon={Lightbulb} />
          <StatChip label="Streak" value={initialStats ? `${initialStats.currentStreak}d` : '—'} icon={Flame} />
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
              <h2>Challenge Completed!</h2>
              <p className="game-complete-sub">
                {game?.title} · {difficulty} · level {level}
              </p>

              <div className="game-complete-grid">
                <div className="game-complete-stat">
                  <Trophy size={17} aria-hidden="true" />
                  <strong>{summary?.score ?? completion?.score ?? '—'}</strong>
                  <span>points earned</span>
                </div>
                <div className="game-complete-stat">
                  <Award size={17} aria-hidden="true" />
                  <strong>{completion?.stats?.totalPoints ?? initialStats?.totalPoints ?? '—'}</strong>
                  <span>total points</span>
                </div>
                <div className="game-complete-stat">
                  <Hourglass size={17} aria-hidden="true" />
                  <strong>{summary?.elapsedMs != null ? formatElapsed(summary.elapsedMs) : '—'}</strong>
                  <span>completion time</span>
                </div>
                <div className="game-complete-stat">
                  <Flame size={17} aria-hidden="true" />
                  <strong>{completion?.stats?.currentStreak ?? initialStats?.currentStreak ?? '—'}</strong>
                  <span>day streak</span>
                </div>
                <div className="game-complete-stat">
                  <Trophy size={17} aria-hidden="true" />
                  <strong>{best?.score ?? summary?.score ?? '—'}</strong>
                  <span>personal best</span>
                </div>
              </div>

              {duplicateCompletion && (
                <p className="game-complete-note" role="status">
                  This challenge was already banked earlier. No duplicate reward was added.
                </p>
              )}

              {session && (
                <p className="game-complete-hints">
                  <Lightbulb size={14} aria-hidden="true" />
                  {hintsUsed === 0 ? 'Finished without any hints — full points.' : `${hintsUsed} hint${hintsUsed > 1 ? 's' : ''} used (−${hintsUsed * 10}% each).`}
                </p>
              )}

              <div className="game-complete-actions">
                {nextLevelError && <p className="game-complete-note game-complete-note-error" role="alert">{nextLevelError}</p>}
                <button type="button" className="btn btn-primary" onClick={nextLevel} disabled={busy || completionSubmitting || nextLevelLoading}>{nextLevelLoading ? 'Loading…' : nextLevelError ? 'Retry Next Level' : 'Next Level'}</button>
                <button type="button" className="btn btn-secondary" onClick={exit} disabled={completionSubmitting}>Exit to Games</button>
              </div>
              <p className="game-complete-note">
                This level is complete. Choose Next Level when you are ready; replaying never awards duplicate points.
              </p>
            </Panel>
          ) : (
            <Panel className="game-board-panel">
              <Board
                key={puzzle.id}
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

      {showVictoryBlast && completion && (
        <VictoryBlast
          game={game}
          completion={completion}
          stats={initialStats}
          personalBest={Boolean(best && Number(completion.score || completion.points || 0) >= Number(best.score || 0))}
          duplicate={duplicateCompletion}
          level={level}
          difficulty={difficulty}
          onContinue={nextLevel}
          onBack={exit}
          onClose={closeVictoryBlast}
          nextLevelLoading={nextLevelLoading}
        />
      )}

      <Modal
        open={confirmExit}
        onClose={() => setConfirmExit(false)}
        title="Leave this puzzle?"
        description="Your board is only kept while this page is open."
      >
        <div className="game-exit-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setConfirmExit(false)}>Keep playing</button>
          <button type="button" className="btn btn-primary" onClick={exit}>Exit</button>
        </div>
      </Modal>
    </div>
  );
}
