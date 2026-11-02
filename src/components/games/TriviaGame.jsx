import { QuestionBoard } from './QuizGame';

export default function TriviaGame(props) {
  return <QuestionBoard name="trivia" submitLabel="Submit trivia" className="trivia-stage" {...props} />;
}
