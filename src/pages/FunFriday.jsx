import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2, Send, Trophy, Vote, Clock, CheckCircle,
  Plus, Star, Users, X, AlertCircle, XCircle, Trash2, Search
} from 'lucide-react';
import { fridayAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format, parseISO, isPast, differenceInDays } from 'date-fns';
import Avatar from '../components/common/Avatar';
import toast from 'react-hot-toast';
import PageLoader from '../components/common/PageLoader';

const SPRING = { type: 'spring', stiffness: 200, damping: 28 };

const CATEGORY_CONFIG = {
  'team game': { color: '#6366f1', bg: 'rgba(99,102,241,0.15)', icon: '🤝', label: 'Team Game' },
  'online':    { color: '#06b6d4', bg: 'rgba(6,182,212,0.15)',  icon: '💻', label: 'Online' },
  'indoor':    { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', icon: '🏠', label: 'Indoor' },
  'outdoor':   { color: '#10b981', bg: 'rgba(16,185,129,0.15)', icon: '☀️', label: 'Outdoor' },
};

const STATUS_CONFIG = {
  pending:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  label: '⏳ Pending' },
  approved: { color: '#10b981', bg: 'rgba(16,185,129,0.15)', label: '✅ Approved' },
  rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)',  label: '❌ Rejected' },
};

/* ── Confetti Burst (reuse from celebrations logic) ─────────── */
function useMiniConfetti() {
  const burst = (el) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99999;';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const colors = ['#6366f1','#ec4899','#f59e0b','#10b981','#fbbf24'];
    const particles = Array.from({length:60}, () => ({
      x: rect.left + rect.width/2, y: rect.top,
      vx: (Math.random()-0.5)*10, vy: Math.random()*-14-4,
      size: Math.random()*6+3, color: colors[Math.floor(Math.random()*colors.length)],
      opacity:1, life:1, decay: Math.random()*0.025+0.015, gravity:0.5, rot:Math.random()*360, rs:(Math.random()-0.5)*8,
    }));
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      particles.forEach(p => {
        p.x+=p.vx; p.y+=p.vy; p.vy+=p.gravity; p.rot+=p.rs; p.life-=p.decay; p.opacity=Math.max(0,p.life);
        ctx.save(); ctx.globalAlpha=p.opacity; ctx.fillStyle=p.color;
        ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180);
        ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*0.6);
        ctx.restore();
      });
      if (particles.some(p=>p.life>0)) requestAnimationFrame(draw);
      else document.body.removeChild(canvas);
    };
    draw();
  };
  return burst;
}

/* ── Suggest Game Form ─────────────────────────────────────── */
function SuggestGameForm({ user, onSuccess }) {
  const [form, setForm] = useState({ title:'', description:'', category:'indoor', emoji:'🎮' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const burst = useMiniConfetti();

  const EMOJIS = ['🎮','🎲','🏆','🎯','🎨','🧩','🏏','⚽','🎭','🎸','🎪','🕹️'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Give your game a title!'); return; }
    setLoading(true);
    try {
      await fridayAPI.submitSuggestion({
        ...form,
        submittedBy: user?.id || 'emp001',
        submitterName: user?.name || 'Arjun Sharma',
        submitterAvatar: user?.avatar || 'AS',
        submitterPhoto: user?.photo || '',
        submitterColor: user?.color || '#6366f1',
        department: user?.department || 'Engineering',
      });
      setDone(true);
      burst(document.getElementById('suggest-btn'));
      toast.success('🎮 Game suggestion submitted!');
      setTimeout(() => { setDone(false); setForm({ title:'', description:'', category:'indoor', emoji:'🎮' }); onSuccess?.(); }, 2500);
    } catch { toast.error('Failed to submit'); }
    finally { setLoading(false); }
  };

  return (
    <div className="glass-card overflow-hidden"
      style={{ border: '1px solid rgba(99,102,241,0.25)', boxShadow: '0 8px 40px rgba(99,102,241,0.1)' }}>
      <div className="px-6 py-5 flex items-center gap-3"
        style={{ background: 'linear-gradient(90deg, rgba(99,102,241,0.15), transparent)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
          style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' }}>
          🎮
        </div>
        <div>
          <h3 className="text-white font-black text-base">Suggest a Game</h3>
          <p className="text-white/35 text-xs">Got a fun idea? Share it with the team!</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="ok" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0}}
            className="flex flex-col items-center py-10 text-center px-6">
            <motion.div animate={{ rotate:[0,10,-10,0], scale:[1,1.2,1] }} transition={{duration:0.6}}>
              <span className="text-6xl">🎉</span>
            </motion.div>
            <p className="text-white font-black text-lg mt-3">Suggestion Submitted!</p>
            <p className="text-white/45 text-sm mt-1">HR will review your suggestion soon.</p>
            <span className="badge mt-3 text-xs" style={{ background:'rgba(245,158,11,0.15)', color:'#fbbf24', border:'1px solid rgba(245,158,11,0.3)' }}>⏳ Pending Review</span>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Emoji picker */}
            <div>
              <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Pick an Emoji</label>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map(e => (
                  <button key={e} type="button" onClick={() => setForm(f => ({...f, emoji:e}))}
                    className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all"
                    style={{
                      background: form.emoji===e ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
                      border: form.emoji===e ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.08)',
                      transform: form.emoji===e ? 'scale(1.2)' : 'scale(1)',
                    }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Game Title *</label>
              <input type="text" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}
                placeholder="e.g. Office Olympics, Trivia Throwdown…" className="input-field" required />
            </div>

            <div>
              <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Description</label>
              <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                placeholder="How is it played? What makes it fun?" rows={3} className="input-field resize-none" />
            </div>

            <div>
              <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                  <button key={key} type="button" onClick={() => setForm(f=>({...f,category:key}))}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={form.category===key
                      ? { background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40`, boxShadow: `0 0 16px ${cfg.color}25` }
                      : { background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.5)', border:'1px solid rgba(255,255,255,0.08)' }
                    }>
                    <span>{cfg.icon}</span> {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            <button id="suggest-btn" type="submit" disabled={loading}
              className="w-full py-3 rounded-2xl font-black text-white flex items-center justify-center gap-2 transition-all"
              style={{ background:'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow:'0 4px 20px rgba(99,102,241,0.4)' }}>
              {loading ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"/> : <><Send size={16}/>Submit Suggestion</>}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Active Poll ───────────────────────────────────────────── */
function ActivePoll({ poll, userId, onVoted }) {
  const [selected, setSelected] = useState(null);
  const [voting, setVoting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const hasVoted = poll.voters.includes(userId);
  const burst = useMiniConfetti();
  const maxVotes = Math.max(...poll.games.map(g=>g.votes), 1);
  const daysLeft = differenceInDays(parseISO(poll.endDate), new Date());

  const handleVote = async () => {
    if (!selected) { toast.error('Pick a game first!'); return; }
    setVoting(true);
    try {
      await fridayAPI.vote(poll.id, { suggestionId: selected, voterId: userId });
      burst(document.getElementById(`vote-btn-${poll.id}`));
      toast.success('🗳️ Vote cast! May the best game win!');
      setShowResults(true);
      onVoted?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to vote');
    } finally { setVoting(false); }
  };

  return (
    <div className="glass-card overflow-hidden"
      style={{ border:'1px solid rgba(236,72,153,0.25)', boxShadow:'0 8px 40px rgba(236,72,153,0.1)' }}>
      {/* Header */}
      <div className="px-6 py-4"
        style={{ background:'linear-gradient(135deg, rgba(236,72,153,0.12), rgba(99,102,241,0.08))', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Vote size={16} style={{color:'#f472b6'}} />
              <span className="text-white font-black text-base">{poll.title}</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="badge text-xs" style={{background:'rgba(16,185,129,0.15)',color:'#34d399',border:'1px solid rgba(16,185,129,0.3)'}}>
                🟢 Active Poll
              </span>
              <span className="text-white/35 text-xs flex items-center gap-1">
                <Clock size={11}/>
                {daysLeft > 0 ? `Closes in ${daysLeft} day${daysLeft>1?'s':''}` : 'Closing today!'}
              </span>
              <span className="text-white/35 text-xs flex items-center gap-1">
                <Users size={11}/> {poll.totalVotes} votes
              </span>
            </div>
          </div>
          {(hasVoted || showResults) && (
            <button onClick={() => setShowResults(r=>!r)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex-shrink-0"
              style={{background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.6)', border:'1px solid rgba(255,255,255,0.1)'}}>
              {showResults ? 'Hide Results' : '📊 Results'}
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-3">
        {poll.games.map(game => {
          const pct = poll.totalVotes > 0 ? Math.round((game.votes / poll.totalVotes) * 100) : 0;
          const isLeading = game.votes === maxVotes && poll.totalVotes > 0;
          const isSelected = selected === game.suggestionId;

          return (
            <motion.div key={game.suggestionId}
              className="relative overflow-hidden rounded-2xl cursor-pointer transition-all"
              style={{
                border: isSelected ? '1.5px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.08)',
                background: isSelected ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
              }}
              whileHover={!hasVoted ? { scale:1.01 } : {}}
              onClick={() => !hasVoted && setSelected(game.suggestionId)}>

              {/* Vote progress bar (behind content) */}
              {(showResults || hasVoted) && (
                <motion.div className="absolute inset-0 rounded-2xl"
                  initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:1, ease:[0.16,1,0.3,1], delay:0.2}}
                  style={{background: isLeading ? 'rgba(236,72,153,0.1)' : 'rgba(99,102,241,0.07)'}} />
              )}

              <div className="relative z-10 flex items-center gap-3 p-4">
                <span className="text-2xl flex-shrink-0">{game.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm flex items-center gap-2">
                    {game.title}
                    {isLeading && (showResults||hasVoted) && <span className="text-xs">🔥 Leading</span>}
                  </p>
                </div>
                {(showResults || hasVoted) && (
                  <div className="flex-shrink-0 text-right">
                    <p className="font-black text-sm" style={{color: isLeading ? '#f472b6' : 'rgba(255,255,255,0.5)'}}>{pct}%</p>
                    <p className="text-white/25 text-xs">{game.votes} vote{game.votes!==1?'s':''}</p>
                  </div>
                )}
                {!hasVoted && !showResults && (
                  <div className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                    style={{borderColor: isSelected ? '#6366f1' : 'rgba(255,255,255,0.2)', background: isSelected ? '#6366f1' : 'transparent'}}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white"/>}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {!hasVoted && (
          <button id={`vote-btn-${poll.id}`} onClick={handleVote} disabled={voting || !selected}
            className="w-full py-3 rounded-2xl font-black text-white flex items-center justify-center gap-2 mt-2 transition-all"
            style={selected
              ? {background:'linear-gradient(135deg, #ec4899, #f43f5e)', boxShadow:'0 4px 20px rgba(236,72,153,0.4)'}
              : {background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.3)'}
            }>
            {voting ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"/> : <><Vote size={16}/> Cast My Vote</>}
          </button>
        )}

        {hasVoted && !showResults && (
          <div className="flex items-center justify-center gap-2 py-3 rounded-2xl"
            style={{background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)'}}>
            <CheckCircle size={16} className="text-emerald-400"/>
            <span className="text-emerald-400 text-sm font-bold">You've voted! Results update live.</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Past Winners ──────────────────────────────────────────── */
function PastWinners({ polls }) {
  const archived = polls.filter(p => p.status === 'archived' && p.winner);

  if (!archived.length) return (
    <div className="glass-card p-8 text-center">
      <span className="text-5xl">🏆</span>
      <p className="text-white/40 text-sm mt-3">No past winners yet — be the first!</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {archived.map((poll, i) => (
        <motion.div key={poll.id}
          initial={{opacity:0, y:12}} animate={{opacity:1, y:0}}
          transition={{...SPRING, delay:i*0.07}}
          className="glass-card p-5"
          style={{border:'1px solid rgba(245,158,11,0.2)', background:'linear-gradient(135deg, rgba(245,158,11,0.05), rgba(251,146,60,0.03))'}}>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.3)', boxShadow:'0 4px 16px rgba(245,158,11,0.2)'}}>
              {poll.winner.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="badge text-xs font-black"
                  style={{background:'rgba(245,158,11,0.2)', color:'#fbbf24', border:'1px solid rgba(245,158,11,0.35)'}}>
                  🏆 This Friday's Game
                </span>
                <span className="text-white/25 text-xs">{poll.title.replace('Fun Friday — ','')}</span>
              </div>
              <h3 className="text-white font-black text-lg">{poll.winner.title}</h3>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-white/45 text-xs flex items-center gap-1">
                  <Users size={11}/> {poll.totalVotes} total votes
                </span>
                <span className="font-bold text-xs" style={{color:'#fbbf24'}}>
                  {poll.winner.votes} votes won ({Math.round((poll.winner.votes/poll.totalVotes)*100)}%)
                </span>
              </div>
              {/* Mini bar chart of all options */}
              <div className="flex items-end gap-1 mt-3 h-8">
                {poll.games.sort((a,b)=>b.votes-a.votes).map(g => {
                  const h = Math.max(8, Math.round((g.votes/poll.totalVotes)*100*0.32));
                  const isWinner = g.suggestionId === poll.winner.suggestionId;
                  return (
                    <div key={g.suggestionId} className="flex flex-col items-center gap-1 flex-1" title={`${g.title}: ${g.votes} votes`}>
                      <div className="w-full rounded-t-lg transition-all"
                        style={{height:`${h}px`, background: isWinner ? 'linear-gradient(180deg, #fbbf24, #f59e0b)' : 'rgba(255,255,255,0.08)', boxShadow: isWinner ? '0 0 8px rgba(251,191,36,0.4)' : 'none'}}/>
                      <span className="text-[9px]">{g.emoji}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ── My Suggestions ────────────────────────────────────────── */
function MySuggestions({ userId, suggestions }) {
  const mine = suggestions.filter(s => s.submittedBy === userId);
  if (!mine.length) return null;

  return (
    <div className="glass-card p-5">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Star size={15} style={{color:'#fbbf24'}}/> My Suggestions
      </h3>
      <div className="space-y-2">
        {mine.map(s => {
          const st = STATUS_CONFIG[s.status] || STATUS_CONFIG.pending;
          const cat = CATEGORY_CONFIG[s.category] || CATEGORY_CONFIG.indoor;
          return (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl"
              style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)'}}>
              <span className="text-xl flex-shrink-0">{s.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white/80 text-sm font-semibold truncate">{s.title}</p>
                <span className="text-xs" style={{color:cat.color}}>{cat.icon} {cat.label}</span>
              </div>
              <span className="badge text-xs flex-shrink-0 font-bold"
                style={{background:st.bg, color:st.color, border:`1px solid ${st.color}30`}}>
                {st.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Admin Friday View ─────────────────────────────────────── */
function AdminFridayView({ suggestions, polls, onRefresh }) {
  const [tab, setTab] = useState('suggestions');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [pollForm, setPollForm] = useState({ title:'', selectedGames:[], startDate:'', endDate:'' });
  const [creating, setCreating] = useState(false);

  const STATUS_COLORS = {
    pending:  { bg:'rgba(245,158,11,0.15)', color:'#fbbf24' },
    approved: { bg:'rgba(16,185,129,0.15)', color:'#34d399' },
    rejected: { bg:'rgba(239,68,68,0.12)', color:'#f87171' },
  };
  const POLL_COLORS = {
    active:   { bg:'rgba(16,185,129,0.15)', color:'#34d399' },
    closed:   { bg:'rgba(245,158,11,0.12)', color:'#fbbf24' },
    archived: { bg:'rgba(99,102,241,0.12)', color:'#a5b4fc' },
  };

  const handleSuggestionAction = async (id, action) => {
    await fridayAPI.updateSuggestion(id, { status: action });
    toast.success(`Suggestion ${action}!`);
    onRefresh();
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this suggestion?')) return;
    await fridayAPI.deleteSuggestion(id);
    toast.success('Deleted'); onRefresh();
  };
  const handlePollAction = async (id, action) => {
    await fridayAPI.updatePoll(id, { action });
    toast.success(`Poll ${action}d!`); onRefresh();
  };
  const toggleGame = (id) => setPollForm(f => ({
    ...f, selectedGames: f.selectedGames.includes(id) ? f.selectedGames.filter(g=>g!==id) : [...f.selectedGames, id],
  }));
  const handleCreatePoll = async () => {
    if (!pollForm.title || !pollForm.startDate || !pollForm.endDate || pollForm.selectedGames.length < 2) {
      toast.error('Fill all fields & select at least 2 games'); return;
    }
    setCreating(true);
    const approvedMap = suggestions.filter(s=>s.status==='approved').reduce((m,s)=>{m[s.id]=s;return m;},{});
    try {
      await fridayAPI.createPoll({
        title: pollForm.title, startDate: pollForm.startDate, endDate: pollForm.endDate,
        games: pollForm.selectedGames.map(id => ({ suggestionId:id, title:approvedMap[id]?.title||'', emoji:approvedMap[id]?.emoji||'🎮' })),
      });
      toast.success('🎮 Poll created & activated!');
      setPollForm({title:'',selectedGames:[],startDate:'',endDate:''});
      setTab('polls'); onRefresh();
    } catch { toast.error('Failed'); }
    finally { setCreating(false); }
  };

  const filtered = suggestions
    .filter(s => filterStatus==='all' || s.status===filterStatus)
    .filter(s => !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.submitterName.toLowerCase().includes(search.toLowerCase()));
  const approved = suggestions.filter(s=>s.status==='approved');

  return (
    <div className="space-y-5">
      {/* Admin tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id:'suggestions', label:`🎲 Suggestions`, count: suggestions.filter(s=>s.status==='pending').length },
          { id:'polls',       label:`🗳️ Polls & Results` },
          { id:'create',      label:`➕ Create Poll` },
        ].map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${tab!==t.id ? 'funfriday-tab-inactive' : ''}`}
            style={tab===t.id
              ? {background:'linear-gradient(135deg,#ec4899,#6366f1)',color:'white',boxShadow:'0 4px 16px rgba(236,72,153,0.3)'}
              : {background:'rgba(255,255,255,0.05)',color:'rgba(255,255,255,0.5)',border:'1px solid rgba(255,255,255,0.08)'}
            }>
            {t.label}
            {t.count > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black"
                style={{background:'rgba(245,158,11,0.25)',color:'#fbbf24'}}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Suggestions Management */}
      {tab==='suggestions' && (
        <div className="glass-card p-5">
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-36">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"/>
              <input type="text" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} className="input-field pl-9 py-2 text-sm w-full"/>
            </div>
            <div className="flex gap-1 flex-wrap">
              {['all','pending','approved','rejected'].map(s=>(
                <button key={s} onClick={()=>setFilterStatus(s)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all"
                  style={filterStatus===s
                    ? {background:'rgba(99,102,241,0.2)',color:'#a5b4fc',border:'1px solid rgba(99,102,241,0.3)'}
                    : {background:'rgba(255,255,255,0.04)',color:'rgba(255,255,255,0.4)',border:'1px solid rgba(255,255,255,0.07)'}
                  }>{s}</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map(s => {
                const sc = STATUS_COLORS[s.status]||STATUS_COLORS.pending;
                return (
                  <motion.div key={s.id} initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0,height:0}}
                    className="flex items-center gap-3 p-3.5 rounded-2xl"
                    style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)'}}>
                    <span className="text-xl flex-shrink-0">{s.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white/80 text-sm font-semibold">{s.title}</p>
                        <span className="badge text-[10px] font-bold" style={{background:sc.bg,color:sc.color}}>{s.status}</span>
                        <span className="text-white/25 text-xs">{s.category}</span>
                      </div>
                      <p className="text-white/35 text-xs mt-0.5">By <strong className="text-white/55">{s.submitterName}</strong> · {s.department}</p>
                      {s.description && <p className="text-white/25 text-xs italic line-clamp-1 mt-0.5">{s.description}</p>}
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {s.status==='pending' && <>
                        <motion.button whileHover={{scale:1.08}} whileTap={{scale:0.92}}
                          onClick={()=>handleSuggestionAction(s.id,'approved')}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                          style={{background:'rgba(16,185,129,0.15)',color:'#34d399',border:'1px solid rgba(16,185,129,0.3)'}}>
                          <CheckCircle size={11}/> Approve
                        </motion.button>
                        <motion.button whileHover={{scale:1.08}} whileTap={{scale:0.92}}
                          onClick={()=>handleSuggestionAction(s.id,'rejected')}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                          style={{background:'rgba(239,68,68,0.12)',color:'#f87171',border:'1px solid rgba(239,68,68,0.25)'}}>
                          <XCircle size={11}/> Reject
                        </motion.button>
                      </>}
                      <motion.button whileHover={{scale:1.08}} whileTap={{scale:0.92}}
                        onClick={()=>handleDelete(s.id)}
                        className="p-1.5 rounded-lg text-xs"
                        style={{background:'rgba(239,68,68,0.08)',color:'rgba(239,68,68,0.6)',border:'1px solid rgba(239,68,68,0.15)'}}>
                        <Trash2 size={13}/>
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {filtered.length===0 && <div className="text-center py-6"><p className="text-white/30 text-sm">No suggestions found</p></div>}
          </div>
        </div>
      )}

      {/* Polls & Results */}
      {tab==='polls' && (
        <div className="space-y-4">
          {polls.length===0
            ? <div className="glass-card p-10 text-center"><Vote size={36} style={{color:'rgba(255,255,255,0.1)'}} className="mx-auto mb-2"/><p className="text-white/30 text-sm">No polls yet</p></div>
            : polls.map(poll => {
              const pc = POLL_COLORS[poll.status]||POLL_COLORS.archived;
              const max = Math.max(...poll.games.map(g=>g.votes),1);
              return (
                <div key={poll.id} className="glass-card p-5" style={{border:`1px solid ${pc.color}20`}}>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h4 className="text-white font-black">{poll.title}</h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="badge text-xs font-bold" style={{background:pc.bg,color:pc.color}}>{poll.status}</span>
                        <span className="text-white/30 text-xs">{poll.totalVotes} votes · {poll.startDate} → {poll.endDate}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {poll.status==='active' && (
                        <motion.button whileHover={{scale:1.05}} onClick={()=>handlePollAction(poll.id,'close')}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                          style={{background:'rgba(245,158,11,0.15)',color:'#fbbf24',border:'1px solid rgba(245,158,11,0.3)'}}>
                          <Clock size={12}/> Close
                        </motion.button>
                      )}
                      {poll.status==='closed' && (
                        <motion.button whileHover={{scale:1.05}} onClick={()=>handlePollAction(poll.id,'archive')}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                          style={{background:'rgba(245,158,11,0.15)',color:'#fbbf24',border:'1px solid rgba(245,158,11,0.3)'}}>
                          <Trophy size={12}/> Declare Winner
                        </motion.button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {poll.games.sort((a,b)=>b.votes-a.votes).map(g => {
                      const pct = poll.totalVotes>0 ? Math.round((g.votes/poll.totalVotes)*100) : 0;
                      const isW = poll.winner?.suggestionId===g.suggestionId;
                      return (
                        <div key={g.suggestionId} className="flex items-center gap-3">
                          <span className="text-base w-6 text-center flex-shrink-0">{g.emoji}</span>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-white/65 text-xs">{g.title} {isW&&poll.status!=='active'?'🏆':''}</span>
                              <span className="text-xs font-bold" style={{color:isW&&poll.status!=='active'?'#fbbf24':'rgba(255,255,255,0.4)'}}>{g.votes} ({pct}%)</span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.06)'}}>
                              <div className="h-full rounded-full" style={{width:`${pct}%`,background:isW&&poll.status!=='active'?'linear-gradient(90deg,#fbbf24,#f59e0b)':'rgba(99,102,241,0.6)'}}/>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          }
        </div>
      )}

      {/* Create Poll */}
      {tab==='create' && (
        <div className="glass-card p-6" style={{border:'1px solid rgba(99,102,241,0.2)'}}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style={{background:'rgba(99,102,241,0.15)'}}>🗳️</div>
            <div><h3 className="text-white font-black">Create New Poll</h3><p className="text-white/35 text-xs">Select approved games & set dates</p></div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Poll Title *</label>
              <input type="text" value={pollForm.title} onChange={e=>setPollForm(f=>({...f,title:e.target.value}))}
                placeholder="e.g. Fun Friday — March 14, 2026 🎮" className="input-field"/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Start Date *</label>
                <input type="date" value={pollForm.startDate} onChange={e=>setPollForm(f=>({...f,startDate:e.target.value}))} className="input-field"/>
              </div>
              <div>
                <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">End Date *</label>
                <input type="date" value={pollForm.endDate} onChange={e=>setPollForm(f=>({...f,endDate:e.target.value}))} min={pollForm.startDate} className="input-field"/>
              </div>
            </div>
            <div>
              <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-3">Select Games * (min 2)</label>
              {approved.length===0
                ? <p className="text-white/30 text-sm text-center py-4">No approved suggestions — approve some first!</p>
                : <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {approved.map(s=>{
                    const sel = pollForm.selectedGames.includes(s.id);
                    return (
                      <button key={s.id} type="button" onClick={()=>toggleGame(s.id)}
                        className="flex items-center gap-2.5 p-3 rounded-xl text-left transition-all"
                        style={sel
                          ? {background:'rgba(99,102,241,0.18)',border:'1px solid rgba(99,102,241,0.4)'}
                          : {background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}
                        }>
                        <span className="text-xl">{s.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/80 text-sm font-semibold truncate">{s.title}</p>
                          <p className="text-white/30 text-xs">{s.category}</p>
                        </div>
                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                          style={{borderColor:sel?'#6366f1':'rgba(255,255,255,0.2)',background:sel?'#6366f1':'transparent'}}>
                          {sel && <CheckCircle size={13} className="text-white"/>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              }
            </div>
            <button onClick={handleCreatePoll} disabled={creating}
              className="w-full py-3 rounded-2xl font-black text-white flex items-center justify-center gap-2"
              style={{background:'linear-gradient(135deg,#ec4899,#6366f1)',boxShadow:'0 4px 20px rgba(236,72,153,0.35)'}}>
              {creating ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"/> : <><Vote size={16}/> Create & Activate Poll</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────── */
export default function FunFriday() {
  const { user } = useAuth();
  const isAdmin = user?.keycloakRoles?.includes('hr-admin');
  const [previewAsEmployee, setPreviewAsEmployee] = useState(false);

  const [activePoll, setActivePoll] = useState(null);
  const [polls, setPolls] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vote');

  const fetchAll = async () => {
    try {
      const [pollData, sugData] = await Promise.all([
        fridayAPI.getPolls(),
        fridayAPI.getSuggestions(),
      ]);
      setPolls(pollData);
      setActivePoll(pollData.find(p => p.status === 'active') || null);
      setSuggestions(sugData);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const pastPolls = polls.filter(p => p.status === 'archived');
  const userId = user?.id || 'emp001';

  const tabs = [
    { id: 'vote',    label: '🗳️ Vote',         show: !!activePoll },
    { id: 'suggest', label: '💡 Suggest',       show: true },
    { id: 'winners', label: '🏆 Past Winners',  show: true },
  ];

  const showAdminView = isAdmin && !previewAsEmployee;

  return (
    <div className="space-y-7 animate-fade-in">

      {/* Hero */}
      <motion.div className="relative overflow-hidden glass-card p-7"
        initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={SPRING}
        style={{
          background:'linear-gradient(135deg, rgba(236,72,153,0.12), rgba(99,102,241,0.08), rgba(245,158,11,0.06))',
          border:'1px solid rgba(236,72,153,0.2)',
          boxShadow:'0 8px 40px rgba(236,72,153,0.1)',
        }}>

        {['🎮','🎲','🎯','🏆','🎉'].map((e, i) => (
          <motion.span key={i} className="absolute text-2xl pointer-events-none select-none opacity-10"
            style={{ top: `${10+i*18}%`, right: `${5+i*4}%` }}
            animate={{ y:[0,-8,0], rotate:[0,10,-10,0] }}
            transition={{ duration:3+i*0.5, repeat:Infinity, delay:i*0.4, ease:'easeInOut' }}>
            {e}
          </motion.span>
        ))}

        <div className="relative z-10 flex flex-col sm:flex-row items-start justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <motion.div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                style={{background:'linear-gradient(135deg, rgba(236,72,153,0.25), rgba(99,102,241,0.15))', border:'1px solid rgba(236,72,153,0.3)'}}
                animate={{rotate:[0,5,-5,0]}} transition={{duration:3, repeat:Infinity, ease:'easeInOut'}}>
                🎮
              </motion.div>
              <div>
                <h1 className="text-white text-2xl font-black tracking-tight"
                  style={{background:'linear-gradient(135deg, #f472b6, #fbbf24, #34d399)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
                  Fun Friday
                </h1>
                <p className="text-white/40 text-sm">
                  {showAdminView ? 'Manage suggestions, polls & declare winners' : 'Vote · Play · Win · Repeat every Friday!'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {activePoll && <span className="badge text-xs font-bold" style={{background:'rgba(16,185,129,0.15)',color:'#34d399',border:'1px solid rgba(16,185,129,0.3)'}}>🟢 Poll Live</span>}
              <span className="badge text-xs" style={{background:'rgba(99,102,241,0.12)',color:'#a5b4fc'}}>{suggestions.filter(s=>s.status==='approved').length} approved games</span>
              <span className="badge text-xs" style={{background:'rgba(245,158,11,0.12)',color:'#fbbf24'}}>{pastPolls.length} past winners</span>
              {isAdmin && showAdminView && (
                <span className="badge text-xs font-bold" style={{background:'rgba(249,115,22,0.15)',color:'#fb923c',border:'1px solid rgba(249,115,22,0.3)'}}>🛡️ Admin View</span>
              )}
            </div>
          </div>

          {/* Admin toggle */}
          {isAdmin && (
            <div className="flex-shrink-0">
              <button onClick={() => setPreviewAsEmployee(p => !p)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all"
                style={previewAsEmployee
                  ? {background:'rgba(236,72,153,0.15)',color:'#f472b6',border:'1px solid rgba(236,72,153,0.3)'}
                  : {background:'rgba(249,115,22,0.12)',color:'#fb923c',border:'1px solid rgba(249,115,22,0.25)'}
                }>
                {previewAsEmployee ? '🛡️ Switch to Admin View' : '👀 Preview Employee View'}
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <PageLoader loading={loading}>
        {/* ── ADMIN VIEW ─────────────────────────────────── */}
        {showAdminView ? (
          <AdminFridayView suggestions={suggestions} polls={polls} onRefresh={fetchAll} />
        ) : (
          /* ── EMPLOYEE VIEW ───────────────────────────── */
          <>
            <div className="flex gap-2 flex-wrap">
              {tabs.filter(t=>t.show).map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${activeTab!==tab.id ? 'funfriday-tab-inactive' : ''}`}
                  style={activeTab===tab.id
                    ? {background:'linear-gradient(135deg, #ec4899, #6366f1)', color:'white', boxShadow:'0 4px 20px rgba(236,72,153,0.35)'}
                    : {background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.5)', border:'1px solid rgba(255,255,255,0.08)'}
                  }>
                  {tab.label}
                  {tab.id==='vote' && activePoll && <span className="ml-2 w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"/>}
                </button>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-5">
                <AnimatePresence mode="wait">
                  {activeTab==='vote' && activePoll && (
                    <motion.div key="vote" initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} exit={{opacity:0,x:16}} transition={SPRING}>
                      <ActivePoll poll={activePoll} userId={userId} onVoted={fetchAll} />
                    </motion.div>
                  )}
                  {activeTab==='vote' && !activePoll && (
                    <motion.div key="no-poll" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                      className="glass-card p-10 text-center">
                      <span className="text-5xl">⏳</span>
                      <p className="text-white font-black text-lg mt-4">No Active Poll Yet</p>
                      <p className="text-white/40 text-sm mt-1">Check back soon — HR posts polls every Thursday!</p>
                      <button onClick={()=>setActiveTab('suggest')} className="btn-primary mt-5 mx-auto">💡 Suggest a Game</button>
                    </motion.div>
                  )}
                  {activeTab==='suggest' && (
                    <motion.div key="suggest" initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} exit={{opacity:0,x:16}} transition={SPRING}>
                      <SuggestGameForm user={user} onSuccess={fetchAll} />
                    </motion.div>
                  )}
                  {activeTab==='winners' && (
                    <motion.div key="winners" initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} exit={{opacity:0,x:16}} transition={SPRING}>
                      <PastWinners polls={polls} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-5">
                <MySuggestions userId={userId} suggestions={suggestions} />
                <div className="glass-card p-5">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Gamepad2 size={15} style={{color:'#ec4899'}}/> Approved Games
                  </h3>
                  <div className="space-y-2">
                    {suggestions.filter(s=>s.status==='approved').map(s => {
                      const cat = CATEGORY_CONFIG[s.category]||CATEGORY_CONFIG.indoor;
                      return (
                        <div key={s.id} className="flex items-center gap-2.5 p-2.5 rounded-xl"
                          style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
                          <span className="text-lg">{s.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white/75 text-xs font-semibold truncate">{s.title}</p>
                            <span className="text-[10px] font-bold" style={{color:cat.color}}>{cat.icon} {cat.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </PageLoader>
    </div>
  );
}
