import { useEffect, useMemo, useRef, useState } from 'react';
import { Award, ArrowRight, CheckCircle2, Flame, Gamepad2, Trophy, X } from 'lucide-react';
import { GameIcon, GAME_TONES, prefersReducedMotion } from './common';
import { formatElapsed } from './common';

const EFFECTS = {
  sudoku: ['Grid2X2', 'Sparkles', 'Grid2X2'],
  quiz: ['HelpCircle', 'Star', 'Sparkles'],
  word: ['Type', 'Sparkles', 'Type'],
  trivia: ['Lightbulb', 'Star', 'Lightbulb'],
};

function seeded(index, salt = 0) {
  const value = Math.sin((index + 1) * 17.13 + salt * 31.7) * 10000;
  return value - Math.floor(value);
}

function CountUp({ value, reduced }) {
  const target = Number(value) || 0;
  const [shown, setShown] = useState(reduced ? target : 0);
  useEffect(() => {
    if (reduced) { setShown(target); return undefined; }
    let frame;
    const started = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - started) / 850);
      setShown(Math.round(target * (1 - ((1 - progress) ** 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced, target]);
  return shown;
}

export default function VictoryBlast({ game, completion, stats, personalBest, duplicate, level, difficulty, onContinue, onBack, onClose, nextLevelLoading }) {
  const reduced = prefersReducedMotion();
  const closeRef = useRef(null);
  const tone = GAME_TONES[game?.color] || 'blue';
  const effects = useMemo(() => EFFECTS[game?.id] || [game?.icon || 'Crown'], [game?.id, game?.icon]);
  const particles = useMemo(() => Array.from({ length: 28 }, (_, index) => ({
    id: `${game?.id || 'game'}-blast-${index}`,
    name: effects[index % effects.length],
    left: `${Math.round(seeded(index, 1) * 100)}%`,
    top: `${Math.round(34 + seeded(index, 2) * 60)}%`,
    delay: `${Math.round(seeded(index, 3) * 500)}ms`,
    duration: `${700 + Math.round(seeded(index, 4) * 800)}ms`,
    size: `${14 + Math.round(seeded(index, 5) * 14)}px`,
    angle: `${Math.round(seeded(index, 6) * 360)}deg`,
    x: `${Math.round((seeded(index, 7) - 0.5) * 620)}px`,
    y: `${Math.round(-80 - seeded(index, 8) * 230)}px`,
  })), [effects, game?.id]);

  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const points = completion?.score ?? completion?.points ?? 0;
  const streak = stats?.currentStreak ?? 0;
  const total = stats?.totalPoints ?? 0;
  const time = formatElapsed(completion?.completion_ms ?? 0);

  return (
    <div className={`victory-blast tone-${tone}`} role="dialog" aria-modal="true" aria-labelledby="victory-blast-title">
      <div className="victory-blast-backdrop" aria-hidden="true" />
      <div className="victory-blast-particles" aria-hidden="true">
        {particles.map((particle) => (
          <span className="victory-blast-particle" key={particle.id} style={{ left: particle.left, top: particle.top, animationDelay: particle.delay, animationDuration: particle.duration, '--blast-size': particle.size, '--blast-angle': particle.angle, '--blast-x': particle.x, '--blast-y': particle.y }}>
            <GameIcon name={particle.name} size={Number.parseInt(particle.size, 10)} />
          </span>
        ))}
      </div>
      <section className="victory-blast-panel">
        <button ref={closeRef} type="button" className="victory-blast-close" aria-label="Close celebration" onClick={onClose}><X size={18} /></button>
        <span className="victory-blast-kicker"><Gamepad2 size={14} aria-hidden="true" /> Reward secured</span>
        <div className="victory-blast-icon"><GameIcon name={game?.icon} size={42} /><CheckCircle2 className="victory-blast-check" size={20} aria-hidden="true" /></div>
        <h2 id="victory-blast-title">BOOM! CHALLENGE COMPLETED!</h2>
        <p className="victory-blast-game">{game?.title} · {difficulty} · level {level}</p>
        <div className="victory-blast-points"><Award size={21} aria-hidden="true" /><strong>+<CountUp value={points} reduced={reduced} /></strong><span>points earned</span></div>
        <div className="victory-blast-stats">
          <span><Flame size={15} aria-hidden="true" /><strong>{streak}</strong> day streak</span>
          <span><Trophy size={15} aria-hidden="true" /><strong>{total}</strong> total points</span>
          <span><CheckCircle2 size={15} aria-hidden="true" /><strong>{time}</strong> time</span>
        </div>
        <p className="victory-blast-best">{duplicate ? 'This reward was already banked — no duplicate points added.' : personalBest ? 'Personal best secured!' : 'Great solve — keep your streak going!'}</p>
        <div className="victory-blast-actions">
          <button type="button" className="btn btn-primary" onClick={onContinue} disabled={nextLevelLoading}>{nextLevelLoading ? 'Loading…' : 'Next Level'} {!nextLevelLoading && <ArrowRight size={15} aria-hidden="true" />}</button>
          <button type="button" className="btn btn-ghost" onClick={onBack}>Exit to Games</button>
        </div>
      </section>
    </div>
  );
}
