import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Bot,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  ExternalLink,
  LifeBuoy,
  MessageCircle,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PageTitle, Panel, Tag } from '../components/common/UI';
import { APP_SUGGESTIONS } from '../data/appGuide';

const ALL = 'All';
const SEARCH_FIELDS = (item) => `${item.question || ''} ${item.answer || ''} ${item.category || ''}`.toLowerCase();

function openAssistant(question) {
  window.dispatchEvent(new CustomEvent('hrobit-open-chat', question ? { detail: { question } } : undefined));
}

function FaqState({ icon: Icon = Search, title, description, children }) {
  return (
    <div className="faq-state" role="status">
      <span className="faq-state-icon" aria-hidden="true"><Icon size={19} /></span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {children && <div className="faq-state-actions">{children}</div>}
    </div>
  );
}

export default function HRFAQ() {
  const { faqs, faqsState } = useApp();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [openIds, setOpenIds] = useState([]);

  const categories = useMemo(() => {
    const counts = new Map();
    faqs.forEach((item) => {
      const label = (item.category || 'General').trim();
      counts.set(label, (counts.get(label) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([label, count]) => ({ label, count }));
  }, [faqs]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return faqs.filter((item) => {
      if (activeCategory !== ALL && (item.category || 'General').trim() !== activeCategory) return false;
      if (!needle) return true;
      return SEARCH_FIELDS(item).includes(needle);
    });
  }, [faqs, search, activeCategory]);

  const isFiltering = Boolean(search.trim()) || activeCategory !== ALL;
  const toggle = (id) => setOpenIds((items) => (items.includes(id) ? items.filter((item) => item !== id) : [...items, id]));
  const resetFilters = () => { setSearch(''); setActiveCategory(ALL); };

  const subtitle = faqsState.loading
    ? 'Loading answers from the HR knowledge base…'
    : isFiltering
      ? `Showing ${filtered.length} of ${faqs.length} question${faqs.length === 1 ? '' : 's'}`
      : `Answers approved by HR · ${faqs.length} question${faqs.length === 1 ? '' : 's'}`;

  return (
    <>
      <PageTitle
        eyebrow="HR KNOWLEDGE BASE"
        title="HR FAQ assistant"
        description="Answers approved by People Operations, plus an assistant that searches the same knowledge base for you."
      />

      <section className="faq-hero">
        <div className="faq-hero-main">
          <span className="faq-avatar" aria-hidden="true"><Bot size={23} /><i /></span>
          <div className="faq-hero-copy">
            <Tag tone="blue">Orbit Assistant</Tag>
            <h2>Ask anything about work, policies and pay.</h2>
            <p>
              Ask how to use HROrbit — profile, announcements, kudos, Quick Connect — or about HR policies like
              leave, payroll and benefits. Policy answers come from the FAQ database maintained by HR.
            </p>
            <div className="faq-hero-actions">
              <button type="button" className="faq-cta" onClick={() => openAssistant()}>
                <MessageCircle size={15} aria-hidden="true" />
                Open chat assistant
              </button>
              <Link className="faq-cta-secondary" to="/hr-contacts">
                <LifeBuoy size={15} aria-hidden="true" />
                Contact HR
              </Link>
            </div>
          </div>
        </div>
        <div className="faq-hero-stats">
          <div className="faq-stat">
            <strong>{faqsState.loading ? '—' : faqs.length}</strong>
            <span>Approved answers</span>
          </div>
          <div className="faq-stat">
            <strong>{faqsState.loading ? '—' : categories.length}</strong>
            <span>HR topics</span>
          </div>
        </div>
      </section>

      <Panel className="faq-content-panel">
        <div className="faq-content-head">
          <div className="faq-content-title">
            <h2>Frequently asked questions</h2>
            <p>{subtitle}</p>
          </div>
          <div className="faq-toolbar">
            <label className="faq-search">
              <Search size={16} aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search questions and answers…"
                aria-label="Search HR questions and answers"
              />
              {search && (
                <button type="button" className="faq-search-clear" onClick={() => setSearch('')} aria-label="Clear search">
                  <X size={13} />
                </button>
              )}
            </label>
          </div>
        </div>

        <div className="faq-ask-row">
          <span className="faq-ask-label"><Sparkles size={12} aria-hidden="true" /> Ask the assistant</span>
          {APP_SUGGESTIONS.slice(0, 4).map((question) => (
            <button
              key={question}
              type="button"
              className="faq-ask-chip"
              onClick={() => openAssistant(question)}
            >
              {question}
              <ArrowUpRight size={12} aria-hidden="true" />
            </button>
          ))}
        </div>

        {categories.length > 1 && (
          <div className="faq-chips filter-chip-row" role="group" aria-label="Filter questions by topic">
            <button
              type="button"
              className={`filter-chip ${activeCategory === ALL ? 'selected' : ''}`}
              onClick={() => setActiveCategory(ALL)}
              aria-pressed={activeCategory === ALL}
            >
              All <span className="faq-chip-count">{faqs.length}</span>
            </button>
            {categories.map((category) => (
              <button
                key={category.label}
                type="button"
                className={`filter-chip ${activeCategory === category.label ? 'selected' : ''}`}
                onClick={() => setActiveCategory(category.label)}
                aria-pressed={activeCategory === category.label}
              >
                {category.label} <span className="faq-chip-count">{category.count}</span>
              </button>
            ))}
          </div>
        )}

        <div className="faq-list">
          {faqsState.loading && [0, 1, 2].map((row) => (
            <div className="faq-skeleton" key={row} aria-hidden="true"><i /><span /><b /></div>
          ))}

          {!faqsState.loading && faqsState.error && (
            <FaqState icon={AlertCircle} title="Unable to load FAQs" description={faqsState.error}>
              <button type="button" className="faq-cta-secondary" onClick={() => faqsState.refresh()}>
                <RotateCcw size={14} /> Try again
              </button>
            </FaqState>
          )}

          {!faqsState.loading && !faqsState.error && filtered.length === 0 && (
            isFiltering ? (
              <FaqState
                icon={Search}
                title="No matching questions"
                description="Nothing in the HR knowledge base matches your search yet. Try a broader term or ask the assistant directly."
              >
                <button type="button" className="faq-cta-secondary" onClick={resetFilters}>
                  <RotateCcw size={14} /> Clear filters
                </button>
                <button type="button" className="faq-cta" onClick={() => openAssistant()}>
                  <MessageCircle size={14} /> Ask the assistant
                </button>
              </FaqState>
            ) : (
              <FaqState
                icon={Sparkles}
                title="No answers published yet"
                description="HR has not published any FAQ entries. Reach out through Quick Connect and the people team will help directly."
              >
                <Link className="faq-cta-secondary" to="/hr-contacts">
                  <LifeBuoy size={14} /> Contact HR
                </Link>
              </FaqState>
            )
          )}

          {!faqsState.loading && !faqsState.error && filtered.map((item) => {
            const isOpen = openIds.includes(item.id);
            const answerId = `faq-answer-${item.id}`;
            return (
              <article className={`faq-item ${isOpen ? 'expanded' : ''}`} key={item.id}>
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => toggle(item.id)}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                >
                  <span className="faq-q-icon" aria-hidden="true"><CircleHelp size={16} /></span>
                  <span className="faq-q-text">
                    <small>{item.category || 'General'}</small>
                    <strong>{item.question}</strong>
                  </span>
                  <span className="faq-chevron" aria-hidden="true">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </button>
                {isOpen && (
                  <div className="faq-answer" id={answerId} role="region" aria-label={item.question}>
                    <div className="faq-answer-body">{item.answer}</div>
                    <div className="faq-answer-actions">
                      <Link className="faq-answer-link" to="/hr-contacts">
                        Still need help? Contact HR <ExternalLink size={12} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </Panel>

      <p className="demo-inline-note">Answers are provided from the company FAQ database. For anything unclear, contact HR directly.</p>
    </>
  );
}
