/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { MaterialUpload } from './components/MaterialUpload';
import { TopicSelector } from './components/TopicSelector';
import { StudyNotesView } from './components/StudyNotesView';
import { QuizConfigModal } from './components/QuizConfigModal';
import { QuizActiveView } from './components/QuizActiveView';
import { QuizResultsView } from './components/QuizResultsView';
import { QuizReviewView } from './components/QuizReviewView';
import { ProgressDashboard } from './components/ProgressDashboard';
import { AskMaterialView } from './components/AskMaterialView';
import {
  StudyFile,
  StudyScope,
  GeneratedNotes,
  QuizQuestion,
  QuizConfig,
  QuizAttemptResult,
  MaterialChatMessage,
} from './types';
import {
  getStoredFiles,
  saveStoredFiles,
  getStoredActiveTopic,
  saveStoredActiveTopic,
  getStoredNotes,
  saveStoredNotes,
  getStoredQuizHistory,
  saveStoredQuizHistory,
  getStoredChatMessages,
  saveStoredChatMessages,
} from './utils/storage';
import {
  generateStudyNotes,
  generateQuizQuestions,
  generateWeakTopicNotes,
} from './services/api';
import { SAMPLE_STUDY_FILE } from './data/sampleMaterial';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<'home' | 'materials' | 'notes' | 'quiz' | 'progress' | 'chat'>('home');

  // Persistence State
  const [files, setFiles] = useState<StudyFile[]>(getStoredFiles);
  const [activeTopic, setActiveTopic] = useState<string>(getStoredActiveTopic);
  const [activeScope, setActiveScope] = useState<StudyScope>('entire');
  const [savedNotes, setSavedNotes] = useState<GeneratedNotes[]>(getStoredNotes);
  const [quizHistory, setQuizHistory] = useState<QuizAttemptResult[]>(getStoredQuizHistory);
  const [chatMessages, setChatMessages] = useState<MaterialChatMessage[]>(getStoredChatMessages);

  // Active Document Notes State
  const [currentNotes, setCurrentNotes] = useState<GeneratedNotes | null>(() => {
    const list = getStoredNotes();
    return list.length > 0 ? list[0] : null;
  });
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  // Active Quiz State
  const [isQuizConfigOpen, setIsQuizConfigOpen] = useState(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<QuizQuestion[]>([]);
  const [activeQuizConfig, setActiveQuizConfig] = useState<QuizConfig | null>(null);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [currentResult, setCurrentResult] = useState<QuizAttemptResult | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    saveStoredFiles(files);
  }, [files]);

  useEffect(() => {
    saveStoredActiveTopic(activeTopic);
  }, [activeTopic]);

  useEffect(() => {
    saveStoredNotes(savedNotes);
  }, [savedNotes]);

  useEffect(() => {
    saveStoredQuizHistory(quizHistory);
  }, [quizHistory]);

  useEffect(() => {
    saveStoredChatMessages(chatMessages);
  }, [chatMessages]);

  const combinedStudyText = files
    .filter((f) => f.status === 'ready')
    .map((f) => f.extractedText)
    .join('\n\n');

  // Handler: Try with sample material
  const handleTrySampleMaterial = () => {
    const exists = files.some((f) => f.id === SAMPLE_STUDY_FILE.id);
    if (!exists) {
      const updated = [SAMPLE_STUDY_FILE, ...files];
      setFiles(updated);
    }
    setActiveTopic('Big-O Asymptotic Analysis');
    setActiveScope('topic');
    setCurrentTab('materials');
  };

  // Handler: Generate Notes for topic
  const handleTriggerGenerateNotes = async (
    targetTopic = activeTopic,
    scope = activeScope
  ) => {
    if (!combinedStudyText) {
      setCurrentTab('materials');
      return;
    }

    setIsLoadingNotes(true);
    setCurrentTab('notes');

    try {
      const notes = await generateStudyNotes(combinedStudyText, targetTopic, scope);
      setCurrentNotes(notes);

      if (notes.grounded) {
        // Save to notes history
        const filtered = savedNotes.filter((n) => n.topic !== notes.topic);
        setSavedNotes([notes, ...filtered]);
      }
    } catch (err) {
      console.error('Note generation error:', err);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  // Handler: Launch Quiz Generation
  const handleLaunchQuiz = async (config: QuizConfig) => {
    if (!combinedStudyText) {
      setIsQuizConfigOpen(false);
      setCurrentTab('materials');
      return;
    }

    setIsLoadingQuiz(true);
    setActiveQuizConfig(config);

    try {
      const res = await generateQuizQuestions(
        combinedStudyText,
        activeTopic,
        config.questionCount,
        config.difficulty,
        config.allowMultipleCorrect,
        config.mode === 'exam'
      );

      setIsQuizConfigOpen(false);

      if (res.grounded && res.questions.length > 0) {
        setActiveQuizQuestions(res.questions);
        setIsQuizActive(true);
        setCurrentResult(null);
        setIsReviewing(false);
        setCurrentTab('quiz');
      } else {
        // Show not grounded alert in notes or state
        alert(
          res.notGroundedMessage ||
            'This topic was not found in your uploaded study material. Please choose another topic.'
        );
      }
    } catch (err) {
      console.error('Quiz generation error:', err);
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  // Handler: Finish Quiz & Compute Score
  const handleFinishQuiz = (
    answers: Record<string, string | string[]>,
    timeSpentSeconds: number
  ) => {
    if (!activeQuizQuestions || !activeQuizConfig) return;

    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;

    const topicStats: Record<string, { correct: number; total: number }> = {};
    const mistakes: any[] = [];

    const reviews = activeQuizQuestions.map((q) => {
      const userAns = answers[q.id];
      const isSkipped =
        userAns === undefined ||
        (Array.isArray(userAns) ? userAns.length === 0 : userAns.trim() === '');

      let isCorrect = false;
      if (!isSkipped) {
        if (Array.isArray(q.correctAnswer)) {
          const sortedCorrect = [...q.correctAnswer].sort().join(',');
          const sortedUser = Array.isArray(userAns)
            ? [...userAns].sort().join(',')
            : userAns;
          isCorrect = sortedCorrect === sortedUser;
        } else {
          isCorrect = userAns === q.correctAnswer;
        }
      }

      if (isSkipped) skippedCount++;
      else if (isCorrect) correctCount++;
      else incorrectCount++;

      // Topic aggregation
      const cat = q.topicCategory || 'General Concepts';
      if (!topicStats[cat]) topicStats[cat] = { correct: 0, total: 0 };
      topicStats[cat].total += 1;
      if (isCorrect) topicStats[cat].correct += 1;

      if (!isCorrect && !isSkipped) {
        mistakes.push({
          question: q.question,
          userAnswer: userAns,
          correctAnswer: q.correctAnswer,
          topicCategory: cat,
        });
      }

      return {
        question: q,
        userAnswer: userAns || 'Not Answered',
        isCorrect,
        isSkipped,
      };
    });

    const totalQuestions = activeQuizQuestions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    const topicBreakdown = Object.keys(topicStats).map((cat) => ({
      topic: cat,
      correct: topicStats[cat].correct,
      total: topicStats[cat].total,
      percentage: Math.round((topicStats[cat].correct / topicStats[cat].total) * 100),
    }));

    // Weak topics: areas where score < 70%
    const weakTopics = topicBreakdown
      .filter((t) => t.percentage < 70)
      .map((t) => t.topic);

    let summaryDiagnosis = 'Solid performance across the board!';
    if (percentage >= 85) {
      summaryDiagnosis = 'Outstanding mastery of the core definitions and problem mechanics!';
    } else if (percentage >= 65) {
      summaryDiagnosis = 'You understand the foundational definitions well, but review application and comparison questions.';
    } else {
      summaryDiagnosis = 'Review the foundational concepts and formulas before retaking the test.';
    }

    const attemptResult: QuizAttemptResult = {
      id: 'attempt-' + Date.now(),
      quizId: 'quiz-' + Date.now(),
      topic: activeTopic || 'Entire Material',
      date: new Date().toISOString(),
      mode: activeQuizConfig.mode,
      totalQuestions,
      score: correctCount,
      percentage,
      correctCount,
      incorrectCount,
      skippedCount,
      timeSpentSeconds,
      topicBreakdown,
      summaryDiagnosis,
      weakTopics,
      questionReviews: reviews,
    };

    setCurrentResult(attemptResult);
    setQuizHistory([attemptResult, ...quizHistory]);
    setIsQuizActive(false);
  };

  // Handler: Generate targeted weak topic notes
  const handleStudyWeakTopics = async (weakTopicList: string[]) => {
    if (!combinedStudyText) return;
    setIsLoadingNotes(true);
    setCurrentTab('notes');

    try {
      const notes = await generateWeakTopicNotes(combinedStudyText, weakTopicList, []);
      setCurrentNotes(notes);
      setSavedNotes([notes, ...savedNotes]);
    } catch (err) {
      console.error('Weak notes error:', err);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* 1. Global Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'quiz') {
            setIsReviewing(false);
          }
        }}
        activeTopic={activeTopic}
        filesCount={files.length}
        onTrySample={handleTrySampleMaterial}
      />

      {/* 2. Main Content Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB 1: HOME LANDING */}
        {currentTab === 'home' && (
          <LandingHero
            onStartStudying={() => setCurrentTab('materials')}
            onTrySampleMaterial={handleTrySampleMaterial}
          />
        )}

        {/* TAB 2: STUDY MATERIALS & TOPIC SELECTOR */}
        {currentTab === 'materials' && (
          <div className="space-y-12">
            <MaterialUpload
              files={files}
              onFilesChange={setFiles}
              onProceedToTopic={() => {
                const topicEl = document.getElementById('topic-selection-section');
                topicEl?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <div id="topic-selection-section" className="pt-6 border-t border-slate-200">
              <TopicSelector
                files={files}
                selectedTopic={activeTopic}
                selectedScope={activeScope}
                onSelectTopic={(t, s) => {
                  setActiveTopic(t);
                  setActiveScope(s);
                }}
                onGenerateNotes={() => handleTriggerGenerateNotes(activeTopic, activeScope)}
                onStartQuiz={() => setIsQuizConfigOpen(true)}
              />
            </div>
          </div>
        )}

        {/* TAB 3: AI STUDY NOTES */}
        {currentTab === 'notes' && (
          <StudyNotesView
            notes={currentNotes}
            isLoading={isLoadingNotes}
            topic={activeTopic}
            onRegenerate={() => handleTriggerGenerateNotes(activeTopic, activeScope)}
            onStartQuiz={() => setIsQuizConfigOpen(true)}
            onOpenChatWithTopic={(t) => {
              setActiveTopic(t);
              setCurrentTab('chat');
            }}
          />
        )}

        {/* TAB 4: MCQ QUIZ (Active / Result / Review / Empty Launcher) */}
        {currentTab === 'quiz' && (
          <div>
            {isQuizActive && activeQuizConfig ? (
              <QuizActiveView
                questions={activeQuizQuestions}
                config={activeQuizConfig}
                topic={activeTopic}
                onFinishQuiz={handleFinishQuiz}
                onCancelQuiz={() => setIsQuizActive(false)}
              />
            ) : isReviewing && currentResult ? (
              <QuizReviewView
                result={currentResult}
                onBackToResults={() => setIsReviewing(false)}
                onRetryQuiz={() => {
                  if (activeQuizConfig) handleLaunchQuiz(activeQuizConfig);
                  else setIsQuizConfigOpen(true);
                }}
              />
            ) : currentResult ? (
              <QuizResultsView
                result={currentResult}
                onReviewAnswers={() => setIsReviewing(true)}
                onRetryQuiz={() => {
                  if (activeQuizConfig) handleLaunchQuiz(activeQuizConfig);
                  else setIsQuizConfigOpen(true);
                }}
                onNewQuiz={() => setIsQuizConfigOpen(true)}
                onStudyWeakTopics={handleStudyWeakTopics}
              />
            ) : (
              <div className="max-w-xl mx-auto py-16 text-center space-y-6 bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                  <span className="text-xl font-bold font-mono">Q&A</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-slate-900 font-serif-display">
                    Start a Grounded MCQ Quiz
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Test your memory and conceptual application on "{activeTopic || 'Entire Material'}".
                  </p>
                </div>
                <button
                  onClick={() => setIsQuizConfigOpen(true)}
                  className="px-6 py-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Configure & Start Quiz
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PROGRESS & WEAK TOPICS */}
        {currentTab === 'progress' && (
          <ProgressDashboard
            files={files}
            quizHistory={quizHistory}
            savedNotes={savedNotes}
            activeTopic={activeTopic}
            onSelectTopic={(t) => {
              setActiveTopic(t);
              setActiveScope('topic');
              setCurrentTab('notes');
              handleTriggerGenerateNotes(t, 'topic');
            }}
            onGenerateWeakNotes={handleStudyWeakTopics}
            onStartQuizForTopic={(t) => {
              setActiveTopic(t);
              setActiveScope('topic');
              setIsQuizConfigOpen(true);
            }}
            onViewNotes={(notes) => {
              setCurrentNotes(notes);
              setActiveTopic(notes.topic);
              setCurrentTab('notes');
            }}
          />
        )}

        {/* TAB 6: ASK YOUR MATERIAL (AI CHAT) */}
        {currentTab === 'chat' && (
          <AskMaterialView
            files={files}
            initialTopic={activeTopic}
            chatMessages={chatMessages}
            onMessagesChange={setChatMessages}
          />
        )}
      </main>

      {/* Quiz Configuration Modal */}
      <QuizConfigModal
        topic={activeTopic}
        isOpen={isQuizConfigOpen}
        isLoading={isLoadingQuiz}
        onClose={() => setIsQuizConfigOpen(false)}
        onLaunchQuiz={handleLaunchQuiz}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 font-serif-display">StudyForge AI</span>
            <span>·</span>
            <span>Turn your study material into smarter preparation</span>
          </div>
          <div>
            <span>Strict document grounding · AI-assisted academic intelligence</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
