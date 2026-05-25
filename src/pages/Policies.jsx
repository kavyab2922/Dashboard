import PageLoader from '../components/common/PageLoader';
import { useState, useEffect } from 'react';
import { BookOpen, Search, Star, Clock, ChevronDown, ChevronUp, X } from 'lucide-react';
import { policiesAPI } from '../services/api';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

function PolicyCard({ policy, onClick }) {
  return (
    <div
      onClick={() => onClick(policy)}
      className="glass-card p-5 cursor-pointer hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5 group"
    >
      <div className="flex items-start gap-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: `${policy.categoryColor}15`, border: `1px solid ${policy.categoryColor}25` }}
        >
          {policy.categoryIcon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-white font-semibold text-sm leading-snug group-hover:text-primary-300 transition-colors">
              {policy.title}
            </h3>
            {policy.popular && (
              <Star size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
            )}
          </div>
          <p className="text-white/50 text-xs mt-1 line-clamp-2">{policy.description}</p>
          <div className="flex items-center gap-2 mt-3">
            <span
              className="badge text-xs"
              style={{
                background: `${policy.categoryColor}15`,
                color: policy.categoryColor,
                border: `1px solid ${policy.categoryColor}25`
              }}
            >
              {policy.category}
            </span>
            <span className="text-white/25 text-xs flex items-center gap-1">
              <Clock size={11} /> {policy.readTime}
            </span>
            <span className="text-white/20 text-xs ml-auto">{policy.version}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PolicyModal({ policy, onClose }) {
  if (!policy) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="glass-card max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#1a1833]/95 backdrop-blur-sm border-b border-white/5 px-6 py-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{policy.categoryIcon}</span>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">{policy.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-white/40 text-xs">Last updated: {format(parseISO(policy.lastUpdated), 'MMM d, yyyy')}</span>
                <span className="text-white/20">·</span>
                <span className="text-white/40 text-xs">{policy.version}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-white/60 text-sm mb-6 leading-relaxed">{policy.description}</p>

          <div className="space-y-5">
            {policy.content?.sections?.map((section, idx) => (
              <div key={idx} className="border-l-2 pl-4" style={{ borderColor: policy.categoryColor }}>
                <h3 className="text-white font-semibold mb-2">{section.heading}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 mt-6 pt-4 border-t border-white/5">
            {policy.tags.map(tag => (
              <span key={tag} className="badge bg-white/5 text-white/30 border border-white/8 text-xs">
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="flex items-center gap-1.5 text-white/30 text-sm">
              <Clock size={14} /> ~{policy.readTime} read
            </span>
            <button
              onClick={onClose}
              className="btn-primary text-sm py-2"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Policies() {
  const [policies, setPolicies] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCategory !== 'all') params.category = activeCategory;
      if (search) params.search = search;

      const [data, cats] = await Promise.all([
        policiesAPI.getAll(params),
        policiesAPI.getCategories(),
      ]);
      setPolicies(data);
      setCategories(['all', ...cats]);
    } catch {
      toast.error('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPolicies(); }, [activeCategory]);

  useEffect(() => {
    const timeout = setTimeout(fetchPolicies, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const popular = policies.filter(p => p.popular);
  const others = policies.filter(p => !p.popular);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <BookOpen size={24} className="text-purple-400" />
            Policy & Resource Hub
          </h1>
          <p className="text-white/40 text-sm mt-1">Find the information you need, instantly.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Search policies by title, category, or keyword..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-11 py-3 text-base"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              activeCategory === cat
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                : 'bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10 border border-white/5'
            }`}
          >
            {cat === 'all' ? 'All Policies' : cat}
          </button>
        ))}
      </div>

      <PageLoader loading={loading}>
        <div className="space-y-8">
          {!search && activeCategory === 'all' && popular.length > 0 && (
            <div>
              <h2 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                <Star size={12} className="text-amber-400" /> Popular Policies
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {popular.map(policy => <PolicyCard key={policy.id} policy={policy} onClick={setSelectedPolicy} />)}
              </div>
            </div>
          )}
          {(search || activeCategory !== 'all' ? policies : others).length > 0 && (
            <div>
              {!search && activeCategory === 'all' && popular.length > 0 && (
                <h2 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">All Policies</h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(search || activeCategory !== 'all' ? policies : others).map(policy => (
                  <PolicyCard key={policy.id} policy={policy} onClick={setSelectedPolicy} />
                ))}
              </div>
            </div>
          )}
          {!loading && policies.length === 0 && (
            <div className="text-center py-16">
              <Search size={40} className="text-white/15 mx-auto mb-3" />
              <p className="text-white/30">No policies found for "{search}"</p>
              <button onClick={() => { setSearch(''); setActiveCategory('all'); }} className="text-primary-400 text-sm mt-2 hover:text-primary-300 transition-colors">
                Clear filters
              </button>
            </div>
          )}
        </div>
      </PageLoader>

      <PolicyModal policy={selectedPolicy} onClose={() => setSelectedPolicy(null)} />
    </div>
  );
}
