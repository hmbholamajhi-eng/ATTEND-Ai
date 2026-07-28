import React, { useState } from 'react';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AttendanceMarkingView } from './components/attendance/AttendanceMarkingView';
import { GoalBunkCalculatorView } from './components/calculator/GoalBunkCalculatorView';
import { CalendarView } from './components/calendar/CalendarView';
import { DashboardView } from './components/dashboard/DashboardView';
import { Header } from './components/Header';
import { ReportsBackupView } from './components/reports/ReportsBackupView';
import { Sidebar, TabType } from './components/Sidebar';
import { Snackbar } from './components/Snackbar';
import { SubjectManagementView } from './components/subjects/SubjectManagementView';
import { GoogleTasksView } from './components/tasks/GoogleTasksView';
import { TimetableBuilderView } from './components/timetable/TimetableBuilderView';
import { AttendanceProvider } from './context/AttendanceContext';
import { AuthProvider } from './context/AuthContext';

function MainLayout() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#05070a] text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors relative overflow-x-hidden">
      {/* Background Mesh Gradients for Frosted Glass Theme */}
      <div className="fixed top-[-10%] left-[-10%] w-[55%] h-[55%] bg-blue-500/15 dark:bg-blue-600/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[55%] h-[55%] bg-indigo-500/15 dark:bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-[25%] right-[10%] w-[35%] h-[35%] bg-cyan-500/10 dark:bg-cyan-600/15 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Top Header */}
      <Header />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto relative z-10">
        {/* Sidebar Navigation */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Active Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
          {activeTab === 'attendance' && <AttendanceMarkingView />}
          {activeTab === 'subjects' && <SubjectManagementView />}
          {activeTab === 'timetable' && <TimetableBuilderView />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'tasks' && <GoogleTasksView />}
          {activeTab === 'calculator' && <GoalBunkCalculatorView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'reports' && <ReportsBackupView />}
        </main>
      </div>

      {/* Undo Toast & Snackbar */}
      <Snackbar />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AttendanceProvider>
        <MainLayout />
      </AttendanceProvider>
    </AuthProvider>
  );
}
