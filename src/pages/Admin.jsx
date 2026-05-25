import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Megaphone, Trophy, CheckCircle, XCircle,
  MessageSquare, Plus, Send, Eye, Clock, RefreshCw,
  Users, TrendingUp, BarChart3, Zap, ChevronDown, Lock,
  Gamepad2, Vote, Trash2, Search, Filter, Calendar, UserPlus, Mail, Phone, MapPin, Briefcase
} from 'lucide-react';
import { announcementsAPI, leavesAPI, achievementsAPI, feedbackAPI, analyticsAPI, fridayAPI, employeesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import Avatar from '../components/common/Avatar';
import toast from 'react-hot-toast';

const SPRING = { type: 'spring', stiffness: 200, damping: 28 };

/* ── Access Guard ──────────────────────────────────────────── */
function AccessDenied() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
        <Lock size={36} style={{ color: '#f87171' }} />
      </div>
      <h2 className="text-white text-2xl font-black mb-2">Access Restricted</h2>
      <p className="text-white/45 text-sm mb-6 max-w-sm leading-relaxed">
        This area requires the <span className="text-red-400 font-bold">hr-admin</span> role.<br />
        Sign in as <strong className="text-white/70">Meera Nair</strong> to access the HR Admin Portal.
      </p>
      <button onClick={() => navigate('/')} className="btn-secondary">← Back to Dashboard</button>
    </div>
  );
}

/* ── Stat Mini Card ────────────────────────────────────────── */
function MiniStat({ icon: Icon, label, value, color }) {
  return (
    <div className="glass-card p-4 flex items-center gap-3"
      style={{ border: `1px solid ${color}20` }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div>
        <p className="text-white font-black text-xl">{value}</p>
        <p className="text-white/40 text-xs">{label}</p>
      </div>
    </div>
  );
}

/* ── Panel: Post Announcement ──────────────────────────────── */
function PostAnnouncementPanel() {
  const [form, setForm] = useState({
    title: '', content: '', category: 'Company News', priority: 'medium', pinned: false,
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const CATEGORIES = ['Company News', 'Events', 'Policy Update', 'Benefits', 'Learning & Development', 'Facilities', 'New Joinee'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) { toast.error('Fill in title and content'); return; }
    setLoading(true);
    try {
      await announcementsAPI.create({
        ...form,
        author: 'Meera Nair',
        authorRole: 'HR Business Partner',
        authorAvatar: 'MN',
        authorColor: '#f97316',
        categoryColor: '#3b82f6',
        tags: [],
        views: 0,
        likes: 0,
      });
      toast.success('🎉 Announcement published! It\'s live now.');
      setSent(true);
      setTimeout(() => { setSent(false); setForm({ title: '', content: '', category: 'Company News', priority: 'medium', pinned: false }); }, 2500);
    } catch { toast.error('Failed to publish'); }
    finally { setLoading(false); }
  };

  return (
    <div className="glass-card p-6" style={{ border: '1px solid rgba(59,130,246,0.2)' }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)' }}>
          <Megaphone size={18} style={{ color: '#60a5fa' }} />
        </div>
        <div>
          <h3 className="text-white font-black text-base">Post Announcement</h3>
          <p className="text-white/35 text-xs">Publish instantly to all employees</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div key="success"
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center py-8 text-center">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>
              <CheckCircle size={48} className="text-emerald-400 mx-auto mb-3" />
            </motion.div>
            <p className="text-white font-black">Published! 🎉</p>
            <p className="text-white/40 text-sm mt-1">All employees can see it now</p>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={handleSubmit} className="space-y-4" initial={{ opacity: 1 }}>
            <div>
              <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Title *</label>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. New Leave Policy Effective April 1st" className="input-field" required />
            </div>
            <div>
              <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Content *</label>
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Write the full announcement here…" rows={4} className="input-field resize-none" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Priority</label>
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="input-field">
                  <option value="high">🔴 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setForm(f => ({ ...f, pinned: !f.pinned }))}
                className="relative w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0"
                style={{ background: form.pinned ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.1)' }}>
                <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300"
                  style={{ left: form.pinned ? '22px' : '2px' }} />
              </button>
              <span className="text-white/60 text-sm">Pin to top of announcements</span>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-2xl font-black text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', boxShadow: '0 4px 20px rgba(59,130,246,0.35)' }}>
              {loading ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <><Send size={16} /> Publish Now</>}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Panel: Approve Leaves ─────────────────────────────────── */
function LeavesPanel() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = () => {
    setLoading(true);
    leavesAPI.getAll({ status: 'pending' })
      .then(d => { setLeaves(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleAction = async (id, action) => {
    try {
      await leavesAPI.updateStatus(id, action, 'Meera Nair');
      toast.success(`Leave ${action === 'approved' ? '✅ Approved' : '❌ Rejected'}`);
      fetchLeaves();
    } catch { toast.error('Action failed'); }
  };

  const statusColor = { pending: '#f59e0b', approved: '#10b981', rejected: '#ef4444' };

  return (
    <div className="glass-card p-6" style={{ border: '1px solid rgba(245,158,11,0.2)' }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <CheckCircle size={18} style={{ color: '#fbbf24' }} />
          </div>
          <div>
            <h3 className="text-white font-black text-base">Leave Approvals</h3>
            <p className="text-white/35 text-xs">{leaves.length} pending request{leaves.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button onClick={fetchLeaves} className="p-2 rounded-xl text-white/30 hover:text-white hover:bg-white/5 transition-all">
          <RefreshCw size={15} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        </div>
      ) : leaves.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle size={36} className="text-emerald-400 mx-auto mb-2" />
          <p className="text-white/40 text-sm">All caught up! No pending requests.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {leaves.map(leave => (
              <motion.div key={leave.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20, height: 0 }}
                transition={SPRING}
                className="p-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-white font-bold text-sm">{leave.employeeName}</p>
                      <span className="badge text-[10px]"
                        style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' }}>
                        {leave.type}
                      </span>
                      <span className="text-white/30 text-xs">{leave.days}d</span>
                    </div>
                    <p className="text-white/40 text-xs">{format(parseISO(leave.from), 'MMM d')} – {format(parseISO(leave.to), 'MMM d')}</p>
                    <p className="text-white/30 text-xs mt-0.5 italic">"{leave.reason}"</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                      onClick={() => handleAction(leave.id, 'approved')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                      style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
                      <CheckCircle size={12} /> Approve
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                      onClick={() => handleAction(leave.id, 'rejected')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                      style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                      <XCircle size={12} /> Reject
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/* ── Panel: Add Achievement ────────────────────────────────── */
function AddAchievementPanel() {
  const EMPLOYEES = [
    { id: 'emp001', name: 'Arjun Sharma',   dept: 'Engineering',     photo: 'https://randomuser.me/api/portraits/men/32.jpg',   color: '#6366f1', avatar: 'AS' },
    { id: 'emp002', name: 'Priya Menon',    dept: 'Engineering',     photo: 'https://randomuser.me/api/portraits/women/44.jpg',  color: '#8b5cf6', avatar: 'PM' },
    { id: 'emp003', name: 'Sneha Kapoor',   dept: 'Design',          photo: 'https://randomuser.me/api/portraits/women/26.jpg',  color: '#ec4899', avatar: 'SK' },
    { id: 'emp005', name: 'Ananya Iyer',    dept: 'Analytics',       photo: 'https://randomuser.me/api/portraits/women/54.jpg',  color: '#10b981', avatar: 'AI' },
    { id: 'emp008', name: 'Karan Malhotra', dept: 'Engineering',     photo: 'https://randomuser.me/api/portraits/men/22.jpg',    color: '#14b8a6', avatar: 'KM' },
    { id: 'emp009', name: 'Divya Reddy',    dept: 'Marketing',       photo: 'https://randomuser.me/api/portraits/women/17.jpg',  color: '#a855f7', avatar: 'DR' },
    { id: 'emp010', name: 'Rahul Joshi',    dept: 'Engineering',     photo: 'https://randomuser.me/api/portraits/men/18.jpg',    color: '#ef4444', avatar: 'RJ' },
  ];
  const BADGES = ['🏆', '⭐', '🚀', '💎', '🌟', '🎨', '🛡️', '❤️'];
  const CATEGORIES = ['Innovation', 'Leadership', 'Excellence', 'Technical Excellence', 'Business Impact', 'Culture', 'Community'];

  const [form, setForm] = useState({ employeeId: '', title: '', description: '', category: 'Excellence', badge: '🏆', featured: false });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emp = EMPLOYEES.find(e => e.id === form.employeeId);
    if (!emp) { toast.error('Select an employee'); return; }
    setLoading(true);
    try {
      // POST to achievements via API
      await fetch('/api/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `ach${Date.now()}`,
          employeeId: emp.id, employeeName: emp.name,
          avatar: emp.avatar, photo: emp.photo, coverColor: emp.color,
          title: form.title, description: form.description,
          category: form.category, badge: form.badge,
          badgeColor: emp.color, featured: form.featured,
          date: new Date().toISOString().split('T')[0],
          likes: 0, comments: 0, department: emp.dept,
        }),
      });
      toast.success(`🏆 Achievement added for ${emp.name}!`);
      setDone(true);
      setTimeout(() => { setDone(false); setForm({ employeeId: '', title: '', description: '', category: 'Excellence', badge: '🏆', featured: false }); }, 2500);
    } catch { toast.error('Failed to add achievement'); }
    finally { setLoading(false); }
  };

  return (
    <div className="glass-card p-6" style={{ border: '1px solid rgba(245,158,11,0.2)' }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <Trophy size={18} style={{ color: '#fbbf24' }} />
        </div>
        <div>
          <h3 className="text-white font-black text-base">Add Achievement</h3>
          <p className="text-white/35 text-xs">Recognize an employee's contribution</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="ok" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center py-8 text-center">
            <motion.span className="text-5xl mb-3" animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 0.6 }}>🏆</motion.span>
            <p className="text-white font-black">Achievement Published!</p>
            <p className="text-white/40 text-sm mt-1">Visible on Spotlight now</p>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={handleSubmit} className="space-y-4" initial={{ opacity: 1 }}>
            <div>
              <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Employee *</label>
              <select value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} className="input-field" required>
                <option value="">Select employee…</option>
                {EMPLOYEES.map(e => <option key={e.id} value={e.id}>{e.name} — {e.dept}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Achievement Title *</label>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Q1 2026 Innovation Champion" className="input-field" required />
            </div>
            <div>
              <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="What did they do and why does it matter?" rows={3} className="input-field resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Badge</label>
                <div className="flex gap-1.5 flex-wrap">
                  {BADGES.map(b => (
                    <button key={b} type="button" onClick={() => setForm(f => ({ ...f, badge: b }))}
                      className="w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all"
                      style={{ background: form.badge === b ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)', border: form.badge === b ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.07)', transform: form.badge === b ? 'scale(1.15)' : 'scale(1)' }}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setForm(f => ({ ...f, featured: !f.featured }))}
                className="relative w-10 h-5 rounded-full transition-all duration-300"
                style={{ background: form.featured ? 'linear-gradient(135deg, #f59e0b, #fb923c)' : 'rgba(255,255,255,0.1)' }}>
                <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300"
                  style={{ left: form.featured ? '22px' : '2px' }} />
              </button>
              <span className="text-white/60 text-sm">Feature on Dashboard</span>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-2xl font-black text-white flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #fb923c)', boxShadow: '0 4px 20px rgba(245,158,11,0.35)' }}>
              {loading ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <><Plus size={16} /> Add Achievement</>}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Panel: View Feedback ──────────────────────────────────── */
function FeedbackPanel() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    feedbackAPI.getAll()
      .then(d => { setFeedbacks(d.reverse()); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const typeColor = { suggestion: '#f59e0b', appreciation: '#ec4899', concern: '#ef4444', idea: '#6366f1', other: '#10b981' };
  const typeEmoji = { suggestion: '💡', appreciation: '❤️', concern: '⚠️', idea: '🚀', other: '💬' };
  const ratingStars = (r) => r ? '★'.repeat(r) + '☆'.repeat(5 - r) : null;

  return (
    <div className="glass-card p-6" style={{ border: '1px solid rgba(139,92,246,0.2)' }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)' }}>
          <MessageSquare size={18} style={{ color: '#a78bfa' }} />
        </div>
        <div>
          <h3 className="text-white font-black text-base">Employee Feedback</h3>
          <p className="text-white/35 text-xs">{feedbacks.length} submission{feedbacks.length !== 1 ? 's' : ''} received</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare size={36} style={{ color: 'rgba(255,255,255,0.1)' }} className="mx-auto mb-2" />
          <p className="text-white/40 text-sm">No feedback submissions yet.</p>
          <p className="text-white/25 text-xs mt-1">Encourage employees to share feedback!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {feedbacks.map((fb, i) => (
            <motion.div key={fb.id}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: i * 0.05 }}
              className="rounded-2xl overflow-hidden cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              onClick={() => setExpanded(expanded === fb.id ? null : fb.id)}>
              <div className="flex items-center gap-3 p-3.5">
                <span className="text-lg flex-shrink-0">{typeEmoji[fb.type] || '💬'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${typeColor[fb.type] || '#6366f1'}15`, color: typeColor[fb.type] || '#6366f1' }}>
                      {fb.type || 'other'}
                    </span>
                    <span className="text-white/50 text-xs font-medium">{fb.topic}</span>
                    {fb.rating && <span className="text-amber-400 text-xs">{ratingStars(fb.rating)}</span>}
                    <span className="text-white/20 text-xs ml-auto">{fb.anonymous ? '🔒 Anonymous' : fb.submittedBy}</span>
                  </div>
                  {fb.subject && <p className="text-white/60 text-xs mt-0.5 truncate">{fb.subject}</p>}
                </div>
                <ChevronDown size={13} className="text-white/25 flex-shrink-0 transition-transform"
                  style={{ transform: expanded === fb.id ? 'rotate(180deg)' : '' }} />
              </div>
              <AnimatePresence>
                {expanded === fb.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                    style={{ overflow: 'hidden' }}>
                    <div className="px-4 pb-4 pt-1"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <p className="text-white/65 text-sm leading-relaxed">{fb.message}</p>
                      <p className="text-white/20 text-xs mt-2">Submitted: {fb.date}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Panel: Add Employee ───────────────────────────────────── */
function AddEmployeePanel() {
  const DEPARTMENTS = ['Engineering', 'Design', 'Product', 'Analytics', 'Marketing', 'Human Resources', 'Finance', 'Operations', 'Sales'];
  const COVER_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#f97316', '#14b8a6', '#ef4444', '#a855f7'];

  const [form, setForm] = useState({
    name: '', role: '', department: 'Engineering', email: '', phone: '',
    location: 'Bangalore', joinDate: new Date().toISOString().split('T')[0],
    bio: '', manager: '', coverColor: '#6366f1',
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(null);

  const getInitials = (name) => name.trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.role || !form.email) { toast.error('Name, role and email are required'); return; }
    setLoading(true);
    try {
      const avatar = getInitials(form.name);
      const employee = await employeesAPI.add({
        ...form,
        avatar,
        photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name)}&background=${form.coverColor.slice(1)}&color=fff&size=128`,
        birthday: '',
        skills: [],
        status: 'active',
        points: 0,
        yearsAtCompany: 0,
        achievements: [],
      });
      setDone(employee.name);
      toast.success(`${employee.name} added to the team!`);
      setTimeout(() => {
        setDone(null);
        setForm({ name: '', role: '', department: 'Engineering', email: '', phone: '', location: 'Bangalore', joinDate: new Date().toISOString().split('T')[0], bio: '', manager: '', coverColor: '#6366f1' });
      }, 3000);
    } catch { toast.error('Failed to add employee'); }
    finally { setLoading(false); }
  };

  return (
    <div className="glass-card p-6 lg:col-span-2" style={{ border: '1px solid rgba(99,102,241,0.2)' }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
          <UserPlus size={18} style={{ color: '#818cf8' }} />
        </div>
        <div>
          <h3 className="text-white font-black text-base">Add New Employee</h3>
          <p className="text-white/35 text-xs">Create a new employee profile in the system</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="success"
            initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center py-10 text-center">
            <motion.div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}
              animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5 }}>
              <CheckCircle size={40} className="text-emerald-400" />
            </motion.div>
            <p className="text-white font-black text-lg">{done} added!</p>
            <p className="text-white/40 text-sm mt-1">Visible in Directory and throughout the portal</p>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={handleSubmit} className="space-y-5" initial={{ opacity: 1 }}>
            {/* Row 1 — Name + Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Full Name *</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Riya Sharma" className="input-field" required />
              </div>
              <div>
                <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Job Title *</label>
                <input type="text" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  placeholder="e.g. Frontend Engineer" className="input-field" required />
              </div>
            </div>

            {/* Row 2 — Department + Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Department *</label>
                <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className="input-field">
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Location</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="Bangalore" className="input-field pl-9" />
                </div>
              </div>
            </div>

            {/* Row 3 — Email + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Email *</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="riya@company.com" className="input-field pl-9" required />
                </div>
              </div>
              <div>
                <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Phone</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 98765 00000" className="input-field pl-9" />
                </div>
              </div>
            </div>

            {/* Row 4 — Manager + Join Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Reporting Manager</label>
                <div className="relative">
                  <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input type="text" value={form.manager} onChange={e => setForm(f => ({ ...f, manager: e.target.value }))}
                    placeholder="e.g. Priya Menon" className="input-field pl-9" />
                </div>
              </div>
              <div>
                <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Join Date</label>
                <input type="date" value={form.joinDate} onChange={e => setForm(f => ({ ...f, joinDate: e.target.value }))}
                  className="input-field" />
              </div>
            </div>

            {/* Row 5 — Bio */}
            <div>
              <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Short Bio</label>
              <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="A brief intro about this person…" rows={2} className="input-field resize-none" />
            </div>

            {/* Row 6 — Cover colour picker */}
            <div>
              <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Profile Colour</label>
              <div className="flex gap-2 flex-wrap">
                {COVER_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm(f => ({ ...f, coverColor: c }))}
                    className="w-8 h-8 rounded-xl transition-all"
                    style={{
                      background: c,
                      border: form.coverColor === c ? '3px solid white' : '2px solid transparent',
                      boxShadow: form.coverColor === c ? `0 0 12px ${c}80` : 'none',
                      transform: form.coverColor === c ? 'scale(1.2)' : 'scale(1)',
                    }} />
                ))}
              </div>
            </div>

            {/* Preview pill */}
            {form.name && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: `${form.coverColor}10`, border: `1px solid ${form.coverColor}25` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white flex-shrink-0"
                  style={{ background: form.coverColor }}>
                  {getInitials(form.name) || '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm truncate">{form.name || 'Employee Name'}</p>
                  <p className="text-white/40 text-xs">{form.role || 'Role'} · {form.department}</p>
                </div>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>Preview</span>
              </motion.div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-2xl font-black text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}>
              {loading
                ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                : <><UserPlus size={16} /> Add Employee</>
              }
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main Admin Page ───────────────────────────────────────── */
/* ── Fun Friday Admin Section ──────────────────────────────── */
function FridayAdminSection() {
  const [suggestions, setSuggestions] = useState([]);
  const [polls, setPolls]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('suggestions');
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreatePoll, setShowCreatePoll] = useState(false);

  // Poll form
  const [pollForm, setPollForm] = useState({ title: '', selectedGames: [], startDate: '', endDate: '' });
  const [creating, setCreating] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([fridayAPI.getSuggestions(), fridayAPI.getPolls()]);
      setSuggestions(s); setPolls(p);
    } catch { toast.error('Failed to load Friday data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSuggestionAction = async (id, action, extra = {}) => {
    try {
      await fridayAPI.updateSuggestion(id, { status: action, ...extra });
      toast.success(`Suggestion ${action}!`);
      fetchAll();
    } catch { toast.error('Action failed'); }
  };

  const handleDeleteSuggestion = async (id) => {
    if (!window.confirm('Delete this suggestion?')) return;
    await fridayAPI.deleteSuggestion(id);
    toast.success('Deleted');
    fetchAll();
  };

  const handlePollAction = async (id, action) => {
    try {
      await fridayAPI.updatePoll(id, { action });
      toast.success(`Poll ${action}d!`);
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  const handleCreatePoll = async () => {
    if (!pollForm.title || !pollForm.startDate || !pollForm.endDate || pollForm.selectedGames.length < 2) {
      toast.error('Fill all fields & select at least 2 games'); return;
    }
    setCreating(true);
    try {
      const approvedMap = suggestions.filter(s => s.status === 'approved')
        .reduce((m, s) => { m[s.id] = s; return m; }, {});
      await fridayAPI.createPoll({
        title: pollForm.title,
        startDate: pollForm.startDate,
        endDate: pollForm.endDate,
        games: pollForm.selectedGames.map(id => ({
          suggestionId: id,
          title: approvedMap[id]?.title || '',
          emoji: approvedMap[id]?.emoji || '🎮',
        })),
      });
      toast.success('🎮 Poll created & activated!');
      setShowCreatePoll(false);
      setPollForm({ title: '', selectedGames: [], startDate: '', endDate: '' });
      fetchAll();
    } catch { toast.error('Failed to create poll'); }
    finally { setCreating(false); }
  };

  const toggleGame = (id) => {
    setPollForm(f => ({
      ...f,
      selectedGames: f.selectedGames.includes(id)
        ? f.selectedGames.filter(g => g !== id)
        : [...f.selectedGames, id],
    }));
  };

  const STATUS_COLORS = {
    pending:  { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
    approved: { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
    rejected: { bg: 'rgba(239,68,68,0.12)', color: '#f87171' },
  };

  const POLL_COLORS = {
    active:   { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
    closed:   { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24' },
    archived: { bg: 'rgba(99,102,241,0.12)', color: '#a5b4fc' },
  };

  const filteredSuggestions = suggestions
    .filter(s => filterStatus === 'all' || s.status === filterStatus)
    .filter(s => !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.submitterName.toLowerCase().includes(search.toLowerCase()));

  const approvedSuggestions = suggestions.filter(s => s.status === 'approved');

  return (
    <div className="mt-2">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-5 p-5 glass-card"
        style={{ border: '1px solid rgba(236,72,153,0.2)', background: 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(99,102,241,0.04))' }}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
          style={{ background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.25)' }}>
          🎮
        </div>
        <div className="flex-1">
          <h3 className="text-white font-black text-lg">Fun Friday Management</h3>
          <p className="text-white/35 text-xs">Manage suggestions, polls & declare winners</p>
        </div>
        <div className="flex gap-2">
          <span className="badge text-xs" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>
            {suggestions.filter(s => s.status === 'pending').length} pending
          </span>
          <span className="badge text-xs" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
            {polls.filter(p => p.status === 'active').length} active polls
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { id: 'suggestions', label: `🎲 Suggestions (${suggestions.filter(s=>s.status==='pending').length} pending)` },
          { id: 'polls',       label: `🗳️ Polls & Results` },
          { id: 'create',      label: `➕ Create Poll` },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={activeTab === tab.id
              ? { background: 'linear-gradient(135deg, #ec4899, #6366f1)', color: 'white', boxShadow: '0 4px 16px rgba(236,72,153,0.3)' }
              : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }
            }>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Suggestions Tab ───────────────────────────── */}
      {activeTab === 'suggestions' && (
        <div className="glass-card p-5">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-40">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input type="text" placeholder="Search suggestions…" value={search}
                onChange={e => setSearch(e.target.value)} className="input-field pl-9 py-2 text-sm w-full" />
            </div>
            <div className="flex gap-1">
              {['all','pending','approved','rejected'].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className="px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all"
                  style={filterStatus === s
                    ? { background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }
                    : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.07)' }
                  }>{s}</button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {filteredSuggestions.map(s => {
                const sc = STATUS_COLORS[s.status] || STATUS_COLORS.pending;
                return (
                  <motion.div key={s.id}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 p-3.5 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <span className="text-xl flex-shrink-0">{s.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white/80 text-sm font-semibold">{s.title}</p>
                        <span className="badge text-[10px] font-bold" style={{ background: sc.bg, color: sc.color }}>{s.status}</span>
                        <span className="text-white/25 text-xs">{s.category}</span>
                      </div>
                      <p className="text-white/40 text-xs mt-0.5">
                        By <strong className="text-white/60">{s.submitterName}</strong> · {s.department} · {s.date}
                      </p>
                      {s.description && <p className="text-white/30 text-xs mt-0.5 line-clamp-1 italic">{s.description}</p>}
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {s.status === 'pending' && <>
                        <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                          onClick={() => handleSuggestionAction(s.id, 'approved')}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                          style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
                          <CheckCircle size={11}/> Approve
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                          onClick={() => handleSuggestionAction(s.id, 'rejected')}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                          style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                          <XCircle size={11}/> Reject
                        </motion.button>
                      </>}
                      <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                        onClick={() => handleDeleteSuggestion(s.id)}
                        className="p-1.5 rounded-lg text-xs transition-all"
                        style={{ background: 'rgba(239,68,68,0.08)', color: 'rgba(239,68,68,0.6)', border: '1px solid rgba(239,68,68,0.15)' }}>
                        <Trash2 size={13}/>
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {filteredSuggestions.length === 0 && (
              <div className="text-center py-8">
                <Gamepad2 size={32} style={{ color: 'rgba(255,255,255,0.1)' }} className="mx-auto mb-2" />
                <p className="text-white/30 text-sm">No suggestions found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Polls Tab ─────────────────────────────────── */}
      {activeTab === 'polls' && (
        <div className="space-y-4">
          {polls.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <Vote size={36} style={{ color: 'rgba(255,255,255,0.1)' }} className="mx-auto mb-3" />
              <p className="text-white/30">No polls yet. Create one!</p>
            </div>
          ) : polls.map(poll => {
            const pc = POLL_COLORS[poll.status] || POLL_COLORS.archived;
            const maxVotes = poll.games.length > 0 ? Math.max(...poll.games.map(g=>g.votes), 1) : 1;
            return (
              <div key={poll.id} className="glass-card p-5"
                style={{ border: `1px solid ${pc.color}25` }}>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h4 className="text-white font-black">{poll.title}</h4>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="badge text-xs font-bold" style={{ background: pc.bg, color: pc.color }}>{poll.status}</span>
                      <span className="text-white/30 text-xs flex items-center gap-1"><Users size={10}/> {poll.totalVotes} votes</span>
                      <span className="text-white/25 text-xs">{poll.startDate} → {poll.endDate}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {poll.status === 'active' && (
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handlePollAction(poll.id, 'close')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                        style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}>
                        <Clock size={12}/> Close Poll
                      </motion.button>
                    )}
                    {poll.status === 'closed' && (
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handlePollAction(poll.id, 'archive')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                        style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }}>
                        <Trophy size={12}/> Declare & Archive
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Results bars */}
                <div className="space-y-2">
                  {poll.games.sort((a,b)=>b.votes-a.votes).map(game => {
                    const pct = poll.totalVotes > 0 ? Math.round((game.votes/poll.totalVotes)*100) : 0;
                    const isWinner = poll.winner?.suggestionId === game.suggestionId || game.votes === maxVotes;
                    return (
                      <div key={game.suggestionId} className="flex items-center gap-3">
                        <span className="text-base w-7 text-center flex-shrink-0">{game.emoji}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white/70 text-xs font-medium">{game.title}</span>
                            <span className="text-xs font-bold" style={{ color: isWinner && poll.status!=='active' ? '#fbbf24' : 'rgba(255,255,255,0.4)' }}>
                              {game.votes} ({pct}%) {isWinner && poll.status!=='active' ? '🏆' : ''}
                            </span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <div className="h-full rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                background: isWinner && poll.status!=='active' ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' : 'rgba(99,102,241,0.6)',
                                boxShadow: isWinner && poll.status!=='active' ? '0 0 8px rgba(251,191,36,0.5)' : 'none',
                              }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create Poll Tab ───────────────────────────── */}
      {activeTab === 'create' && (
        <div className="glass-card p-6" style={{ border: '1px solid rgba(99,102,241,0.2)' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
              🗳️
            </div>
            <div>
              <h3 className="text-white font-black">Create New Poll</h3>
              <p className="text-white/35 text-xs">Select approved games and set voting dates</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Poll Title *</label>
              <input type="text" value={pollForm.title}
                onChange={e => setPollForm(f => ({...f, title: e.target.value}))}
                placeholder="e.g. Fun Friday — March 14, 2026 🎮"
                className="input-field" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Start Date *</label>
                <input type="date" value={pollForm.startDate}
                  onChange={e => setPollForm(f => ({...f, startDate: e.target.value}))}
                  className="input-field" />
              </div>
              <div>
                <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">End Date *</label>
                <input type="date" value={pollForm.endDate}
                  onChange={e => setPollForm(f => ({...f, endDate: e.target.value}))}
                  className="input-field" min={pollForm.startDate} />
              </div>
            </div>

            <div>
              <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-3">
                Select Games * <span className="normal-case font-normal text-white/25">(only approved games · min 2)</span>
              </label>
              {approvedSuggestions.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-4">No approved suggestions yet. Approve some first!</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {approvedSuggestions.map(s => {
                    const sel = pollForm.selectedGames.includes(s.id);
                    return (
                      <button key={s.id} type="button" onClick={() => toggleGame(s.id)}
                        className="flex items-center gap-2.5 p-3 rounded-xl text-left transition-all"
                        style={sel
                          ? { background:'rgba(99,102,241,0.18)', border:'1px solid rgba(99,102,241,0.4)', boxShadow:'0 0 12px rgba(99,102,241,0.2)' }
                          : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }
                        }>
                        <span className="text-xl flex-shrink-0">{s.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/80 text-sm font-semibold truncate">{s.title}</p>
                          <p className="text-white/30 text-xs">{s.category}</p>
                        </div>
                        <div className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                          style={{ borderColor: sel ? '#6366f1' : 'rgba(255,255,255,0.2)', background: sel ? '#6366f1' : 'transparent' }}>
                          {sel && <CheckCircle size={13} className="text-white"/>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {pollForm.selectedGames.length > 0 && (
              <div className="px-4 py-3 rounded-xl"
                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <p className="text-white/60 text-xs font-bold">
                  {pollForm.selectedGames.length} game{pollForm.selectedGames.length!==1?'s':''} selected for this poll
                </p>
              </div>
            )}

            <button onClick={handleCreatePoll} disabled={creating}
              className="w-full py-3 rounded-2xl font-black text-white flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #ec4899, #6366f1)', boxShadow: '0 4px 20px rgba(236,72,153,0.35)' }}>
              {creating ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"/> : <><Vote size={16}/> Create & Activate Poll</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);

  const isAdmin = user?.keycloakRoles?.includes('hr-admin');

  useEffect(() => {
    if (isAdmin) analyticsAPI.get().then(setAnalytics).catch(() => {});
  }, [isAdmin]);

  if (!isAdmin) return <AccessDenied />;

  return (
    <div className="space-y-7 animate-fade-in">

      {/* Header */}
      <motion.div className="relative overflow-hidden glass-card p-6"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(239,68,68,0.06))', border: '1px solid rgba(249,115,22,0.25)' }}>
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full pointer-events-none opacity-10"
          style={{ background: 'radial-gradient(circle, #f97316, transparent)', filter: 'blur(30px)' }} />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)', boxShadow: '0 8px 24px rgba(249,115,22,0.4)' }}>
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-white text-2xl font-black tracking-tight">HR Admin Portal</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1.5">
                  <Avatar photo={user?.photo} initials={user?.avatar || 'MN'} color={user?.color || '#f97316'} size="xs" shape="circle" />
                  <span className="text-white/60 text-xs">{user?.name}</span>
                </div>
                <span className="badge text-[10px] font-black"
                  style={{ background: 'rgba(249,115,22,0.2)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.35)' }}>
                  hr-admin
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <motion.span className="w-2 h-2 rounded-full bg-emerald-400"
              animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            <span className="text-emerald-400 text-xs font-bold">Live Portal</span>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MiniStat icon={Users}     label="Total Employees"  value={analytics.overview.totalEmployees}    color="#6366f1" />
          <MiniStat icon={Trophy}    label="Achievements"     value={analytics.overview.totalAchievements} color="#f59e0b" />
          <MiniStat icon={TrendingUp}label="Kudos Given"      value={analytics.overview.totalKudos}        color="#ec4899" />
          <MiniStat icon={BarChart3} label="Engagement Score" value={analytics.overview.engagementScore}   color="#10b981" />
        </div>
      )}

      {/* 2x2 Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PostAnnouncementPanel />
        <LeavesPanel />
        <AddAchievementPanel />
        <FeedbackPanel />
      </div>

      {/* Add Employee — full width */}
      <div className="grid grid-cols-1 gap-6">
        <AddEmployeePanel />
      </div>

      {/* Fun Friday Admin Section */}
      <FridayAdminSection />
    </div>
  );
}
