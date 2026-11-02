import { useState } from 'react';
import { ArrowUp, Check, XCircle } from 'lucide-react';
import { Feedback, GameControls } from './common';

function TriviaCard({ question, index, value, onChange, disabled }) {
  return (
    <fieldset className="crossclimb-question" disabled={disabled}>
      <legend>
        <span className="crossclimb-question-index">{index + 1}</span>
        <span className="crossclimb-question-category">{question.category}</span>
        <span className={`crossclimb-difficulty difficulty-${question.difficulty.toLowerCase()}`}>{question.difficulty}</span>
      </legend>
      <p>{question.question}</p>
      <div className="crossclimb-choices">
        {question.choices.map((choice, choiceIndex) => (
          <label key={choice} className={`crossclimb-choice ${value === choiceIndex ? 'is-selected' : ''}`}>
            <input
              type="radio"
              name={`trivia-${question.id}`}
              checked={value === choiceIndex}
              onChange={() => onChange(choiceIndex)}
            />
            <span>{choice}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function CrossclimbGame({ puzzle, onComplete, onHint, hint, hintsUsed, maxHints, busy }) {
  const { questions, ladder } = puzzle.config;
  const [answers, setAnswers] = useState(() => questions.map(() => null));
  const [words, setWords] = useState(() => Array.from({ length: Number(ladder.blanks) || 0 }, () => ''));
  const [feedback, setFeedback] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const answeredAll = answers.every((answer) => answer !== null);
  const wordsFilled = words.every((word) => word.trim().length === (ladder.start || '').length);

  const setWord = (index, raw) => {
    const clean = raw.toUpperCase().replace(/[^A-Z]/g, '').slice(0, ladder.start.length);
    setWords((prev) => prev.map((word, i) => (i === index ? clean : word)));
  };

  const reset = () => {
    setAnswers(questions.map(() => null));
    setWords(Array.from({ length: Number(ladder.blanks) || 0 }, () => ''));
    setFeedback(null);
    setSubmitted(false);
  };

  const submit = async () => {
    setFeedback(null);
    setSubmitted(true);
    const result = await onComplete({ answers, words: words.map((word) => word.trim().toUpperCase()) });
    if (result && result.ok === false) {
      setFeedback({ tone: 'error', message: result.message });
      setSubmitted(false);
    }
  };

  return (
    <div className="game-stage">
      <section className="crossclimb-trivia" aria-label="Trivia round">
        <div className="crossclimb-section-title">
          <span>Step 1</span>
          <h3>Trivia warm-up</h3>
          <small>Accuracy adds up to +30% bonus points.</small>
        </div>
        {questions.map((question, index) => (
          <TriviaCard
            key={question.id || index}
            question={question}
            index={index}
            value={answers[index]}
            disabled={submitted || busy}
            onChange={(choice) => setAnswers((prev) => prev.map((answer, i) => (i === index ? choice : answer)))}
          />
        ))}
      </section>

      <section className="crossclimb-ladder" aria-label="Word ladder">
        <div className="crossclimb-section-title">
          <span>Step 2</span>
          <h3>Word ladder</h3>
          <small>Every rung changes exactly one letter.</small>
        </div>

        <div className="ladder">
          <div className="ladder-rung is-fixed">
            <span className="ladder-rung-label">Start</span>
            <strong>{ladder.start}</strong>
          </div>
          {words.map((word, index) => (
            <div className="ladder-rung" key={`rung-${index}`}>
              <span className="ladder-rung-label">Rung {index + 1}</span>
              <input
                value={word}
                maxLength={ladder.start.length}
                disabled={submitted || busy}
                aria-label={`Ladder rung ${index + 1}`}
                onChange={(event) => setWord(index, event.target.value)}
              />
            </div>
          ))}
          <div className="ladder-rung is-fixed">
            <span className="ladder-rung-label">Goal</span>
            <strong>{ladder.end}</strong>
          </div>
        </div>
        <p className="ladder-help">
          Each rung must be a real word of {ladder.start.length} letters, one letter away from the rung above it.
        </p>
      </section>

      <Feedback tone={feedback ? feedback.tone : 'info'}>
        {feedback
          ? feedback.message
          : hint || (answeredAll ? 'Trivia done — finish the ladder to submit.' : 'Answer every trivia question, then complete the ladder.')}
      </Feedback>

      <GameControls
        canReset={answeredAll || words.some(Boolean)}
        onReset={reset}
        onHint={onHint}
        hintDisabled={hintsUsed >= maxHints}
        onSubmit={submit}
        submitDisabled={!answeredAll || !wordsFilled || busy}
        submitLabel="Submit round"
        footer={
          <span className="game-hint-cost">
            <Check size={13} aria-hidden="true" /> {answers.filter((answer) => answer !== null).length}/{questions.length}
            {answeredAll ? '' : ' answered'}
          </span>
        }
      />
      {!answeredAll && (
        <p className="game-fineprint">
          <XCircle size={13} aria-hidden="true" /> Answer all {questions.length} questions before submitting.
        </p>
      )}
      <p className="game-fineprint">
        <ArrowUp size={13} aria-hidden="true" /> Ladder: {ladder.start} → {ladder.end}
      </p>
    </div>
  );
}
