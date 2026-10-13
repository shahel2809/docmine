export type DocumentStatus = 'indexing' | 'ready' | 'error';

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  pageNumber: number;
  content: string;
  keywords: string[];
}

export interface DocumentMeta {
  id: string;
  title: string;
  filename: string;
  subject: string;
  pageCount: number;
  fileSize: number;
  uploadDate: string;
  status: DocumentStatus;
  chunksCount: number;
  isSample?: boolean;
  summary?: string;
  keyTopics?: string[];
}

export interface Citation {
  documentId: string;
  documentTitle: string;
  pageNumber: number;
  snippet: string;
  matchScore?: number;
}

export type AnswerFormat = '2-mark' | '5-mark' | '10-mark' | 'short-answer' | 'detailed-explanation';

export interface AnswerResponse {
  question: string;
  answer: string;
  format: AnswerFormat;
  evidenceStatus: 'verified' | 'partial' | 'insufficient';
  evidenceAssessment: string;
  citations: Citation[];
  suggestedQuestions?: string[];
  generatedAt: string;
}

export type HighlightCategory = 'definition' | 'formula' | 'concept' | 'algorithm' | 'comparison' | 'exam_question';

export interface SmartHighlight {
  id: string;
  documentId: string;
  documentTitle: string;
  pageNumber: number;
  category: HighlightCategory;
  title: string;
  content: string;
  importance: 'high' | 'medium';
}

export interface DiagramStep {
  stepNumber: number;
  title: string;
  description: string;
  highlightedNode: string;
  formulaOrAnalogy?: string;
}

export interface DiagramData {
  id: string;
  topic: string;
  mermaidCode: string;
  title: string;
  description: string;
  steps: DiagramStep[];
}

export type QuestionType = 'mcq' | 'true_false' | 'fill_in_the_blank';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
  documentTitle?: string;
  pageNumber?: number;
}

export interface Quiz {
  id: string;
  title: string;
  documentId?: string;
  topic: string;
  questions: QuizQuestion[];
  timeLimitMinutes?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface MistakeRecord {
  id: string;
  questionId: string;
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  explanation: string;
  topic: string;
  documentTitle?: string;
  pageNumber?: number;
  timestamp: string;
  resolved?: boolean;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  timestamp: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  weakTopics: string[];
  mistakes: MistakeRecord[];
}

export type MasteryStatus = 'needs_review' | 'in_progress' | 'mastered';

export interface TopicMastery {
  topic: string;
  subject: string;
  attemptsCount: number;
  correctCount: number;
  totalCount: number;
  accuracy: number;
  status: MasteryStatus;
  lastAttemptDate: string;
}

export interface StudyPlanTask {
  id: string;
  date: string;
  topic: string;
  subject: string;
  type: 'reading' | 'quiz' | 'revision' | 'flowchart';
  estimatedMinutes: number;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  documentTitle?: string;
}

export interface StudySchedule {
  id: string;
  examDate: string;
  subjects: string[];
  dailyHours: number;
  createdDate: string;
  tasks: StudyPlanTask[];
}

export interface LearningProgress {
  totalStudyHours: number;
  dailyStreak: number;
  completedTopicsCount: number;
  totalQuizzesTaken: number;
  averageQuizScore: number;
  pendingRevisionsCount: number;
  masteredTopicsCount: number;
  topicMasteries: TopicMastery[];
  recentAttempts: QuizAttempt[];
  mistakes: MistakeRecord[];
  dailyActivity: Array<{ date: string; minutes: number; quizzesTaken: number; accuracy: number }>;
}

export interface SavedNote {
  id: string;
  title: string;
  content: string;
  documentId?: string;
  documentTitle?: string;
  pageNumber?: number;
  tags: string[];
  category: 'summary' | 'flashcard' | 'custom_note';
  createdAt: string;
}

export interface StudySettings {
  masteryThresholdPercent: number; // e.g. 85
  minimumAttemptsForMastery: number; // e.g. 2
  dailyStudyGoalHours: number; // e.g. 3
  examDate: string;
  targetSubjects: string[];
}
