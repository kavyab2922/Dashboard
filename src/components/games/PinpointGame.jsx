import { useState } from 'react';
import { Lightbulb, Search } from 'lucide-react';
import { Feedback, GameControls } from './common';

export default function PinpointGame({ puzzle, onComplete, onCheck, onHint, hint, hintsUsed, maxHints, busy }) {
  const clueCount = Number(puzzle.config.clueCount) || 0;
  const [clues, setClues] = useState(() => (Array.isArray(puzzle.revealedClues) && puzzle.revealedClues.length ? puzzle.revealedClues : []));
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [answered, setAnswered] = useState(false);

  const reveal = async () => {
    const result = await onHint();
    if (result && Array.isArray(result.clues)) setClues(result.clues);
    setFeedback(result && result.hint
      ? { tone: 'info', message: `Clue revealed: “${result.hint}”` }
      : { tone: 'info', message: 'Another clue has been revealed.' });
  };

  const submitGuess = async (event) => {
    if (event) event.preventDefault();
    if (!guess.trim() || busy) return;
    setFeedback(null);
    const result = await onCheck({ answer: guess.trim() });
    if (result && result.valid) {
      setAnswered(true);
      const done = await onComplete({ answer: guess.trim() });
      if (done && done.ok === false) setFeedback({ tone: 'error', message: done.message });
      return;
    }
    if (result && Array.isArray(result.clues)) setClues(result.clues);
    setFeedback({ tone: 'error', message: (result && result.reason) || 'That is not the shared category yet.' });
  };

  const remaining = Math.max(0, clueCount - clues.length);

  return (
    <div className="game-stage">
      <div className="pinpoint-clues">
        {clues.map((clue, index) => (
          <div className={`pinpoint-clue ${index === clues.length - 1 ? 'is-latest' : ''}`} key={`${clue}-${index}`}>
            <span className="pinpoint-clue-index">{String(index + 1).padStart(2, '0')}</span>
            <strong>{clue}</strong>
          </div>
        ))}
        {Array.from({ length: remaining }).map((_, index) => (
          <div className="pinpoint-clue is-hidden" key={`locked-${index}`}>
            <span className="pinpoint-clue-index">{String(clues.length + index + 1).padStart(2, '0')}</span>
            <strong>••••••••</strong>
          </div>
        ))}
      </div>

      <form className="pinpoint-answer" onSubmit={submitGuess}>
        <label className="sr-only" htmlFor="pinpoint-guess">Category name</label>
        <div className="pinpoint-input">
          <Search size={17} aria-hidden="true" />
          <input
            id="pinpoint-guess"
            value={guess}
            disabled={answered || busy}
            autoComplete="off"
            placeholder="Which category connects these clues?"
            onChange={(event) => setGuess(event.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={!guess.trim() || answered || busy}>
          Submit guess
        </button>
      </form>

      <Feedback tone={feedback ? feedback.tone : 'info'}>
        {feedback
          ? feedback.message
          : hint || `All clues share one category. ${clues.length} of ${clueCount} revealed.`}
      </Feedback>

      <GameControls
        canReset={false}
        onReset={null}
        onHint={reveal}
        hintDisabled={hintsUsed >= maxHints || remaining === 0}
        footer={<span className="game-hint-cost">{remaining} clue{remaining === 1 ? '' : 's'} still hidden</span>}
      />
    </div>
  );
}
