import React from 'react';
import { BookOpen, Check, Download, Layers, Sparkles, X } from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { Subject } from '../../types';

interface StreamPresetsModalProps {
  onClose: () => void;
}

interface StreamPreset {
  id: string;
  name: string;
  department: string;
  description: string;
  subjects: Omit<Subject, 'id'>[];
}

const STREAM_PRESETS: StreamPreset[] = [
  {
    id: 'cs-sem5',
    name: 'Computer Science & Engineering',
    department: 'CSE / IT',
    description: 'Data Structures, Operating Systems, DBMS, Networks, Machine Learning & Ethics',
    subjects: [
      { name: 'Data Structures & Algorithms', code: 'CS301', faculty: 'Dr. Aris Vance', credits: 4, weeklyCount: 4, color: '#3b82f6', targetPercentage: 75 },
      { name: 'Operating Systems', code: 'CS302', faculty: 'Prof. Sarah Jenkins', credits: 4, weeklyCount: 4, color: '#10b981', targetPercentage: 75 },
      { name: 'Database Management Systems', code: 'CS303', faculty: 'Dr. Marcus Brody', credits: 3, weeklyCount: 3, color: '#f59e0b', targetPercentage: 80 },
      { name: 'Computer Networks', code: 'CS304', faculty: 'Prof. Elena Rostova', credits: 3, weeklyCount: 3, color: '#8b5cf6', targetPercentage: 75 },
      { name: 'Machine Learning Essentials', code: 'CS305', faculty: 'Dr. Kabir Sharma', credits: 3, weeklyCount: 3, color: '#ec4899', targetPercentage: 75 },
    ],
  },
  {
    id: 'ece-sem5',
    name: 'Electronics & Communication',
    department: 'ECE / EEE',
    description: 'Signals & Systems, Digital Signal Processing, Microcontrollers, VLSI Design & Electromagnetics',
    subjects: [
      { name: 'Digital Signal Processing', code: 'EC301', faculty: 'Dr. Nathan Reed', credits: 4, weeklyCount: 4, color: '#06b6d4', targetPercentage: 75 },
      { name: 'Microcontrollers & Embedded Systems', code: 'EC302', faculty: 'Prof. Maya Lin', credits: 4, weeklyCount: 4, color: '#3b82f6', targetPercentage: 75 },
      { name: 'VLSI Design & Architecture', code: 'EC303', faculty: 'Dr. Victor Stone', credits: 3, weeklyCount: 3, color: '#8b5cf6', targetPercentage: 75 },
      { name: 'Electromagnetic Field Theory', code: 'EC304', faculty: 'Prof. Alan Turing', credits: 3, weeklyCount: 3, color: '#f59e0b', targetPercentage: 80 },
      { name: 'Analog Communication Systems', code: 'EC305', faculty: 'Dr. Rachel Green', credits: 3, weeklyCount: 3, color: '#ec4899', targetPercentage: 75 },
    ],
  },
  {
    id: 'mech-sem5',
    name: 'Mechanical & Production Engineering',
    department: 'ME / PE',
    description: 'Thermodynamics, Fluid Mechanics, Heat Transfer, Machine Design & CAD/CAM',
    subjects: [
      { name: 'Fluid Mechanics & Hydraulics', code: 'ME301', faculty: 'Dr. Robert Lang', credits: 4, weeklyCount: 4, color: '#3b82f6', targetPercentage: 75 },
      { name: 'Heat & Mass Transfer', code: 'ME302', faculty: 'Prof. Hannah Abbott', credits: 4, weeklyCount: 4, color: '#f97316', targetPercentage: 75 },
      { name: 'Design of Machine Elements', code: 'ME303', faculty: 'Dr. Carter Hall', credits: 4, weeklyCount: 4, color: '#10b981', targetPercentage: 80 },
      { name: 'Manufacturing Processes & CAD', code: 'ME304', faculty: 'Prof. Simon Cox', credits: 3, weeklyCount: 3, color: '#64748b', targetPercentage: 75 },
      { name: 'Applied Industrial Management', code: 'ME305', faculty: 'Dr. Laura Palmer', credits: 2, weeklyCount: 2, color: '#f59e0b', targetPercentage: 75 },
    ],
  },
  {
    id: 'bba-sem5',
    name: 'Business Administration & Management',
    department: 'BBA / MBA',
    description: 'Financial Management, Marketing Analytics, Business Law, HR Management & Strategy',
    subjects: [
      { name: 'Corporate Financial Management', code: 'BM301', faculty: 'Dr. Richard Sterling', credits: 4, weeklyCount: 3, color: '#10b981', targetPercentage: 75 },
      { name: 'Marketing Research & Analytics', code: 'BM302', faculty: 'Prof. Sophia Martinez', credits: 3, weeklyCount: 3, color: '#ec4899', targetPercentage: 75 },
      { name: 'Business Law & Governance', code: 'BM303', faculty: 'Dr. Jonathan Kent', credits: 3, weeklyCount: 3, color: '#f59e0b', targetPercentage: 75 },
      { name: 'Strategic Human Resource Management', code: 'BM304', faculty: 'Prof. Diana Prince', credits: 3, weeklyCount: 3, color: '#8b5cf6', targetPercentage: 80 },
      { name: 'Operations & Supply Chain Management', code: 'BM305', faculty: 'Dr. Bruce Wayne', credits: 3, weeklyCount: 3, color: '#06b6d4', targetPercentage: 75 },
    ],
  },
];

export const StreamPresetsModal: React.FC<StreamPresetsModalProps> = ({ onClose }) => {
  const { addSubject, showToast } = useAttendance();

  const handleImportPreset = (preset: StreamPreset) => {
    preset.subjects.forEach((sub) => {
      addSubject(sub);
    });
    showToast(`Imported ${preset.subjects.length} subjects for ${preset.name}`, undefined, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-blue-500 dark:text-blue-400 font-bold text-xs uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Quick Stream Templates</span>
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
          Import Department Subject Bundles
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
          Choose your branch to instantly populate realistic subject bundles with credits, weekly class counts, and target goals.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
          {STREAM_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-3 backdrop-blur-md group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-700 dark:text-blue-300">
                    {preset.department}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {preset.subjects.length} Subjects
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {preset.name}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {preset.description}
                </p>
              </div>

              <button
                onClick={() => handleImportPreset(preset)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center space-x-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Import {preset.subjects.length} Subjects</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
