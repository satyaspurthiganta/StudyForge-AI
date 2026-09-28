import React, { useState } from 'react';
import {
  X,
  Play,
  Clock,
  HelpCircle,
  Shield,
  Layers,
  Sparkles,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { QuizConfig } from '../types';

interface QuizConfigModalProps {
  topic: string;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onLaunchQuiz: (config: QuizConfig) => void;
}

export const QuizConfigModal: React.FC<QuizConfigModalProps> = ({
  topic,
  isOpen,
  isLoading,
  onClose,
  onLaunchQuiz,
}) => {
  const [questionCount, setQuestionCount] = useState<5 | 10 | 15 | 20>(10);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');
  const [allowMultipleCorrect, setAllowMultipleCorrect] = useState(false);
  const [mode, setMode] = useState<'exam' | 'practice'>('exam');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(15);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLaunchQuiz({
      questionCount,
      difficulty,
      allowMultipleCorrect,
      mode,
      timeLimitMinutes: mode === 'exam' ? timeLimitMinutes : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quiz Configuration</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-serif-display mt-0.5">
              Launch MCQ Quiz
            </h3>
            <p className="text-xs text-slate-500">
              Topic: <strong className="text-slate-800 font-sans">{topic || 'Entire Material'}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* 1. Mode Selection: Exam vs Practice */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Quiz Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('exam')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  mode === 'exam'
                    ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-bold text-slate-900">Exam Mode</span>
                  </div>
                  {mode === 'exam' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Answers hidden until submission. Timer enabled. No hints. Pure exam pressure.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMode('practice')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  mode === 'practice'
                    ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-bold text-slate-900">Practice Mode</span>
                  </div>
                  {mode === 'practice' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Instant answer check, hints enabled, learn as you practice question-by-question.
                </p>
              </button>
            </div>
          </div>

          {/* 2. Number of Questions */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Number of Questions
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuestionCount(num as any)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-center ${
                    questionCount === num
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {num} Questions
                </button>
              ))}
            </div>
          </div>

          {/* 3. Difficulty */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Difficulty Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'easy', label: 'Easy' },
                { id: 'medium', label: 'Medium' },
                { id: 'hard', label: 'Hard' },
                { id: 'mixed', label: 'Mixed' },
              ].map((diff) => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => setDifficulty(diff.id as any)}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-center ${
                    difficulty === diff.id
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Multiple Correct Answers Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-900 block">
                Allow Multiple-Correct Options
              </span>
              <span className="text-[11px] text-slate-500 block">
                Default is single-choice (A, B, C, or D). Enable for multi-select challenges.
              </span>
            </div>
            <input
              type="checkbox"
              checked={allowMultipleCorrect}
              onChange={(e) => setAllowMultipleCorrect(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
            />
          </div>

          {/* 5. Exam Mode Timer Setting */}
          {mode === 'exam' && (
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">
                    Timer Limit
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Countdown clock during the exam
                  </span>
                </div>
              </div>
              <select
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
              >
                <option value={5}>5 Minutes</option>
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes</option>
                <option value={20}>20 Minutes</option>
                <option value={30}>30 Minutes</option>
              </select>
            </div>
          )}

          {/* Grounding reminder */}
          <div className="text-[11px] text-slate-500 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/60 leading-relaxed">
            <strong>StudyForge AI Grounding:</strong> Questions and plausible distractors are generated strictly from your uploaded materials.
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating Grounded Questions...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Generate & Start Quiz</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
