import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Flame,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Layers,
  Calendar,
  Clock,
  Compass
} from 'lucide-react';
import { DocumentMeta, LearningProgress, StudySchedule, StudyPlanTask } from '../types/index.js';
import { ActiveTab } from '../components/Navbar.js';

interface DashboardViewProps {
  documents: DocumentMeta[];
  progress: LearningProgress | null;
  schedule: StudySchedule | null;
  setActiveTab: (tab: ActiveTab) => void;
  onToggleTask: (taskId: string, completed: boolean) => void;
  onSelectDocumentForAsk: (docId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  documents,
  progress,
  schedule,
  setActiveTab,
  onToggleTask,
  onSelectDocumentForAsk
}) => {
  const todayDate = '2026-10-13';
  const todayTasks = schedule?.tasks.filter(t => t.date === todayDate) || [];
  const completedToday = todayTasks.filter(t => t.completed).length;
  const progressPercent = todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 0;

  // Recommended revision topics based on mistakes
  const weakTopics = Array.from(new Set(progress?.mistakes.map(m => m.topic) || [])).slice(0, 3);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Card */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 text-white shadow-lg">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="/src/assets/images/hero_documind_study_1791912427129.jpg"
            alt="DocuMind Academic Study Workspace"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent z-1" />

        <div className="relative z-10 p-6 md:p-10 max-w-2xl space-y-4">
          <div className="flex items-center gap-2 text-xs text-indigo-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>DocuMind Study Hub</span>
            <span aria-hidden="true">·</span>
            <span>Tagline: Upload. Understand. Remember.</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white text-balance">
            Master your university exams with cited textbook intelligence.
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Upload multiple textbooks, get answers grounded in exact page numbers, explore animated flowcharts, and train adaptively where you make mistakes.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('ask')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-900 bg-white rounded-lg hover:bg-slate-100 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Ask DocuMind</span>
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600/80 hover:bg-indigo-600 rounded-lg transition-colors border border-indigo-400/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <BookOpen className="w-4 h-4" />
              <span>Upload Textbooks</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Quantitative Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Library Books</span>
            <BookOpen className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {documents.length}
          </div>
          <p className="text-xs text-slate-500">
            {documents.reduce((acc, d) => acc + d.pageCount, 0)} pages indexed
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Mastered Topics</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono tabular-nums">
            {progress?.masteredTopicsCount || 0}
          </div>
          <p className="text-xs text-slate-500">
            ≥85% across 2+ drills
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Avg Quiz Score</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 font-mono tabular-nums">
            {progress?.averageQuizScore || 0}%
          </div>
          <p className="text-xs text-slate-500">
            {progress?.totalQuizzesTaken || 0} quizzes taken
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Study Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 font-mono tabular-nums">
            {progress?.dailyStreak || 1} Days
          </div>
          <p className="text-xs text-slate-500">
            14.5 hours logged
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Mistakes to Review</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 font-mono tabular-nums">
            {progress?.pendingRevisionsCount || 0}
          </div>
          <button
            onClick={() => setActiveTab('mistakes')}
            className="text-xs text-rose-600 hover:text-rose-700 font-medium hover:underline text-left block"
          >
            Review errors →
          </button>
        </div>
      </div>

      {/* Main Grid: Today's Schedule & Recommended Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Today's Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Today's Study Schedule</h2>
              <p className="text-xs text-slate-500">
                {todayTasks.length} sessions scheduled · {completedToday} completed ({progressPercent}%)
              </p>
            </div>
            <button
              onClick={() => setActiveTab('planner')}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Full Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="space-y-2.5">
            {todayTasks.length === 0 ? (
              <div className="p-6 rounded-xl bg-white border border-slate-200 text-center text-sm text-slate-500">
                No tasks set for today. Generate your study schedule in the Study Planner.
              </div>
            ) : (
              todayTasks.map(task => (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                    task.completed
                      ? 'bg-slate-50/70 border-slate-200 opacity-70'
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
                        <span className="text-xs text-slate-500 font-normal">
                          · {task.subject}
                        </span>
                      </div>
                      {task.documentTitle && (
                        <p className="text-xs text-slate-500 truncate max-w-md">
                          Source: {task.documentTitle}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
                        <span className="flex items-center gap-1">
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
                            <span className="text-rose-600 font-medium">High Exam Priority</span>
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
                    className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    Start {task.type}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Adaptive Recommendations & Quick Links */}
        <div className="space-y-6">
          {/* Weak Topics Card */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Recommended Revisions</h3>
              <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">
                Adaptive AI
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Based on your incorrect quiz answers, DocuMind recommends drilling these high-yield exam concepts:
            </p>

            <div className="space-y-2">
              {weakTopics.length === 0 ? (
                <div className="text-xs text-slate-500 italic p-2">
                  No active mistakes! Take a quiz to diagnose weak points.
                </div>
              ) : (
                weakTopics.map((topic, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900">{topic}</h4>
                      <p className="text-xs text-slate-500">Needs review (accuracy &lt;60%)</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('mistakes')}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline shrink-0"
                    >
                      Review
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setActiveTab('quiz')}
              className="w-full py-2 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors text-center"
            >
              Take Diagnostic Quiz
            </button>
          </div>

          {/* Quick Study Modes */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Quick Study Tools</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTab('visual')}
                className="p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all"
              >
                <Compass className="w-4 h-4 text-indigo-600 mb-1" />
                <div className="text-xs font-semibold text-slate-900">Flowcharts</div>
                <div className="text-xs text-slate-500">Step animations</div>
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className="p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all"
              >
                <Layers className="w-4 h-4 text-emerald-600 mb-1" />
                <div className="text-xs font-semibold text-slate-900">Smart Notes</div>
                <div className="text-xs text-slate-500">Flashcards & formulas</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Uploaded Textbooks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Recent Textbooks in Library</h2>
            <p className="text-xs text-slate-500">
              {documents.length} books indexed for search and citation
            </p>
          </div>
          <button
            onClick={() => setActiveTab('library')}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>Manage Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {documents.slice(0, 3).map(doc => (
            <div
              key={doc.id}
              className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{doc.subject}</span>
                  {doc.isSample && (
                    <span className="text-xs text-slate-400 font-mono">Sample Data</span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {doc.summary || 'Indexed textbook for exam preparation.'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono">{doc.pageCount} Pages</span>
                <button
                  onClick={() => {
                    onSelectDocumentForAsk(doc.id);
                    setActiveTab('ask');
                  }}
                  className="font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <span>Ask this book</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
