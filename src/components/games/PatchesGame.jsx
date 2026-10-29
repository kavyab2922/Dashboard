import { useCallback, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Feedback, GameControls } from './common';

function rotated(cells, times) {
  let current = cells;
  for (let i = 0; i < ((times % 4) + 4) % 4; i += 1) {
    const next = current.map(([row, col]) => [col, -row]);
    const minRow = Math.min(...next.map((cell) => cell[0]));
    const minCol = Math.min(...next.map((cell) => cell[1]));
    current = next.map(([row, col]) => [row - minRow, col - minCol]);
  }
  return current;
}

function bounds(cells, originRow, originCol, size) {
  for (const [row, col] of cells) {
    const targetRow = originRow + row;
    const targetCol = originCol + col;
    if (targetRow < 0 || targetRow >= size || targetCol < 0 || targetCol >= size) return false;
  }
  return true;
}

export default function PatchesGame({ puzzle, onComplete, onHint, hint, hintsUsed, maxHints, busy }) {
  const { size, pieces } = puzzle.config;
  const [placements, setPlacements] = useState({});
  const [selected, setSelected] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const occupancy = useMemo(() => {
    const map = new Map();
    for (const piece of pieces) {
      const placement = placements[piece.id];
      if (!placement) continue;
      for (const [row, col] of rotated(piece.cells, placement.rot)) {
        map.set(`${placement.r + row}-${placement.c + col}`, piece.id);
      }
    }
    return map;
  }, [pieces, placements]);

  const occupiedCount = occupancy.size;
  const covered = occupiedCount === size * size;

  const snapshot = () => setHistory((prev) => [...prev, placements]);

  const selectPiece = (id) => {
    setSelected(id);
    setRotation(0);
    setFeedback(null);
  };

  const handleCell = (row, col) => {
    if (busy) return;
    const occupant = occupancy.get(`${row}-${col}`);

    if (!selected) {
      if (occupant) {
        // Lift the piece back off the board so it can be repositioned.
        snapshot();
        setPlacements((current) => {
          const next = { ...current };
          delete next[occupant];
          return next;
        });
        setSelected(occupant);
        setRotation(placements[occupant] ? placements[occupant].rot : 0);
        setFeedback({ tone: 'info', message: `Shape ${occupant} picked up. Rotate it, then tap a cell to drop it.` });
      }
      return;
    }

    const piece = pieces.find((item) => item.id === selected);
    if (!piece) return;
    const cells = rotated(piece.cells, rotation);

    // Never drop a shape on top of another one (the piece being moved is free).
    const free = cells.every(([r, c]) => {
      const target = occupancy.get(`${row + r}-${col + c}`);
      return !target || target === selected;
    });
    if (!bounds(cells, row, col, size)) {
      setFeedback({ tone: 'error', message: `Shape ${selected} would fall off the board.` });
      return;
    }
    if (!free) {
      setFeedback({ tone: 'error', message: `Shape ${selected} would overlap another shape.` });
      return;
    }

    snapshot();
    setPlacements((current) => ({ ...current, [selected]: { r: row, c: col, rot: rotation } }));
    setSelected(null);
    setRotation(0);
    setFeedback(null);
  };

  const turn = () => setRotation((current) => (current + 1) % 4);

  const undo = () => {
    if (!history.length) return;
    setPlacements(history[history.length - 1]);
    setHistory((prev) => prev.slice(0, -1));
    setSelected(null);
    setFeedback(null);
  };

  const reset = () => {
    setHistory([]);
    setPlacements({});
    setSelected(null);
    setRotation(0);
    setFeedback(null);
  };

  const submit = async () => {
    setFeedback(null);
    const result = await onComplete({ placements });
    if (result && result.ok === false) setFeedback({ tone: 'error', message: result.message });
  };

  const rotatePieceCells = useCallback((cells) => rotated(cells, rotation), [rotation]);

  return (
    <div className="game-stage">
      <div className="patches-layout">
        <div className="patches-palette" aria-label="Shapes">
          <div className="patches-palette-title">Shapes</div>
          {pieces.map((piece) => {
            const placed = Boolean(placements[piece.id]);
            const cells = selected === piece.id ? rotatePieceCells(piece.cells) : piece.cells;
            const rows = Math.max(...cells.map((cell) => cell[0])) + 1;
            const cols = Math.max(...cells.map((cell) => cell[1])) + 1;
            return (
              <button
                type="button"
                key={piece.id}
                className={`patches-piece ${selected === piece.id ? 'is-selected' : ''} ${placed ? 'is-placed' : ''}`}
                onClick={() => (placed ? handleCell(placements[piece.id].r, placements[piece.id].c) : selectPiece(piece.id))}
                aria-pressed={selected === piece.id}
                aria-label={`Shape ${piece.id}${placed ? ', placed — tap to pick up' : ''}`}
              >
                <span className="patches-piece-grid" style={{ gridTemplateColumns: `repeat(${cols}, 14px)` }}>
                  {Array.from({ length: rows * cols }, (_, index) => {
                    const row = Math.floor(index / cols);
                    const col = index % cols;
                    const on = cells.some(([r, c]) => r === row && c === col);
                    return <i key={index} className={on ? 'is-on' : ''} />;
                  })}
                </span>
                <small>{piece.id}</small>
              </button>
            );
          })}
          <button type="button" className="btn btn-ghost patches-rotate" onClick={turn} disabled={!selected}>
            <RefreshCw size={15} aria-hidden="true" /> Rotate
          </button>
        </div>

        <div className="patches-board-wrap">
          <div className="patches-board" style={{ '--patches-size': size }} role="grid" aria-label="Patches board">
            {Array.from({ length: size * size }, (_, index) => {
              const row = Math.floor(index / size);
              const col = index % size;
              const occupant = occupancy.get(`${row}-${col}`);
              return (
                <button
                  type="button"
                  key={index}
                  role="gridcell"
                  className={`patches-cell ${occupant ? 'is-filled' : ''} ${selected ? 'is-armed' : ''}`}
                  onClick={() => handleCell(row, col)}
                  aria-label={`Row ${row + 1}, column ${col + 1}${occupant ? `, shape ${occupant}` : ', empty'}`}
                >
                  {occupant ? <span className={`patches-fill tone-${pieces.findIndex((p) => p.id === occupant) % 4}`} /> : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <Feedback tone={feedback ? feedback.tone : 'info'}>
        {feedback
          ? feedback.message
          : hint || `${occupiedCount} of ${size * size} cells covered — every shape must fit with no gaps or overlaps.`}
      </Feedback>

      <GameControls
        canUndo={history.length > 0}
        canReset={occupiedCount > 0}
        onUndo={undo}
        onReset={reset}
        onHint={onHint}
        hintDisabled={hintsUsed >= maxHints}
        onSubmit={submit}
        submitDisabled={!covered || busy}
        submitLabel="Check board"
        footer={<span className="game-hint-cost">{selected ? `Placing ${selected} · rotation ${rotation * 90}°` : 'Pick a shape to place'}</span>}
      />
    </div>
  );
}
