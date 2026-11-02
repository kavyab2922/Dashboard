import { useEffect, useMemo, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Feedback, GameControls } from './common';

function rowIssues(cells, size) {
  const issues = new Set();
  for (let row = 0; row < size; row += 1) {
    const slice = cells.slice(row * size, row * size + size);
    const suns = slice.filter((value) => value === 1).length;
    const moons = slice.filter((value) => value === 0).length;
    const filled = suns + moons === size;
    const unbalanced = filled && suns !== moons;
    const run = slice.some((value, index) => index >= 2 && slice[index - 1] === value && slice[index - 2] === value && value !== null);
    if (unbalanced || run) issues.add(row);
  }
  return issues;
}

function colIssues(cells, size) {
  const issues = new Set();
  for (let col = 0; col < size; col += 1) {
    const slice = cells.filter((_, index) => index % size === col);
    const suns = slice.filter((value) => value === 1).length;
    const moons = slice.filter((value) => value === 0).length;
    const filled = suns + moons === size;
    const unbalanced = filled && suns !== moons;
    const run = slice.some((value, index) => index >= 2 && slice[index - 1] === value && slice[index - 2] === value && value !== null);
    if (unbalanced || run) issues.add(col);
  }
  return issues;
}

export default function TangoGame({ puzzle, onComplete, onHint, hint, hintsUsed, maxHints, busy }) {
  const { size, givens, symbolCount } = puzzle.config;
  const [cells, setCells] = useState(() => givens.map((value) => value));
  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setCells(givens.map((value) => value));
    setHistory([]);
    setFeedback(null);
  }, [puzzle.id, givens]);

  const badRows = useMemo(() => rowIssues(cells, size), [cells, size]);
  const badCols = useMemo(() => colIssues(cells, size), [cells, size]);
  const filled = cells.filter((value) => value !== null).length;

  const cycle = (index) => {
    if (busy || givens[index] !== null) return;
    setHistory((prev) => [...prev, cells]);
    setCells((current) => current.map((value, i) => {
      if (i !== index) return value;
      if (value === null) return 1;
      if (value === 1) return 0;
      return null;
    }));
    setFeedback(null);
  };

  const undo = () => {
    if (!history.length) return;
    setCells(history[history.length - 1]);
    setHistory((prev) => prev.slice(0, -1));
  };

  const reset = () => {
    setHistory([]);
    setCells(givens.map((value) => value));
    setFeedback(null);
  };

  const submit = async () => {
    setFeedback(null);
    const result = await onComplete({ cells });
    if (result && result.ok === false) setFeedback({ tone: 'error', message: result.message });
  };

  return (
    <div className="game-stage">
      <div className="tango-legend">
        <span><Sun size={15} aria-hidden="true" /> Sun</span>
        <span><Moon size={15} aria-hidden="true" /> Moon</span>
        <span className="tango-legend-rule">Balanced rows &amp; columns · never three in a row</span>
      </div>

      <div className="tango-board" style={{ '--tango-size': size }} role="grid" aria-label="Tango board">
        {cells.map((value, index) => {
          const row = Math.floor(index / size);
          const col = index % size;
          const given = givens[index] !== null;
          return (
            <button
              type="button"
              role="gridcell"
              key={index}
              data-cell
              data-row={row}
              data-col={col}
              disabled={given || busy}
              className={[
                'tango-cell',
                given ? 'is-given' : '',
                badRows.has(row) || badCols.has(col) ? 'is-conflict' : '',
                value === 1 ? 'is-sun' : value === 0 ? 'is-moon' : '',
              ].join(' ')}
              aria-label={`Row ${row + 1}, column ${col + 1}: ${given ? 'given ' : ''}${value === 1 ? 'sun' : value === 0 ? 'moon' : 'empty'}`}
              onClick={() => cycle(index)}
            >
              {value === 1 ? <Sun size={20} aria-hidden="true" /> : value === 0 ? <Moon size={20} aria-hidden="true" /> : <i />}
            </button>
          );
        })}
      </div>

      <div className="tango-counters" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }} aria-hidden="true">
        {Array.from({ length: size }, (_, col) => {
          const suns = cells.filter((_, index) => index % size === col).filter((value) => value === 1).length;
          const moons = cells.filter((_, index) => index % size === col).filter((value) => value === 0).length;
          return (
            <span key={col} className={badCols.has(col) ? 'is-conflict' : ''}>
              {suns}☀ {moons}☾
            </span>
          );
        })}
      </div>

      <Feedback tone={feedback ? feedback.tone : 'info'}>
        {feedback
          ? feedback.message
          : hint || `${filled} of ${cells.length} cells filled — each row and column needs ${symbolCount} suns and ${symbolCount} moons.`}
      </Feedback>

      <GameControls
        canUndo={history.length > 0}
        canReset={filled > 0}
        onUndo={undo}
        onReset={reset}
        onHint={onHint}
        hintDisabled={hintsUsed >= maxHints}
        onSubmit={submit}
        submitDisabled={busy || filled !== size * size}
        submitLabel="Check board"
      />
    </div>
  );
}
