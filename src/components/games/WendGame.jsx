import { useCallback, useState } from 'react';
import { Check } from 'lucide-react';
import { Feedback, GameControls, useDragBoard } from './common';

const sign = (value) => (value > 0 ? 1 : value < 0 ? -1 : 0);

/** Straight line (8 directions) from the press cell towards the current cell. */
function lineCells(start, end, size) {
  let deltaRow = end.row - start.row;
  let deltaCol = end.col - start.col;
  if (deltaRow === 0 && deltaCol === 0) return [start];

  // Snap to the dominant axis so diagonal drags stay on a clean line.
  if (deltaRow !== 0 && deltaCol !== 0 && Math.abs(deltaRow) !== Math.abs(deltaCol)) {
    if (Math.abs(deltaRow) > Math.abs(deltaCol)) deltaCol = 0;
    else deltaRow = 0;
  }

  const stepRow = sign(deltaRow);
  const stepCol = sign(deltaCol);
  const steps = Math.max(Math.abs(deltaRow), Math.abs(deltaCol));
  const cells = [];
  for (let i = 0; i <= steps; i += 1) {
    const row = start.row + stepRow * i;
    const col = start.col + stepCol * i;
    if (row < 0 || row >= size || col < 0 || col >= size) break;
    cells.push({ row, col });
  }
  return cells;
}

export default function WendGame({ puzzle, onComplete, onCheck, onHint, hint, hintsUsed, maxHints, busy }) {
  const { size, letters, theme, wordCount, wordLengths } = puzzle.config;
  const [found, setFound] = useState({});
  const [preview, setPreview] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [solved, setSolved] = useState(false);

  const wordOf = useCallback((cells) => cells.map((cell) => letters[cell.row * size + cell.col]).join(''), [letters, size]);

  const onCellStart = useCallback((cell) => {
    if (busy || solved) return;
    setPreview([cell]);
  }, [busy, solved]);

  const onCellMove = useCallback((cell) => {
    setPreview((current) => {
      if (!current || !current.length) return current;
      const next = lineCells(current[0], cell, size);
      if (next.length < 2) return current;
      return next;
    });
  }, [size]);

  const onCellEnd = useCallback(async (cell) => {
    const cells = preview;
    setPreview(null);
    if (!cells || cells.length < 3) return;
    const word = wordOf(cells);
    if (found[word]) {
      setFeedback({ tone: 'info', message: `${word} is already on your list.` });
      return;
    }
    setFeedback({ tone: 'info', message: `Checking “${word}”…` });
    const result = await onCheck({ words: [word] });
    if (result && result.valid) {
      const nextFound = { ...found, [word]: cells };
      setFound(nextFound);
      const remaining = result.details ? result.details.remaining : wordCount - Object.keys(nextFound).length;
      if (remaining <= 0) {
        setSolved(true);
        const done = await onComplete({ words: Object.keys(nextFound) });
        if (done && done.ok === false) {
          setSolved(false);
          setFeedback({ tone: 'error', message: done.message });
        } else {
          setFeedback({ tone: 'success', message: `All ${wordCount} words found.` });
        }
        return;
      }
      setFeedback({ tone: 'success', message: `Found “${word}” — ${remaining} left.` });
      return;
    }
    setFeedback({ tone: 'error', message: (result && result.reason) || 'That selection is not a hidden word.' });
  }, [found, onComplete, onCheck, preview, wordCount, wordOf, solved]);

  const { boardRef, handlers } = useDragBoard({ onCellStart, onCellMove, onCellEnd });

  const previewSet = new Set((preview || []).map((cell) => `${cell.row}-${cell.col}`));
  const foundSet = new Set(Object.values(found).flat().map((cell) => `${cell.row}-${cell.col}`));
  const foundCount = Object.keys(found).length;

  const reset = () => {
    setFound({});
    setPreview(null);
    setFeedback(null);
    setSolved(false);
  };

  return (
    <div className="game-stage">
      <div className="wend-meta">
        <span className="wend-theme">Theme: <strong>{theme}</strong></span>
        <span>{wordCount} words · lengths {wordLengths.join(', ')}</span>
      </div>

      <div
        className="wend-board"
        style={{ '--wend-size': size }}
        ref={boardRef}
        {...handlers}
        role="grid"
        aria-label={`Word grid, theme ${theme}`}
      >
        {letters.map((letter, index) => {
          const row = Math.floor(index / size);
          const col = index % size;
          const key = `${row}-${col}`;
          return (
            <span
              key={key}
              data-cell
              data-row={row}
              data-col={col}
              data-index={index}
              className={`wend-cell ${foundSet.has(key) ? 'is-found' : ''} ${previewSet.has(key) ? 'is-preview' : ''}`}
            >
              {letter}
            </span>
          );
        })}
      </div>

      <div className="wend-found" aria-live="polite">
        {foundCount === 0 ? (
          <span className="wend-found-empty">Drag across neighbouring letters to reveal a word.</span>
        ) : (
          Object.keys(found).map((word) => <span className="wend-chip" key={word}>{word}</span>)
        )}
      </div>

      <Feedback tone={feedback ? feedback.tone : 'info'}>
        {feedback ? feedback.message : hint || `${foundCount} of ${wordCount} words found.`}
      </Feedback>

      <GameControls
        canReset={foundCount > 0}
        onReset={reset}
        onHint={onHint}
        hintDisabled={hintsUsed >= maxHints}
        submitDisabled
        footer={
          <span className="game-hint-cost">
            <Check size={13} aria-hidden="true" /> {foundCount}/{wordCount} found
          </span>
        }
      />
    </div>
  );
}
