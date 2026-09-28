import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  CheckCircle,
  XCircle,
  Clock,
  RotateCw,
  Eye,
  Target,
  Sparkles,
  ArrowRight,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
import { QuizAttemptResult } from '../types';

interface QuizResultsViewProps {
  result: QuizAttemptResult;
  onReviewAnswers: () => void;
  onRetryQuiz: () => void;
  onNewQuiz: () => void;
  onStudyWeakTopics: (weakTopics: string[]) => void;
}

export const QuizResultsView: React.FC<QuizResultsViewProps> = ({
  result,
  onReviewAnswers,
  onRetryQuiz,
  onNewQuiz,
  onStudyWeakTopics,
}) => {
  useEffect(() => {
    if (result.percentage >= 75) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore confetti errors
      }
    }
  }, [result.percentage]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (pct >= 60) return 'text-indigo-700 bg-indigo-50 border-indigo-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* 1. Score Summary Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs text-center space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Quiz Complete</span>
            <span aria-hidden="true">·</span>
            <span>{result.mode === 'exam' ? 'Exam Mode' : 'Practice Mode'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif-display">
            {result.topic}
          </h2>
        </div>

        {/* Big Score Display */}
        <div className="flex items-center justify-center">
          <div className="relative inline-flex flex-col items-center justify-center w-36 h-36 rounded-full border-4 border-slate-100 bg-slate-50/50 shadow-inner">
            <span className="text-4xl font-extrabold text-slate-900 tracking-tight font-serif-display">
              {result.score} <span className="text-xl text-slate-400">/ {result.totalQuestions}</span>
            </span>
            <span className="text-xs font-bold text-indigo-600 mt-0.5">
              {result.percentage}% Score
            </span>
          </div>
        </div>

        {/* Diagnosis callout */}
        <div className="max-w-xl mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
          "{result.summaryDiagnosis}"
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-2">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
            <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-semibold">Correct</span>
            </div>
            <span className="text-xl font-bold text-slate-900 font-mono">
              {result.correctCount}
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
            <div className="flex items-center justify-center gap-1 text-rose-600 mb-1">
              <XCircle className="w-4 h-4" />
              <span className="text-xs font-semibold">Incorrect</span>
            </div>
            <span className="text-xl font-bold text-slate-900 font-mono">
              {result.incorrectCount}
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
            <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
              <HelpCircle className="w-4 h-4" />
              <span className="text-xs font-semibold">Skipped</span>
            </div>
            <span className="text-xl font-bold text-slate-900 font-mono">
              {result.skippedCount}
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
            <div className="flex items-center justify-center gap-1 text-indigo-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-semibold">Time Taken</span>
            </div>
            <span className="text-base font-bold text-slate-900 font-mono">
              {formatTime(result.timeSpentSeconds)}
            </span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onReviewAnswers}
            className="px-5 py-2.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Review Answers</span>
          </button>

          <button
            onClick={onRetryQuiz}
            className="px-5 py-2.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
            <span>Retry Quiz</span>
          </button>

          {result.weakTopics && result.weakTopics.length > 0 && (
            <button
              onClick={() => onStudyWeakTopics(result.weakTopics)}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Target className="w-4 h-4" />
              <span>Study Weak Topics ({result.weakTopics.length})</span>
            </button>
          )}

          <button
            onClick={onNewQuiz}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>Generate New Quiz</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Performance Breakdown by Topic Table */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Performance by Topic Area
            </h3>
            <p className="text-xs text-slate-500">
              Concept mastery breakdown based on your quiz responses
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-900 font-semibold">
              <tr>
                <th className="px-4 py-3">Topic / Concept Area</th>
                <th className="px-4 py-3 text-center">Score</th>
                <th className="px-4 py-3">Mastery Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {result.topicBreakdown.map((t, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-medium text-slate-900">{t.topic}</td>
                  <td className="px-4 py-3 text-center font-mono font-semibold">
                    {t.correct} / {t.total} ({t.percentage}%)
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden max-w-[140px]">
                        <div
                          className={`h-full rounded-full ${
                            t.percentage >= 75
                              ? 'bg-emerald-500'
                              : t.percentage >= 50
                              ? 'bg-indigo-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${t.percentage}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 font-mono">
                        {t.percentage >= 75
                          ? 'Mastered'
                          : t.percentage >= 50
                          ? 'Developing'
                          : 'Needs Review'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Weak Topic Detection Callout */}
      {result.weakTopics && result.weakTopics.length > 0 && (
        <section className="bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                <Target className="w-4 h-4 text-amber-600" />
                <span>Weak Topic Detection</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-serif-display">
                Topics to Review Before Your Exam
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                StudyForge detected misconceptions in these areas based on your incorrect answers. Click below to generate focused revision notes directly targeting these gaps.
              </p>
            </div>

            <button
              onClick={() => onStudyWeakTopics(result.weakTopics)}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Revision Notes for Weak Topics</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {result.weakTopics.map((topic, i) => (
              <span
                key={i}
                className="text-xs font-semibold text-amber-900 bg-white/90 border border-amber-200 px-3 py-1 rounded-lg shadow-xs"
              >
                {topic}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
