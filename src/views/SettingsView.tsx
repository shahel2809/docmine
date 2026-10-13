import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  RotateCcw,
  Save,
  Check,
  Server,
  Key
} from 'lucide-react';
import { StudySettings } from '../types/index.js';

interface SettingsViewProps {
  settings: StudySettings;
  onUpdateSettings: (settings: StudySettings) => Promise<void>;
  onResetData: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetData
}) => {
  const [masteryThreshold, setMasteryThreshold] = useState(settings.masteryThresholdPercent || 85);
  const [minAttempts, setMinAttempts] = useState(settings.minimumAttemptsForMastery || 2);
  const [dailyGoal, setDailyGoal] = useState(settings.dailyStudyGoalHours || 3.5);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateSettings({
        ...settings,
        masteryThresholdPercent: masteryThreshold,
        minimumAttemptsForMastery: minAttempts,
        dailyStudyGoalHours: dailyGoal
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      alert('Failed to save settings: ' + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Reset DocuMind to starter university textbooks and clean progress?')) {
      await onResetData();
      alert('Data reset to sample textbooks successfully.');
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">DocuMind Settings</h1>
        <p className="text-sm text-slate-500">
          Configure adaptive mastery thresholds, exam prep preferences, and study defaults.
        </p>
      </div>

      <form onSubmit={handleSave} className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-slate-900">Adaptive Learning Parameters</h2>

        {/* Mastery Threshold Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-800">
              Topic Mastery Accuracy Threshold: <span className="font-mono text-indigo-600">{masteryThreshold}%</span>
            </label>
            <span className="text-xs text-slate-400">Default: 85%</span>
          </div>
          <input
            type="range"
            min="70"
            max="95"
            step="5"
            value={masteryThreshold}
            onChange={e => setMasteryThreshold(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <p className="text-xs text-slate-500 leading-relaxed">
            A topic will only be certified as "Mastered" when your quiz performance meets or exceeds this percentage across multiple attempts.
          </p>
        </div>

        {/* Minimum Attempts */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-800">
              Minimum Attempts Required for Mastery: <span className="font-mono text-indigo-600">{minAttempts} Drills</span>
            </label>
            <span className="text-xs text-slate-400">Default: 2 attempts</span>
          </div>
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4].map(num => (
              <button
                type="button"
                key={num}
                onClick={() => setMinAttempts(num)}
                className={`flex-1 py-1.5 text-xs font-mono font-medium rounded-lg transition-colors ${
                  minAttempts === num
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {num} {num === 1 ? 'Attempt' : 'Attempts'}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            Prevents false mastery from a single lucky guess.
          </p>
        </div>

        {/* Daily Study Goal */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-800">
              Daily Study Target: <span className="font-mono text-indigo-600">{dailyGoal} Hours</span>
            </label>
          </div>
          <input
            type="range"
            min="1"
            max="8"
            step="0.5"
            value={dailyGoal}
            onChange={e => setDailyGoal(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5 text-white" /> : <Save className="w-3.5 h-3.5" />}
            <span>{savedSuccess ? 'Settings Saved!' : isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Backend & Security Diagnostics */}
      <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">System & Engine Architecture</h2>
        <div className="space-y-3 text-xs text-slate-600">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="font-medium">AI Intelligence:</span>
            <span className="font-mono text-slate-800">Google Gemini API (gemini-3.8-flash)</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="font-medium">PDF Text Engine:</span>
            <span className="font-mono text-slate-800">PyMuPDF / pdf-parse Page Indexer</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="font-medium">Diagram Syntax Engine:</span>
            <span className="font-mono text-slate-800">Mermaid.js Flowchart Runtime</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="font-medium">Untrusted Document Security:</span>
            <span className="text-emerald-700 font-medium">Grounded Retrieval Mode (No Prompt Injection)</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Reset to starter sample textbooks and initial state.
          </span>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Sample Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
