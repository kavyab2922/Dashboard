import { useEffect, useState } from 'react';
import { Feedback, GameControls } from './common';

export default function WordQuestGame({ puzzle, onComplete, onHint, hint, hintsUsed, maxHints, busy }) {
  const { choices = [], clue = '' } = puzzle.config || {};
  const [selected, setSelected] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setSelected('');
    setFeedback(null);
    setSubmitted(false);
  }, [puzzle.id]);

  const submit = async () => {
    if (!selected || busy) return;
    setSubmitted(true);
    const result = await onComplete({ word: selected });
    if (result?.ok === false) {
      setSubmitted(false);
      setFeedback({ tone: 'error', message: result.message });
    }
  };

  const reset = () => { setSelected(''); setFeedback(null); setSubmitted(false); };

  return <div className="game-stage word-quest-stage">
    <div className="word-quest-clue"><span className="game-eyebrow">WORD QUEST</span><h2>{clue}</h2></div>
    <div className="word-quest-choices" role="radiogroup" aria-label="Word candidates">
      {choices.map((word) => <button type="button" role="radio" aria-checked={selected === word} className={selected === word ? 'is-selected' : ''} disabled={submitted || busy} key={word} onClick={() => setSelected(word)}>{word}</button>)}
    </div>
    <Feedback tone={feedback?.tone || 'info'}>{feedback?.message || hint || 'Select the word that best fits the clue.'}</Feedback>
    <GameControls canReset={Boolean(selected)} onReset={reset} onHint={onHint} hintDisabled={hintsUsed >= maxHints} onSubmit={submit} submitDisabled={!selected || submitted || busy} submitLabel="Lock in word" footer={<span className="game-hint-cost">{choices.length} candidates</span>} />
  </div>;
}
