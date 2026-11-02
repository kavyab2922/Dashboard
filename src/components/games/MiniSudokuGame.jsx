import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Eraser } from 'lucide-react';
import { Feedback, GameControls } from './common';

function conflictsFor(cells, index) {
  const value = cells[index];
  if (!value) return new Set();
  const row = Math.floor(index / 9);
  const col = index % 9;
  const clash = new Set([index]);
  for (let i = 0; i < 81; i += 1) {
    if (cells[i] !== value) continue;
    const otherRow = Math.floor(i / 9);
    const otherCol = i % 9;
    const sameBox = Math.floor(otherRow / 3) === Math.floor(row / 3) && Math.floor(otherCol / 3) === Math.floor(col / 3);
    if (otherRow === row || otherCol === col || sameBox) clash.add(i);
  }
  return clash;
}

export default function MiniSudokuGame({ puzzle, reveals, onComplete, onHint, hint, hintsUsed, maxHints, busy }) {
  const { givens, apiDifficulty } = puzzle.config;
  // Clues plus any cells a hint has filled in; both are locked.
  const locked = useMemo(() => givens.map((value, index) => value || Number(reveals?.cells?.[index]) || 0), [givens, reveals]);
  const [cells, setCells] = useState(() => locked.slice());
  const [selected, setSelected] = useState(() => givens.findIndex((value) => !value));
  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const boardRef = useRef(null);

  useEffect(() => {
    setCells(locked.slice());
    setSelected(givens.findIndex((value) => !value));
    setHistory([]);
    setFeedback(null);
  }, [puzzle.id, givens]);

  // Drop hint-revealed values into the board without clearing the player's other entries.
  useEffect(() => {
    setCells((current) => current.map((value, index) => (locked[index] && !givens[index] ? locked[index] : value)));
  }, [locked, givens]);

  const clashes = useMemo(() => {
    const map = new Map();
    for (let i = 0; i < 81; i += 1) {
      if (!cells[i]) continue;
      const set = conflictsFor(cells, i);
      if (set.size > 1) map.set(i, set);
    }
    return map;
  }, [cells]);

  const filled = cells.filter(Boolean).length;

  const setCell = useCallback((index, value) => {
    if (index < 0 || locked[index]) return;
    setHistory((prev) => [...prev, cells]);
    setCells((current) => current.map((cell, i) => (i === index ? value : cell)));
    setFeedback(null);
  }, [cells, locked]);

  const erase = useCallback(() => setCell(selected, 0), [selected, setCell]);

  const undo = () => {
    if (!history.length) return;
    setCells(history[history.length - 1]);
    setHistory((prev) => prev.slice(0, -1));
  };

  const reset = () => {
    setHistory([]);
    setCells(locked.slice());
    setFeedback(null);
  };

  const move = (delta) => {
    setSelected((current) => Math.max(0, Math.min(80, (current < 0 ? 0 : current) + delta)));
  };

  const handleKey = (event) => {
    if (event.key >= '1' && event.key <= '9') {
      event.preventDefault();
      setCell(selected, Number(event.key));
      return;
    }
    if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') {
      event.preventDefault();
      erase();
      return;
    }
    const moves = { ArrowUp: -9, ArrowDown: 9, ArrowLeft: -1, ArrowRight: 1 };
    if (moves[event.key] !== undefined) {
      event.preventDefault();
      move(moves[event.key]);
    }
  };

  const submit = async () => {
    if (filled < 81) {
      setFeedback({ tone: 'error', message: `${81 - filled} cell${81 - filled === 1 ? ' is' : 's are'} still empty.` });
      return;
    }
    if (clashes.size) {
      setFeedback({ tone: 'error', message: 'Fix the highlighted conflicts before checking.' });
      return;
    }
    setFeedback(null);
    const result = await onComplete({ cells });
    if (result && result.ok === false) setFeedback({ tone: 'error', message: result.message });
  };

  return (
    <div className="game-stage">
      <div
        className={`sudoku-board ${clashes.size ? 'has-conflicts' : ''}`}
        ref={boardRef}
        tabIndex={0}
        role="grid"
        aria-label="Mini Sudoku board"
        onKeyDown={handleKey}
      >
        {cells.map((value, index) => {
          const row = Math.floor(index / 9);
          const col = index % 9;
          const given = Boolean(givens[index]);
          const revealed = !given && Boolean(locked[index]);
          const conflict = clashes.has(index);
          const classes = [
            'sudoku-cell',
            given ? 'is-given' : '',
            revealed ? 'is-revealed' : '',
            conflict ? 'is-conflict' : '',
            selected === index ? 'is-selected' : '',
            (Math.floor(row / 3) + Math.floor(col / 3)) % 2 === 0 ? 'is-box' : '',
            col % 3 === 0 ? 'box-left' : '',
            row % 3 === 0 ? 'box-top' : '',
          ].join(' ');
          return (
            <button
              type="button"
              key={index}
              className={classes}
              aria-label={`Row ${row + 1}, column ${col + 1}${given ? ', clue' : revealed ? ', hint' : ''}${value ? `, ${value}` : ', empty'}${conflict ? ', conflict' : ''}`}
              onClick={() => setSelected(index)}
            >
              {value || ''}
            </button>
          );
        })}
      </div>

      <div className="sudoku-pad" role="group" aria-label="Number pad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
          <button
            type="button"
            key={digit}
            className="sudoku-pad-key"
            disabled={selected < 0 || Boolean(locked[selected])}
            onClick={() => setCell(selected, digit)}
            aria-label={`Enter ${digit}`}
          >
            {digit}
          </button>
        ))}
        <button type="button" className="sudoku-pad-key is-erase" onClick={erase} disabled={selected < 0 || Boolean(locked[selected]) || !cells[selected]} aria-label="Erase cell">
          <Eraser size={16} aria-hidden="true" />
        </button>
      </div>

      <Feedback tone={feedback ? feedback.tone : 'info'}>
        {feedback
          ? feedback.message
          : hint || `${filled} of 81 cells filled${apiDifficulty ? ` · source difficulty ${apiDifficulty}` : ''}. Conflicting cells are highlighted.`}
      </Feedback>

      <GameControls
        canUndo={history.length > 0}
        canReset={filled > locked.filter(Boolean).length}
        onUndo={undo}
        onReset={reset}
        onHint={onHint}
        hintDisabled={hintsUsed >= maxHints}
        onSubmit={submit}
        submitDisabled={busy}
        submitLabel="Check grid"
        footer={<span className="game-hint-cost">{clashes.size ? `${clashes.size} cells in conflict` : 'No conflicts'} · each hint fills a cell (−10%)</span>}
      />
    </div>
  );
}
