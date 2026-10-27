import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, Loader2, Search, X } from 'lucide-react';
import useClickOutside from '../../hooks/useClickOutside';
import { dataApi, resolveAssetUrl } from '../../services/api';
import { Avatar } from './UI';

const SEARCH_DELAY = 280;

function employeeMeta(person) {
  return [person.role, person.team].filter(Boolean).join(' · ');
}

export default function EmployeePicker({
  selected,
  onSelect,
  excludeEmployeeId,
  label = 'Give Kudos To',
  placeholder = 'Search by employee name...',
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [highlighted, setHighlighted] = useState(-1);
  const [retryKey, setRetryKey] = useState(0);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const requestSeq = useRef(0);
  const listboxId = useId();
  const trimmed = query.trim();

  const closeResults = useCallback(() => {
    setOpen(false);
    setHighlighted(-1);
  }, []);

  useClickOutside(wrapRef, open, closeResults);

  useEffect(() => {
    if (!trimmed) {
      setResults([]);
      setSearching(false);
      setError('');
      setHighlighted(-1);
      return undefined;
    }

    let cancelled = false;
    const sequence = requestSeq.current + 1;
    requestSeq.current = sequence;
    setSearching(true);
    setError('');

    const timer = window.setTimeout(async () => {
      try {
        const payload = await dataApi.employees.search(trimmed, 8);
        if (cancelled || sequence !== requestSeq.current) return;
        const people = Array.isArray(payload?.data) ? payload.data : [];
        const filtered = people.filter((person) => !excludeEmployeeId || String(person.id) !== String(excludeEmployeeId));
        setResults(filtered);
        setHighlighted(filtered.length ? 0 : -1);
        setOpen(true);
      } catch (err) {
        if (cancelled || sequence !== requestSeq.current) return;
        setResults([]);
        setError(err.message || 'Unable to search employees.');
        setHighlighted(-1);
        setOpen(true);
      } finally {
        if (!cancelled && sequence === requestSeq.current) setSearching(false);
      }
    }, SEARCH_DELAY);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [trimmed, excludeEmployeeId, retryKey]);

  const chooseEmployee = (person) => {
    onSelect?.(person);
    setQuery('');
    setResults([]);
    setError('');
    setOpen(false);
    setHighlighted(-1);
  };

  const clearSelection = () => {
    onSelect?.(null);
    setQuery('');
    window.setTimeout(() => inputRef.current?.focus(), 60);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open && trimmed) setOpen(true);
      if (results.length) setHighlighted((index) => (index + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (results.length) setHighlighted((index) => (index - 1 + results.length) % results.length);
    } else if (event.key === 'Enter') {
      if (open && highlighted >= 0 && results[highlighted]) {
        event.preventDefault();
        chooseEmployee(results[highlighted]);
      }
    } else if (event.key === 'Escape') {
      closeResults();
    }
  };

  if (selected) {
    const meta = employeeMeta(selected);
    return (
      <div className="employee-picker" ref={wrapRef}>
        <span className="employee-picker-label">{label}</span>
        <div className="employee-selected">
          <Avatar name={selected.name} initials={selected.initials} color={selected.color} size="lg" src={resolveAssetUrl(selected.avatar)} />
          <div className="employee-selected-copy">
            <strong>{selected.name}</strong>
            {meta && <small>{meta}</small>}
          </div>
          <div className="employee-selected-actions">
            <button type="button" className="employee-change" onClick={clearSelection}>Change</button>
            <button type="button" className="employee-remove" aria-label={`Remove ${selected.name}`} onClick={() => onSelect?.(null)}>
              <X size={15} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-picker" ref={wrapRef}>
      <span className="employee-picker-label" id={`${listboxId}-label`}>{label}</span>
      <div className={`employee-search ${open ? 'is-open' : ''}`}>
        <Search size={17} />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            if (!event.target.value.trim()) setOpen(false);
          }}
          onFocus={() => { if (trimmed) setOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          role="combobox"
          aria-labelledby={`${listboxId}-label`}
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={open && highlighted >= 0 && results[highlighted] ? `${listboxId}-option-${results[highlighted].id}` : undefined}
          autoComplete="off"
        />
        {searching ? (
          <Loader2 size={16} className="employee-search-spinner" />
        ) : trimmed ? (
          <button type="button" className="employee-search-clear" aria-label="Clear employee search" onClick={() => { setQuery(''); setOpen(false); inputRef.current?.focus(); }}>
            <X size={14} />
          </button>
        ) : (
          <ChevronDown size={15} />
        )}
      </div>

      {open && trimmed && (
        <div className="employee-picker-results" id={listboxId} role="listbox" aria-labelledby={`${listboxId}-label`}>
          {error ? (
            <div className="employee-picker-state">
              <strong>Unable to search employees</strong>
              <span>{error}</span>
              <button type="button" onClick={() => setRetryKey((key) => key + 1)}>Try again</button>
            </div>
          ) : searching && results.length === 0 ? (
            <div className="employee-picker-state">
              <Loader2 size={18} className="employee-search-spinner" />
              <span>Searching employees...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="employee-picker-state">
              <strong>No employees found</strong>
              <span>No one matches “{trimmed}”. Try a different part of their name.</span>
            </div>
          ) : (
            results.map((person, index) => {
              const meta = employeeMeta(person);
              return (
                <button
                  type="button"
                  role="option"
                  id={`${listboxId}-option-${person.id}`}
                  aria-selected={index === highlighted}
                  key={person.id}
                  className={`employee-option ${index === highlighted ? 'highlighted' : ''}`}
                  onMouseEnter={() => setHighlighted(index)}
                  onClick={() => chooseEmployee(person)}
                >
                  <Avatar name={person.name} initials={person.initials} color={person.color} size="lg" src={resolveAssetUrl(person.avatar)} />
                  <span className="employee-option-copy">
                    <strong>{person.name}</strong>
                    {meta && <small>{meta}</small>}
                  </span>
                  {index === highlighted && <Check size={16} />}
                </button>
              );
            })
          )}
        </div>
      )}

      {!trimmed && <p className="employee-picker-hint">Type a name to search the employee directory.</p>}
    </div>
  );
}
