import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Trophy, Heart, Megaphone } from 'lucide-react';
import Avatar from '../components/common/Avatar';
import { useTheme } from '../context/ThemeContext';

const empPhotos = {
  emp001: 'https://randomuser.me/api/portraits/men/32.jpg',
  emp002: 'https://randomuser.me/api/portraits/women/44.jpg',
  emp003: 'https://randomuser.me/api/portraits/women/26.jpg',
  emp004: 'https://randomuser.me/api/portraits/men/41.jpg',
  emp005: 'https://randomuser.me/api/portraits/women/54.jpg',
  emp006: 'https://randomuser.me/api/portraits/men/55.jpg',
  emp007: 'https://randomuser.me/api/portraits/women/33.jpg',
  emp008: 'https://randomuser.me/api/portraits/men/22.jpg',
  emp009: 'https://randomuser.me/api/portraits/women/17.jpg',
  emp010: 'https://randomuser.me/api/portraits/men/18.jpg',
};
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { analyticsAPI } from '../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#14b8a6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border border-white/15 text-xs">
        <p className="text-white/70 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
          <Icon size={18} style={{ color }} />
        </div>
        <div>
          <p className="text-white/40 text-sm">{label}</p>
          <p className="text-white text-2xl font-bold mt-0.5">{value}</p>
          {sub && <p className="text-white/30 text-xs mt-1">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

export default function Analytics() {
  const { isDark } = useTheme();
  const chartGrid  = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const chartTick  = isDark ? 'rgba(255,255,255,0.4)'  : '#64748b';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.get().then(d => {
      setData(d);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load analytics');
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!data) return null;

  const deptData = Object.entries(data.deptDistribution).map(([name, value]) => ({ name, value }));
  const kudosCatData = Object.entries(data.kudosByCategory).map(([name, value]) => ({ name, value }));
  const achievDeptData = Object.entries(data.achievementsByDept).map(([name, value]) => ({ name, value }));

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="section-title flex items-center gap-2">
          <BarChart3 size={24} className="text-violet-400" />
          Engagement Analytics
        </h1>
        <p className="text-white/40 text-sm mt-1">Culture metrics and engagement insights at a glance.</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Employees" value={data.overview.totalEmployees} color="#6366f1" sub={`${data.overview.upcomingBirthdays} bdays this month`} />
        <StatCard icon={Trophy} label="Achievements" value={data.overview.totalAchievements} color="#f59e0b" sub="Across all departments" />
        <StatCard icon={Heart} label="Kudos Given" value={data.overview.totalKudos} color="#ec4899" sub={`${data.overview.totalKudosPoints} total points`} />
        <StatCard icon={Megaphone} label="Announcements" value={data.overview.totalAnnouncements} color="#3b82f6" sub={`${data.overview.engagementScore} avg reactions`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Engagement Trend */}
        <div className="glass-card p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-400" />
            Monthly Engagement Trend
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.monthlyEngagement}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
              <XAxis dataKey="month" tick={{ fill: chartTick, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: chartTick, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }} />
              <Line type="monotone" dataKey="kudos" stroke="#ec4899" strokeWidth={2} dot={{ fill: '#ec4899', r: 3 }} name="Kudos" />
              <Line type="monotone" dataKey="achievements" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} name="Achievements" />
              <Line type="monotone" dataKey="announcements" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} name="Announcements" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Department Distribution */}
        <div className="glass-card p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Users size={16} className="text-primary-400" />
            Team Distribution
          </h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={deptData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {deptData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {deptData.map((dept, idx) => (
                <div key={dept.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[idx % COLORS.length] }} />
                  <span className="text-white/60 text-xs truncate flex-1">{dept.name}</span>
                  <span className="text-white/40 text-xs font-medium">{dept.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kudos by Category */}
        <div className="glass-card p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Heart size={16} className="text-pink-400" />
            Kudos by Category
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={kudosCatData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} horizontal={false} />
              <XAxis type="number" tick={{ fill: chartTick, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#ec4899" radius={[0, 4, 4, 0]} name="Kudos">
                {kudosCatData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Recognized */}
        <div className="glass-card p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Trophy size={16} className="text-amber-400" />
            Most Recognized Employees
          </h3>
          <div className="space-y-3">
            {data.topRecognized.map((person, idx) => (
              <div key={person.name} className={`flex items-center gap-3 p-3 rounded-xl ${idx === 0 ? 'bg-amber-500/10 border border-amber-500/15' : 'bg-white/3'}`}>
                <span className="text-lg w-7 text-center">{medals[idx] || (idx + 1)}</span>
                <Avatar photo={empPhotos[person.id]} initials={person.avatar} color={person.color} size="sm" shape="circle" />
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm font-medium truncate">{person.name}</p>
                  <div className="w-full bg-white/5 rounded-full h-1 mt-1.5">
                    <div
                      className="h-1 rounded-full"
                      style={{
                        width: `${(person.count / data.topRecognized[0].count) * 100}%`,
                        background: COLORS[idx % COLORS.length]
                      }}
                    />
                  </div>
                </div>
                <span className="text-white/50 text-sm font-semibold">{person.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements by Dept */}
      <div className="glass-card p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Trophy size={16} className="text-amber-400" />
          Achievements by Department
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={achievDeptData}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
            <XAxis dataKey="name" tick={{ fill: chartTick, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: chartTick, fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" name="Achievements" radius={[4, 4, 0, 0]}>
              {achievDeptData.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
