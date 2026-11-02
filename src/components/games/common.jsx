import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowUp, Check, CheckCircle2, CircleDot, Crown, Grid2X2, HelpCircle, Lightbulb, RotateCcw,
  Route, Shapes, Sparkles, Star, SunMoon, Target, Type, Undo2, XCircle,
} from 'lucide-react';

/** Icon names stored in hcm.games mapped to lucide components. */
export const GAME_ICONS = {
  ArrowUp, Check, CheckCircle2, CircleDot, Crown, Grid2X2, Lightbulb, Route,
  Shapes, Sparkles, Star, SunMoon, Target, Type, HelpCircle,
};

/** Region / theme tones used by the games table mapped to design-system tags. */
export const GAME_TONES = {
  purple: 'purple', violet: 'purple', blue: 'blue', mint: 'mint',
  teal: 'mint', gold: 'gold', orange: 'gold', rose: 'rose', slate: 'slate',
};

export function GameIcon({ name, size = 20, ...props }) {
  const Icon = GAME_ICONS[name] || Crown;
  return <Icon size={size} {...props} />;
}

/** Colours used for Queens regions (kept light for contrast with dark glyphs). */
export const REGION_COLORS = [
  '#dbeafe', '#dcfce7', '#fef3c7', '#fce7f3',
  '#e0e7ff', '#ffedd5', '#ccfbf1', '#f3e8ff',
];

export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (event) => setReduced(event.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);
  return reduced;
}

export function formatElapsed(ms) {
  const total = Math.max(0, Math.floor(Number(ms) || 0) / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = Math.floor(total % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** Counts up from the moment the game screen mounts. */
export function useTimer(active = true) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());
  useEffect(() => {
    if (!active) return undefined;
    startRef.current = Date.now();
    setElapsed(0);
    const timer = setInterval(() => setElapsed(Date.now() - startRef.current), 500);
    return () => clearInterval(timer);
  }, [active]);
  return elapsed;
}

/** One-line feedback banner used by every board for validation messages. */
export function Feedback({ tone = 'info', children, action }) {
  if (!children) return null;
  const Icon = tone === 'error' ? XCircle : tone === 'success' ? CheckCircle2 : Lightbulb;
  return (
    <div className={`game-feedback game-feedback-${tone}`} role="status" aria-live="polite">
      <Icon size={17} aria-hidden="true" />
      <span>{children}</span>
      {action}
    </div>
  );
}

/**
 * Standard control strip: every active board exposes the same buttons so labels,
 * spacing and keyboard behaviour stay consistent across the four games.
 */
export function GameControls({
  canUndo, canReset, onUndo, onReset, onHint, onSubmit, submitLabel = 'Check answer',
  hintDisabled, submitDisabled, footer,
}) {
  return (
    <div className="game-controls">
      <div className="game-controls-left">
        {canReset && (
          <button type="button" className="btn btn-ghost" onClick={onReset}>
            <RotateCcw size={15} aria-hidden="true" /> Reset
          </button>
        )}
        {canUndo && (
          <button type="button" className="btn btn-ghost" onClick={onUndo} disabled={!canUndo}>
            <Undo2 size={15} aria-hidden="true" /> Undo
          </button>
        )}
        {onHint && (
          <button type="button" className="btn btn-ghost" onClick={onHint} disabled={hintDisabled}>
            <Lightbulb size={15} aria-hidden="true" /> Hint
          </button>
        )}
      </div>
      <div className="game-controls-right">
        {footer}
        {onSubmit && (
          <button type="button" className="btn btn-primary" onClick={onSubmit} disabled={submitDisabled}>
            <Check size={15} aria-hidden="true" /> {submitLabel}
          </button>
        )}
      </div>
    </div>
  );
}

/** Small labelled stat used in the play-screen header. */
export function StatChip({ label, value, icon: Icon = Check }) {
  return (
    <span className="game-stat-chip">
      <Icon size={14} aria-hidden="true" />
      <span className="game-stat-label">{label}</span>
      <strong>{value}</strong>
    </span>
  );
}

export function RulesPanel({ rules, scoring, hint }) {
  return (
    <aside className="game-rules" aria-label="How to play">
      <div className="game-rules-head">
        <HelpCircle size={16} aria-hidden="true" />
        <h3>How to play</h3>
      </div>
      <ol>
        {rules.map((rule) => <li key={rule}>{rule}</li>)}
      </ol>
      <div className="game-scoring">
        <h4>Scoring</h4>
        <ul>
          {scoring.map((line) => <li key={line}>{line}</li>)}
        </ul>
      </div>
      {hint && <p className="game-rules-note">{hint}</p>}
    </aside>
  );
}

/** Grid coordinates helper shared by the pointer driven boards. */
export function useDragBoard({ onCellStart, onCellMove, onCellEnd }) {
  const [dragging, setDragging] = useState(false);
  const boardRef = useRef(null);

  const cellFromEvent = useCallback((event) => {
    const node = document.elementFromPoint(event.clientX, event.clientY);
    const cell = node && node.closest ? node.closest('[data-cell]') : null;
    if (!cell || !boardRef.current || !boardRef.current.contains(cell)) return null;
    return { row: Number(cell.dataset.row), col: Number(cell.dataset.col), index: Number(cell.dataset.index) };
  }, []);

  const handlePointerDown = useCallback((event) => {
    const cell = cellFromEvent(event);
    if (!cell) return;
    event.preventDefault();
    setDragging(true);
    onCellStart(cell, event);
  }, [cellFromEvent, onCellStart]);

  const handlePointerMove = useCallback((event) => {
    if (!dragging) return;
    const cell = cellFromEvent(event);
    if (cell) onCellMove(cell, event);
  }, [dragging, cellFromEvent, onCellMove]);

  const handlePointerUp = useCallback((event) => {
    if (!dragging) return;
    setDragging(false);
    onCellEnd(cellFromEvent(event), event);
  }, [dragging, cellFromEvent, onCellEnd]);

  useEffect(() => {
    if (!dragging) return undefined;
    const cancel = () => setDragging(false);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', cancel);
    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', cancel);
    };
  }, [dragging, handlePointerUp]);

  return { boardRef, dragging, handlers: { onPointerDown: handlePointerDown, onPointerMove: handlePointerMove } };
}
