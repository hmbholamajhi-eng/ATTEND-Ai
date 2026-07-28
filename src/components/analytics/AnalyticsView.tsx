import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3, BookOpen, Calendar, CheckCircle2, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';

export const AnalyticsView: React.FC = () => {
  const { subjects, subjectStats, overallStats, records, profile } = useAttendance();

  // Pie chart data for attendance status distribution
  const pieData = [
    { name: 'Present', value: overallStats.totalPresent, color: '#10b981' },
    { name: 'Absent', value: overallStats.totalAbsent, color: '#f43f5e' },
    { name: 'Cancelled', value: overallStats.totalCancelled, color: '#64748b' },
    { name: 'Extra Class', value: overallStats.totalExtra, color: '#8b5cf6' },
  ].filter((d) => d.value > 0);

  // Bar chart data comparing current % vs target % per subject
  const barData = subjectStats.map((stats) => ({
    name: stats.subjectCode,
    fullName: stats.subjectName,
    current: stats.attendancePercentage,
    target: stats.targetPercentage,
    color: stats.color,
  }));

  // Trend line data (past 4 weeks)
  const today = new Date();
  const trendData = [3, 2, 1, 0].map((weeksAgo) => {
    const weekEndDate = new Date(today.getTime() - weeksAgo * 7 * 86400000);
    const dateLimitStr = weekEndDate.toISOString().split('T')[0];

    const weekRecords = records.filter((r) => r.date <= dateLimitStr);
    const present = weekRecords.filter((r) => r.status === 'present' || r.status === 'extra').length;
    const total = weekRecords.filter((r) => r.status !== 'cancelled').length;
    const pct = total > 0 ? Math.round((present / total) * 100) : 100;

    return {
      week: weeksAgo === 0 ? 'Current' : `${weeksAgo}w ago`,
      percentage: pct,
    };
  });

  // Calculate semester completion percentage
  const totalPlanned = overallStats.totalSemesterClassesPlanned || 100;
  const completed = overallStats.classesCompleted;
  const completionPct = Math.min(100, Math.round((completed / totalPlanned) * 100));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            <span>Attendance Analytics & Insights</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Visual graphs, subject distribution, trend lines, and semester completion statistics.
          </p>
        </div>
      </div>

      {/* Semester Progress Card */}
      <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-black/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Semester Progress Tracker ({profile.semester})
            </h3>
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-3 py-1 rounded-full backdrop-blur-md">
            {completionPct}% Complete
          </span>
        </div>

        <div className="w-full bg-slate-200/80 dark:bg-white/10 h-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all"
            style={{ width: `${completionPct}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-center text-xs">
          <div className="p-3 bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-xl border border-slate-200/50 dark:border-white/5">
            <div className="text-slate-400 font-medium">Recorded Classes</div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {overallStats.classesCompleted}
            </div>
          </div>

          <div className="p-3 bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-xl border border-slate-200/50 dark:border-white/5">
            <div className="text-slate-400 font-medium">Estimated Remaining</div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {overallStats.classesRemaining}
            </div>
          </div>

          <div className="p-3 bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-xl border border-slate-200/50 dark:border-white/5">
            <div className="text-slate-400 font-medium">Total Planned</div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {overallStats.totalSemesterClassesPlanned}
            </div>
          </div>

          <div className="p-3 bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-xl border border-slate-200/50 dark:border-white/5">
            <div className="text-slate-400 font-medium">Safe Bunk Reserve</div>
            <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {overallStats.overallSafeBunks} classes
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Comparison Bar Chart */}
        <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-black/5 space-y-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Subject Attendance % vs Target Goal
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#888888" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(16px)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Bar dataKey="current" name="Current %" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <Bar dataKey="target" name="Target Goal %" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Distribution Pie Chart */}
        <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-black/5 space-y-4">
          <div className="flex items-center space-x-2">
            <PieChartIcon className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Attendance Distribution Breakdown
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(16px)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Attendance Trend Line Chart */}
      <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-black/5 space-y-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Overall Attendance % Trend Over Weeks
          </h3>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="week" stroke="#888888" fontSize={11} />
              <YAxis domain={[50, 100]} stroke="#888888" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(16px)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="percentage"
                name="Overall %"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 5, fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
