import { AnimatePresence, motion } from 'motion/react';
import React from 'react';
import { AlertCircle, CheckCircle2, Info, RotateCcw, X, XCircle } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';

export const Snackbar: React.FC = () => {
  const { snackbar, hideToast } = useAttendance();

  return (
    <AnimatePresence>
      {snackbar.show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 max-w-md w-full shadow-2xl rounded-xl border p-4 bg-slate-900 text-white dark:bg-slate-800 dark:border-slate-700 flex items-center justify-between space-x-3"
          role="alert"
        >
          <div className="flex items-center space-x-3 overflow-hidden">
            {snackbar.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {snackbar.type === 'error' && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {snackbar.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />}
            {(!snackbar.type || snackbar.type === 'info') && <Info className="w-5 h-5 text-sky-400 shrink-0" />}

            <span className="text-sm font-medium truncate">{snackbar.message}</span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {snackbar.undoAction && (
              <button
                onClick={() => {
                  snackbar.undoAction?.();
                  hideToast();
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-sky-500 hover:bg-sky-600 text-white transition-colors flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Undo</span>
              </button>
            )}

            <button
              onClick={hideToast}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
