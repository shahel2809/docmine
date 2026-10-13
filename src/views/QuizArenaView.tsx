import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Sparkles,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Play,
  Flame,
  Check
} from 'lucide-react';
import { Quiz, QuizQuestion, QuizAttempt, MistakeRecord, DocumentMeta } from '../types/index.js';

interface QuizArenaViewProps {
  documents: DocumentMeta[];
  onRecordAttempt: (attempt: QuizAttempt) => Promise<void>;
  onRetryMistakes: () => void;
}

export const QuizArenaView: React.FC<QuizArenaViewProps> = ({
  documents,
  onRecordAttempt,
  onRetryMistakes
}) => {
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('Virtual Memory & Concurrency');
  const [selectedDocId, setSelectedDocId] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [questionCount, setQuestionCount] = useState(5);

  // Active quiz session states
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizAttempt | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 mins
  const [isTimed, setIsTimed] = useState(true);

  // Retrying single mistake in-place
  const [retryingQuestions, setRetryingQuestions] = useState<QuizQuestion[] | null>(null);

  // Fetch or generate quiz
  const handleGenerateQuiz = async (topicToUse?: string) => {
    setIsGenerating(true);
    setActiveQuiz(null);
    setIsSubmitted(false);
    setQuizResult(null);
    setAnswers({});
    setRetryingQuestions(null);
    setTimeLeft(10 * 60);

    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicToUse || selectedTopic,
          documentId: selectedDocId === 'all' ? undefined : selectedDocId,
          count: questionCount,
          difficulty
        })
      });

      if (!res.ok) throw new Error('Failed to generate quiz');
      const quiz: Quiz = await res.json();
      setActiveQuiz(quiz);
    } catch (err) {
      alert('Error creating quiz: ' + (err as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (!activeQuiz || isSubmitted || !isTimed) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeQuiz, isSubmitted, isTimed]);

  const handleSelectOption = (questionId: string, option: string) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz || isSubmitted) return;
    const questionsToGrade = retryingQuestions || activeQuiz.questions;

    let score = 0;
    const mistakes: MistakeRecord[] = [];
    const weakTopicsSet = new Set<string>();

    questionsToGrade.forEach(q => {
      const studentAns = (answers[q.id] || '').trim();
      const isCorrect = studentAns.toLowerCase() === q.correctAnswer.toLowerCase();

      if (isCorrect) {
        score += 1;
      } else {
        weakTopicsSet.add(q.topic);
        mistakes.push({
          id: `mistake-${Date.now()}-${q.id}`,
          questionId: q.id,
          question: q.question,
          studentAnswer: studentAns || '(No Answer Provided)',
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          topic: q.topic,
          documentTitle: q.documentTitle,
          pageNumber: q.pageNumber,
          timestamp: new Date().toISOString(),
          resolved: false
        });
      }
    });

    const total = questionsToGrade.length;
    const percentage = Math.round((score / total) * 100);

    const attempt: QuizAttempt = {
      id: `attempt-${Date.now()}`,
      quizId: activeQuiz.id,
      quizTitle: activeQuiz.title,
      timestamp: new Date().toISOString(),
      score,
      totalQuestions: total,
      percentage,
      weakTopics: Array.from(weakTopicsSet),
      mistakes
    };

    setQuizResult(attempt);
    setIsSubmitted(true);

    if (percentage >= 80) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }

    // Save attempt in backend store
    await onRecordAttempt(attempt);
  };

  const handleStartMistakeRetry = () => {
    if (!quizResult || quizResult.mistakes.length === 0 || !activeQuiz) return;
    const mistakeQuestionIds = new Set(quizResult.mistakes.map(m => m.questionId));
    const mistakeQuestions = activeQuiz.questions.filter(q => mistakeQuestionIds.has(q.id));

    setRetryingQuestions(mistakeQuestions);
    setAnswers({});
    setIsSubmitted(false);
    setQuizResult(null);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const displayedQuestions = retryingQuestions || activeQuiz?.questions || [];

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quiz Arena</h1>
          <p className="text-sm text-slate-500">
            Generate grounded practice drills, timed tests, and retry mistakes adaptively.
          </p>
        </div>
      </div>

      {/* Quiz Configurator Bar */}
      {!activeQuiz && (
        <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900">Configure Practice Drill</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Topic / Focus
              </label>
              <input
                type="text"
                value={selectedTopic}
                onChange={e => setSelectedTopic(e.target.value)}
                placeholder="e.g. Virtual Memory, Deadlock, Keynesian Multiplier..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Source Document
              </label>
              <select
                value={selectedDocId}
                onChange={e => setSelectedDocId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50"
              >
                <option value="all">All Library Books ({documents.length})</option>
                {documents.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.title} ({d.subject})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Difficulty Level
              </label>
              <div className="flex items-center gap-2">
                {(['beginner', 'intermediate', 'advanced'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                      difficulty === d
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Questions Count
              </label>
              <div className="flex items-center gap-2">
                {[3, 5, 10].map(c => (
                  <button
                    key={c}
                    onClick={() => setQuestionCount(c)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg font-mono transition-colors ${
                      questionCount === c
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {c} Questions
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isTimed}
                onChange={e => setIsTimed(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Enable 10-Minute Exam Timer</span>
            </label>

            <button
              onClick={() => handleGenerateQuiz()}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Generating Quiz...' : 'Launch Quiz'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Quiz Session */}
      {activeQuiz && (
        <div className="space-y-6">
          {/* Status Bar */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 truncate max-w-md">
                {retryingQuestions ? `Retry Mode: ${activeQuiz.title}` : activeQuiz.title}
              </h2>
              <p className="text-xs text-slate-500">
                {displayedQuestions.length} Questions · {retryingQuestions ? 'Mistake Drill' : activeQuiz.difficulty}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {isTimed && !isSubmitted && (
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{formatTimer(timeLeft)}</span>
                </div>
              )}

              <button
                onClick={() => {
                  if (confirm('Leave current quiz session?')) {
                    setActiveQuiz(null);
                    setRetryingQuestions(null);
                  }
                }}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Quit Drill
              </button>
            </div>
          </div>

          {/* Results Card after submission */}
          {isSubmitted && quizResult && (
            <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Award className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">Drill Completed</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Performance recorded for adaptive topic mastery tracking.
                </p>
              </div>

              <div className="flex justify-center items-baseline gap-2 font-mono">
                <span className="text-4xl font-extrabold text-indigo-600">
                  {quizResult.score}
                </span>
                <span className="text-xl text-slate-400">/ {quizResult.totalQuestions}</span>
                <span className="text-lg font-bold text-slate-700 ml-2">
                  ({quizResult.percentage}%)
                </span>
              </div>

              {quizResult.weakTopics.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl max-w-md mx-auto text-xs text-rose-800 space-y-1">
                  <span className="font-bold">Topics to Revise:</span>
                  <p>{quizResult.weakTopics.join(', ')}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {quizResult.mistakes.length > 0 && (
                  <button
                    onClick={handleStartMistakeRetry}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retry Mistakes Only ({quizResult.mistakes.length})</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setActiveQuiz(null);
                    setRetryingQuestions(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Return to Arena
                </button>
              </div>
            </div>
          )}

          {/* Question List */}
          <div className="space-y-4">
            {displayedQuestions.map((q, idx) => {
              const studentAnswer = answers[q.id] || '';
              const isAnswered = Boolean(studentAnswer);
              const isCorrect = isSubmitted && studentAnswer.toLowerCase() === q.correctAnswer.toLowerCase();
              const isWrong = isSubmitted && !isCorrect;

              return (
                <div
                  key={q.id}
                  className={`p-6 rounded-2xl bg-white border transition-all space-y-4 ${
                    isSubmitted
                      ? isCorrect
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : 'border-rose-200 bg-rose-50/20'
                      : 'border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                        <span>Question {idx + 1}</span>
                        <span>·</span>
                        <span className="capitalize">{q.type.replace(/_/g, ' ')}</span>
                        {q.pageNumber && (
                          <>
                            <span>·</span>
                            <span>Textbook Page {q.pageNumber}</span>
                          </>
                        )}
                      </div>
                      <h3 className="text-sm md:text-base font-bold text-slate-900 leading-snug">
                        {q.question}
                      </h3>
                    </div>

                    {isSubmitted && (
                      <div className="shrink-0">
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-600" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Options rendering */}
                  {q.type === 'mcq' || q.type === 'true_false' ? (
                    <div className="space-y-2">
                      {(q.options || ['True', 'False']).map((opt, optIdx) => {
                        const isSelected = studentAnswer === opt;
                        const isThisCorrect = isSubmitted && opt.toLowerCase() === q.correctAnswer.toLowerCase();
                        const isThisWrongSelected = isSubmitted && isSelected && !isThisCorrect;

                        return (
                          <button
                            key={optIdx}
                            disabled={isSubmitted}
                            onClick={() => handleSelectOption(q.id, opt)}
                            className={`w-full p-3 rounded-xl text-left text-xs md:text-sm transition-all flex items-center justify-between ${
                              isThisCorrect
                                ? 'bg-emerald-100 border border-emerald-300 text-emerald-950 font-semibold'
                                : isThisWrongSelected
                                ? 'bg-rose-100 border border-rose-300 text-rose-950 font-semibold'
                                : isSelected
                                ? 'bg-indigo-50 border border-indigo-300 text-indigo-900 font-medium'
                                : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800'
                            }`}
                          >
                            <span>{opt}</span>
                            {isThisCorrect && <Check className="w-4 h-4 text-emerald-600" />}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    /* Fill in the blank */
                    <div className="space-y-2">
                      <input
                        type="text"
                        disabled={isSubmitted}
                        value={studentAnswer}
                        onChange={e => handleSelectOption(q.id, e.target.value)}
                        placeholder="Type your answer..."
                        className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                      {isSubmitted && isWrong && (
                        <div className="text-xs text-rose-700 font-medium">
                          Correct Answer: <span className="font-bold">{q.correctAnswer}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Explanation after submission */}
                  {isSubmitted && (
                    <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200/80 text-xs text-slate-700 leading-relaxed space-y-1">
                      <span className="font-bold text-slate-900 block">
                        Textbook Explanation:
                      </span>
                      <p>{q.explanation}</p>
                      {q.documentTitle && (
                        <p className="text-slate-500 font-serif italic pt-1">
                          Source: {q.documentTitle} (Page {q.pageNumber})
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          {!isSubmitted && (
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSubmitQuiz}
                className="px-8 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Submit Drill & Record Progress
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
