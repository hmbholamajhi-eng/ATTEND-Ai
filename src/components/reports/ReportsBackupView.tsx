import React, { useRef, useState } from 'react';
import {
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  Printer,
  RotateCcw,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { AttendanceStatus } from '../../types';
import {
  exportAttendanceLogsCSV,
  exportAttendanceSummaryCSV,
  generatePrintablePDF,
} from '../../utils/csvPdfExport';
import { exportBackupDataJSON, importBackupDataJSON } from '../../utils/storage';

export const ReportsBackupView: React.FC = () => {
  const {
    profile,
    subjects,
    records,
    subjectStats,
    overallStats,
    loadDemoData,
    clearAllData,
    deleteAttendanceRecord,
    showToast,
  } = useAttendance();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  // Filter records
  const filteredRecords = records
    .filter((rec) => {
      if (statusFilter !== 'all' && rec.status !== statusFilter) return false;
      if (subjectFilter !== 'all' && rec.subjectId !== subjectFilter) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const sub = subjects.find((s) => s.id === rec.subjectId);
        const matchName = sub?.name.toLowerCase().includes(query);
        const matchCode = sub?.code.toLowerCase().includes(query);
        const matchFaculty = sub?.faculty.toLowerCase().includes(query);
        const matchDate = rec.date.includes(query);
        const matchNote = rec.note?.toLowerCase().includes(query);

        return matchName || matchCode || matchFaculty || matchDate || matchNote;
      }
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  // Handle JSON backup download
  const handleDownloadBackup = () => {
    const jsonStr = exportBackupDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AttendAI_Backup_${profile.rollNumber || 'Student'}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded local JSON backup file', undefined, 'success');
  };

  // Handle JSON backup restore upload
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importBackupDataJSON(content);
        if (success) {
          showToast('Successfully restored backup data! Reloading...', undefined, 'success');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          showToast('Failed to parse invalid backup JSON file', undefined, 'error');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            <span>Reports, Search & Local Data Backup</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Export official PDF reports, CSV logs, search attendance records, and manage JSON backups.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => generatePrintablePDF(subjects, subjectStats, overallStats, profile)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF Report</span>
          </button>

          <button
            onClick={() => exportAttendanceSummaryCSV(subjects, subjectStats, overallStats, profile)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center space-x-1.5 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Local Backup & Restore Box */}
      <div className="bg-slate-900/80 backdrop-blur-2xl text-white border border-slate-700/60 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base flex items-center space-x-2">
              <Download className="w-5 h-5 text-blue-400" />
              <span>Offline Data Backup & Migration</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Keep full control of your academic data with zero cloud dependencies.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadBackup}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON Backup</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs rounded-xl border border-white/10 transition-all flex items-center space-x-1.5 backdrop-blur-md"
            >
              <Upload className="w-4 h-4" />
              <span>Restore from File</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleRestoreFile}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Attendance Logs Search & Filter Section */}
      <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-black/5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Attendance Log History ({filteredRecords.length} Records)
          </h3>

          <button
            onClick={() => exportAttendanceLogsCSV(records, subjects, profile)}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1 self-start md:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Raw Logs CSV</span>
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by code, teacher, date, note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/10 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Subject Filter */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-2 bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="cancelled">Cancelled</option>
            <option value="extra">Extra Class</option>
          </select>
        </div>

        {/* Log Table */}
        <div className="overflow-x-auto border border-slate-200/50 dark:border-white/10 rounded-xl backdrop-blur-md">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/60 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200/50 dark:border-white/10">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Faculty</th>
                <th className="p-3">Status</th>
                <th className="p-3">Note</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/40 dark:divide-white/5 text-slate-800 dark:text-slate-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No matching attendance logs found.
                  </td>
                </tr>
              ) : (
                filteredRecords.slice(0, 50).map((rec) => {
                  const sub = subjects.find((s) => s.id === rec.subjectId);

                  return (
                    <tr key={rec.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                      <td className="p-3 font-semibold">{rec.date}</td>
                      <td className="p-3 font-bold">
                        <span
                          className="inline-block w-2 h-2 rounded-full mr-1.5"
                          style={{ backgroundColor: sub?.color || '#3b82f6' }}
                        />
                        {sub?.code || 'SUB'} ({sub?.name || 'Subject'})
                      </td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">
                        {sub?.faculty || '-'}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            rec.status === 'present'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                              : rec.status === 'absent'
                              ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                              : rec.status === 'cancelled'
                              ? 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30'
                              : 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 dark:text-slate-400 italic max-w-xs truncate">
                        {rec.note || '-'}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => deleteAttendanceRecord(rec.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Danger Zone: Demo Data & Clear */}
      <div className="bg-white/50 dark:bg-slate-900/30 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
            Developer & Data Maintenance
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Reset to sample engineering dataset or purge all stored local data.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={loadDemoData}
            className="px-3.5 py-2 bg-white/60 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/20 text-xs font-bold rounded-xl transition-colors border border-slate-200/60 dark:border-white/10 flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to purge all local attendance data?')) {
                clearAllData();
              }
            }}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-500/20 transition-all flex items-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
