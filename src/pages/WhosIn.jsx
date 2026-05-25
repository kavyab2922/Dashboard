import { useState, useEffect } from 'react';
import { MapPin, Wifi, Coffee, Plane, Moon, RefreshCw, Building2, Home, Clock } from 'lucide-react';
import Avatar from '../components/common/Avatar';

const EMPLOYEES = [
  { id: 'emp001', name: 'Arjun Sharma',   role: 'Sr. Engineer',      dept: 'Engineering',     photo: 'https://randomuser.me/api/portraits/men/32.jpg',   color: '#6366f1', avatar: 'AS' },
  { id: 'emp002', name: 'Priya Menon',    role: 'Eng. Manager',      dept: 'Engineering',     photo: 'https://randomuser.me/api/portraits/women/44.jpg',  color: '#8b5cf6', avatar: 'PM' },
  { id: 'emp003', name: 'Sneha Kapoor',   role: 'UX Designer',       dept: 'Design',          photo: 'https://randomuser.me/api/portraits/women/26.jpg',  color: '#ec4899', avatar: 'SK' },
  { id: 'emp004', name: 'Ravi Kumar',     role: 'Head of Design',    dept: 'Design',          photo: 'https://randomuser.me/api/portraits/men/41.jpg',    color: '#f59e0b', avatar: 'RK' },
  { id: 'emp005', name: 'Ananya Iyer',    role: 'Data Scientist',    dept: 'Analytics',       photo: 'https://randomuser.me/api/portraits/women/54.jpg',  color: '#10b981', avatar: 'AI' },
  { id: 'emp006', name: 'Vikram Singh',   role: 'VP of Product',     dept: 'Product',         photo: 'https://randomuser.me/api/portraits/men/55.jpg',    color: '#3b82f6', avatar: 'VS' },
  { id: 'emp007', name: 'Meera Nair',     role: 'HR Partner',        dept: 'Human Resources', photo: 'https://randomuser.me/api/portraits/women/33.jpg',  color: '#f97316', avatar: 'MN' },
  { id: 'emp008', name: 'Karan Malhotra', role: 'DevOps Engineer',   dept: 'Engineering',     photo: 'https://randomuser.me/api/portraits/men/22.jpg',    color: '#14b8a6', avatar: 'KM' },
  { id: 'emp009', name: 'Divya Reddy',    role: 'Marketing Manager', dept: 'Marketing',       photo: 'https://randomuser.me/api/portraits/women/17.jpg',  color: '#a855f7', avatar: 'DR' },
  { id: 'emp010', name: 'Rahul Joshi',    role: 'Full Stack Dev',    dept: 'Engineering',     photo: 'https://randomuser.me/api/portraits/men/18.jpg',    color: '#ef4444', avatar: 'RJ' },
];

const STATUSES = [
  { id: 'office',  label: 'In Office',   icon: Building2, color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.25)', dot: '#10b981' },
  { id: 'wfh',     label: 'Working From Home', icon: Home,      color: '#6366f1', bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.25)',  dot: '#6366f1' },
  { id: 'leave',   label: 'On Leave',    icon: Plane,     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)',  dot: '#f59e0b' },
  { id: 'offline', label: 'Offline',     icon: Moon,      color: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.15)', dot: '#6b7280' },
];

const initialStatuses = {
  emp001: 'office', emp002: 'wfh',    emp003: 'office',
  emp004: 'leave',  emp005: 'wfh',    emp006: 'office',
  emp007: 'office', emp008: 'wfh',    emp009: 'office',
  emp010: 'office',
};

function StatusDot({ status }) {
  const s = STATUSES.find(x => x.id === status);
  if (!s) return null;
  return (
    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
      style={{
        background: s.dot,
        boxShadow: `0 0 6px ${s.dot}`,
        animation: status === 'office' ? 'pulse 2s ease-in-out infinite' : 'none',
      }}
    />
  );
}

function EmployeeRow({ emp, status, onStatusChange }) {
  const s = STATUSES.find(x => x.id === status) || STATUSES[3];

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 group whosin-row"
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; }}
    >
      <div className="relative flex-shrink-0">
        <Avatar photo={emp.photo} initials={emp.avatar} color={emp.color} size="sm" />
        <StatusDot status={status} />
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
          style={{ background: s.dot, borderColor: 'var(--bg-base)', boxShadow: `0 0 6px ${s.dot}80` }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{emp.name}</p>
        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{emp.role}</p>
      </div>

      {/* Status selector */}
      <div className="flex items-center gap-1">
        {STATUSES.map(st => (
          <button key={st.id} onClick={() => onStatusChange(emp.id, st.id)}
            title={st.label}
            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-150 ${status !== st.id ? 'whosin-status-btn-inactive' : ''}`}
            style={status === st.id
              ? { background: st.bg, border: `1px solid ${st.border}`, boxShadow: `0 0 10px ${st.color}30` }
              : { background: 'transparent', opacity: 0.3 }
            }
          >
            <st.icon size={13} className={status !== st.id ? 'whosin-status-inactive-icon' : ''} style={{ color: status === st.id ? st.color : 'rgba(255,255,255,0.4)' }} />
          </button>
        ))}
      </div>
    </div>
  );
}

function StatChip({ icon: Icon, label, count, color }) {
  return (
    <div className="glass-card p-4 flex items-center gap-3"
      style={{ border: `1px solid ${color}20` }}>
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p className="font-black text-2xl" style={{ color: 'var(--text-primary)' }}>{count}</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
      </div>
    </div>
  );
}

export default function WhosIn() {
  const [statuses, setStatuses] = useState(() => {
    const saved = localStorage.getItem('whosIn');
    return saved ? JSON.parse(saved) : initialStatuses;
  });
  const [filter, setFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleChange = (empId, newStatus) => {
    setStatuses(prev => {
      const next = { ...prev, [empId]: newStatus };
      localStorage.setItem('whosIn', JSON.stringify(next));
      return next;
    });
    setLastUpdated(new Date());
  };

  const counts = STATUSES.reduce((acc, s) => {
    acc[s.id] = Object.values(statuses).filter(v => v === s.id).length;
    return acc;
  }, {});

  const filtered = EMPLOYEES.filter(e => filter === 'all' || statuses[e.id] === filter);

  // Group by dept
  const byDept = filtered.reduce((acc, e) => {
    const dept = e.dept;
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(e);
    return acc;
  }, {});

  return (
    <div className="space-y-7 animate-fade-in">

      {/* Hero */}
      <div className="relative overflow-hidden glass-card p-6"
        style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(99,102,241,0.06))', border: '1px solid rgba(16,185,129,0.2)' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-white text-2xl font-black tracking-tight mb-1"
              style={{ background: 'linear-gradient(135deg, #34d399, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Who's In Today?
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Live office attendance board · Updates in real-time</p>
            <div className="flex items-center gap-1.5 mt-2 text-xs" style={{ color: 'var(--text-faint)' }}>
              <Clock size={11} />
              Last updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              <button onClick={() => setLastUpdated(new Date())} className="ml-1 hover:text-white/60 transition-colors">
                <RefreshCw size={10} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold"
            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399' }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {counts.office + counts.wfh} Active Today
          </div>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatChip icon={Building2} label="In Office" count={counts.office || 0} color="#10b981" />
        <StatChip icon={Wifi}      label="WFH"       count={counts.wfh    || 0} color="#6366f1" />
        <StatChip icon={Plane}     label="On Leave"  count={counts.leave  || 0} color="#f59e0b" />
        <StatChip icon={Moon}      label="Offline"   count={counts.offline|| 0} color="#6b7280" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[{ id: 'all', label: 'Everyone', count: EMPLOYEES.length }, ...STATUSES.map(s => ({ ...s, count: counts[s.id] || 0 }))].map(tab => (
          <button key={tab.id} onClick={() => setFilter(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${filter !== tab.id ? 'whosin-filter-inactive' : ''}`}
            style={filter === tab.id
              ? { background: tab.color ? `${tab.color}18` : 'rgba(99,102,241,0.18)', border: `1px solid ${tab.color ? tab.color + '30' : 'rgba(99,102,241,0.3)'}`, color: tab.color || '#818cf8', boxShadow: `0 4px 16px ${tab.color ? tab.color + '20' : 'rgba(99,102,241,0.2)'}` }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }
            }
          >
            {tab.icon && <tab.icon size={14} />}
            {tab.label}
            <span className="whosin-filter-count text-xs px-1.5 py-0.5 rounded-full font-black"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Boards by Department */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {Object.entries(byDept).map(([dept, emps]) => (
          <div key={dept} className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={14} className="whosin-dept-icon text-white/30" />
              <span className="whosin-dept-label text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>{dept}</span>
              <span className="whosin-dept-count ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>{emps.length} members</span>
            </div>
            <div className="space-y-2">
              {emps.map(emp => (
                <EmployeeRow key={emp.id} emp={emp} status={statuses[emp.id] || 'offline'} onStatusChange={handleChange} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="glass-card p-4">
        <p className="whosin-legend-title text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>How to update status</p>
        <div className="flex flex-wrap gap-4">
          {STATUSES.map(s => (
            <div key={s.id} className="whosin-legend-text flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <s.icon size={12} style={{ color: s.color }} />
              </div>
              {s.label}
            </div>
          ))}
          <p className="whosin-legend-hint text-xs ml-auto self-center" style={{ color: 'var(--text-faint)' }}>Click the icons on each row to update</p>
        </div>
      </div>
    </div>
  );
}
