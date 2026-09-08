import React, { useState } from 'react';
import { Settings as SettingsIcon, ShieldCheck, Database, FileSpreadsheet, CheckCircle2, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [autoAssignment, setAutoAssignment] = useState(true);
  const [duplicateDetection, setDuplicateDetection] = useState(true);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">System Configuration & Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Platform operational rules, theme appearance, and data ingestion controls.</p>
      </div>

      {savedMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Settings updated successfully.
        </div>
      )}

      {/* Appearance Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" /> Appearance & Theme
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Choose how Rudra Services looks to you. Seamlessly switches across entire UI.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
              theme === 'light'
                ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-bold ring-2 ring-indigo-600/30 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="p-2.5 rounded-full bg-amber-100 text-amber-600">
              <Sun className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">Light Mode</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Crisp & high-contrast</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
              theme === 'dark'
                ? 'border-indigo-600 bg-indigo-950/40 text-indigo-300 font-bold ring-2 ring-indigo-600/30 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="p-2.5 rounded-full bg-indigo-900/60 text-indigo-400">
              <Moon className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">Dark Mode</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Deep slate SaaS palette</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
              theme === 'system'
                ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold ring-2 ring-indigo-600/30 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              <Monitor className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">System Default</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Matches device settings</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6 text-xs">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Excel & Data Import Rules
          </h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Non-Destructive UPSERT Mode</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Update existing loan accounts by Loan Account Number without wiping past followups.</p>
              </div>
              <input
                type="checkbox"
                checked={duplicateDetection}
                onChange={(e) => setDuplicateDetection(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-600 dark:bg-slate-800 dark:border-slate-700"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Auto-Flag Critical DPD (&gt;90 Days)</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Automatically mark cases exceeding 90 DPD as CRITICAL priority.</p>
              </div>
              <input
                type="checkbox"
                checked={autoAssignment}
                onChange={(e) => setAutoAssignment(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-600 dark:bg-slate-800 dark:border-slate-700"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all"
          >
            Save System Settings
          </button>
        </div>
      </form>
    </div>
  );
};
