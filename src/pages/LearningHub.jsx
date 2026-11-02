import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  Bookmark,
  Check,
  ChevronDown,
  Clock3,
  ExternalLink,
  GraduationCap,
  Search,
  ShieldAlert,
} from 'lucide-react';
import { PageTitle, Panel, Tag, Button, EmptyState } from '../components/common/UI';
import { useApp } from '../context/AppContext';

const fallbackCategories = ['All', 'Development', 'Programming', 'Communication', 'Career Growth', 'Other'];
const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

function normalizeValue(value) {
  return String(value || '').trim().toLowerCase();
}

function getProviderMark(provider = '') {
  const marks = {
    Microsoft: 'MS',
    freeCodeCamp: 'fCC',
    GeeksforGeeks: 'GFG',
    Coursera: 'Co',
    Docker: 'D',
    NPTEL: 'N',
    React: 'R',
  };
  return Object.entries(marks).find(([name]) => provider.includes(name))?.[1] || provider.slice(0, 2).toUpperCase() || 'LH';
}

function isValidCourseUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function LearningDropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(() => Math.max(options.indexOf(value), 0));
  const wrapperRef = useRef(null);
  const menuRef = useRef(null);
  const triggerId = useId();
  const menuId = `${triggerId}-menu`;

  useEffect(() => {
    setHighlightedIndex(Math.max(options.indexOf(value), 0));
  }, [options, value]);

  useEffect(() => {
    if (!open) return undefined;

    const closeOnOutsidePointer = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        wrapperRef.current?.querySelector('button')?.focus();
      }
    };

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    menuRef.current?.focus();
    menuRef.current?.querySelector(`[data-option-index="${highlightedIndex}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex, open]);

  const selectOption = (option) => {
    onChange(option);
    setOpen(false);
  };

  const handleTriggerKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen(true);
      if (event.key === 'ArrowUp') setHighlightedIndex(options.length - 1);
    }
  };

  const handleMenuKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((index) => (index + 1) % options.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((index) => (index - 1 + options.length) % options.length);
    } else if (event.key === 'Home') {
      event.preventDefault();
      setHighlightedIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setHighlightedIndex(options.length - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectOption(options[highlightedIndex]);
      wrapperRef.current?.querySelector('button')?.focus();
    }
  };

  return (
    <div className={`learning-dropdown ${open ? 'is-open' : ''}`} ref={wrapperRef}>
      <span className="learning-dropdown-label">{label}</span>
      <button
        type="button"
        className="learning-dropdown-trigger"
        id={triggerId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((isOpen) => !isOpen)}
        onKeyDown={handleTriggerKeyDown}
      >
        <span>{value}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {open && (
        <div
          className="learning-dropdown-menu"
          id={menuId}
          ref={menuRef}
          role="listbox"
          aria-labelledby={triggerId}
          tabIndex={-1}
          onKeyDown={handleMenuKeyDown}
        >
          {options.map((option, index) => (
            <button
              type="button"
              role="option"
              key={option}
              data-option-index={index}
              aria-selected={value === option}
              className={`learning-dropdown-option ${value === option ? 'is-selected' : ''} ${highlightedIndex === index ? 'is-highlighted' : ''}`}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => selectOption(option)}
            >
              <span>{option}</span>
              {value === option && <Check size={15} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course, saved, onToggleSaved, onOpen }) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = course.image && !imageFailed;

  return (
    <article className="learning-course-card">
      <div className="course-cover">
        {hasImage ? (
          <img
            src={course.image}
            alt=""
            className="course-cover-img"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="course-cover-fallback" aria-hidden="true">
            <GraduationCap size={30} />
          </div>
        )}
        <div className="course-cover-overlay" />
        <div className="course-cover-brand" aria-label={`${course.provider || 'Learning Hub'} source`}>
          {getProviderMark(course.provider)}
        </div>
        <button
          type="button"
          className={`course-bookmark ${saved ? 'saved' : ''}`}
          aria-label={saved ? `Remove ${course.title} from saved resources` : `Save ${course.title}`}
          aria-pressed={saved}
          onClick={() => onToggleSaved(course)}
        >
          <Bookmark size={17} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="learning-course-body">
        <div className="course-card-meta">
          <Tag tone={course.level === 'Beginner' ? 'mint' : 'blue'}>{course.level || 'Self-paced'}</Tag>
          <span>{course.category || 'Other'}</span>
        </div>
        <h3 title={course.title}>{course.title}</h3>
        <p title={course.description}>{course.description || 'Build practical skills with this curated learning resource.'}</p>

        <div className="course-provider-row">
          <span className="provider-dot" aria-hidden="true">{getProviderMark(course.provider)}</span>
          <strong>{course.provider || 'Learning Hub'}</strong>
        </div>
        <div className="course-access-row">
          <span className="course-access-pill"><Check size={12} />{course.access || 'Open access'}</span>
          {course.duration && <span className="course-duration"><Clock3 size={12} />{course.duration}</span>}
        </div>
        {course.certificate && <div className="course-certificate-note">Certificate: {course.certificate}</div>}
        <button type="button" className="course-start-button" onClick={() => onOpen(course)}>
          Start learning <ExternalLink size={14} />
        </button>
      </div>
    </article>
  );
}

function CourseSkeleton() {
  return (
    <div className="learning-course-card learning-course-skeleton" aria-hidden="true">
      <span className="skeleton-cover" />
      <div className="skeleton-body"><span /><span /><span /><span /><i /></div>
    </div>
  );
}

export default function LearningHub() {
  const { courses, coursesState, savedCourses, toggleSavedCourse, setToast } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [provider, setProvider] = useState('All');
  const [level, setLevel] = useState('All');
  const [freeOnly, setFreeOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);

  const uniqueCourses = useMemo(() => {
    const seen = new Set();
    return courses.filter((course) => {
      const key = course.id || course.url || course.title;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [courses]);

  const categories = useMemo(() => {
    const values = uniqueCourses.map((course) => String(course.category || '').trim()).filter(Boolean);
    return ['All', ...new Set([...fallbackCategories.slice(1), ...values])];
  }, [uniqueCourses]);

  const providers = useMemo(() => ['All', ...new Set(uniqueCourses.map((course) => String(course.provider || '').trim()).filter(Boolean))], [uniqueCourses]);
  const savedCourseIds = useMemo(() => new Set(savedCourses.map((id) => normalizeValue(id))), [savedCourses]);

  const filtered = useMemo(() => {
    const query = normalizeValue(search);
    return uniqueCourses.filter((course) => {
      const searchable = normalizeValue(`${course.title || ''} ${course.description || ''} ${course.provider || ''} ${course.category || ''}`);
      return (!query || searchable.includes(query))
        && (category === 'All' || normalizeValue(course.category) === normalizeValue(category))
        && (provider === 'All' || normalizeValue(course.provider) === normalizeValue(provider))
        && (level === 'All' || normalizeValue(course.level) === normalizeValue(level))
        && (!freeOnly || /free|open|no cost/i.test(course.access || ''))
        && (!savedOnly || savedCourseIds.has(normalizeValue(course.id)));
    });
  }, [uniqueCourses, search, category, provider, level, freeOnly, savedOnly, savedCourseIds]);

  const savedCount = uniqueCourses.filter((course) => savedCourseIds.has(normalizeValue(course.id))).length;
  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setProvider('All');
    setLevel('All');
    setFreeOnly(false);
    setSavedOnly(false);
  };

  const openCourse = (course) => {
    if (!isValidCourseUrl(course.url)) {
      setToast('This learning resource does not have a valid link yet.');
      return;
    }
    window.open(course.url, '_blank', 'noopener,noreferrer');
    setToast(`Opened ${course.provider || 'learning resource'} in a new tab.`);
  };

  const toggleCourse = (course) => {
    const wasSaved = savedCourseIds.has(normalizeValue(course.id));
    toggleSavedCourse(course.id);
    setToast(wasSaved ? 'Removed from your saved resources.' : 'Saved to your learning list.');
  };

  return (
    <div className="learning-hub-page">
      <PageTitle
        eyebrow="GROW AT YOUR OWN PACE"
        title="Learning Hub"
        description="Discover new skills and grow your career with trusted learning resources."
        actions={(
          <button type="button" className={`btn ${savedOnly ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSavedOnly((value) => !value)}>
            <Bookmark size={15} fill={savedOnly ? 'currentColor' : 'none'} /> Saved resources ({savedCount})
          </button>
        )}
      />

      <section className="learning-hero" aria-labelledby="learning-hero-title">
        <div className="learning-hero-copy">
          <div className="learning-hero-icon"><GraduationCap size={24} /></div>
          <div>
            <span className="learning-section-label">LEARNING HUB</span>
            <h2 id="learning-hero-title">Make space for your next breakthrough.</h2>
            <p>Explore curated engineering, cloud, AI, and professional development resources from platforms you can trust.</p>
          </div>
        </div>
        <div className="learning-hero-stats">
          <span><strong>{coursesState.loading ? '—' : uniqueCourses.length}</strong> resources</span>
          <span><strong>{savedCount}</strong> saved</span>
        </div>
      </section>

      <Panel className="learning-filter-panel">
        <div className="learning-filter-heading">
          <div><h2>Find your next course</h2><p>Search by topic, skill, or learning platform.</p></div>
          <span className="learning-result-count" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'resource' : 'resources'}</span>
        </div>
        <label className="learning-search-field">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Search learning resources</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search courses, skills, or providers" type="search" />
          {search && <button type="button" aria-label="Clear search" onClick={() => setSearch('')}>×</button>}
        </label>
        <div className="learning-category-row" role="group" aria-label="Filter by category">
          {categories.map((item) => (
            <button type="button" key={item} className={`learning-category-chip ${category === item ? 'active' : ''}`} aria-pressed={category === item} onClick={() => setCategory(item)}>
              {item}
            </button>
          ))}
        </div>
        <div className="learning-filter-row">
          <LearningDropdown label="Provider" value={provider} options={providers} onChange={setProvider} />
          <LearningDropdown label="Difficulty" value={level} options={levels} onChange={setLevel} />
          <label className="learning-check-option"><input type="checkbox" checked={freeOnly} onChange={(event) => setFreeOnly(event.target.checked)} /><span>Free resources</span></label>
          {(search || category !== 'All' || provider !== 'All' || level !== 'All' || freeOnly || savedOnly) && <button type="button" className="learning-clear-button" onClick={clearFilters}>Clear filters</button>}
        </div>
      </Panel>

      {coursesState.error && (
        <div className="learning-state learning-error-state" role="alert">
          <span className="learning-state-icon"><ShieldAlert size={20} /></span>
          <div><h2>We couldn’t load learning resources</h2><p>{coursesState.error}</p></div>
        </div>
      )}

      {coursesState.loading && <div className="learning-course-grid" role="status" aria-label="Loading learning resources">{[1, 2, 3, 4].map((item) => <CourseSkeleton key={item} />)}</div>}

      {!coursesState.loading && !coursesState.error && (
        <>
          <div className="learning-section-heading"><div><span className="learning-section-label">CURATED FOR YOU</span><h2>Explore learning resources</h2></div></div>
          <div className="learning-course-grid">
            {filtered.map((course) => <CourseCard key={course.id || course.url || course.title} course={course} saved={savedCourseIds.has(normalizeValue(course.id))} onToggleSaved={toggleCourse} onOpen={openCourse} />)}
            {filtered.length === 0 && <div className="learning-empty"><EmptyState icon={Search} title="No resources match your search" description="Try another topic or clear a filter to see more learning options." action={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>} /></div>}
          </div>
        </>
      )}

      <p className="demo-inline-note">Provider catalogs, availability, prices, and certificates can change. Verify details on official provider pages before enrolling.</p>
    </div>
  );
}
