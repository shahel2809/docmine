import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Check
} from 'lucide-react';
import { LearningProgress, MistakeRecord, TopicMastery } from '../types/index.js';
import { ActiveTab } from '../components/Navbar.js';

interface AdaptiveMistakesViewProps {
  progress: LearningProgress | null;
  onRetryMistake: (mistakeId: string, resolved: boolean) => Promise<void>;
  setActiveTab: (tab: ActiveTab) => void;
  onStartRemedialQuiz: (topic: string) => void;
}

export const AdaptiveMistakesView: React.FC<AdaptiveMistakesViewProps> = ({
  progress,
  onRetryMistake,
  setActiveTab,
  onStartRemedialQuiz
}) => {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const mistakes = progress?.mistakes || [];
  const masteries = progress?.topicMasteries || [];

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    await onRetryMistake(id, true);
    setResolvingId(null);
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Adaptive Learning & Mistake Tracker
        </h1>
        <p className="text-sm text-slate-500">
          Target concepts you missed in quizzes. Topics are marked mastered only after 85%+ accuracy across 2+ drill attempts.
        </p>
      </div>

      {/* Mastery Threshold Rules Banner */}
      <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-950 space-y-1">
          <span className="font-bold">DocuMind Academic Mastery Rule:</span>
          <p className="leading-relaxed">
            Unlike superficial study apps, DocuMind never marks a topic as "mastered" merely because you opened or read a chapter.
            Mastery requires verified proof: achieving <strong>≥85% accuracy across at least 2 distinct quiz attempts</strong>.
          </p>
        </div>
      </div>

      {/* Topic Mastery Matrix */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">Curriculum Topic Mastery Matrix</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {masteries.map(m => {
            let statusColor = 'bg-slate-100 text-slate-700 border-slate-200';
            let label = 'In Progress';
            if (m.status === 'mastered') {
              statusColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
              label = 'Mastered';
            } else if (m.status === 'needs_review') {
              statusColor = 'bg-rose-50 text-rose-800 border-rose-200';
              label = 'Needs Review';
            }

            return (
              <div
                key={m.topic}
                className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{m.subject}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${statusColor}`}>
                      {label}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {m.topic}
                  </h3>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-600 font-mono">
                    <span>Accuracy: {m.accuracy}%</span>
                    <span>{m.attemptsCount} Attempts</span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        m.accuracy >= 85
                          ? 'bg-emerald-600'
                          : m.accuracy >= 60
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, m.accuracy)}%` }}
                    />
                  </div>

                  {m.status !== 'mastered' && (
                    <button
                      onClick={() => onStartRemedialQuiz(m.topic)}
                      className="w-full mt-1 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors text-center"
                    >
                      Practice This Topic →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Mistakes Log */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Active Mistakes Log ({mistakes.length})</h2>
            <p className="text-xs text-slate-500">
              Incorrect answers from previous tests requiring review and reinforcement.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {mistakes.map(m => (
            <div
              key={m.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <span className="font-bold text-rose-600">Incorrect Answer</span>
                    <span>·</span>
                    <span>Topic: {m.topic}</span>
                    {m.pageNumber && (
                      <>
                        <span>·</span>
                        <span>Page {m.pageNumber}</span>
                      </>
                    )}
                  </div>
                  <h3 className="text-sm md:text-base font-bold text-slate-900">
                    {m.question}
                  </h3>
                </div>

                <button
                  onClick={() => handleResolve(m.id)}
                  disabled={resolvingId === m.id}
                  className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1 shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark Resolved</span>
                </button>
              </div>

              {/* Answers Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1">
                  <span className="font-bold text-rose-900">Your Answer:</span>
                  <p className="text-rose-950 font-mono">{m.studentAnswer}</p>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-900">Correct Textbook Answer:</span>
                  <p className="text-emerald-950 font-mono font-semibold">{m.correctAnswer}</p>
                </div>
              </div>

              {/* Explanation */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed space-y-1">
                <span className="font-bold text-slate-900 block">Textbook Rule & Rationale:</span>
                <p>{m.explanation}</p>
                {m.documentTitle && (
                  <p className="text-slate-500 font-serif italic pt-1">
                    Source: {m.documentTitle} (Page {m.pageNumber})
                  </p>
                )}
              </div>
            </div>
          ))}

          {mistakes.length === 0 && (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-900">Zero Pending Mistakes!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All reviewed errors have been resolved. Continue with your daily revision schedule or challenge yourself with an advanced quiz.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
