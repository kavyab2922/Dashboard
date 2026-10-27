import { useMemo, useState } from 'react';
import { Bookmark, BookOpen, Check, ExternalLink, Filter, GraduationCap, Search, Sparkles, Star } from 'lucide-react';
import { PageTitle, Panel, Tag, Button, EmptyState } from '../components/common/UI';
import { useApp } from '../context/AppContext';

const categoryOptions = ['All', ...new Set(['Java & OOP','DSA','Web Development','Cloud & DevOps','Databases','Python','Computer Science','Career Skills','AI & ML'])];
const providerOptions = ['All', ...new Set(['GeeksforGeeks','freeCodeCamp','React.dev','Microsoft Learn','NPTEL','Coursera','Docker'])];

export default function LearningHub() {
  const { courses, coursesState, savedCourses, toggleSavedCourse, setToast } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [provider, setProvider] = useState('All');
  const [level, setLevel] = useState('All');
  const [freeOnly, setFreeOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);

  const filtered = useMemo(() => courses.filter((course) =>
    `${course.title} ${course.description} ${course.provider} ${course.category}`.toLowerCase().includes(search.toLowerCase()) &&
    (category === 'All' || course.category === category) &&
    (provider === 'All' || course.provider === provider) &&
    (level === 'All' || course.level === level) &&
    (!freeOnly || /free/i.test(course.access)) &&
    (!savedOnly || savedCourses.includes(course.id))
  ), [courses, search, category, provider, level, freeOnly, savedOnly, savedCourses]);

  const saved = courses.filter((item) => savedCourses.includes(item.id));
  const openCourse = (course) => {
    window.open(course.url, '_blank', 'noopener,noreferrer');
    setToast(`Opened ${course.provider} in a new tab.`);
  };

  return (
    <>
      <PageTitle
        eyebrow="GROW AT YOUR OWN PACE"
        title="Learning hub"
        description="Discover curated resources across software engineering, cloud computing, AI, systems and professional leadership."
        actions={
          <button className={`btn ${savedOnly ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSavedOnly(!savedOnly)}>
            <Bookmark size={15} fill={savedOnly ? 'currentColor' : 'none'}/> Saved resources ({saved.length})
          </button>
        }
      />

      {coursesState.error && (
        <Panel><p className="muted">Unable to load learning resources: {coursesState.error}</p></Panel>
      )}
      {coursesState.loading && (
        <Panel><p className="muted">Loading learning resources…</p></Panel>
      )}

      <div className="learning-hero">
        <div className="learning-hero-copy">
          <Tag tone="blue">YOUR PERSONAL GROWTH SPACE</Tag>
          <h2>Curiosity is a career superpower.</h2>
          <p>
            Explore verified engineering and leadership modules with official certifications, cloud sandbox access, and interactive coding exercises.
          </p>
          <div className="learning-provider-chips">
            <span>Microsoft Learn</span>
            <span>React.dev</span>
            <span>freeCodeCamp</span>
            <span>Coursera</span>
            <span>Docker</span>
          </div>
        </div>
      </div>

      <div className="learning-stats-row">
        <div>
          <span className="learning-stat-icon"><BookOpen size={18}/></span>
          <span><strong>{coursesState.loading ? '…' : courses.length}</strong><small>resources to explore</small></span>
        </div>
        <div>
          <span className="learning-stat-icon purple"><Bookmark size={18}/></span>
          <span><strong>{saved.length}</strong><small>saved for later</small></span>
        </div>
        <div>
          <span className="learning-stat-icon blue"><GraduationCap size={18}/></span>
          <span><strong>{coursesState.loading ? '…' : new Set(courses.map((course) => course.category)).size}</strong><small>learning categories</small></span>
        </div>
      </div>

      <Panel className="learning-filter-panel">
        <div className="learning-search-row">
          <label className="inline-search">
            <Search size={16}/>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses, skills or providers..."/>
          </label>
          <label className="learning-free-toggle">
            <input type="checkbox" checked={freeOnly} onChange={(e) => setFreeOnly(e.target.checked)}/>
            <span/> Free resources first
          </label>
        </div>
        <div className="learning-filter-row">
          <label>
            <span>Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categoryOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>Provider</span>
            <select value={provider} onChange={(e) => setProvider(e.target.value)}>
              {providerOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>Difficulty</span>
            <select value={level} onChange={(e) => setLevel(e.target.value)}>
              {['All','Beginner','Intermediate','Advanced'].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <span className="learning-result-count">{filtered.length} resources</span>
        </div>
      </Panel>

      <div className="learning-course-grid">
        {filtered.map((course) => (
          <Panel className="learning-course-card" key={course.id}>
            <div className="course-cover">
              {course.image && (
                <img
                  src={course.image}
                  alt={course.title}
                  className="course-cover-img"
                  loading="lazy"
                />
              )}
              <div className="course-cover-overlay" />
              <div className="course-cover-brand">
                {course.provider === 'Microsoft Learn' ? 'MS' :
                 course.provider === 'freeCodeCamp' ? 'fCC' :
                 course.provider === 'GeeksforGeeks' ? 'GFG' :
                 course.provider === 'Coursera' ? 'Co' :
                 course.provider === 'Docker' ? 'D' :
                 course.provider === 'NPTEL' ? 'NPTEL' : 'React'}
              </div>
              <button
                className={`course-bookmark ${savedCourses.includes(course.id) ? 'saved' : ''}`}
                aria-label={savedCourses.includes(course.id) ? 'Remove saved course' : 'Save course'}
                onClick={() => {
                  toggleSavedCourse(course.id);
                  setToast(savedCourses.includes(course.id) ? 'Removed from your saved resources.' : 'Saved to your learning list.');
                }}
              >
                <Bookmark size={17} fill={savedCourses.includes(course.id) ? 'currentColor' : 'none'}/>
              </button>
            </div>
            <div className="learning-course-body">
              <div className="course-card-meta">
                <Tag tone={course.level === 'Beginner' ? 'mint' : 'purple'}>{course.level}</Tag>
                <span>{course.category}</span>
              </div>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <div className="course-provider-row">
                <span className="provider-dot">{course.provider.slice(0,1)}</span>
                <strong>{course.provider}</strong>
              </div>
              <div className="course-access-row">
                <span className="course-access-pill"><Check size={12}/>{course.access}</span>
                <span className="course-duration">{course.duration}</span>
              </div>
              <div className="course-certificate-note">Certificate: {course.certificate}</div>
              <button className="course-start-button" onClick={() => openCourse(course)}>
                Start learning <ExternalLink size={14}/>
              </button>
            </div>
          </Panel>
        ))}          {!coursesState.loading && !coursesState.error && filtered.length === 0 && (
            <div className="learning-empty">
            <EmptyState
              icon={Search}
              title="No resources match your filters"
              description="Try removing a filter or searching for a broader topic."
              action={<Button variant="secondary" onClick={() => { setSearch('');setCategory('All');setProvider('All');setLevel('All');setFreeOnly(false);setSavedOnly(false); }}>Clear filters</Button>}
            />
          </div>
        )}
      </div>

      <p className="demo-inline-note">
        Provider catalogs, availability, prices and certificates can change. Verify details on official provider pages before enrolling.
      </p>
    </>
  );
}
