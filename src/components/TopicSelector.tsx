import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Sparkles,
  Layers,
  FileCheck2,
  Check,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { StudyFile, StudyScope } from '../types';
import { checkTopicGroundedInText } from '../utils/aiFallback';

interface TopicSelectorProps {
  files: StudyFile[];
  selectedTopic: string;
  selectedScope: StudyScope;
  onSelectTopic: (topic: string, scope: StudyScope) => void;
  onGenerateNotes: () => void;
  onStartQuiz: () => void;
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({
  files,
  selectedTopic,
  selectedScope,
  onSelectTopic,
  onGenerateNotes,
  onStartQuiz,
}) => {
  const [topicInput, setTopicInput] = useState(selectedTopic === 'Entire Material' ? '' : selectedTopic);
  const [scope, setScope] = useState<StudyScope>(selectedScope);
  const [groundingWarning, setGroundingWarning] = useState<string | null>(null);

  // Combine text from all ready files
  const combinedText = files
    .filter(f => f.status === 'ready')
    .map(f => f.extractedText)
    .join('\n\n');

  // Collect detected topics from files
  const detectedTopics: string[] = ['Entire Material'];
  files.forEach(f => {
    (f.detectedTopics || []).forEach(t => {
      if (!detectedTopics.includes(t) && t.trim() !== '') {
        detectedTopics.push(t);
      }
    });
  });

  const handleApplyTopic = (topic: string, newScope: StudyScope = scope) => {
    setGroundingWarning(null);
    const clean = topic.trim();

    if (clean === '' || clean === 'Entire Material' || newScope === 'entire') {
      onSelectTopic('Entire Material', 'entire');
      setTopicInput('');
      setScope('entire');
      return;
    }

    // Verify grounding against combined documents
    const isGrounded = checkTopicGroundedInText(clean, combinedText);
    if (!isGrounded && combinedText.length > 0) {
      setGroundingWarning(
        'This topic was not found in your uploaded study material. Please choose another topic or upload relevant material.'
      );
    } else {
      setGroundingWarning(null);
    }

    setScope(newScope);
    onSelectTopic(clean, newScope);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTopicInput(val);
    if (val.trim() === '') {
      handleApplyTopic('Entire Material', 'entire');
    } else {
      handleApplyTopic(val, scope === 'entire' ? 'topic' : scope);
    }
  };

  const selectDetectedTopic = (t: string) => {
    if (t === 'Entire Material') {
      setTopicInput('');
      handleApplyTopic('Entire Material', 'entire');
    } else {
      setTopicInput(t);
      const isModule = /module|chapter|unit/i.test(t);
      handleApplyTopic(t, isModule ? 'module' : 'topic');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Title & Prompt */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-serif-display">
          What do you want to study?
        </h2>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Choose a comprehensive review of your entire material, or zero in on a specific chapter, unit, or concept.
        </p>
      </div>

      {/* Scope Selector (Segmented control) */}
      <div className="bg-slate-100 p-1.5 rounded-xl max-w-lg mx-auto flex items-center justify-between shadow-inner">
        <button
          onClick={() => {
            setScope('entire');
            handleApplyTopic('Entire Material', 'entire');
          }}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            scope === 'entire'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Entire Material</span>
        </button>

        <button
          onClick={() => {
            setScope('topic');
            if (topicInput) handleApplyTopic(topicInput, 'topic');
          }}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            scope === 'topic'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Specific Topic</span>
        </button>

        <button
          onClick={() => {
            setScope('module');
            if (topicInput) handleApplyTopic(topicInput, 'module');
          }}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            scope === 'module'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Module / Chapter</span>
        </button>
      </div>

      {/* Topic Search & Input */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={topicInput}
            onChange={handleInputChange}
            placeholder={
              scope === 'entire'
                ? 'Studying Entire Material (type to filter by concept...)'
                : 'Enter a topic, chapter, unit, or concept (e.g. Linked Lists, BST, Big-O)...'
            }
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Grounding Warning Alert */}
        {groundingWarning && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900 text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-950">Grounding Notice</p>
              <p className="text-xs text-amber-800 leading-relaxed">{groundingWarning}</p>
            </div>
          </div>
        )}

        {/* Suggested Detected Topics from Uploaded Material */}
        <div className="space-y-2 pt-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Detected from your uploaded material:
          </p>
          <div className="flex flex-wrap gap-2">
            {detectedTopics.slice(0, 10).map((topic, idx) => {
              const isSelected =
                (topic === 'Entire Material' && (!selectedTopic || selectedTopic === 'Entire Material')) ||
                selectedTopic.toLowerCase() === topic.toLowerCase();

              return (
                <button
                  key={idx}
                  onClick={() => selectDetectedTopic(topic)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                  <span>{topic}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Decision Area */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-indigo-300 transition-colors shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Step 1: Revision Notes</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Generate structured definitions, comparisons, formulas, exam tips, and common pitfalls for{' '}
              <strong className="text-slate-900">{selectedTopic || 'Entire Material'}</strong>.
            </p>
          </div>
          <button
            onClick={onGenerateNotes}
            disabled={!!groundingWarning}
            className={`w-full py-3 px-4 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              groundingWarning
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
            }`}
          >
            <span>Generate Study Notes</span>
            <BookOpen className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-300 transition-colors shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm mb-1.5">
              <FileCheck2 className="w-4 h-4" />
              <span>Step 2: MCQ Quiz</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Test your understanding with 4-option grounded MCQs with realistic distractors and source citations.
            </p>
          </div>
          <button
            onClick={onStartQuiz}
            disabled={!!groundingWarning}
            className={`w-full py-3 px-4 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              groundingWarning
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
            }`}
          >
            <span>Configure & Launch Quiz</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
