import QueensGame from './QueensGame';
import PinpointGame from './PinpointGame';
import CrossclimbGame from './CrossclimbGame';
import ZipGame from './ZipGame';
import TangoGame from './TangoGame';
import MiniSudokuGame from './MiniSudokuGame';
import WendGame from './WendGame';
import PatchesGame from './PatchesGame';

/** Maps the hcm.games ids to their board components. */
export const GAME_COMPONENTS = {
  queens: QueensGame,
  pinpoint: PinpointGame,
  crossclimb: CrossclimbGame,
  zip: ZipGame,
  tango: TangoGame,
  'mini-sudoku': MiniSudokuGame,
  wend: WendGame,
  patches: PatchesGame,
};

export default GAME_COMPONENTS;
