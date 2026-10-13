import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Plus,
  Check
} from 'lucide-react';
import { StudySchedule, StudyPlanTask } from '../types/index.js';
import { ActiveTab } from '../components/Navbar.js';

interface StudyPlannerViewProps {
  schedule: StudySchedule | null;
  onToggleTask: (taskId: string, completed: boolean) => void;
  onGenerateSchedule: (examDate: string, subjects: string[], hours: number) => Promise<void>;
  onReschedule: () => Promise<void>;
  setActiveTab: (tab: ActiveTab) => void;
}

export const StudyPlannerView: React.FC<StudyPlannerViewProps> = ({
  schedule,
  onToggleTask,
  onGenerateSchedule,
  onReschedule,
  setActiveTab
}) => {
  const [examDate, setExamDate] = useState(schedule?.examDate || '2026-11-20');
  const [dailyHours, setDailyHours] = useState(schedule?.dailyHours || 3.5);
  const [subjectsInput, setSubjectsInput] = useState(
    schedule?.subjects.join(', ') || 'Computer Science, Economics, Biology'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const subs = subjectsInput.split(',').map(s => s.trim()).filter(Boolean);
      await onGenerateSchedule(examDate, subs, dailyHours);
    } catch (err) {
      alert('Failed to generate schedule: ' + (err as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAutoReschedule = async () => {
    setIsRescheduling(true);
    try {
      await onReschedule();
      alert('Schedule updated: Missed tasks adjusted to today and upcoming revision dates.');
    } catch (err) {
      alert('Failed to reschedule: ' + (err as Error).message);
    } finally {
      setIsRescheduling(false);
    }
  };

  // Group tasks by date
  const tasksByDate: Record<string, StudyPlanTask[]> = {};
  schedule?.tasks.forEach(task => {
    if (!tasksByDate[task.date]) {
      tasksByDate[task.date] = [];
    }
    tasksByDate[task.date].push(task);
  });

  const totalTasks = schedule?.tasks.length || 0;
  const completedTasks = schedule?.tasks.filter(t => t.completed).length || 0;
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Personalized Study Planner
          </h1>
          <p className="text-sm text-slate-500">
            Intelligent daily revision schedule balancing reading, quiz drills, and visual flowchart review.
          </p>
        </div>

        <button
          onClick={handleAutoReschedule}
          disabled={isRescheduling || !schedule}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{isRescheduling ? 'Rescheduling...' : 'Auto-Reschedule Missed Tasks'}</span>
        </button>
      </div>

      {/* Configuration Console */}
      <form
        onSubmit={handleGenerate}
        className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Exam Parameters</h2>
          <span className="text-xs text-slate-500">
            Target Exam Date: <strong className="font-mono text-slate-800">{examDate}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Exam Date
            </label>
            <input
              type="date"
              value={examDate}
              onChange={e => setExamDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Target Subjects (comma-separated)
            </label>
            <input
              type="text"
              value={subjectsInput}
              onChange={e => setSubjectsInput(e.target.value)}
              placeholder="e.g. Computer Science, Economics"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Daily Available Study Hours: {dailyHours}h
            </label>
            <input
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={dailyHours}
              onChange={e => setDailyHours(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Schedules are dynamically optimized using your active mistakes log.
          </span>
          <button
            type="submit"
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'Optimizing Schedule...' : 'Generate New Plan'}</span>
          </button>
        </div>
      </form>

      {/* Overall Progress Meter */}
      {schedule && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-800 font-sans">Curriculum Completion Progress:</span>
            <span>
              {completedTasks} of {totalTasks} Tasks Completed ({overallProgress}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Day by Day Plan Breakdown */}
      <div className="space-y-6">
        {Object.entries(tasksByDate).map(([date, tasks]) => {
          const dateCompleted = tasks.filter(t => t.completed).length;
          const isToday = date === '2026-10-13';

          return (
            <div key={date} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 font-mono">
                    {date} {isToday && '(Today)'}
                  </h3>
                  <span className="text-xs text-slate-500">
                    · {tasks.length} tasks · {dateCompleted}/{tasks.length} done
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                      task.completed
                        ? 'bg-slate-50/70 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={e => onToggleTask(task.id, e.target.checked)}
                        className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-semibold ${
                              task.completed ? 'line-through text-slate-500' : 'text-slate-900'
                            }`}
                          >
                            {task.topic}
                          </span>
                          <span className="text-xs text-slate-500">
                            · {task.subject}
                          </span>
                        </div>
                        {task.documentTitle && (
                          <p className="text-xs text-slate-500 truncate max-w-lg">
                            Source: {task.documentTitle}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{task.estimatedMinutes} mins</span>
                          </span>
                          <span>·</span>
                          <span className="capitalize font-medium text-slate-600">
                            {task.type} mode
                          </span>
                          {task.priority === 'high' && (
                            <>
                              <span>·</span>
                              <span className="text-rose-600 font-medium">Exam Must-Do</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (task.type === 'quiz') setActiveTab('quiz');
                        else if (task.type === 'flowchart') setActiveTab('visual');
                        else setActiveTab('ask');
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      Launch
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {Object.keys(tasksByDate).length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-sm text-slate-500">
            No schedule active. Click "Generate New Plan" above to create your daily study schedule.
          </div>
        )}
      </div>
    </div>
  );
};
