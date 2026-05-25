import { useState, useEffect } from 'react';
import { CalendarCheck, Plus, X, Send, Clock, CheckCircle, XCircle } from 'lucide-react';
import { leavesAPI } from '../services/api';
import { format, parseISO, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';

const LEAVE_TYPES = ['Annual Leave', 'Sick Leave', 'WFH', 'Casual Leave', 'Maternity Leave', 'Paternity Leave'];

const leaveBalance = {
  'Annual Leave': { total: 18, used: 3, color: '#6366f1' },
  'Sick Leave': { total: 12, used: 2, color: '#ef4444' },
  'WFH': { total: 'Flexible', used: 8, color: '#10b981' },
};

function StatusBadge({ status }) {
  const styles = {
    approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    rejected: 'bg-red-500/15 text-red-400 border-red-500/20',
  };
  const icons = {
    approved: <CheckCircle size={12} />,
    pending: <Clock size={12} />,
    rejected: <XCircle size={12} />,
  };
  return (
    <span className={`badge border text-xs ${styles[status] || styles.pending}`}>
      {icons[status]} {status}
    </span>
  );
}

function ApplyModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ type: '', from: '', to: '', reason: '', employeeName: 'Arjun Sharma', employeeId: 'emp001' });

  const days = form.from && form.to
    ? Math.max(1, differenceInDays(parseISO(form.to), parseISO(form.from)) + 1)
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.type || !form.from || !form.to || !form.reason) {
      toast.error('Please fill all fields');
      return;
    }
    await onSubmit({ ...form, days });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <CalendarCheck size={18} className="text-primary-400" />
            <h2 className="text-white font-bold">Apply for Leave</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-white/60 text-sm font-medium mb-2 block">Leave Type *</label>
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="input-field"
              required
            >
              <option value="">Select type...</option>
              {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/60 text-sm font-medium mb-2 block">From *</label>
              <input
                type="date"
                value={form.from}
                onChange={e => setForm(f => ({ ...f, from: e.target.value }))}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="text-white/60 text-sm font-medium mb-2 block">To *</label>
              <input
                type="date"
                value={form.to}
                onChange={e => setForm(f => ({ ...f, to: e.target.value }))}
                min={form.from}
                className="input-field"
                required
              />
            </div>
          </div>

          {days > 0 && (
            <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-3 text-center">
              <p className="text-primary-300 text-sm">
                <span className="font-bold text-primary-400 text-lg">{days}</span> day{days > 1 ? 's' : ''} leave
              </p>
            </div>
          )}

          <div>
            <label className="text-white/60 text-sm font-medium mb-2 block">Reason *</label>
            <textarea
              value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              placeholder="Brief reason for your leave..."
              rows={3}
              className="input-field resize-none"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              <Send size={16} /> Apply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Leaves() {
  const [leaves, setLeaves] = useState([]);
  const [activeStatus, setActiveStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeStatus !== 'all') params.status = activeStatus;
      const data = await leavesAPI.getAll(params);
      setLeaves(data);
    } catch {
      toast.error('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, [activeStatus]);

  const handleApply = async (data) => {
    try {
      await leavesAPI.apply(data);
      toast.success('Leave application submitted!');
      setShowModal(false);
      fetchLeaves();
    } catch {
      toast.error('Failed to apply for leave');
    }
  };

  const statusCounts = {
    all: leaves.length,
    approved: leaves.filter(l => l.status === 'approved').length,
    pending: leaves.filter(l => l.status === 'pending').length,
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <CalendarCheck size={24} className="text-teal-400" />
            Leave Tracker
          </h1>
          <p className="text-white/40 text-sm mt-1">Manage and track your time-off requests.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={18} /> Apply Leave
        </button>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.entries(leaveBalance).map(([type, bal]) => (
          <div key={type} className="glass-card p-4">
            <p className="text-white/50 text-sm">{type}</p>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-white text-2xl font-bold" style={{ color: bal.color }}>
                {typeof bal.total === 'number' ? bal.total - bal.used : '∞'}
              </span>
              {typeof bal.total === 'number' && (
                <span className="text-white/30 text-sm mb-0.5">/ {bal.total} days left</span>
              )}
            </div>
            {typeof bal.total === 'number' && (
              <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(bal.used / bal.total) * 100}%`, background: bal.color }}
                />
              </div>
            )}
            {typeof bal.total === 'string' && (
              <p className="text-white/30 text-xs mt-1">{bal.used} days used this month</p>
            )}
          </div>
        ))}
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: 'All' },
          { id: 'approved', label: 'Approved' },
          { id: 'pending', label: 'Pending' },
          { id: 'rejected', label: 'Rejected' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveStatus(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeStatus === tab.id
                ? 'bg-primary-600 text-white'
                : 'bg-white/5 text-white/50 hover:text-white/80 border border-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leave List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {leaves.map(leave => (
            <div key={leave.id} className="glass-card p-4 hover:border-white/15 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-semibold text-sm">{leave.type}</span>
                    <StatusBadge status={leave.status} />
                  </div>
                  <p className="text-white/50 text-sm">
                    {format(parseISO(leave.from), 'MMM d')} – {format(parseISO(leave.to), 'MMM d, yyyy')}
                    <span className="text-white/30 ml-2">({leave.days} day{leave.days > 1 ? 's' : ''})</span>
                  </p>
                  <p className="text-white/40 text-sm mt-1">{leave.reason}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white/30 text-xs">Applied {format(parseISO(leave.appliedOn), 'MMM d')}</p>
                  {leave.approvedBy && (
                    <p className="text-white/25 text-xs mt-0.5">by {leave.approvedBy}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {leaves.length === 0 && (
            <div className="text-center py-12">
              <CalendarCheck size={40} className="text-white/15 mx-auto mb-3" />
              <p className="text-white/30">No leave requests found.</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <ApplyModal onClose={() => setShowModal(false)} onSubmit={handleApply} />
      )}
    </div>
  );
}
