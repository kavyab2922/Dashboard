import { useEffect, useState } from 'react';
import { Feedback, GameControls } from './common';

export default function WordQuestGame({ puzzle, reveals, onComplete, onHint, hint, hintsUsed, maxHints, busy }) {
  const { choices = [], clue = '' } = puzzle.config || {};
  const crossedOut = reveals?.eliminatedWords || [];
  const [selected, setSelected] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setSelected('');
    setFeedback(null);
    setSubmitted(false);
  }, [puzzle.id]);

  // A hint can cross out the word that was already picked.
  useEffect(() => {
    if (crossedOut.includes(selected)) setSelected('');
  }, [reveals]);

  const submit = async () => {
    if (!selected || busy) return;
    setSubmitted(true);
    const result = await onComplete({ word: selected });
    if (result?.ok === false) {
      setSubmitted(false);
      setFeedback({ tone: 'error', message: `“${selected}” is not it. Try another word.` });
    }
  };

  const reset = () => { setSelected(''); setFeedback(null); setSubmitted(false); };

  return <div className="game-stage word-quest-stage">
    <div className="word-quest-clue"><span className="game-eyebrow">WORD QUEST</span><h2>{clue}</h2></div>
    <div className="word-quest-choices" role="radiogroup" aria-label="Word candidates">
      {choices.map((word) => {
        const removed = crossedOut.includes(word);
        return <button type="button" role="radio" aria-checked={selected === word} className={`${selected === word ? 'is-selected' : ''} ${removed ? 'is-eliminated' : ''}`} disabled={removed || submitted || busy} key={word} onClick={() => { setSelected(word); setFeedback(null); }}>
          {word}
        </button>;
      })}
    </div>
    <Feedback tone={feedback?.tone || 'info'}>{feedback?.message || hint || 'Pick the word that matches the clue, then lock it in.'}</Feedback>
    <GameControls canReset={Boolean(selected)} onReset={reset} onHint={onHint} hintDisabled={hintsUsed >= maxHints} onSubmit={submit} submitDisabled={!selected || submitted || busy} submitLabel="Lock in word" footer={<span className="game-hint-cost">Each hint crosses out a wrong word · −10% points</span>} />
  </div>;
}
