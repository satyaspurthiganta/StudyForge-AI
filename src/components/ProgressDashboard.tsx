import React from 'react';
import {
  BarChart2,
  Target,
  Sparkles,
  RotateCw,
  Trophy,
  Clock,
  BookOpen,
  CheckCircle,
  XCircle,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { QuizAttemptResult, StudyFile, GeneratedNotes } from '../types';

interface ProgressDashboardProps {
  files: StudyFile[];
  quizHistory: QuizAttemptResult[];
  savedNotes: GeneratedNotes[];
  activeTopic: string;
  onSelectTopic: (topic: string) => void;
  onGenerateWeakNotes: (weakTopics: string[]) => void;
  onStartQuizForTopic: (topic: string) => void;
  onViewNotes: (notes: GeneratedNotes) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  files,
  quizHistory,
  savedNotes,
  activeTopic,
  onSelectTopic,
  onGenerateWeakNotes,
  onStartQuizForTopic,
  onViewNotes,
}) => {
  // Aggregate weak topics from all attempts
  const topicStats: Record<string, { total: number; correct: number }> = {};
  quizHistory.forEach((attempt) => {
    attempt.topicBreakdown.forEach((tb) => {
      if (!topicStats[tb.topic]) {
        topicStats[tb.topic] = { total: 0, correct: 0 };
      }
      topicStats[tb.topic].total += tb.total;
      topicStats[tb.topic].correct += tb.correct;
    });
  });

  const weakTopics = Object.keys(topicStats).filter((top) => {
    const stat = topicStats[top];
    if (stat.total === 0) return false;
    const pct = (stat.correct / stat.total) * 100;
    return pct < 70; // Needs review if below 70%
  });

  const masteredTopics = Object.keys(topicStats).filter((top) => {
    const stat = topicStats[top];
    if (stat.total === 0) return false;
    const pct = (stat.correct / stat.total) * 100;
    return pct >= 75;
  });

  const totalQuizzes = quizHistory.length;
  const avgScore =
    totalQuizzes > 0
      ? Math.round(
          quizHistory.reduce((acc, h) => acc + h.percentage, 0) / totalQuizzes
        )
      : 0;

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-serif-display">
          Study Progress & Weak Topics
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Track concept mastery, identify weak topics, and launch targeted revision material.
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            Quizzes Completed
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
            {totalQuizzes}
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            Average Score
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-indigo-600 font-mono">
            {avgScore}%
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            Mastered Concepts
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-emerald-600 font-mono">
            {masteredTopics.length}
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            Weak Topics to Review
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-amber-600 font-mono">
            {weakTopics.length}
          </span>
        </div>
      </div>

      {/* Weak Topic Detection & Adaptive Notes Generator */}
      <section className="bg-linear-to-r from-amber-50/70 via-orange-50/50 to-white border border-amber-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
              <Target className="w-4 h-4 text-amber-600" />
              <span>Smart Weak Topic Diagnostic</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Concepts Needing Focused Revision
            </h3>
            <p className="text-xs text-slate-600 max-w-xl">
              {weakTopics.length > 0
                ? 'StudyForge identified consistent mistakes in these topic areas across your quiz attempts.'
                : 'No significant weak topics detected yet! Complete more quizzes to train the diagnostic engine.'}
            </p>
          </div>

          {weakTopics.length > 0 && (
            <button
              onClick={() => onGenerateWeakNotes(weakTopics)}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-xl shadow-xs shrink-0 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Revision Notes for Weak Topics</span>
            </button>
          )}
        </div>

        {weakTopics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {weakTopics.map((topic, i) => {
              const stat = topicStats[topic];
              const pct = stat ? Math.round((stat.correct / stat.total) * 100) : 0;
              return (
                <div
                  key={i}
                  className="bg-white border border-amber-200 rounded-xl p-3.5 flex flex-col justify-between space-y-2 shadow-2xs"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {topic}
                    </span>
                    <span className="text-[11px] text-amber-700 font-mono">
                      Score: {stat?.correct || 0} / {stat?.total || 0} ({pct}%)
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => onSelectTopic(topic)}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      Set as Study Focus
                    </button>
                    <button
                      onClick={() => onStartQuizForTopic(topic)}
                      className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
                    >
                      Practice Quiz →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 bg-white/70 border border-slate-200 rounded-xl text-xs text-slate-500 text-center">
            Take a quiz to let the AI analyze your conceptual strengths and identify any weak spots.
          </div>
        )}
      </section>

      {/* Dashboard 2-Column: Quick Notes & Previous Attempts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Notes */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Saved Revision Notes ({savedNotes.length})</span>
            </h3>
          </div>

          {savedNotes.length > 0 ? (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {savedNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => onViewNotes(note)}
                  className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl flex items-center justify-between cursor-pointer transition-colors group"
                >
                  <div className="min-w-0 pr-2">
                    <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                      {note.topic}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                      {new Date(note.generatedAt).toLocaleDateString()} · {note.definitions.length} terms · {note.keyConcepts.length} concepts
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">
              No revision notes generated yet.
            </p>
          )}
        </section>

        {/* Previous Quiz Attempts */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-600" />
              <span>Previous Attempts ({quizHistory.length})</span>
            </h3>
          </div>

          {quizHistory.length > 0 ? (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {quizHistory.map((attempt) => (
                <div
                  key={attempt.id}
                  className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
                      {attempt.topic}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {new Date(attempt.date).toLocaleDateString()} · {attempt.mode === 'exam' ? 'Exam' : 'Practice'}
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                        attempt.percentage >= 75
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {attempt.score} / {attempt.totalQuestions} ({attempt.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">
              No quiz attempts logged yet. Take your first quiz!
            </p>
          )}
        </section>
      </div>
    </div>
  );
};
