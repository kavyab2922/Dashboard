import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Lock, Search, Sparkles, UserRoundCheck, Users, X } from 'lucide-react';
import { Panel, PanelHeading } from '../common/UI';
import { useApp } from '../../context/AppContext';
import { dataApi } from '../../services/api';

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

function stateFromApi(data) {
  if (!data?.mood) return { mood: null, visibility: 'private', submittedAt: null, checkinDate: null, nextEligibleAt: null, locked: false };
  return {
    mood: data.mood.mood,
    visibility: data.mood.visibility,
    submittedAt: data.submittedAt || data.mood.submitted_at || null,
    checkinDate: data.checkinDate || data.mood.checkin_date || null,
    nextEligibleAt: data.nextEligibleAt || data.lockedUntil || null,
    locked: Boolean(data.locked),
  };
}

function formatUnlockTime(value) {
  if (!value) return 'after the next calendar day begins';
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function MoodSection() {
  const { user, setToast } = useApp();
  const [state, setState] = useState(() => stateFromApi(null));
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState('');
  const [employeeReloadKey, setEmployeeReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [celebrating, setCelebrating] = useState(false);
  const previousMood = useRef(null);

  const loadState = async () => {
    try {
      const response = await dataApi.moods.state();
      const next = stateFromApi(response.data);
      setState(next);
      setSelectedEmployees((response.data?.selectedEmployeeIds || []).map(String));
      previousMood.current = next.mood;
      setError('');
    } catch (err) {
      setError(err.message || 'Unable to load your latest mood check-in.');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadState(); }, []);

  useEffect(() => {
    if (!state.locked || !state.nextEligibleAt) return undefined;
    const refreshAtNextDay = () => {
      if (Date.now() >= new Date(state.nextEligibleAt).getTime()) loadState();
    };
    refreshAtNextDay();
    const timer = window.setInterval(refreshAtNextDay, 30000);
    return () => window.clearInterval(timer);
  }, [state.locked, state.nextEligibleAt]);

  useEffect(() => {
    if (state.visibility !== 'selected' || employees.length || employeesLoading) return;
    let cancelled = false;
    setEmployeesLoading(true); setEmployeesError('');
    dataApi.employees.list().then(({ data }) => {
      if (!cancelled) setEmployees(Array.isArray(data) ? data : []);
    }).catch((err) => {
      if (!cancelled) setEmployeesError(err.message || 'Unable to load colleagues.');
    }).finally(() => { if (!cancelled) setEmployeesLoading(false); });
    return () => { cancelled = true; };
  }, [state.visibility, employees.length, employeesLoading, employeeReloadKey]);

  useEffect(() => {
    if (!celebrating) return undefined;
    const timer = window.setTimeout(() => setCelebrating(false), 2600);
    return () => window.clearTimeout(timer);
  }, [celebrating]);

  const locked = state.locked;
  const selectedMood = MOODS.find((mood) => mood.id === state.mood);
  const currentUserId = String(user?.id || user?.employee_id || '');
  const selectableEmployees = employees.filter((employee) => String(employee.id) !== currentUserId);
  const selectedSet = new Set(selectedEmployees);
  const filteredEmployees = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return selectableEmployees;
    return selectableEmployees.filter((employee) => `${employee.name || ''} ${employee.email || ''}`.toLowerCase().includes(value));
  }, [selectableEmployees, query]);
  const selectedPeople = selectableEmployees.filter((employee) => selectedSet.has(String(employee.id)));

  const choose = (mood) => {
    if (locked || saving) return;
    setState((current) => ({ ...current, mood })); setError('');
    if (['amazing', 'happy'].includes(mood) && !['amazing', 'happy'].includes(previousMood.current)) setCelebrating(true);
    previousMood.current = mood;
  };
  const selectVisibility = (visibility) => {
    if (!locked) { setState((current) => ({ ...current, visibility })); setError(''); setQuery(''); }
  };
  const save = async () => {
    if (!state.mood || saving || locked) return;
    if (state.visibility === 'selected' && selectedEmployees.length === 0) { setError('Choose at least one colleague before saving.'); return; }
    setSaving(true); setError('');
    try {
      const response = await dataApi.moods.save({ mood: state.mood, visibility: state.visibility, selectedEmployeeIds: state.visibility === 'selected' ? selectedEmployees : [] });
      const next = stateFromApi(response.data);
      setState(next);
      setSelectedEmployees((response.data?.selectedEmployeeIds || []).map(String));
      previousMood.current = next.mood;
      setToast?.('Your mood check-in was saved.');
    } catch (err) {
      if (err.status === 409 && err.data) {
        setState(stateFromApi(err.data));
        setSelectedEmployees((err.data.selectedEmployeeIds || []).map(String));
        setError('You have already checked in today. You can submit a new mood tomorrow.');
      } else setError(err.message || 'Unable to save your mood check-in.');
    } finally { setSaving(false); }
  };
  const toggleEmployee = (event, id) => {
    event?.stopPropagation();
    if (locked) return;
    const value = String(id);
    setSelectedEmployees((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };
  const removeEmployee = (id) => { if (!locked) setSelectedEmployees((current) => current.filter((item) => item !== String(id))); };

  return <Panel className="mood-panel wellness-mood-panel">
    <div className="wellness-decor wellness-decor-top" aria-hidden="true"><span className="wellness-balloon balloon-teal"/><span className="wellness-balloon balloon-lavender"/><span className="wellness-sparkle sparkle-one">✦</span><span className="wellness-sparkle sparkle-two">✧</span></div>
    <PanelHeading title="How are you feeling today?" subtitle="A quick daily check-in — you choose what feels right for you." action={selectedMood ? <span className="mood-checked-pill"></span> : null}/>
    <div className="mood-options" role="group" aria-label="Daily mood options">
      {MOODS.map((mood) => <button key={mood.id} type="button" className={`mood-option ${locked && state.mood === mood.id ? 'mood-option-locked-selected' : ''}`} disabled={locked} aria-disabled={locked} aria-pressed={state.mood === mood.id} aria-label={`I'm feeling ${mood.label}`} onClick={() => choose(mood.id)}><span className="mood-emoji" aria-hidden="true">{mood.emoji}</span><span className="mood-label">{mood.label}</span>{state.mood === mood.id && <span className="mood-selected-badge" aria-hidden="true"><Check size={11} strokeWidth={3}/></span>}</button>)}
    </div>
    {locked && <div className="mood-lock-notice" role="status"><Lock size={15}/><span><strong>Checked in today.</strong> Your mood and sharing settings are locked until {formatUnlockTime(state.nextEligibleAt)}.</span></div>}
    <div className="mood-footer" aria-live="polite">
      {selectedMood ? <>
        {selectedMood.id === 'amazing' || selectedMood.id === 'happy' ? <div className={`wellness-celebration-card ${celebrating ? 'is-celebrating' : ''}`}><div className="wellness-paper-layer paper-back"/><div className="wellness-paper-layer paper-front"/><div className="wellness-ribbon" aria-hidden="true"/><div className="wellness-confetti" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div><div className="wellness-card-content"><span className="wellness-eyebrow"><Sparkles size={13}/> A bright moment</span><h3>Your happiness is worth celebrating! 🎉</h3><p>{selectedMood.emoji} You're feeling <strong>{selectedMood.label.toLowerCase()}</strong> today. Keep that good energy going.</p></div></div> : <p className="mood-confirm"><span>Thanks for checking in! 💙</span><small>You're feeling {selectedMood.label.toLowerCase()} today — you can choose a new mood tomorrow.</small></p>}
        <div className={`mood-sharing ${locked ? 'mood-sharing-locked' : ''}`}><div className="mood-sharing-heading"><div><strong>Who can see this mood?</strong><small>Employees control their own mood visibility. Sharing settings are locked after today’s check-in.</small></div><ChevronDown size={16} aria-hidden="true"/></div><div className="mood-visibility-options" role="radiogroup" aria-label="Mood visibility">{VISIBILITY_OPTIONS.map(({ id, label, hint, Icon, tone }) => <button type="button" role="radio" aria-checked={state.visibility === id} disabled={locked} aria-disabled={locked} key={id} className={`mood-visibility-option mood-visibility-${tone} ${state.visibility === id ? 'active' : ''}`} onClick={() => selectVisibility(id)}><span className="mood-visibility-icon"><Icon size={17}/></span><span className="mood-visibility-copy"><b>{label}</b><small>{hint}</small></span>{state.visibility === id && <span className="mood-visibility-check" aria-hidden="true"><Check size={13}/></span>}</button>)}</div>
          {state.visibility === 'selected' && <div className="mood-colleague-picker"><div className="mood-picker-heading"><div><label htmlFor="mood-colleague-search">Choose colleagues</label><small>{selectedEmployees.length} {selectedEmployees.length === 1 ? 'colleague' : 'colleagues'} selected</small></div>{selectedEmployees.length > 0 && <button type="button" className="mood-clear-all" disabled={locked} onClick={() => setSelectedEmployees([])}>Clear all</button>}</div><div className="mood-selected-chips" aria-label="Selected colleagues">{selectedPeople.map((employee) => <span className="mood-selected-chip" key={employee.id}><span className="mood-chip-avatar">{employee.initials || employee.name?.slice(0, 2).toUpperCase()}</span>{employee.name}<button type="button" disabled={locked} aria-label={`Remove ${employee.name}`} onClick={() => removeEmployee(employee.id)}><X size={12}/></button></span>)}</div><label className="mood-search-field"><Search size={16}/><input id="mood-colleague-search" disabled={locked} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search colleagues by name or email…"/><kbd>/</kbd></label>{employeesLoading ? <div className="mood-picker-state">Loading colleagues…</div> : employeesError ? <div className="mood-picker-state mood-picker-error"><span>{employeesError}</span><button type="button" disabled={locked} onClick={() => { setEmployees([]); setEmployeesError(''); }}>Try again</button></div> : filteredEmployees.length ? <div className="mood-colleague-results">{filteredEmployees.map((employee) => { const isSelected = selectedSet.has(String(employee.id)); return <div role="checkbox" aria-checked={isSelected} aria-disabled={locked} tabIndex={locked ? -1 : 0} className={`mood-colleague-result ${isSelected ? 'selected' : ''}`} key={employee.id} onClick={() => toggleEmployee(null, employee.id)} onKeyDown={(event) => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); toggleEmployee(null, employee.id); } }}><input type="checkbox" checked={isSelected} disabled={locked} onChange={() => toggleEmployee(null, employee.id)} onClick={(event) => event.stopPropagation()} aria-label={`Select ${employee.name}`}/><span className="mood-result-avatar">{employee.initials || employee.name?.slice(0, 2).toUpperCase()}</span><span className="mood-result-copy"><b>{employee.name}</b><small>{employee.role || employee.team || employee.email}</small></span><span className="mood-result-check" aria-hidden="true">{isSelected ? <Check size={15}/> : <span/>}</span></div>; })}</div> : <div className="mood-picker-state"><Search size={16}/><span>No colleagues found.</span></div>}<small className="mood-picker-hint">Select one or more colleagues. Your choices remain private.</small></div>}
          {error && <p className="form-error" role="alert">{error}</p>}<button type="button" className="btn btn-secondary mood-save-sharing" disabled={saving || loading || locked || (state.visibility === 'selected' && selectedEmployees.length === 0)} onClick={save}>{saving ? 'Saving…' : locked ? 'Saved for today' : 'Send'}</button>
        </div>
      </> : <p className="mood-hint">Pick the emoji that best matches your mood today, then save your check-in.</p>}
    </div>
  </Panel>;
}
