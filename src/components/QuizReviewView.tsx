import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  HelpCircle,
  BookOpen,
  Filter,
} from 'lucide-react';
import { QuizAttemptResult } from '../types';

interface QuizReviewViewProps {
  result: QuizAttemptResult;
  onBackToResults: () => void;
  onRetryQuiz: () => void;
}

export const QuizReviewView: React.FC<QuizReviewViewProps> = ({
  result,
  onBackToResults,
  onRetryQuiz,
}) => {
  const [filter, setFilter] = useState<'all' | 'incorrect' | 'skipped'>('all');

  const filteredReviews = result.questionReviews.filter((r) => {
    if (filter === 'incorrect') return !r.isCorrect && !r.isSkipped;
    if (filter === 'skipped') return r.isSkipped;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToResults}
            className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Back to results"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-serif-display">
              Answer Review: {result.topic}
            </h2>
            <p className="text-xs text-slate-500">
              Score: {result.score} / {result.totalQuestions} ({result.percentage}%)
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({result.totalQuestions})
          </button>
          <button
            onClick={() => setFilter('incorrect')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filter === 'incorrect'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-rose-700'
            }`}
          >
            Incorrect ({result.incorrectCount})
          </button>
          <button
            onClick={() => setFilter('skipped')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filter === 'skipped'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-amber-700'
            }`}
          >
            Skipped ({result.skippedCount})
          </button>
        </div>
      </div>

      {/* Question Cards List */}
      <div className="space-y-4">
        {filteredReviews.map((review, idx) => {
          const q = review.question;
          const userAns = Array.isArray(review.userAnswer)
            ? review.userAnswer.join(', ')
            : review.userAnswer;
          const correctAns = Array.isArray(q.correctAnswer)
            ? q.correctAnswer.join(', ')
            : q.correctAnswer;

          return (
            <div
              key={q.id}
              className={`bg-white border rounded-2xl p-6 shadow-xs space-y-4 transition-all ${
                review.isCorrect
                  ? 'border-emerald-200/80 bg-emerald-50/10'
                  : review.isSkipped
                  ? 'border-amber-200/80 bg-amber-50/10'
                  : 'border-rose-200/80 bg-rose-50/10'
              }`}
            >
              {/* Question Header & Status Indicator */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <span>Question {q.questionNumber}</span>
                    {q.topicCategory && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-600">{q.topicCategory}</span>
                      </>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {q.question}
                  </h3>
                </div>

                <div className="shrink-0">
                  {review.isCorrect ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Correct</span>
                    </span>
                  ) : review.isSkipped ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Skipped</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Incorrect</span>
                    </span>
                  )}
                </div>
              </div>

              {/* 4 Options Grid */}
              <div className="space-y-2 pt-1">
                {q.options.map((opt) => {
                  const isUserSelection = Array.isArray(review.userAnswer)
                    ? review.userAnswer.includes(opt.id)
                    : review.userAnswer === opt.id;
                  const isCorrectAnswer = Array.isArray(q.correctAnswer)
                    ? q.correctAnswer.includes(opt.id)
                    : q.correctAnswer === opt.id;

                  let optBox = 'bg-slate-50 border-slate-200 text-slate-700';
                  if (isCorrectAnswer) {
                    optBox = 'bg-emerald-50/90 border-emerald-300 text-emerald-950 font-semibold';
                  } else if (isUserSelection && !isCorrectAnswer) {
                    optBox = 'bg-rose-50/90 border-rose-300 text-rose-950';
                  }

                  return (
                    <div
                      key={opt.id}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${optBox}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center font-mono font-bold text-slate-900 shrink-0">
                          {opt.id}
                        </span>
                        <span>{opt.text}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 text-[11px]">
                        {isCorrectAnswer && (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>Correct Answer</span>
                          </span>
                        )}
                        {isUserSelection && !isCorrectAnswer && (
                          <span className="text-rose-700 font-semibold flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            <span>Your Selection</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation & Source Reference */}
              <div className="pt-3 border-t border-slate-200/80 space-y-2 text-xs">
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">Explanation:</p>
                  <p className="text-slate-700 leading-relaxed">{q.explanation}</p>
                </div>

                {q.sourceReference && (
                  <div className="bg-slate-100/80 p-2.5 rounded-lg flex items-center gap-2 text-slate-600 font-mono text-[11px]">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Source: {q.sourceReference}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div className="pt-4 flex items-center justify-between">
        <button
          onClick={onBackToResults}
          className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
        >
          Back to Scorecard
        </button>

        <button
          onClick={onRetryQuiz}
          className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
        >
          Retry This Quiz
        </button>
      </div>
    </div>
  );
};
