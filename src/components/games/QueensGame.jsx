import { useState } from 'react';
import { Crown } from 'lucide-react';
import { Feedback, GameControls, REGION_COLORS } from './common';

function conflictsAt(row, col, queens, regions) {
  for (const [qr, qc] of queens) {
    if (qr === row && qc === col) continue;
    if (qr === row) return 'Each row can hold exactly one queen.';
    if (qc === col) return 'Each column can hold exactly one queen.';
    if (regions[qr][qc] === regions[row][col]) return 'Two queens cannot share the same coloured region.';
    if (Math.abs(qr - row) <= 1 && Math.abs(qc - col) <= 1) return 'Queens may never touch — not even diagonally.';
  }
  return null;
}

export default function QueensGame({ puzzle, onComplete, onHint, hint, hintsUsed, maxHints, busy }) {
  const { size, regions } = puzzle.config;
  const [queens, setQueens] = useState([]);
  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const toggle = (row, col) => {
    if (busy) return;
    const exists = queens.some(([r, c]) => r === row && c === col);
    if (exists) {
      setHistory((prev) => [...prev, queens]);
      setQueens(queens.filter(([r, c]) => !(r === row && c === col)));
      setFeedback(null);
      return;
    }
    const reason = conflictsAt(row, col, queens, regions);
    if (reason) {
      setFeedback({ tone: 'error', message: reason });
      return;
    }
    setHistory((prev) => [...prev, queens]);
    setQueens([...queens, [row, col]]);
    setFeedback(null);
  };

  const undo = () => {
    if (!history.length) return;
    setQueens(history[history.length - 1]);
    setHistory((prev) => prev.slice(0, -1));
    setFeedback(null);
  };

  const reset = () => {
    setQueens([]);
    setHistory([]);
    setFeedback(null);
  };

  const submit = async () => {
    setFeedback(null);
    const result = await onComplete({ cells: queens });
    if (result && result.ok === false) {
      setFeedback({ tone: 'error', message: result.message });
    }
  };

  const filled = queens.length;
  const ready = filled === size;

  return (
    <div className="game-stage">
      <div className="queens-board" style={{ '--queens-size': size }} role="grid" aria-label="Queens board">
        {regions.map((row, rowIndex) =>
          row.map((region, colIndex) => {
            const hasQueen = queens.some(([r, c]) => r === rowIndex && c === colIndex);
            const thick = '2px solid rgba(15, 23, 42, 0.28)';
            const thin = '1px solid rgba(15, 23, 42, 0.08)';
            const rightEdge = colIndex < size - 1 && regions[rowIndex][colIndex + 1] !== region;
            const bottomEdge = rowIndex < size - 1 && regions[rowIndex + 1][colIndex] !== region;
            return (
              <button
                type="button"
                role="gridcell"
                key={`${rowIndex}-${colIndex}`}
                data-cell
                data-row={rowIndex}
                data-col={colIndex}
                className={`queens-cell ${hasQueen ? 'has-queen' : ''}`}
                style={{
                  background: REGION_COLORS[region % REGION_COLORS.length],
                  borderLeft: colIndex === 0 ? thick : thin,
                  borderTop: rowIndex === 0 ? thick : thin,
                  borderRight: rightEdge ? thick : thin,
                  borderBottom: bottomEdge ? thick : thin,
                }}
                aria-label={`Row ${rowIndex + 1}, column ${colIndex + 1}${hasQueen ? ', queen placed' : ''}`}
                aria-pressed={hasQueen}
                onClick={() => toggle(rowIndex, colIndex)}
              >
                {hasQueen && <Crown size={20} aria-hidden="true" />}
              </button>
            );
          })
        )}
      </div>

      <Feedback tone={feedback ? feedback.tone : 'info'}>
        {feedback ? feedback.message : hint || `Place one queen in every row, column and region — ${filled} of ${size} placed.`}
      </Feedback>

      <GameControls
        canUndo={history.length > 0}
        canReset={filled > 0}
        onUndo={undo}
        onReset={reset}
        onHint={onHint}
        hintDisabled={hintsUsed >= maxHints}
        onSubmit={submit}
        submitDisabled={!ready || busy}
        submitLabel="Check board"
      />
    </div>
  );
}
