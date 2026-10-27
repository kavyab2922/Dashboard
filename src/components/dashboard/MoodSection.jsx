import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Lock, Search, Sparkles, UserRoundCheck, Users, X } from 'lucide-react';
import { Panel, PanelHeading } from '../common/UI';
import { useApp } from '../../context/AppContext';
import { dataApi } from '../../services/api';

const STORAGE_KEY = 'hrobit-mood-checkin';
const MOODS = [
  { id: 'amazing', emoji: '😄', label: 'Amazing' },
  { id: 'happy', emoji: '😊', label: 'Happy' },
  { id: 'calm', emoji: '😌', label: 'Calm' },
  { id: 'okay', emoji: '😐', label: 'Okay' },
  { id: 'sad', emoji: '😔', label: 'Sad' },
  { id: 'stressed', emoji: '😫', label: 'Stressed' },
];
const VISIBILITY_OPTIONS = [
  { id: 'private', label: 'Only Me', hint: 'Keep your mood private. Only you can see it.', Icon: Lock, tone: 'neutral' },
  { id: 'colleagues', label: 'Everyone at HROrbit', hint: 'Let colleagues see your mood and interact with you.', Icon: Users, tone: 'teal' },
  { id: 'selected', label: 'Selected Colleagues', hint: 'Choose exactly who can see your mood.', Icon: UserRoundCheck, tone: 'lavender' },
];
const todayKey = () => new Date().toISOString().slice(0, 10);
function readLocal() { try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); return saved?.date === todayKey() ? saved : null; } catch { return null; } }

export default function MoodSection() {
  const { setToast } = useApp();
  const [state, setState] = useState(readLocal);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState('');
  const [error, setError] = useState('');
  const [celebrating, setCelebrating] = useState(false);
  const previousMood = useRef(state?.mood || null);

  useEffect(() => {
    let cancelled = false;
    dataApi.moods.state().then(({ data }) => {
      if (!cancelled && data?.mood) {
        setState({ date: todayKey(), mood: data.mood.mood, visibility: data.mood.visibility });
        setSelectedEmployees(data.selectedEmployeeIds || []);
        previousMood.current = data.mood.mood;
      }
    }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (state?.visibility !== 'selected' || employees.length) return;
    let cancelled = false;
    setEmployeesLoading(true); setEmployeesError('');
    dataApi.employees.list().then(({ data }) => { if (!cancelled) setEmployees(Array.isArray(data) ? data : []); })
      .catch((err) => { if (!cancelled) setEmployeesError(err.message || 'Unable to load colleagues.'); })
      .finally(() => { if (!cancelled) setEmployeesLoading(false); });
    return () => { cancelled = true; };
  }, [state?.visibility, employees.length]);

  useEffect(() => {
    if (!celebrating) return undefined;
    const timer = window.setTimeout(() => setCelebrating(false), 2600);
    return () => window.clearTimeout(timer);
  }, [celebrating]);

  const choose = (mood) => {
    const next = { date: todayKey(), mood, visibility: state?.visibility || 'private' };
    setState(next); setError('');
    if (['amazing', 'happy'].includes(mood) && !['amazing', 'happy'].includes(previousMood.current)) setCelebrating(true);
    previousMood.current = mood;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* session state remains available */ }
  };
  const selectVisibility = (visibility) => { setState((current) => ({ ...current, visibility })); setError(''); setQuery(''); };
  const save = async (visibility = state?.visibility || 'private') => {
    if (!state?.mood || saving) return;
    if (visibility === 'selected' && selectedEmployees.length === 0) { setError('Choose at least one colleague before saving.'); return; }
    setSaving(true); setError('');
    try {
      await dataApi.moods.save({ mood: state.mood, visibility, selectedEmployeeIds: visibility === 'selected' ? selectedEmployees : [] });
      const next = { ...state, visibility };
      setState(next);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore unavailable storage */ }
      setToast?.('Your mood sharing preference was saved.');
    } catch (err) { setError(err.message || 'Unable to save your sharing preference.'); }
    finally { setSaving(false); }
  };
  const selectedMood = MOODS.find((mood) => mood.id === state?.mood);
  const selectedSet = new Set(selectedEmployees);
  const filteredEmployees = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return employees;
    return employees.filter((employee) => `${employee.name || ''} ${employee.email || ''} ${employee.role || ''} ${employee.team || ''}`.toLowerCase().includes(value));
  }, [employees, query]);
  const selectedPeople = employees.filter((employee) => selectedSet.has(String(employee.id)));
  const addEmployee = (id) => setSelectedEmployees((current) => current.includes(String(id)) ? current : [...current, String(id)]);
  const removeEmployee = (id) => setSelectedEmployees((current) => current.filter((item) => item !== String(id)));

  return <Panel className="mood-panel wellness-mood-panel">
    <div className="wellness-decor wellness-decor-top" aria-hidden="true"><span className="wellness-balloon balloon-teal"/><span className="wellness-balloon balloon-lavender"/><span className="wellness-sparkle sparkle-one">✦</span><span className="wellness-sparkle sparkle-two">✧</span></div>
    <PanelHeading title="How are you feeling today?" subtitle="A quick daily check-in — you choose what feels right for you." action={selectedMood ? <span className="mood-checked-pill"><Check size={13}/> Checked in today</span> : null}/>
    <div className="mood-options" role="group" aria-label="Daily mood options">
      {MOODS.map((mood) => <button key={mood.id} type="button" className="mood-option" aria-pressed={state?.mood === mood.id} aria-label={`I'm feeling ${mood.label}`} onClick={() => choose(mood.id)}><span className="mood-emoji" aria-hidden="true">{mood.emoji}</span><span className="mood-label">{mood.label}</span>{state?.mood === mood.id && <span className="mood-selected-badge" aria-hidden="true"><Check size={11} strokeWidth={3}/></span>}</button>)}
    </div>
    <div className="mood-footer" aria-live="polite">
      {selectedMood ? <>
        {selectedMood.id === 'amazing' || selectedMood.id === 'happy' ? <div className={`wellness-celebration-card ${celebrating ? 'is-celebrating' : ''}`}><div className="wellness-paper-layer paper-back"/><div className="wellness-paper-layer paper-front"/><div className="wellness-ribbon" aria-hidden="true"/><div className="wellness-confetti" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div><div className="wellness-card-content"><span className="wellness-eyebrow"><Sparkles size={13}/> A bright moment</span><h3>Your happiness is worth celebrating! 🎉</h3><p>{selectedMood.emoji} You're feeling <strong>{selectedMood.label.toLowerCase()}</strong> today. Keep that good energy going.</p><div className="wellness-card-actions"><button type="button" className="btn btn-secondary btn-small" onClick={() => save('colleagues')}><Sparkles size={14}/> Share My Mood</button><span className="wellness-card-note">You’re always in control of who sees it.</span></div></div></div> : <p className="mood-confirm"><span>Thanks for checking in! 💙</span><small>You're feeling {selectedMood.label.toLowerCase()} today — you can change it anytime.</small></p>}
        <div className="mood-sharing"><div className="mood-sharing-heading"><div><strong>Who can see this mood?</strong><small>Employees control their own mood visibility. You can change or revoke sharing anytime.</small></div><ChevronDown size={16} aria-hidden="true"/></div><div className="mood-visibility-options" role="radiogroup" aria-label="Mood visibility">{VISIBILITY_OPTIONS.map(({ id, label, hint, Icon, tone }) => <button type="button" role="radio" aria-checked={state.visibility === id} key={id} className={`mood-visibility-option mood-visibility-${tone} ${state.visibility === id ? 'active' : ''}`} onClick={() => selectVisibility(id)}><span className="mood-visibility-icon"><Icon size={17}/></span><span className="mood-visibility-copy"><b>{label}</b><small>{hint}</small></span>{state.visibility === id && <span className="mood-visibility-check" aria-hidden="true"><Check size={13}/></span>}</button>)}</div>
          {state.visibility === 'selected' && <div className="mood-colleague-picker"><div className="mood-picker-heading"><div><label htmlFor="mood-colleague-search">Choose colleagues</label><small>{selectedEmployees.length} {selectedEmployees.length === 1 ? 'colleague' : 'colleagues'} selected</small></div>{selectedEmployees.length > 0 && <button type="button" className="mood-clear-all" onClick={() => setSelectedEmployees([])}>Clear all</button>}</div><div className="mood-selected-chips" aria-label="Selected colleagues">{selectedPeople.map((employee) => <span className="mood-selected-chip" key={employee.id}><span className="mood-chip-avatar">{employee.initials || employee.name?.slice(0, 2).toUpperCase()}</span>{employee.name}<button type="button" aria-label={`Remove ${employee.name}`} onClick={() => removeEmployee(employee.id)}><X size={12}/></button></span>)}</div><label className="mood-search-field"><Search size={16}/><input id="mood-colleague-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search colleagues by name or email…"/><kbd>/</kbd></label>{employeesLoading ? <div className="mood-picker-state">Loading colleagues…</div> : employeesError ? <div className="mood-picker-state mood-picker-error"><span>{employeesError}</span><button type="button" onClick={() => { setEmployees([]); setEmployeesError(''); }}>Try again</button></div> : filteredEmployees.length ? <div className="mood-colleague-results">{filteredEmployees.map((employee) => { const isSelected = selectedSet.has(String(employee.id)); return <button type="button" className={`mood-colleague-result ${isSelected ? 'selected' : ''}`} key={employee.id} onClick={() => isSelected ? removeEmployee(employee.id) : addEmployee(employee.id)}><span className="mood-result-avatar">{employee.initials || employee.name?.slice(0, 2).toUpperCase()}</span><span className="mood-result-copy"><b>{employee.name}</b><small>{employee.role || employee.team || employee.email}</small></span><span className="mood-result-check">{isSelected ? <Check size={15}/> : <span/>}</span></button>; })}</div> : <div className="mood-picker-state"><Search size={16}/><span>No colleagues match that search.</span></div>}<small className="mood-picker-hint">Select one or more colleagues. Your choices remain private.</small></div>}
          {error && <p className="form-error" role="alert">{error}</p>}<button type="button" className="btn btn-secondary mood-save-sharing" disabled={saving || loading || (state.visibility === 'selected' && selectedEmployees.length === 0)} onClick={save}>{saving ? 'Saving…' : 'Save sharing preference'}</button>
        </div>
      </> : <p className="mood-hint">Pick the emoji that best matches your mood today.</p>}
    </div>
  </Panel>;
}
