import { useState, useEffect } from 'react';
import { Users, Search, X, Mail, Phone, MapPin, Briefcase, Star } from 'lucide-react';
import Avatar from '../components/common/Avatar';
import { employeesAPI } from '../services/api';
import { useLocation } from 'react-router-dom';
import PageLoader from '../components/common/PageLoader';
import toast from 'react-hot-toast';

function EmployeeCard({ employee, onClick, index }) {
  return (
    <div
      onClick={() => onClick(employee)}
      className="glass-card p-5 cursor-pointer group animate-slide-up overflow-hidden relative"
      style={{
        animationDelay: `${index * 50}ms`,
        transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = `0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px ${employee.coverColor}20`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      {/* Background glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
        style={{ background: employee.coverColor, filter: 'blur(20px)' }} />

      <div className="flex items-start gap-4 mb-4 relative z-10">
        <div className="relative flex-shrink-0">
          <Avatar photo={employee.photo} initials={employee.avatar} color={employee.coverColor} size="lg" online />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-base truncate group-hover:text-primary-300 transition-colors">{employee.name}</h3>
          <p className="text-white/45 text-xs mt-0.5 truncate">{employee.role}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="badge text-xs font-bold"
              style={{ background: `${employee.coverColor}15`, color: employee.coverColor, border: `1px solid ${employee.coverColor}25` }}>
              {employee.department}
            </span>
            <span className="text-white/25 text-xs flex items-center gap-1">
              <MapPin size={10} /> {employee.location}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4 relative z-10">
        {employee.skills.slice(0, 3).map(skill => (
          <span key={skill} className="tag">{skill}</span>
        ))}
        {employee.skills.length > 3 && (
          <span className="tag">+{employee.skills.length - 3}</span>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 relative z-10"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-white font-bold text-sm">{employee.yearsAtCompany}</p>
            <p className="text-white/25 text-xs">yrs</p>
          </div>
          <div className="w-px h-6 bg-white/5" />
          <div className="text-center">
            <p className="text-white font-bold text-sm">{employee.achievements.length}</p>
            <p className="text-white/25 text-xs">awards</p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-xs font-bold" style={{ color: '#a5b4fc' }}>
          <Star size={11} /> {employee.points}
        </span>
      </div>
    </div>
  );
}

function EmployeeModal({ employee, onClose }) {
  if (!employee) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(16px)' }}
      onClick={onClose}
    >
      <div className="glass-card max-w-md w-full animate-scale-in overflow-hidden"
        style={{ border: `1px solid ${employee.coverColor}25`, boxShadow: `0 40px 80px rgba(0,0,0,0.6), 0 0 60px ${employee.coverColor}15` }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div className="h-28 relative"
          style={{ background: `linear-gradient(135deg, ${employee.coverColor}30, ${employee.coverColor}08)` }}>
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: `radial-gradient(circle at 20% 50%, ${employee.coverColor} 0%, transparent 60%)` }} />
          <button onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pb-6">
          <div className="-mt-10 mb-5 flex items-end justify-between">
            <div className="border-4 rounded-2xl" style={{ borderColor: 'var(--bg-base)' }}>
              <Avatar photo={employee.photo} initials={employee.avatar} color={employee.coverColor} size="xl" />
            </div>
            <span className="badge font-bold mb-1" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }}>
              ● Active
            </span>
          </div>

          <h2 className="text-white text-xl font-black">{employee.name}</h2>
          <p className="text-white/45 text-sm mt-0.5">{employee.role}</p>
          {employee.bio && (
            <p className="text-white/40 text-sm mt-3 leading-relaxed italic border-l-2 pl-3"
              style={{ borderColor: employee.coverColor }}>"{employee.bio}"</p>
          )}

          <div className="mt-5 space-y-2.5">
            {[
              { icon: Briefcase, text: `${employee.department} · ${employee.yearsAtCompany} years` },
              { icon: Mail,      text: employee.email },
              { icon: Phone,     text: employee.phone },
              { icon: MapPin,    text: employee.location },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${employee.coverColor}12` }}>
                  <Icon size={13} style={{ color: employee.coverColor }} />
                </div>
                <span className="text-white/55 truncate">{text}</span>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <p className="text-white/30 text-xs font-bold uppercase tracking-wider mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {employee.skills.map(skill => (
                <span key={skill} className="badge px-3 py-1 text-xs font-semibold"
                  style={{ background: `${employee.coverColor}12`, color: employee.coverColor, border: `1px solid ${employee.coverColor}20` }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 grid grid-cols-3 gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            {[
              { val: employee.points, label: 'Points', color: '#a5b4fc' },
              { val: employee.achievements.length, label: 'Awards', color: '#fbbf24' },
              { val: employee.yearsAtCompany, label: 'Years', color: '#34d399' },
            ].map(({ val, label, color }) => (
              <div key={label} className="text-center py-2 rounded-xl" style={{ background: `${color}08` }}>
                <p className="font-black text-lg" style={{ color }}>{val}</p>
                <p className="text-white/30 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Directory() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState(['all']);
  const [activeDept, setActiveDept] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Auto-open profile if navigated from "My Profile"
  useEffect(() => {
    if (location.state?.openProfile && employees.length > 0) {
      const emp = employees.find(e => e.id === location.state.openProfile);
      if (emp) setSelected(emp);
    }
  }, [location.state, employees]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeDept !== 'all') params.department = activeDept;
      if (search) params.search = search;
      const [empData, deptData] = await Promise.all([employeesAPI.getAll(params), employeesAPI.getDepartments()]);
      setEmployees(empData);
      setDepartments(['all', ...deptData]);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [activeDept]);
  useEffect(() => { const t = setTimeout(fetchData, 300); return () => clearTimeout(t); }, [search]);

  return (
    <div className="space-y-7 animate-fade-in">
      <div>
        <h1 className="section-title flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(59,130,246,0.1))', boxShadow: '0 4px 16px rgba(6,182,212,0.2)' }}>
            <Users size={20} style={{ color: '#22d3ee' }} />
          </div>
          <span style={{ background: 'linear-gradient(135deg, #22d3ee, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Employee Directory
          </span>
        </h1>
        <p className="text-white/35 text-sm mt-2 ml-14">{employees.length} colleagues · {departments.length - 1} departments</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.25)' }} />
        <input type="text" placeholder="Search by name, role, skill, or department…"
          value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10 py-3 text-base" />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
            <X size={15} />
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {departments.map(dept => (
          <button key={dept} onClick={() => setActiveDept(dept)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${activeDept !== dept ? 'directory-filter-inactive' : ''}`}
            style={activeDept === dept
              ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }
            }
          >
            {dept === 'all' ? '🌐 All' : dept}
          </button>
        ))}
      </div>

      <PageLoader loading={loading}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp, i) => <EmployeeCard key={emp.id} employee={emp} onClick={setSelected} index={i} />)}
          {!loading && employees.length === 0 && (
            <div className="col-span-full text-center py-16">
              <Users size={44} style={{ color: 'rgba(255,255,255,0.07)' }} className="mx-auto mb-4" />
              <p className="text-white/25">No employees found.</p>
            </div>
          )}
        </div>
      </PageLoader>

      <EmployeeModal employee={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
