import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, CircleHelp, Flame, Gamepad2, Grid2X2, Lightbulb, RotateCcw, Sparkles, Trophy, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, PageTitle, Panel, Tag } from '../components/common/UI';

const rounds = [
  { clues: ['Orbit', 'Launch', 'Astronaut', 'Gravity'], answer: 'Space', choices: ['Space','Ocean','Garden','Music'], explanation: 'Orbit, launch, astronaut and gravity all connect to space exploration.' },
  { clues: ['Canvas', 'Palette', 'Brush', 'Gallery'], answer: 'Art', choices: ['Art','Cooking','Fitness','Travel'], explanation: 'Canvas, palette, brush and gallery are all closely related to art.' },
  { clues: ['Kernel', 'Terminal', 'Shell', 'Directory'], answer: 'Computing', choices: ['Weather','Computing','Fashion','Theatre'], explanation: 'Kernel, terminal, shell and directory are common computing concepts.' },
];
const gridSolution = [1,3,0,2];

function WordConnections() {
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [complete, setComplete] = useState(false);
  const [score, setScore] = useState(0);
  const round = rounds[roundIndex % rounds.length];
  const choose = (choice) => { if (complete) return; setSelected(choice); setComplete(true); if (choice === round.answer) setScore((value) => value + 1); };
  const next = () => { setRoundIndex((value) => (value + 1) % rounds.length); setSelected(''); setComplete(false); };
  return <div className="game-play-layout"><div className="game-play-intro"><span className="game-play-step">ROUND {(roundIndex % rounds.length) + 1} OF {rounds.length}</span><h2>What connects these clues?</h2><p>Find the idea that ties all four words together. Trust your first instinct.</p><div className="word-clue-grid">{round.clues.map((clue, index) => <div className={`word-clue clue-${index}`} key={clue}><span>{String(index + 1).padStart(2,'0')}</span><strong>{clue}</strong></div>)}</div><div className="word-answer-grid">{round.choices.map((choice) => <button key={choice} className={`word-answer ${selected === choice ? (choice === round.answer ? 'correct' : 'incorrect') : ''}`} disabled={complete} onClick={() => choose(choice)}><span className="answer-letter">{String.fromCharCode(65 + round.choices.indexOf(choice))}</span>{choice}{selected === choice && (choice === round.answer ? <CheckCircle2 size={17}/> : <XCircle size={17}/>)}</button>)}</div>{complete && <div className={`game-feedback ${selected === round.answer ? 'feedback-correct' : 'feedback-incorrect'}`}>{selected === round.answer ? <CheckCircle2 size={18}/> : <Lightbulb size={18}/>}<div><strong>{selected === round.answer ? 'Nicely connected!' : `The connection was ${round.answer}.`}</strong><p>{round.explanation}</p></div></div>}<div className="game-play-actions"><span className="game-score"><Trophy size={15}/> Score: {score}</span>{complete && <Button onClick={next}>Next round <ArrowRight size={15}/></Button>}</div></div><aside className="game-rules-card"><span className="rules-icon"><CircleHelp size={19}/></span><h3>How to play</h3><ol><li>Read all four clue words.</li><li>Choose one answer that connects the clues.</li><li>Find out if your connection is right.</li><li>Try all three short rounds.</li></ol><div className="rules-bottom"><Sparkles size={15}/><span>No timer. Just a little brain break.</span></div></aside></div>;
}

function OrbitGrid() {
  const [placements, setPlacements] = useState({});
  const [checked, setChecked] = useState(false);
  const [hint, setHint] = useState(false);
  const [won, setWon] = useState(false);
  const choose = (row, col) => { setChecked(false); setWon(false); setPlacements((current) => { const next = {...current}; if (next[row] === col) delete next[row]; else next[row] = col; return next; }); };
  const validate = () => { const values = Object.values(placements); const valid = Object.keys(placements).length === 4 && new Set(values).size === 4 && [0,1,2,3].every((row) => placements[row] === gridSolution[row]); setChecked(true); setWon(valid); };
  const reset = () => { setPlacements({}); setChecked(false); setHint(false); setWon(false); };
  return <div className="game-play-layout"><div className="grid-game-main"><span className="game-play-step">LOGIC CHALLENGE · 4 × 4</span><h2>Place one star in each row and column.</h2><p>Tap a cell to place a star. Each row can hold one star, and no two stars can share a column.</p><div className="orbit-grid-board">{Array.from({length:16},(_,index) => { const row = Math.floor(index / 4); const col = index % 4; const active = placements[row] === col; const wrongColumn = checked && active && placements[row] !== gridSolution[row]; return <button key={index} aria-label={`Row ${row+1}, column ${col+1}${active ? ', star placed' : ''}`} className={`orbit-grid-cell ${active ? 'has-star' : ''} ${(row+col)%2 === 0 ? 'cell-light' : 'cell-dark'} ${wrongColumn ? 'cell-wrong' : ''}`} onClick={() => choose(row,col)}>{active ? <span>✦</span> : <i/>}</button>; })}</div>{checked && <div className={`game-feedback ${won ? 'feedback-correct' : 'feedback-incorrect'}`}>{won ? <CheckCircle2 size={18}/> : <Lightbulb size={18}/>}<div><strong>{won ? 'Grid solved!' : 'Not quite there yet.'}</strong><p>{won ? 'You placed one star in each row and column. Nice focus!' : 'Check that you have four stars, one in each row, with no repeated columns. Hint: the correct columns for rows 1–4 are 2, 4, 1, 3.'}</p></div></div>}<div className="game-play-actions"><span className="game-score"><Sparkles size={15}/> {Object.keys(placements).length}/4 stars placed</span><div><Button variant="ghost" onClick={() => setHint(!hint)}>{hint ? 'Hide hint' : 'Need a hint?'}</Button><Button variant="secondary" onClick={reset}><RotateCcw size={15}/> Reset</Button><Button onClick={validate}>Check grid <CheckCircle2 size={15}/></Button></div></div>{hint && <div className="hint-strip"><Lightbulb size={15}/> Try a different column in each row. Your placements are saved as you play.</div>}</div><aside className="game-rules-card"><span className="rules-icon"><Grid2X2 size={19}/></span><h3>Grid rules</h3><ol><li>Fill all four rows.</li><li>Place exactly one star in every row.</li><li>Stars must use different columns.</li><li>Press Check grid to validate your solution.</li></ol><div className="rules-bottom"><Sparkles size={15}/><span>Take your time and think a move ahead.</span></div></aside></div>;
}

export default function Games() {
  const { games, gamesState } = useApp();
  const [active, setActive] = useState('word-connections');
  const [streak, setStreak] = useState(0);
  const playableCount = games.filter((game) => game.available).length;

  useEffect(() => {
    if (!gamesState.loading && !gamesState.error && games.length > 0 && !games.some((game) => game.id === active && game.available)) {
      const firstAvailable = games.find((game) => game.available);
      if (firstAvailable) setActive(firstAvailable.id);
    }
  }, [games, gamesState.loading, gamesState.error, active]);

  return <><PageTitle eyebrow="A SMALL BREAK, A FRESH PERSPECTIVE" title="Daily games" description="Original, bite-sized puzzles made for a few minutes of curiosity and fun."/><div className="games-hero"><div className="games-hero-art"><div className="games-orb orb-one"/><div className="games-orb orb-two"/><div className="games-hero-symbol"><Gamepad2 size={35}/></div><span className="games-hero-spark gs-one">✦</span><span className="games-hero-spark gs-two">✧</span></div><div className="games-hero-copy"><Tag tone="purple">TODAY'S BRAIN BREAK</Tag><h2>Play a little. Think a little differently.</h2><p>Quick puzzles can be a nice way to reset between tasks. No leaderboard or pressure — just you and a new challenge.</p><div className="games-hero-stats"><span><Flame size={16}/><strong>{streak}</strong> day demo streak</span><span><Sparkles size={16}/><strong>{gamesState.loading ? '…' : playableCount}</strong> playable puzzles</span></div></div></div><div className="games-page-heading"><div><h2>Choose your challenge</h2><p>Original puzzle mechanics · no third-party game embeds</p></div><span className="games-daily-chip"><span/> DAILY PLAY</span></div>{gamesState.loading ? <Panel><p className="muted">Loading games…</p></Panel> : gamesState.error ? <Panel><p className="muted">Unable to load games: {gamesState.error}</p></Panel> : games.length === 0 ? <Panel><p className="muted">No games available yet.</p></Panel> : <div className="games-pick-grid">{games.map((game) => <button key={game.id} className={`game-pick-card ${active === game.id ? 'selected' : ''}`} onClick={() => game.available && setActive(game.id)} disabled={!game.available}><span className={`game-pick-icon ${game.color}`}>{game.id === 'orbit-grid' ? <Grid2X2 size={21}/> : game.id === 'word-connections' ? <Lightbulb size={21}/> : <Sparkles size={21}/>}</span><span className="game-pick-info"><strong>{game.title}</strong><small>{game.subtitle}</small></span><Tag tone={game.available ? (game.difficulty === 'Easy' ? 'mint' : 'purple') : 'slate'}>{game.difficulty}</Tag>{active === game.id && <span className="game-pick-selected"><CheckCircle2 size={15}/></span>}</button>)}</div>}<Panel className="game-play-panel"><div className="game-panel-top"><div><span className="game-panel-kicker"><Sparkles size={13}/> READY WHEN YOU ARE</span><h2>{active === 'orbit-grid' ? 'Orbit Grid' : 'Word Connections'}</h2></div><Tag tone="mint">Playable demo</Tag></div>{active === 'orbit-grid' ? <OrbitGrid/> : <WordConnections/>}</Panel><p className="demo-inline-note">Games are original UI prototypes. Progress and streaks are not tracked by a backend.</p></>;
}
