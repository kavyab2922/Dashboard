import { useState } from 'react';
import { MessageSquare, Send, CheckCircle, Star, Shield } from 'lucide-react';
import { feedbackAPI } from '../services/api';
import toast from 'react-hot-toast';

const TYPES = [
  { value: 'suggestion', label: '💡 Suggestion', color: '#f59e0b' },
  { value: 'appreciation', label: '❤️ Appreciation', color: '#ec4899' },
  { value: 'concern', label: '⚠️ Concern', color: '#ef4444' },
  { value: 'idea', label: '🚀 Idea', color: '#6366f1' },
  { value: 'other', label: '💬 Other', color: '#10b981' },
];

const TOPICS = [
  'Work Culture', 'Management', 'Benefits', 'Office Environment',
  'Learning & Development', 'Team Collaboration', 'Processes', 'Other'
];

export default function Feedback() {
  const [form, setForm] = useState({
    type: '',
    topic: '',
    subject: '',
    message: '',
    rating: 0,
    anonymous: true,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.type || !form.topic || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      await feedbackAPI.submit({
        ...form,
        submittedBy: form.anonymous ? 'Anonymous' : 'Arjun Sharma',
      });
      setSubmitted(true);
      toast.success('Feedback submitted successfully!');
    } catch {
      toast.error('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-400" />
          </div>
          <h2 className="text-white text-2xl font-bold mb-2">Thank You! 🙏</h2>
          <p className="text-white/50 text-base mb-6 leading-relaxed">
            Your feedback has been received. We take every submission seriously and work to continuously improve.
          </p>
          <button
            onClick={() => { setSubmitted(false); setForm({ type: '', topic: '', subject: '', message: '', rating: 0, anonymous: true }); }}
            className="btn-primary mx-auto"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="section-title flex items-center gap-2">
          <MessageSquare size={24} className="text-indigo-400" />
          Share Your Feedback
        </h1>
        <p className="text-white/40 text-sm mt-1">Your voice shapes our workplace. Every word counts.</p>
      </div>

      {/* Anonymous Toggle Banner */}
      <div className="glass-card p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield size={18} className="text-primary-400" />
          <div>
            <p className="text-white/80 text-sm font-medium">Anonymous Submission</p>
            <p className="text-white/40 text-xs">Your identity is {form.anonymous ? 'hidden' : 'visible'}</p>
          </div>
        </div>
        <button
          onClick={() => setForm(f => ({ ...f, anonymous: !f.anonymous }))}
          className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
            form.anonymous ? 'bg-primary-600' : 'bg-white/10'
          }`}
        >
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
            form.anonymous ? 'left-7' : 'left-0.5'
          }`} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
        {/* Type Selection */}
        <div>
          <label className="text-white/60 text-sm font-medium mb-3 block">Feedback Type *</label>
          <div className="flex flex-wrap gap-2">
            {TYPES.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, type: type.value }))}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  form.type === type.value
                    ? 'border-opacity-40 text-white'
                    : 'border-white/8 bg-white/3 text-white/60 hover:bg-white/6'
                }`}
                style={form.type === type.value ? {
                  background: `${type.color}20`,
                  borderColor: `${type.color}50`,
                  color: type.color
                } : {}}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Topic */}
        <div>
          <label className="text-white/60 text-sm font-medium mb-2 block">Topic *</label>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map(topic => (
              <button
                key={topic}
                type="button"
                onClick={() => setForm(f => ({ ...f, topic }))}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  form.topic === topic
                    ? 'bg-primary-600 text-white'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/5'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="text-white/60 text-sm font-medium mb-2 block">Subject (optional)</label>
          <input
            type="text"
            value={form.subject}
            onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
            placeholder="Brief subject line..."
            className="input-field"
          />
        </div>

        {/* Message */}
        <div>
          <label className="text-white/60 text-sm font-medium mb-2 block">Your Message *</label>
          <textarea
            value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            placeholder="Share your thoughts openly and honestly..."
            rows={5}
            className="input-field resize-none"
            required
          />
          <p className="text-white/25 text-xs mt-1.5 text-right">{form.message.length} characters</p>
        </div>

        {/* Overall Rating */}
        <div>
          <label className="text-white/60 text-sm font-medium mb-3 block">Overall Workplace Rating</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setForm(f => ({ ...f, rating: star }))}
                className="transition-all duration-100"
              >
                <Star
                  size={28}
                  className={`transition-all ${
                    star <= (hoveredStar || form.rating)
                      ? 'text-amber-400 fill-current'
                      : 'text-white/20'
                  }`}
                />
              </button>
            ))}
            {form.rating > 0 && (
              <span className="text-amber-400 text-sm ml-2 font-medium">
                {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][form.rating]}
              </span>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center py-3 text-base"
        >
          {loading ? (
            <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <>
              <Send size={18} />
              {form.anonymous ? 'Submit Anonymously' : 'Submit Feedback'}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
