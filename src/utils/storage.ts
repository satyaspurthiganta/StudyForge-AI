import { StudyFile, GeneratedNotes, QuizAttemptResult, MaterialChatMessage } from '../types';
import { SAMPLE_STUDY_FILE } from '../data/sampleMaterial';

const STORAGE_KEYS = {
  FILES: 'studyforge_files',
  ACTIVE_FILE_IDS: 'studyforge_active_file_ids',
  ACTIVE_TOPIC: 'studyforge_active_topic',
  SAVED_NOTES: 'studyforge_saved_notes',
  QUIZ_HISTORY: 'studyforge_quiz_history',
  CHAT_MESSAGES: 'studyforge_chat_messages',
};

export function getStoredFiles(): StudyFile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FILES);
    if (!raw) {
      // Default to sample study file
      return [SAMPLE_STUDY_FILE];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [SAMPLE_STUDY_FILE];
  } catch (e) {
    return [SAMPLE_STUDY_FILE];
  }
}

export function saveStoredFiles(files: StudyFile[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
  } catch (e) {
    console.error('Failed to save files in localStorage:', e);
  }
}

export function getStoredActiveTopic(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_TOPIC) || 'Entire Material';
  } catch (e) {
    return 'Entire Material';
  }
}

export function saveStoredActiveTopic(topic: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TOPIC, topic);
  } catch (e) {
    console.error('Failed to save active topic:', e);
  }
}

export function getStoredNotes(): GeneratedNotes[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_NOTES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredNotes(notes: GeneratedNotes[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_NOTES, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes:', e);
  }
}

export function getStoredQuizHistory(): QuizAttemptResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUIZ_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredQuizHistory(history: QuizAttemptResult[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save quiz history:', e);
  }
}

export function getStoredChatMessages(): MaterialChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredChatMessages(messages: MaterialChatMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save chat messages:', e);
  }
}
