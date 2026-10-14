import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar.js';
import { DashboardView } from './views/DashboardView.js';
import { LibraryView } from './views/LibraryView.js';
import { AskDocuMindView } from './views/AskDocuMindView.js';
import { SmartNotesView } from './views/SmartNotesView.js';
import { VisualLearningView } from './views/VisualLearningView.js';
import { QuizArenaView } from './views/QuizArenaView.js';
import { AdaptiveMistakesView } from './views/AdaptiveMistakesView.js';
import { StudyPlannerView } from './views/StudyPlannerView.js';
import { ProgressTrackerView } from './views/ProgressTrackerView.js';
import { SettingsView } from './views/SettingsView.js';
import {
  DocumentMeta,
  LearningProgress,
  StudySchedule,
  SmartHighlight,
  SavedNote,
  StudySettings,
  QuizAttempt
} from './types/index.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [highlights, setHighlights] = useState<SmartHighlight[]>([]);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [schedule, setSchedule] = useState<StudySchedule | null>(null);
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
  const [settings, setSettings] = useState<StudySettings>({
    masteryThresholdPercent: 85,
    minimumAttemptsForMastery: 2,
    dailyStudyGoalHours: 3.5,
    examDate: '2026-11-20',
    targetSubjects: ['Computer Science', 'Economics', 'Biology']
  });

  const [selectedDocIdForAsk, setSelectedDocIdForAsk] = useState<string>('all');
  const [remedialQuizTopic, setRemedialQuizTopic] = useState<string | null>(null);

  // Fetch initial state from server
  const loadInitialData = async () => {
    try {
      const [docsRes, progRes, schedRes, highRes, notesRes, settsRes] = await Promise.all([
        fetch('/api/documents'),
        fetch('/api/progress'),
        fetch('/api/schedule'),
        fetch('/api/highlights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        }),
        fetch('/api/notes'),
        fetch('/api/settings')
      ]);

      if (docsRes.ok) {
        const d = await docsRes.json();
        if (d.documents) setDocuments(d.documents);
      }
      if (progRes.ok) {
        const p = await progRes.json();
        setProgress(p);
      }
      if (schedRes.ok) {
        const s = await schedRes.json();
        if (s.schedule) setSchedule(s.schedule);
      }
      if (highRes.ok) {
        const h = await highRes.json();
        if (h.highlights) setHighlights(h.highlights);
      }
      if (notesRes.ok) {
        const n = await notesRes.json();
        if (n.notes) setSavedNotes(n.notes);
      }
      if (settsRes.ok) {
        const st = await settsRes.json();
        if (st.settings) setSettings(st.settings);
      }
    } catch (e) {
      console.warn('Initial data load notice:', e);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Upload handler
  const handleUploadFiles = async (files: File[]) => {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Upload failed');
    }

    const data = await res.json();
    if (data.documents) {
      setDocuments(prev => [...data.documents, ...prev]);
    }
  };

  // Delete document handler
  const handleDeleteDocument = async (id: string) => {
    const res = await fetch(`/api/delete/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete document');
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  // Rename document handler
  const handleRenameDocument = async (id: string, newTitle: string) => {
    const res = await fetch(`/api/rename/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle })
    });
    if (!res.ok) throw new Error('Failed to rename document');
    setDocuments(prev =>
      prev.map(d => (d.id === id ? { ...d, title: newTitle } : d))
    );
  };

  // Toggle study plan task
  const handleToggleTask = async (taskId: string, completed: boolean) => {
    if (!schedule) return;
    setSchedule(prev => {
      if (!prev) return null;
      return {
        ...prev,
        tasks: prev.tasks.map(t => (t.id === taskId ? { ...t, completed } : t))
      };
    });

    try {
      await fetch(`/api/schedule/task/${taskId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      });
    } catch (err) {
      console.error('Failed to sync task toggle:', err);
    }
  };

  // Generate new schedule
  const handleGenerateSchedule = async (examDate: string, subjects: string[], hours: number) => {
    const res = await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examDate, subjects, dailyHours: hours })
    });
    if (!res.ok) throw new Error('Schedule generation failed');
    const data = await res.json();
    if (data.schedule) setSchedule(data.schedule);
  };

  // Auto reschedule
  const handleReschedule = async () => {
    const res = await fetch('/api/schedule/reschedule', { method: 'POST' });
    if (!res.ok) throw new Error('Reschedule failed');
    const data = await res.json();
    if (data.schedule) setSchedule(data.schedule);
  };

  // Record quiz attempt
  const handleRecordAttempt = async (attempt: QuizAttempt) => {
    const res = await fetch('/api/progress/attempt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attempt)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.progress) setProgress(data.progress);
    }
  };

  // Retry or resolve mistake
  const handleRetryMistake = async (mistakeId: string, resolved: boolean) => {
    const res = await fetch('/api/progress/retry-mistake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mistakeId, resolved })
    });
    if (res.ok) {
      setProgress(prev => {
        if (!prev) return null;
        return {
          ...prev,
          mistakes: prev.mistakes.filter(m => m.id !== mistakeId),
          pendingRevisionsCount: Math.max(0, prev.pendingRevisionsCount - 1)
        };
      });
    }
  };

  // Save note
  const handleSaveNote = async (note: SavedNote) => {
    const res = await fetch('/api/notes/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.note) {
        setSavedNotes(prev => [data.note, ...prev.filter(n => n.id !== data.note.id)]);
      }
    }
  };

  // Delete note
  const handleDeleteNote = async (id: string) => {
    const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setSavedNotes(prev => prev.filter(n => n.id !== id));
    }
  };

  // Update settings
  const handleUpdateSettings = async (newSettings: StudySettings) => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings)
    });
    if (res.ok) {
      setSettings(newSettings);
    }
  };

  // Reset to sample data
  const handleResetData = async () => {
    const res = await fetch('/api/reset', { method: 'POST' });
    if (res.ok) {
      await loadInitialData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Navigation Top Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingMistakesCount={progress?.pendingRevisionsCount || 0}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            documents={documents}
            progress={progress}
            schedule={schedule}
            setActiveTab={setActiveTab}
            onToggleTask={handleToggleTask}
            onSelectDocumentForAsk={id => setSelectedDocIdForAsk(id)}
          />
        )}

        {activeTab === 'library' && (
          <LibraryView
            documents={documents}
            onUploadFiles={handleUploadFiles}
            onDeleteDocument={handleDeleteDocument}
            onRenameDocument={handleRenameDocument}
            setActiveTab={setActiveTab}
            onSelectDocumentForAsk={id => setSelectedDocIdForAsk(id)}
          />
        )}

        {activeTab === 'ask' && (
          <AskDocuMindView
            documents={documents}
            selectedDocId={selectedDocIdForAsk}
            onSaveToNotes={(title, content, docTitle, pageNum) =>
              handleSaveNote({
                id: `note-${Date.now()}`,
                title,
                content,
                documentTitle: docTitle,
                pageNumber: pageNum,
                tags: ['Ask DocuMind', 'Verified'],
                category: 'summary',
                createdAt: new Date().toISOString()
              })
            }
          />
        )}

        {activeTab === 'notes' && (
          <SmartNotesView
            highlights={highlights}
            savedNotes={savedNotes}
            documents={documents}
            onSaveNote={handleSaveNote}
            onDeleteNote={handleDeleteNote}
          />
        )}

        {activeTab === 'visual' && <VisualLearningView />}

        {activeTab === 'quiz' && (
          <QuizArenaView
            documents={documents}
            onRecordAttempt={handleRecordAttempt}
            onRetryMistakes={() => setActiveTab('mistakes')}
          />
        )}

        {activeTab === 'mistakes' && (
          <AdaptiveMistakesView
            progress={progress}
            onRetryMistake={handleRetryMistake}
            setActiveTab={setActiveTab}
            onStartRemedialQuiz={topic => {
              setRemedialQuizTopic(topic);
              setActiveTab('quiz');
            }}
          />
        )}

        {activeTab === 'planner' && (
          <StudyPlannerView
            schedule={schedule}
            onToggleTask={handleToggleTask}
            onGenerateSchedule={handleGenerateSchedule}
            onReschedule={handleReschedule}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'progress' && <ProgressTrackerView progress={progress} />}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Footer without copyright restrictions */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <strong>DocuMind</strong> · Upload. Understand. Remember. Academic exam preparation platform.
          </div>
          <div>
            Open Educational Resource (OER) · Free of Copyright Restrictions · Public Domain Academic License
          </div>
        </div>
      </footer>
    </div>
  );
}
