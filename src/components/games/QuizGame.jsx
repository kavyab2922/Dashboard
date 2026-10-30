import { useEffect, useState } from 'react';
import { Feedback, GameControls } from './common';

const LETTERS = 'ABCDEFGH';

/** Multiple-choice board shared by Quiz and Trivia. Hints remove wrong choices. */
export function QuestionBoard({ name, submitLabel, className = '', puzzle, reveals, onComplete, onHint, hint, hintsUsed, maxHints, busy }) {
  const questions = puzzle.config?.questions || [];
  const eliminated = reveals?.eliminated || {};
  const [answers, setAnswers] = useState(() => questions.map(() => null));
  const [feedback, setFeedback] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const reset = () => {
    setAnswers(questions.map(() => null));
    setFeedback(null);
    setSubmitted(false);
  };

  useEffect(reset, [puzzle.id, questions.length]);

  // A hint can remove the choice that was already picked.
  useEffect(() => {
    setAnswers((current) => current.map((answer, index) => (answer !== null && (eliminated[index] || []).includes(answer) ? null : answer)));
  }, [reveals]);

  const choose = (questionIndex, choiceIndex) => {
    setAnswers((current) => current.map((value, i) => (i === questionIndex ? choiceIndex : value)));
    setFeedback(null);
  };

  const answered = answers.filter((answer) => answer !== null).length;

  const submit = async () => {
    if (answered < questions.length || busy) return;
    setSubmitted(true);
    const result = await onComplete({ answers });
    if (result?.ok === false) {
      setSubmitted(false);
      setFeedback({ tone: 'error', message: result.message });
    }
  };

  return <div className={`game-stage external-quiz-stage ${className}`}>
    <div className="external-question-list">
      {questions.map((question, index) => <fieldset className={`external-question ${answers[index] !== null ? 'is-answered' : ''}`} key={question.id || index} disabled={submitted || busy}>
        <legend><span>{index + 1}</span>{question.question}</legend>
        {question.category && <small className="external-question-category">{question.category}</small>}
        <div className="external-choices">{question.choices.map((choice, choiceIndex) => {
          const removed = (eliminated[index] || []).includes(choiceIndex);
          return <label className={`${answers[index] === choiceIndex ? 'is-selected' : ''} ${removed ? 'is-eliminated' : ''}`} key={`${question.id}-${choiceIndex}`}>
            <input type="radio" name={`${name}-${question.id || index}`} checked={answers[index] === choiceIndex} disabled={removed} onChange={() => choose(index, choiceIndex)} />
            <b className="external-choice-letter" aria-hidden="true">{LETTERS[choiceIndex]}</b>
            <span>{choice}</span>
          </label>;
        })}</div>
      </fieldset>)}
    </div>
    <Feedback tone={feedback?.tone || 'info'}>{feedback?.message || hint || `${answered} of ${questions.length} answered.`}</Feedback>
    <GameControls canReset={answered > 0} onReset={reset} onHint={onHint} hintDisabled={hintsUsed >= maxHints} onSubmit={submit} submitDisabled={submitted || busy || answered < questions.length} submitLabel={submitLabel} footer={<span className="game-hint-cost">Each hint removes a wrong answer · −10% points</span>} />
  </div>;
}

export default function QuizGame(props) {
  return <QuestionBoard name="quiz" submitLabel="Submit quiz" {...props} />;
}
