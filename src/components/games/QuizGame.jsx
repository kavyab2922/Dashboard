import { useEffect, useState } from 'react';
import { Feedback, GameControls } from './common';

export default function QuizGame({ puzzle, onComplete, onHint, hint, hintsUsed, maxHints, busy }) {
  const questions = puzzle.config?.questions || [];
  const [answers, setAnswers] = useState(() => questions.map(() => null));
  const [feedback, setFeedback] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setAnswers(questions.map(() => null));
    setFeedback(null);
    setSubmitted(false);
  }, [puzzle.id, questions.length]);

  const submit = async () => {
    if (answers.some((answer) => answer === null) || busy) return;
    setSubmitted(true);
    const result = await onComplete({ answers });
    if (result?.ok === false) {
      setSubmitted(false);
      setFeedback({ tone: 'error', message: result.message });
    }
  };

  const reset = () => {
    setAnswers(questions.map(() => null));
    setFeedback(null);
    setSubmitted(false);
  };

  return <div className="game-stage external-quiz-stage">
    <div className="external-question-list">
      {questions.map((question, index) => <fieldset className="external-question" key={question.id || index} disabled={submitted || busy}>
        <legend><span>{index + 1}</span>{question.question}</legend>
        <div className="external-choices">{question.choices.map((choice, choiceIndex) => <label className={answers[index] === choiceIndex ? 'is-selected' : ''} key={`${question.id}-${choiceIndex}`}>
          <input type="radio" name={`quiz-${question.id || index}`} checked={answers[index] === choiceIndex} onChange={() => setAnswers((current) => current.map((value, i) => i === index ? choiceIndex : value))} />
          <span>{choice}</span>
        </label>)}</div>
      </fieldset>)}
    </div>
    <Feedback tone={feedback?.tone || 'info'}>{feedback?.message || hint || `${answers.filter((answer) => answer !== null).length} of ${questions.length} answered.`}</Feedback>
    <GameControls canReset={answers.some((answer) => answer !== null)} onReset={reset} onHint={onHint} hintDisabled={hintsUsed >= maxHints} onSubmit={submit} submitDisabled={submitted || busy || answers.some((answer) => answer === null)} submitLabel="Submit quiz" footer={<span className="game-hint-cost">Difficulty: {puzzle.config?.difficulty}</span>} />
  </div>;
}
