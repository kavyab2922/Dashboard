import QueensGame from './QueensGame';
import MiniSudokuGame from './MiniSudokuGame';
import QuizGame from './QuizGame';
import WordQuestGame from './WordQuestGame';
import TriviaGame from './TriviaGame';

/** Maps the four active Daily Games IDs to their board components. */
export const GAME_COMPONENTS = {
  sudoku: MiniSudokuGame,
  quiz: QuizGame,
  word: WordQuestGame,
  trivia: TriviaGame,
};

export default GAME_COMPONENTS;
