import React, { useState, useEffect } from 'react';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Eye,
  Send,
  BookOpen,
  ShieldAlert,
} from 'lucide-react';
import { QuizConfig, QuizQuestion } from '../types';

interface QuizActiveViewProps {
  questions: QuizQuestion[];
  config: QuizConfig;
  topic: string;
  onFinishQuiz: (
    answers: Record<string, string | string[]>,
    timeSpentSeconds: number
  ) => void;
  onCancelQuiz: () => void;
}

export const QuizActiveView: React.FC<QuizActiveViewProps> = ({
  questions,
  config,
  topic,
  onFinishQuiz,
  onCancelQuiz,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  const [practiceChecked, setPracticeChecked] = useState<Record<string, boolean>>({});
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

  // Timer logic
  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    (config.timeLimitMinutes || 15) * 60
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      if (config.mode === 'exam' && config.timeLimitMinutes) {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Auto submit on time expire
            onFinishQuiz(answers, (config.timeLimitMinutes || 15) * 60);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [config.mode, config.timeLimitMinutes, answers]);

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  const currentAnswer = answers[currentQ.id];

  const handleSelectOption = (optionId: 'A' | 'B' | 'C' | 'D') => {
    if (config.allowMultipleCorrect) {
      const existing = Array.isArray(currentAnswer) ? [...currentAnswer] : [];
      const idx = existing.indexOf(optionId);
      if (idx >= 0) {
        existing.splice(idx, 1);
      } else {
        existing.push(optionId);
      }
      setAnswers({ ...answers, [currentQ.id]: existing });
    } else {
      setAnswers({ ...answers, [currentQ.id]: optionId });
    }
  };

  const isOptionSelected = (optionId: 'A' | 'B' | 'C' | 'D'): boolean => {
    if (!currentAnswer) return false;
    if (Array.isArray(currentAnswer)) {
      return currentAnswer.includes(optionId);
    }
    return currentAnswer === optionId;
  };

  const toggleFlag = () => {
    setFlaggedQuestions({
      ...flaggedQuestions,
      [currentQ.id]: !flaggedQuestions[currentQ.id],
    });
  };

  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k] !== undefined && (Array.isArray(answers[k]) ? (answers[k] as string[]).length > 0 : true)
  ).length;

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isCheckedInPractice = practiceChecked[currentQ.id];

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      {/* Quiz Top Action Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-indigo-600 uppercase tracking-wider">
              {config.mode === 'exam' ? 'Exam Simulation' : 'Practice Mode'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{config.difficulty} Difficulty</span>
            <span aria-hidden="true">·</span>
            <span>{config.allowMultipleCorrect ? 'Multiple Answers' : 'Single Choice'}</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">{topic}</h2>
        </div>

        <div className="flex items-center gap-3">
          {config.mode === 'exam' && config.timeLimitMinutes && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-bold ${
                secondsRemaining < 120
                  ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>
          )}

          <button
            onClick={() => setConfirmSubmitOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Quiz</span>
          </button>
        </div>
      </div>

      {/* Question Progress and Grid Navigator */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-semibold">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="font-mono">
            {answeredCount} / {questions.length} Answered
          </span>
        </div>

        {/* Progress Line */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question Jump Tiles */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {questions.map((q, idx) => {
            const isAnswered =
              answers[q.id] !== undefined &&
              (Array.isArray(answers[q.id]) ? (answers[q.id] as string[]).length > 0 : true);
            const isCurrent = idx === currentIndex;
            const isFlagged = flaggedQuestions[q.id];

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded-lg text-xs font-mono font-semibold transition-all relative cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : isAnswered
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{idx + 1}</span>
                {isFlagged && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 absolute -top-0.5 -right-0.5 ring-2 ring-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Question Header & Affordances */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Question {currentIndex + 1}</span>
              {currentQ.topicCategory && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-indigo-600">{currentQ.topicCategory}</span>
                </>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {currentQ.question}
            </h3>
          </div>

          <button
            onClick={toggleFlag}
            className={`p-2 rounded-lg border transition-colors cursor-pointer shrink-0 ${
              flaggedQuestions[currentQ.id]
                ? 'bg-amber-50 border-amber-300 text-amber-600'
                : 'border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
            title="Mark for Review"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Options: A, B, C, D */}
        <div className="space-y-3 pt-2">
          {currentQ.options.map((option) => {
            const selected = isOptionSelected(option.id);
            const isPracticeChecked = isCheckedInPractice && config.mode === 'practice';
            const isCorrectOption = Array.isArray(currentQ.correctAnswer)
              ? currentQ.correctAnswer.includes(option.id)
              : currentQ.correctAnswer === option.id;

            let optionStyle =
              'border-slate-200/90 hover:border-indigo-300 bg-white text-slate-800';
            if (selected) {
              optionStyle =
                'border-indigo-600 bg-indigo-50/40 text-slate-950 ring-1 ring-indigo-600';
            }

            // Visual check in Practice mode after clicking "Check Answer"
            if (isPracticeChecked) {
              if (isCorrectOption) {
                optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-500';
              } else if (selected && !isCorrectOption) {
                optionStyle = 'border-rose-400 bg-rose-50 text-rose-950 ring-1 ring-rose-400';
              }
            }

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelectOption(option.id)}
                className={`w-full p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${optionStyle}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                    selected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {option.id}
                </div>
                <div className="flex-1 text-sm leading-relaxed">{option.text}</div>
              </button>
            );
          })}
        </div>

        {/* Practice Mode Helpers (Hint & Check) */}
        {config.mode === 'practice' && (
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              {currentQ.hint && (
                <button
                  onClick={() =>
                    setShowHint({ ...showHint, [currentQ.id]: !showHint[currentQ.id] })
                  }
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  <span>{showHint[currentQ.id] ? 'Hide Hint' : 'Need a Hint?'}</span>
                </button>
              )}

              {currentAnswer && !isCheckedInPractice && (
                <button
                  onClick={() =>
                    setPracticeChecked({ ...practiceChecked, [currentQ.id]: true })
                  }
                  className="px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  Check Answer Now
                </button>
              )}
            </div>

            {/* Hint Box */}
            {showHint[currentQ.id] && currentQ.hint && (
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2 leading-relaxed">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Hint:</strong> {currentQ.hint}
                </span>
              </div>
            )}

            {/* Practice Instant Explanation */}
            {isCheckedInPractice && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">
                    Correct Answer: {Array.isArray(currentQ.correctAnswer) ? currentQ.correctAnswer.join(', ') : currentQ.correctAnswer}
                  </span>
                  {currentQ.sourceReference && (
                    <span className="text-slate-400 font-mono">
                      · Source: {currentQ.sourceReference}
                    </span>
                  )}
                </div>
                <p className="text-slate-700 leading-relaxed">{currentQ.explanation}</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setConfirmSubmitOpen(true)}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Finish & Submit</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal before Submit */}
      {confirmSubmitOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-serif-display">
              Submit Quiz for Evaluation?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              You have answered <strong>{answeredCount}</strong> of{' '}
              <strong>{questions.length}</strong> questions.
              {answeredCount < questions.length && (
                <span className="text-amber-700 block mt-1 font-semibold">
                  Warning: You have {questions.length - answeredCount} unanswered questions!
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setConfirmSubmitOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Keep Reviewing
              </button>
              <button
                onClick={() => {
                  setConfirmSubmitOpen(false);
                  onFinishQuiz(answers, elapsedSeconds);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Yes, Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
