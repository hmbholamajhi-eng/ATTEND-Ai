import React from 'react';
import {
  BarChart3,
  BookOpen,
  Calculator,
  Calendar,
  CheckSquare,
  Clock,
  FileSpreadsheet,
  LayoutGrid,
  ListTodo,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'attendance'
  | 'subjects'
  | 'timetable'
  | 'calendar'
  | 'tasks'
  | 'calculator'
  | 'analytics'
  | 'reports';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutGrid },
    { id: 'attendance' as TabType, label: 'Mark Attendance', icon: CheckSquare },
    { id: 'subjects' as TabType, label: 'Subjects', icon: BookOpen },
    { id: 'timetable' as TabType, label: 'Timetable', icon: Clock },
    { id: 'calendar' as TabType, label: 'Calendar', icon: Calendar },
    { id: 'tasks' as TabType, label: 'Google Tasks', icon: ListTodo },
    { id: 'calculator' as TabType, label: 'Goal Bunk Math', icon: Calculator },
    { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3 },
    { id: 'reports' as TabType, label: 'Reports & Data', icon: FileSpreadsheet },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200/60 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-xl min-h-[calc(100vh-4rem)] p-4 shrink-0 transition-colors">
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300 font-semibold border border-blue-500/30 shadow-xs backdrop-blur-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-t border-slate-200/60 dark:border-white/10 px-2 py-1.5 shadow-lg">
        <nav className="flex justify-around items-center">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive
                    ? 'text-sky-600 dark:text-sky-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="truncate max-w-[64px]">{item.label}</span>
              </button>
            );
          })}
          {/* More menu items trigger */}
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
              ['calculator', 'analytics', 'reports'].includes(activeTab)
                ? 'text-sky-600 dark:text-sky-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Calculator className="w-5 h-5 mb-0.5" />
            <span>Math & More</span>
          </button>
        </nav>
      </div>
    </>
  );
};
