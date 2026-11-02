import { useCallback, useState } from 'react';
import { Feedback, GameControls, useDragBoard } from './common';

const adjacent = (a, b, size) => {
  const rowA = Math.floor(a / size);
  const colA = a % size;
  const rowB = Math.floor(b / size);
  const colB = b % size;
  return Math.abs(rowA - rowB) + Math.abs(colA - colB) === 1;
};

export default function ZipGame({ puzzle, onComplete, onHint, hint, hintsUsed, maxHints, busy }) {
  const { size, numbers, labelCount } = puzzle.config;
  const total = size * size;
  const [path, setPath] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const onCellStart = useCallback((cell) => {
    if (busy) return;
    const index = cell.index;
    const existing = path.indexOf(index);
    if (existing >= 0) {
      setPath(path.slice(0, existing + 1));
      setFeedback(null);
      return;
    }
    if (path.length === 0 && Number(numbers[index]) !== 1) {
      setFeedback({ tone: 'error', message: 'Start your path on the cell numbered 1.' });
      return;
    }
    if (path.length === 0) {
      setPath([index]);
      setFeedback(null);
      return;
    }
    const last = path[path.length - 1];
    if (adjacent(last, index, size) && path.length < total) {
      setPath([...path, index]);
      setFeedback(null);
    }
  }, [busy, numbers, path, size, total]);

  const onCellMove = useCallback((cell) => {
    const index = cell.index;
    setPath((current) => {
      if (!current.length) return current;
      const existing = current.indexOf(index);
      if (existing >= 0) {
        if (existing === current.length - 1) return current;
        // Dragging back over the path rewinds it instead of crossing it.
        if (existing === current.length - 2) return current.slice(0, -1);
        return current;
      }
      const last = current[current.length - 1];
      if (adjacent(last, index, size) && current.length < total) return [...current, index];
      return current;
    });
  }, [size, total]);

  const onCellEnd = useCallback(() => {
    setFeedback(null);
  }, []);

  const { boardRef, handlers } = useDragBoard({ onCellStart, onCellMove, onCellEnd });

  const undo = () => setPath((current) => current.slice(0, -1));
  const reset = () => {
    setPath([]);
    setFeedback(null);
  };

  const submit = async () => {
    setFeedback(null);
    const result = await onComplete({ path });
    if (result && result.ok === false) setFeedback({ tone: 'error', message: result.message });
  };

  const reached = path.filter((cell) => numbers[cell] !== undefined).length;

  return (
    <div className="game-stage">
      <div
        className="zip-board"
        style={{ '--zip-size': size }}
        ref={boardRef}
        {...handlers}
        role="grid"
        aria-label="Zip path board"
      >
        {Array.from({ length: total }, (_, index) => {
          const position = path.indexOf(index);
          const onPath = position >= 0;
          const label = numbers[index];
          const isEnd = Number(label) === Number(labelCount);
          return (
            <div
              key={index}
              data-cell
              data-index={index}
              data-row={Math.floor(index / size)}
              data-col={index % size}
              className={`zip-cell ${onPath ? 'is-path' : ''} ${label ? 'has-number' : ''} ${isEnd ? 'is-end' : ''}`}
              aria-label={`Cell ${index + 1}${label ? `, number ${label}` : ''}${onPath ? `, path step ${position + 1}` : ''}`}
            >
              {label ? <strong>{label}</strong> : onPath ? <i>{position + 1}</i> : null}
            </div>
          );
        })}
      </div>

      <Feedback tone={feedback ? feedback.tone : 'info'}>
        {feedback
          ? feedback.message
          : hint || `Drag from 1 to cover every cell — ${path.length} of ${total} cells drawn, ${reached} of ${labelCount} numbers reached.`}
      </Feedback>

      <GameControls
        canUndo={path.length > 0}
        canReset={path.length > 0}
        onUndo={undo}
        onReset={reset}
        onHint={onHint}
        hintDisabled={hintsUsed >= maxHints}
        onSubmit={submit}
        submitDisabled={path.length === 0 || busy}
        submitLabel="Check path"
      />
    </div>
  );
}
