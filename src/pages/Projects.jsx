import { useState, useEffect } from 'react';
import { Briefcase, Users, CheckCircle, Clock, X, ArrowRight, Target, Calendar, Tag, ChevronRight } from 'lucide-react';
import { projectsAPI } from '../services/api';
import PageLoader from '../components/common/PageLoader';
import { format, parseISO, differenceInDays } from 'date-fns';
import Avatar from '../components/common/Avatar';
import toast from 'react-hot-toast';

/* ── Status config ─────────────────────────────────────────── */
const STATUS = {
  active:    { label: 'Active',     color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.25)',  dot: '#10b981' },
  'on-hold': { label: 'On Hold',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)',  dot: '#f59e0b' },
  completed: { label: 'Completed', color: '#6366f1', bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.25)',  dot: '#6366f1' },
};

const PRIORITY = {
  high:   { label: 'High',   color: '#ef4444' },
  medium: { label: 'Medium', color: '#f59e0b' },
  low:    { label: 'Low',    color: '#10b981' },
};

/* ── Progress Bar ──────────────────────────────────────────── */
function ProgressBar({ progress, color, height = 6 }) {
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, background: 'rgba(255,255,255,0.06)' }}>
      <div className="h-full rounded-full transition-all duration-1000"
        style={{
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${color}, ${color}99)`,
          boxShadow: `0 0 8px ${color}50`,
        }} />
    </div>
  );
}

/* ── Member Avatars Stack ──────────────────────────────────── */
function AvatarStack({ members, max = 4 }) {
  const visible = members.slice(0, max);
  const extra = members.length - max;
  return (
    <div className="flex items-center">
      {visible.map((m, i) => (
        <div key={m.employeeId} style={{ marginLeft: i === 0 ? 0 : -8, zIndex: visible.length - i }}>
          <div className="rounded-full border-2" style={{ borderColor: 'var(--bg-base)' }}>
            <Avatar photo={m.photo} initials={m.avatar} color={m.color} size="xs" shape="circle" />
          </div>
        </div>
      ))}
      {extra > 0 && (
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-white border-2 flex-shrink-0"
          style={{ marginLeft: -8, background: 'rgba(99,102,241,0.4)', borderColor: 'var(--bg-base)', zIndex: 0 }}>
          +{extra}
        </div>
      )}
    </div>
  );
}

/* ── Project Card ──────────────────────────────────────────── */
function ProjectCard({ project, onClick, index }) {
  const status = STATUS[project.status] || STATUS.active;
  const priority = PRIORITY[project.priority] || PRIORITY.medium;
  const daysLeft = differenceInDays(parseISO(project.endDate), new Date());
  const doneMilestones = project.milestones.filter(m => m.done).length;

  return (
    <div
      onClick={() => onClick(project)}
      className="glass-card overflow-hidden cursor-pointer group animate-slide-up"
      style={{
        animationDelay: `${index * 60}ms`,
        transition: 'all 0.32s cubic-bezier(0.16,1,0.3,1)',
        border: `1px solid rgba(255,255,255,0.07)`,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px ${project.color}25`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      {/* Top accent bar */}
      <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${project.color}, ${project.color}60, transparent)` }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: `${project.color}15`, border: `1px solid ${project.color}25` }}>
              {project.icon}
            </div>
            <div className="min-w-0">
              <h3 className="text-white font-bold text-sm leading-snug truncate group-hover:text-white transition-colors">
                {project.name}
              </h3>
              <span className="text-xs font-medium" style={{ color: `${project.color}90` }}>{project.category}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span className="badge text-[10px] font-bold"
              style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}` }}>
              <span className="w-1.5 h-1.5 rounded-full mr-1" style={{ background: status.dot, display: 'inline-block' }} />
              {status.label}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: `${priority.color}12`, color: priority.color }}>
              {priority.label} priority
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-white/45 text-xs leading-relaxed line-clamp-2 mb-4">{project.description}</p>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-white/40 text-xs">Progress</span>
            <span className="text-xs font-black" style={{ color: project.color }}>{project.progress}%</span>
          </div>
          <ProgressBar progress={project.progress} color={project.color} />
        </div>

        {/* Milestones mini */}
        <div className="flex items-center gap-1 mb-4">
          {project.milestones.map((m, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full"
              style={{ background: m.done ? project.color : 'rgba(255,255,255,0.07)' }} />
          ))}
          <span className="text-white/30 text-[10px] ml-2 flex-shrink-0">
            {doneMilestones}/{project.milestones.length}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <AvatarStack members={project.members} />
          <div className="flex items-center gap-3 text-xs">
            <span className="text-white/30 flex items-center gap-1">
              <Users size={11} /> {project.members.length}
            </span>
            <span className={`font-semibold ${daysLeft < 14 && project.status === 'active' ? 'text-red-400' : 'text-white/30'} flex items-center gap-1`}>
              <Calendar size={11} />
              {project.status === 'completed' ? 'Done' : daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Project Detail Modal ──────────────────────────────────── */
function ProjectModal({ project, onClose }) {
  if (!project) return null;
  const status = STATUS[project.status] || STATUS.active;
  const daysLeft = differenceInDays(parseISO(project.endDate), new Date());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(16px)' }}
      onClick={onClose}
    >
      <div className="glass-card max-w-2xl w-full max-h-[88vh] overflow-y-auto animate-scale-in"
        style={{ border: `1px solid ${project.color}25`, boxShadow: `0 40px 80px rgba(0,0,0,0.7), 0 0 60px ${project.color}10` }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="relative h-28 overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${project.color}25, ${project.color}08)` }}>
          <div className="absolute inset-0 opacity-15"
            style={{ backgroundImage: `radial-gradient(circle at 20% 50%, ${project.color}, transparent 60%)` }} />
          <button onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <X size={18} />
          </button>
          <div className="absolute bottom-4 left-6 flex items-center gap-3">
            <div className="text-3xl">{project.icon}</div>
            <div>
              <h2 className="text-white font-black text-lg leading-tight">{project.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="badge text-[10px] font-bold"
                  style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}` }}>
                  ● {status.label}
                </span>
                <span className="text-white/35 text-xs">{project.category}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Progress', value: `${project.progress}%`, color: project.color },
              { label: 'Days Left', value: project.status === 'completed' ? '✓ Done' : `${Math.max(0, daysLeft)}d`, color: daysLeft < 14 && project.status === 'active' ? '#ef4444' : '#34d399' },
              { label: 'Team Size', value: project.members.length, color: '#818cf8' },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-3 rounded-xl text-center"
                style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
                <p className="font-black text-xl" style={{ color }}>{value}</p>
                <p className="text-white/30 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/50 text-sm font-semibold">Overall Progress</span>
              <span className="font-black" style={{ color: project.color }}>{project.progress}%</span>
            </div>
            <ProgressBar progress={project.progress} color={project.color} height={8} />
          </div>

          {/* Description */}
          <div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">About</p>
            <p className="text-white/60 text-sm leading-relaxed">{project.description}</p>
          </div>

          {/* Milestones */}
          <div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3">
              Milestones · {project.milestones.filter(m => m.done).length}/{project.milestones.length} done
            </p>
            <div className="space-y-2">
              {project.milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: m.done ? `${project.color}08` : 'rgba(255,255,255,0.025)', border: `1px solid ${m.done ? project.color + '20' : 'rgba(255,255,255,0.06)'}` }}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0`}
                    style={{ background: m.done ? project.color : 'rgba(255,255,255,0.08)' }}>
                    {m.done
                      ? <CheckCircle size={13} className="text-white" />
                      : <Clock size={11} className="text-white/30" />
                    }
                  </div>
                  <span className={`text-sm flex-1 ${m.done ? 'text-white/70 line-through' : 'text-white/60'}`}>
                    {m.title}
                  </span>
                  <span className="text-white/25 text-xs">{format(parseISO(m.date), 'MMM d')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3">Team Members</p>
            <div className="space-y-2">
              {project.members.map(m => (
                <div key={m.employeeId} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Avatar photo={m.photo} initials={m.avatar} color={m.color} size="sm" shape="circle" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm font-semibold">{m.name}</p>
                    <p className="text-white/35 text-xs">{m.role}</p>
                  </div>
                  {project.teamLead === m.employeeId && (
                    <span className="badge text-[10px] font-bold" style={{ background: `${project.color}18`, color: project.color, border: `1px solid ${project.color}25` }}>
                      Team Lead
                    </span>
                  )}
                  {/* Allocation bar */}
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full" style={{ width: `${m.allocation}%`, background: m.color }} />
                    </div>
                    <span className="text-white/30 text-[10px] w-7">{m.allocation}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            {project.tags.map(tag => (
              <span key={tag} className="tag text-xs">{tag}</span>
            ))}
            <span className="ml-auto text-white/25 text-xs flex items-center gap-1">
              <Calendar size={11} />
              {format(parseISO(project.startDate), 'MMM d')} – {format(parseISO(project.endDate), 'MMM d, yyyy')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────── */
export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [activeStatus, setActiveStatus] = useState('all');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectsAPI.getAll(activeStatus !== 'all' ? { status: activeStatus } : {})
      .then(d => { setProjects(d); setLoading(false); })
      .catch(() => { toast.error('Failed to load projects'); setLoading(false); });
  }, [activeStatus]);

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    onHold: projects.filter(p => p.status === 'on-hold').length,
  };

  // Unique members across all projects
  const allMembers = [...new Map(projects.flatMap(p => p.members).map(m => [m.employeeId, m])).values()];

  return (
    <div className="space-y-7 animate-fade-in">

      {/* Hero */}
      <div className="relative overflow-hidden glass-card p-7"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))', border: '1px solid rgba(99,102,241,0.18)' }}>
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full pointer-events-none opacity-10"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)', filter: 'blur(30px)' }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-white text-2xl font-black tracking-tight mb-1"
              style={{ background: 'linear-gradient(135deg, #a5b4fc, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Projects & Teams
            </h1>
            <p className="text-white/40 text-sm">See who's working on what across the organization</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Active',    value: stats.active,    color: '#10b981' },
              { label: 'Completed', value: stats.completed, color: '#6366f1' },
              { label: 'On Hold',   value: stats.onHold,    color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} className="text-center px-4 py-2 rounded-xl"
                style={{ background: `${s.color}10`, border: `1px solid ${s.color}20` }}>
                <p className="font-black text-lg" style={{ color: s.color }}>{s.value}</p>
                <p className="text-white/30 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Who's on what — quick summary */}
      <div className="glass-card p-5">
        <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
          <Users size={12} /> People across projects
        </p>
        <div className="flex flex-wrap gap-3">
          {allMembers.map(m => {
            const myProjects = projects.filter(p => p.members.some(pm => pm.employeeId === m.employeeId));
            return (
              <div key={m.employeeId} className="flex items-center gap-2.5 px-3 py-2 rounded-2xl transition-all cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              >
                <Avatar photo={m.photo} initials={m.avatar} color={m.color} size="xs" shape="circle" />
                <div>
                  <p className="text-white/75 text-xs font-semibold">{m.name.split(' ')[0]}</p>
                  <div className="flex gap-1 mt-0.5">
                    {myProjects.map(p => (
                      <span key={p.id} className="w-2 h-2 rounded-full" style={{ background: p.color }} title={p.name} />
                    ))}
                  </div>
                </div>
                <span className="text-white/25 text-[10px]">{myProjects.length} project{myProjects.length !== 1 ? 's' : ''}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all',      label: 'All Projects',  count: projects.length },
          { id: 'active',   label: 'Active',        count: stats.active,    color: '#10b981' },
          { id: 'on-hold',  label: 'On Hold',       count: stats.onHold,    color: '#f59e0b' },
          { id: 'completed',label: 'Completed',     count: stats.completed, color: '#6366f1' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveStatus(tab.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={activeStatus === tab.id
              ? { background: tab.color ? `${tab.color}18` : 'rgba(99,102,241,0.18)', border: `1px solid ${tab.color ? tab.color + '35' : 'rgba(99,102,241,0.3)'}`, color: tab.color || '#818cf8', boxShadow: `0 4px 16px ${tab.color ? tab.color + '20' : 'rgba(99,102,241,0.2)'}` }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }
            }
          >
            {tab.label}
            <span className="text-xs px-1.5 py-0.5 rounded-full font-black"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <PageLoader loading={loading}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj, i) => (
            <ProjectCard key={proj.id} project={proj} onClick={setSelected} index={i} />
          ))}
          {!loading && projects.length === 0 && (
            <div className="col-span-full text-center py-16">
              <Briefcase size={44} style={{ color: 'rgba(255,255,255,0.07)' }} className="mx-auto mb-4" />
              <p className="text-white/25">No projects found.</p>
            </div>
          )}
        </div>
      </PageLoader>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
