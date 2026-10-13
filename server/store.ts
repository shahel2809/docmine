import fs from 'fs';
import path from 'path';
import {
  DocumentMeta,
  DocumentChunk,
  SmartHighlight,
  DiagramData,
  Quiz,
  QuizAttempt,
  TopicMastery,
  MistakeRecord,
  StudySchedule,
  SavedNote,
  StudySettings,
  LearningProgress
} from '../src/types/index.js';
import {
  SAMPLE_DOCUMENTS,
  SAMPLE_CHUNKS,
  SAMPLE_HIGHLIGHTS,
  SAMPLE_DIAGRAMS,
  SAMPLE_QUIZZES
} from './seedData.js';

interface DocuMindDB {
  documents: DocumentMeta[];
  chunks: DocumentChunk[];
  highlights: SmartHighlight[];
  diagrams: Record<string, DiagramData>;
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  topicMasteries: Record<string, TopicMastery>;
  mistakes: MistakeRecord[];
  schedule: StudySchedule | null;
  notes: SavedNote[];
  settings: StudySettings;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'documind_db.json');

const DEFAULT_SETTINGS: StudySettings = {
  masteryThresholdPercent: 85,
  minimumAttemptsForMastery: 2,
  dailyStudyGoalHours: 3.5,
  examDate: '2026-11-15',
  targetSubjects: ['Computer Science', 'Economics', 'Biology']
};

export class Store {
  private db: DocuMindDB;

  constructor() {
    this.db = this.loadDB();
  }

  private loadDB(): DocuMindDB {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.documents)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load documind_db.json, initializing fresh store:', e);
    }

    return this.createInitialDB();
  }

  private createInitialDB(): DocuMindDB {
    const initialMasteries: Record<string, TopicMastery> = {
      'Virtual Memory & Paging': {
        topic: 'Virtual Memory & Paging',
        subject: 'Computer Science',
        attemptsCount: 3,
        correctCount: 3,
        totalCount: 3,
        accuracy: 100,
        status: 'mastered',
        lastAttemptDate: '2026-10-12T16:20:00Z'
      },
      'Deadlock & Concurrency': {
        topic: 'Deadlock & Concurrency',
        subject: 'Computer Science',
        attemptsCount: 2,
        correctCount: 1,
        totalCount: 2,
        accuracy: 50,
        status: 'needs_review',
        lastAttemptDate: '2026-10-12T17:40:00Z'
      },
      'CPU Scheduling Algorithms': {
        topic: 'CPU Scheduling Algorithms',
        subject: 'Computer Science',
        attemptsCount: 1,
        correctCount: 1,
        totalCount: 1,
        accuracy: 100,
        status: 'in_progress', // Note: only 1 attempt, so in_progress according to 2-attempt rule!
        lastAttemptDate: '2026-10-11T14:10:00Z'
      },
      'Keynesian Multiplier': {
        topic: 'Keynesian Multiplier',
        subject: 'Economics',
        attemptsCount: 2,
        correctCount: 2,
        totalCount: 2,
        accuracy: 100,
        status: 'mastered',
        lastAttemptDate: '2026-10-13T08:30:00Z'
      },
      'Price Elasticity of Demand': {
        topic: 'Price Elasticity of Demand',
        subject: 'Economics',
        attemptsCount: 1,
        correctCount: 0,
        totalCount: 1,
        accuracy: 0,
        status: 'needs_review',
        lastAttemptDate: '2026-10-12T10:00:00Z'
      }
    };

    const initialMistakes: MistakeRecord[] = [
      {
        id: 'mstk-1',
        questionId: 'q-os-4',
        question: 'In Dijkstra\'s semaphore specification, the operation that decrements the semaphore counter and blocks if counter < 0 is named __________ (or P).',
        studentAnswer: 'sem_signal',
        correctAnswer: 'sem_wait',
        explanation: 'sem_wait() decrements the counter and suspends the thread if counter is negative. sem_post() or sem_signal increments and unblocks.',
        topic: 'Deadlock & Concurrency',
        documentTitle: 'Operating Systems: Three Easy Pieces (Core Chapters)',
        pageNumber: 41,
        timestamp: '2026-10-12T17:40:00Z',
        resolved: false
      },
      {
        id: 'mstk-2',
        questionId: 'q-econ-2',
        question: 'If a good has price-inelastic demand (|PED| < 1), raising its price will increase total revenue for the seller.',
        studentAnswer: 'False',
        correctAnswer: 'True',
        explanation: 'Because percentage drop in quantity demanded is smaller than percentage increase in price, revenue rises.',
        topic: 'Price Elasticity of Demand',
        documentTitle: 'Principles of Economics: Macro & Micro Essentials',
        pageNumber: 15,
        timestamp: '2026-10-12T10:00:00Z',
        resolved: false
      }
    ];

    const initialAttempts: QuizAttempt[] = [
      {
        id: 'att-1',
        quizId: 'quiz-os-core',
        quizTitle: 'Operating Systems: Virtual Memory & Concurrency Mastery',
        timestamp: '2026-10-12T17:40:00Z',
        score: 4,
        totalQuestions: 5,
        percentage: 80,
        weakTopics: ['Deadlock & Concurrency'],
        mistakes: [initialMistakes[0]]
      },
      {
        id: 'att-2',
        quizId: 'quiz-econ-core',
        quizTitle: 'Economics: Elasticity, Multipliers & Monetary Policy',
        timestamp: '2026-10-13T08:30:00Z',
        score: 2,
        totalQuestions: 3,
        percentage: 67,
        weakTopics: ['Price Elasticity of Demand'],
        mistakes: [initialMistakes[1]]
      }
    ];

    const initialSchedule: StudySchedule = {
      id: 'sched-1',
      examDate: '2026-11-15',
      subjects: ['Computer Science', 'Economics', 'Biology'],
      dailyHours: 3.5,
      createdDate: '2026-10-13T00:00:00Z',
      tasks: [
        {
          id: 'task-1',
          date: '2026-10-13',
          topic: 'Deadlock & Coffman Conditions',
          subject: 'Computer Science',
          type: 'revision',
          estimatedMinutes: 35,
          completed: false,
          priority: 'high',
          documentTitle: 'Operating Systems: Three Easy Pieces (Core Chapters)'
        },
        {
          id: 'task-2',
          date: '2026-10-13',
          topic: 'Price Elasticity & Revenue Test',
          subject: 'Economics',
          type: 'quiz',
          estimatedMinutes: 25,
          completed: false,
          priority: 'high',
          documentTitle: 'Principles of Economics: Macro & Micro Essentials'
        },
        {
          id: 'task-3',
          date: '2026-10-13',
          topic: 'Page Fault Handling Flowchart',
          subject: 'Computer Science',
          type: 'flowchart',
          estimatedMinutes: 20,
          completed: true,
          priority: 'medium',
          documentTitle: 'Operating Systems: Three Easy Pieces (Core Chapters)'
        },
        {
          id: 'task-4',
          date: '2026-10-14',
          topic: 'DNA Replication Fork Machinery',
          subject: 'Biology',
          type: 'reading',
          estimatedMinutes: 45,
          completed: false,
          priority: 'medium',
          documentTitle: 'Molecular Biology of the Cell: Genetics & Energetics'
        },
        {
          id: 'task-5',
          date: '2026-10-14',
          topic: 'Keynesian Multiplier Drill',
          subject: 'Economics',
          type: 'quiz',
          estimatedMinutes: 30,
          completed: false,
          priority: 'medium',
          documentTitle: 'Principles of Economics: Macro & Micro Essentials'
        },
        {
          id: 'task-6',
          date: '2026-10-15',
          topic: 'CPU Scheduling Algorithms & MLFQ',
          subject: 'Computer Science',
          type: 'revision',
          estimatedMinutes: 40,
          completed: false,
          priority: 'medium',
          documentTitle: 'Operating Systems: Three Easy Pieces (Core Chapters)'
        }
      ]
    };

    const initialNotes: SavedNote[] = [
      {
        id: 'note-1',
        title: 'Summary: 4 Coffman Conditions for Deadlock',
        content: '**Essential Exam Formula & Rule:**\n1. **Mutual Exclusion**: Exclusive resource access.\n2. **Hold and Wait**: Process retains assigned resources while seeking others.\n3. **No Preemption**: Resources cannot be seized forcibly.\n4. **Circular Wait**: Chain of processes waiting on next neighbor.\n\n*Exam Tip:* Eliminate Circular Wait by enforcing global ascending lock acquisition order.',
        documentId: 'doc-os-ostep',
        documentTitle: 'Operating Systems: Three Easy Pieces (Core Chapters)',
        pageNumber: 35,
        tags: ['OS', 'Concurrency', 'Exam Must-Know'],
        category: 'summary',
        createdAt: '2026-10-12T18:00:00Z'
      },
      {
        id: 'note-2',
        title: 'Flashcard: Keynesian Multiplier Formula',
        content: '**Front:** What is the formula for the Keynesian expenditure multiplier in terms of MPC and MPS?\n\n**Back:** k = 1 / (1 - MPC) = 1 / MPS. Example: if MPC = 0.8, k = 5. A $1B injection expands GDP by $5B.',
        documentId: 'doc-econ-principles',
        documentTitle: 'Principles of Economics: Macro & Micro Essentials',
        pageNumber: 26,
        tags: ['Macroeconomics', 'Formulas'],
        category: 'flashcard',
        createdAt: '2026-10-13T09:00:00Z'
      }
    ];

    const initial: DocuMindDB = {
      documents: SAMPLE_DOCUMENTS,
      chunks: SAMPLE_CHUNKS,
      highlights: SAMPLE_HIGHLIGHTS,
      diagrams: SAMPLE_DIAGRAMS,
      quizzes: SAMPLE_QUIZZES,
      quizAttempts: initialAttempts,
      topicMasteries: initialMasteries,
      mistakes: initialMistakes,
      schedule: initialSchedule,
      notes: initialNotes,
      settings: DEFAULT_SETTINGS
    };

    this.saveDB(initial);
    return initial;
  }

  private saveDB(data?: DocuMindDB) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data || this.db, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write to documind_db.json:', e);
    }
  }

  // Document Operations
  getDocuments(): DocumentMeta[] {
    return this.db.documents;
  }

  getDocument(id: string): DocumentMeta | undefined {
    return this.db.documents.find(d => d.id === id);
  }

  addDocument(doc: DocumentMeta, chunks: DocumentChunk[]) {
    this.db.documents.unshift(doc);
    this.db.chunks.push(...chunks);
    this.saveDB();
  }

  renameDocument(id: string, newTitle: string): boolean {
    const doc = this.db.documents.find(d => d.id === id);
    if (!doc) return false;
    doc.title = newTitle;
    this.db.chunks.forEach(c => {
      if (c.documentId === id) c.documentTitle = newTitle;
    });
    this.saveDB();
    return true;
  }

  deleteDocument(id: string): boolean {
    const initialLength = this.db.documents.length;
    this.db.documents = this.db.documents.filter(d => d.id !== id);
    this.db.chunks = this.db.chunks.filter(c => c.documentId !== id);
    this.db.highlights = this.db.highlights.filter(h => h.documentId !== id);
    this.saveDB();
    return this.db.documents.length < initialLength;
  }

  // Chunks & Search
  getChunks(documentIds?: string[]): DocumentChunk[] {
    if (!documentIds || documentIds.length === 0) {
      return this.db.chunks;
    }
    const idSet = new Set(documentIds);
    return this.db.chunks.filter(c => idSet.has(c.documentId));
  }

  searchChunks(query: string, documentIds?: string[], limit = 6): Array<{ chunk: DocumentChunk; score: number }> {
    const chunks = this.getChunks(documentIds);
    if (!query.trim()) return [];

    const queryTokens = query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2);

    const scored = chunks.map(chunk => {
      const lowerContent = chunk.content.toLowerCase();
      let score = 0;

      // Exact substring boost
      if (lowerContent.includes(query.toLowerCase())) {
        score += 8;
      }

      // Keyword match boost
      for (const token of queryTokens) {
        if (chunk.keywords.some(k => k.toLowerCase().includes(token))) {
          score += 4;
        }
        // Count token occurrences in text
        const matches = (lowerContent.match(new RegExp(token, 'g')) || []).length;
        score += Math.min(matches * 1.5, 6);
      }

      return { chunk, score };
    });

    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Highlights
  getHighlights(documentId?: string): SmartHighlight[] {
    if (!documentId) return this.db.highlights;
    return this.db.highlights.filter(h => h.documentId === documentId);
  }

  addHighlights(highlights: SmartHighlight[]) {
    this.db.highlights.unshift(...highlights);
    this.saveDB();
  }

  // Diagrams
  getDiagram(topicKey: string): DiagramData | undefined {
    return this.db.diagrams[topicKey];
  }

  getAllDiagrams(): DiagramData[] {
    return Object.values(this.db.diagrams);
  }

  saveDiagram(topicKey: string, diagram: DiagramData) {
    this.db.diagrams[topicKey] = diagram;
    this.saveDB();
  }

  // Quizzes
  getQuizzes(): Quiz[] {
    return this.db.quizzes;
  }

  getQuiz(id: string): Quiz | undefined {
    return this.db.quizzes.find(q => q.id === id);
  }

  saveQuiz(quiz: Quiz) {
    const idx = this.db.quizzes.findIndex(q => q.id === quiz.id);
    if (idx >= 0) {
      this.db.quizzes[idx] = quiz;
    } else {
      this.db.quizzes.unshift(quiz);
    }
    this.saveDB();
  }

  // Learning Progress & Adaptive Mastery
  getProgress(): LearningProgress {
    const attempts = this.db.quizAttempts;
    const totalQuizzesTaken = attempts.length;
    const avgScore = totalQuizzesTaken > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / totalQuizzesTaken)
      : 0;

    const masteries = Object.values(this.db.topicMasteries);
    const masteredCount = masteries.filter(m => m.status === 'mastered').length;
    const pendingRevisions = this.db.mistakes.filter(m => !m.resolved).length;

    // Daily activity calculation
    const dailyMap: Record<string, { minutes: number; quizzes: number; scoreSum: number }> = {
      '2026-10-10': { minutes: 45, quizzes: 1, scoreSum: 85 },
      '2026-10-11': { minutes: 60, quizzes: 1, scoreSum: 90 },
      '2026-10-12': { minutes: 75, quizzes: 2, scoreSum: 160 },
      '2026-10-13': { minutes: 50, quizzes: 1, scoreSum: 80 }
    };

    const dailyActivity = Object.entries(dailyMap).map(([date, val]) => ({
      date,
      minutes: val.minutes,
      quizzesTaken: val.quizzes,
      accuracy: Math.round(val.scoreSum / val.quizzes)
    }));

    return {
      totalStudyHours: 14.5,
      dailyStreak: 4,
      completedTopicsCount: masteries.filter(m => m.status === 'mastered' || m.status === 'in_progress').length,
      totalQuizzesTaken,
      averageQuizScore: avgScore,
      pendingRevisionsCount: pendingRevisions,
      masteredTopicsCount: masteredCount,
      topicMasteries: masteries,
      recentAttempts: attempts.slice(0, 10),
      mistakes: this.db.mistakes.filter(m => !m.resolved),
      dailyActivity
    };
  }

  recordQuizAttempt(attempt: QuizAttempt): LearningProgress {
    this.db.quizAttempts.unshift(attempt);

    // Record mistakes
    if (attempt.mistakes && attempt.mistakes.length > 0) {
      this.db.mistakes.unshift(...attempt.mistakes);
    }

    // Adaptive Topic Mastery Calculation
    // Rule: Configurable accuracy threshold (default 85%) across at least 2 attempts.
    // Topics are NEVER marked mastered just because the student read them!
    const threshold = this.db.settings.masteryThresholdPercent || 85;
    const minAttempts = this.db.settings.minimumAttemptsForMastery || 2;

    const topicStats: Record<string, { correct: number; total: number; subject: string }> = {};

    // Group all attempts' questions or aggregate by topic
    // For simplicity, update each topic affected by this quiz
    const quiz = this.getQuiz(attempt.quizId);
    if (quiz) {
      quiz.questions.forEach(q => {
        const isCorrect = !attempt.mistakes.some(m => m.questionId === q.id);
        const doc = this.db.documents.find(d => d.id === quiz.documentId);
        const subject = doc ? doc.subject : 'General';

        if (!topicStats[q.topic]) {
          topicStats[q.topic] = { correct: 0, total: 0, subject };
        }
        topicStats[q.topic].total += 1;
        if (isCorrect) topicStats[q.topic].correct += 1;
      });
    }

    // Update masteries in DB
    Object.entries(topicStats).forEach(([topic, stat]) => {
      const existing = this.db.topicMasteries[topic] || {
        topic,
        subject: stat.subject,
        attemptsCount: 0,
        correctCount: 0,
        totalCount: 0,
        accuracy: 0,
        status: 'needs_review',
        lastAttemptDate: new Date().toISOString()
      };

      existing.attemptsCount += 1;
      existing.correctCount += stat.correct;
      existing.totalCount += stat.total;
      existing.accuracy = Math.round((existing.correctCount / existing.totalCount) * 100);
      existing.lastAttemptDate = new Date().toISOString();

      if (existing.accuracy >= threshold && existing.attemptsCount >= minAttempts) {
        existing.status = 'mastered';
      } else if (existing.accuracy >= 60) {
        existing.status = 'in_progress';
      } else {
        existing.status = 'needs_review';
      }

      this.db.topicMasteries[topic] = existing;
    });

    this.saveDB();
    return this.getProgress();
  }

  retryMistake(mistakeId: string, resolved: boolean): boolean {
    const mistake = this.db.mistakes.find(m => m.id === mistakeId);
    if (!mistake) return false;
    mistake.resolved = resolved;
    this.saveDB();
    return true;
  }

  // Schedule
  getSchedule(): StudySchedule | null {
    return this.db.schedule;
  }

  saveSchedule(schedule: StudySchedule) {
    this.db.schedule = schedule;
    this.saveDB();
  }

  updateTaskStatus(taskId: string, completed: boolean): boolean {
    if (!this.db.schedule) return false;
    const task = this.db.schedule.tasks.find(t => t.id === taskId);
    if (!task) return false;
    task.completed = completed;
    this.saveDB();
    return true;
  }

  // Notes
  getNotes(): SavedNote[] {
    return this.db.notes;
  }

  saveNote(note: SavedNote) {
    const idx = this.db.notes.findIndex(n => n.id === note.id);
    if (idx >= 0) {
      this.db.notes[idx] = note;
    } else {
      this.db.notes.unshift(note);
    }
    this.saveDB();
  }

  deleteNote(id: string): boolean {
    const initialLength = this.db.notes.length;
    this.db.notes = this.db.notes.filter(n => n.id !== id);
    this.saveDB();
    return this.db.notes.length < initialLength;
  }

  // Settings
  getSettings(): StudySettings {
    return this.db.settings;
  }

  saveSettings(settings: StudySettings) {
    this.db.settings = settings;
    this.saveDB();
  }

  resetToDefaults() {
    this.db = this.createInitialDB();
    return this.db;
  }
}

export const store = new Store();
