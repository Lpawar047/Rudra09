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
        <h1 className="text-2xl font-black text-[#111111] tracking-tight">System Configuration & Settings</h1>
        <p className="text-xs text-[#666666] mt-1 font-medium">Platform operational rules, theme appearance, and data ingestion controls.</p>
      </div>

      {savedMsg && (
        <div className="p-3 bg-[#FEF9C3] border border-[#EAB308] text-[#000000] text-xs font-black rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#EAB308]" /> Settings updated successfully.
        </div>
      )}

      {/* Appearance Section */}
      <div className="bg-white rounded-2xl border border-[#D1D1D1] p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-black text-[#111111] text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
            <Sun className="w-4 h-4 text-[#EAB308]" /> Appearance & Display Standard
          </h3>
          <p className="text-xs text-[#666666]">Rudra Services enforces a strict high-contrast Black + White + Yellow enterprise theme for maximum data readability.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-4 rounded-xl border border-[#EAB308] bg-[#FEF9C3] text-[#000000] font-black ring-2 ring-[#FACC15] shadow-xs flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-[#FFFFFF] text-[#000000] border border-[#D1D1D1] shrink-0">
              <Sun className="w-5 h-5 text-[#EAB308]" />
            </div>
            <div>
              <span className="text-xs font-black block">High-Contrast Light Workspace</span>
              <span className="text-[11px] text-[#333333] font-medium">Deep Black Sidebar + White Workspace + Yellow Accents</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[#D1D1D1] bg-[#FAFAFA] text-[#111111] flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-[#111111] text-[#FACC15] border border-[#333333] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black block">WCAG AAA Accessibility</span>
              <span className="text-[11px] text-[#666666] font-medium">Zero low-contrast or faint data values</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[#D6D6D6] p-6 shadow-xs space-y-6 text-xs">
        <div>
          <h3 className="font-black text-[#111111] text-sm uppercase tracking-wider mb-4 pb-2 border-b border-[#D6D6D6] flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#FACC15]" /> Excel & Data Import Rules
          </h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 bg-[#FAFAFA] rounded-xl border border-[#D6D6D6] cursor-pointer hover:border-[#FACC15] transition-colors">
              <div>
                <p className="font-black text-[#111111]">Non-Destructive UPSERT Mode</p>
                <p className="text-[11px] text-[#666666] mt-0.5">Update existing loan accounts by Loan Account Number without wiping past followups.</p>
              </div>
              <input
                type="checkbox"
                checked={duplicateDetection}
                onChange={(e) => setDuplicateDetection(e.target.checked)}
                className="w-4 h-4 rounded text-[#111111] focus:ring-[#FACC15]"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-[#FAFAFA] rounded-xl border border-[#D6D6D6] cursor-pointer hover:border-[#FACC15] transition-colors">
              <div>
                <p className="font-black text-[#111111]">Auto-Flag Critical DPD (&gt;90 Days)</p>
                <p className="text-[11px] text-[#666666] mt-0.5">Automatically mark cases exceeding 90 DPD as CRITICAL priority.</p>
              </div>
              <input
                type="checkbox"
                checked={autoAssignment}
                onChange={(e) => setAutoAssignment(e.target.checked)}
                className="w-4 h-4 rounded text-[#111111] focus:ring-[#FACC15]"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-[#D6D6D6]">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#FACC15] hover:bg-[#FFD600] text-[#000000] font-black text-xs rounded-xl shadow-xs transition-all border border-[#EAB308]"
          >
            Save System Settings
          </button>
        </div>
      </form>
    </div>
  );
};
