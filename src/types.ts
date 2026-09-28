export interface StudyFile {
  id: string;
  name: string;
  type: string;
  size: number;
  extractedText: string;
  status: 'ready' | 'processing' | 'error';
  detectedTopics?: string[];
  wordCount?: number;
  uploadedAt: string;
}

export type StudyScope = 'entire' | 'topic' | 'module';

export interface StudyTopicSelection {
  topic: string;
  scopeType: StudyScope;
  isCustom?: boolean;
}

export interface StudyNoteSection {
  title: string;
  content: string;
  subsections?: { subtitle: string; content: string }[];
  bulletPoints?: string[];
  table?: {
    headers: string[];
    rows: string[][];
  };
  keyTerms?: { term: string; definition: string }[];
  codeOrFormula?: string;
  examTip?: string;
  commonMistakes?: string[];
}

export interface GeneratedNotes {
  id: string;
  topic: string;
  generatedAt: string;
  sourceFiles: string[];
  grounded: boolean;
  notGroundedMessage?: string;
  overview: string;
  definitions: { term: string; definition: string; context?: string }[];
  keyConcepts: { title: string; explanation: string; example?: string }[];
  formulasOrRules: { name: string; formula: string; explanation: string }[];
  comparisons: {
    title: string;
    headers: string[];
    rows: string[][];
  }[];
  examFocusPoints: string[];
  commonMistakes: string[];
  revisionSummary: string;
}

export interface QuizQuestion {
  id: string;
  questionNumber: number;
  question: string;
  options: {
    id: 'A' | 'B' | 'C' | 'D';
    text: string;
  }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D' | ('A' | 'B' | 'C' | 'D')[];
  explanation: string;
  topicCategory: string; // e.g. "Definitions", "Concepts", "Applications", "Time Complexity"
  sourceReference: string; // e.g. "Module 2: Linked Lists, Section 2.1"
  hint?: string;
}

export interface QuizConfig {
  questionCount: 5 | 10 | 15 | 20;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  allowMultipleCorrect: boolean;
  mode: 'exam' | 'practice';
  timeLimitMinutes?: number; // e.g. 10 mins or unlimited
}

export interface QuizAttemptResult {
  id: string;
  quizId: string;
  topic: string;
  date: string;
  mode: 'exam' | 'practice';
  totalQuestions: number;
  score: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  timeSpentSeconds: number;
  topicBreakdown: {
    topic: string;
    correct: number;
    total: number;
    percentage: number;
  }[];
  summaryDiagnosis: string;
  weakTopics: string[];
  questionReviews: {
    question: QuizQuestion;
    userAnswer: string | string[];
    isCorrect: boolean;
    isSkipped: boolean;
  }[];
}

export interface MaterialChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  groundedInMaterial: boolean;
  sourceCitations?: string[];
}
