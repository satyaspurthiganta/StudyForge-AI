import React from 'react';
import {
  Download,
  RotateCw,
  Play,
  MessageSquare,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Bookmark,
  Scale,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { GeneratedNotes } from '../types';

interface StudyNotesViewProps {
  notes: GeneratedNotes | null;
  isLoading: boolean;
  topic: string;
  onRegenerate: () => void;
  onStartQuiz: () => void;
  onOpenChatWithTopic: (topic: string) => void;
}

export const StudyNotesView: React.FC<StudyNotesViewProps> = ({
  notes,
  isLoading,
  topic,
  onRegenerate,
  onStartQuiz,
  onOpenChatWithTopic,
}) => {
  const downloadNotesAsMarkdown = () => {
    if (!notes) return;
    const content = `# StudyForge AI - Study Notes: ${notes.topic}
Generated: ${new Date(notes.generatedAt).toLocaleString()}
Source: Grounded in uploaded study documents

## 1. Topic Overview
${notes.overview}

## 2. Important Definitions
${notes.definitions.map(d => `### ${d.term}\n${d.definition}\n*Context: ${d.context || 'Core syllabus'}*\n`).join('\n')}

## 3. Key Concepts & Mechanics
${notes.keyConcepts.map(c => `### ${c.title}\n${c.explanation}\n*Example: ${c.example || 'N/A'}*\n`).join('\n')}

## 4. Formulas & Asymptotic Rules
${notes.formulasOrRules.map(f => `### ${f.name}\n\`${f.formula}\`\n${f.explanation}\n`).join('\n')}

## 5. Conceptual Comparisons
${notes.comparisons.map(comp => `### ${comp.title}\n| ${comp.headers.join(' | ')} |\n| ${comp.headers.map(() => '---').join(' | ')} |\n${comp.rows.map(r => `| ${r.join(' | ')} |`).join('\n')}\n`).join('\n')}

## 6. High-Yield Exam Focus Points
${notes.examFocusPoints.map(p => `- ${p}`).join('\n')}

## 7. Common Pitfalls & Mistakes to Avoid
${notes.commonMistakes.map(m => `- ${m}`).join('\n')}

## 8. Quick Revision Summary
${notes.revisionSummary}
`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `StudyForge_${notes.topic.replace(/[^a-zA-Z0-9]/g, '_')}_Notes.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <h3 className="text-xl font-bold text-slate-900 font-serif-display">
          Forging Revision Notes from Your Material...
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Extracting definitions, formulas, comparisons, and exam tips specifically for "{topic}" directly from your uploaded documents.
        </p>
      </div>
    );
  }

  if (!notes) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
          <Bookmark className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No notes generated yet</h3>
        <p className="text-xs text-slate-500">
          Select a topic and click "Generate Study Notes" to produce concise revision material.
        </p>
        <button
          onClick={onRegenerate}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 cursor-pointer"
        >
          Generate Notes Now
        </button>
      </div>
    );
  }

  // Not Grounded Case
  if (!notes.grounded) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-amber-950 font-serif-display">
            Topic Not Grounded in Material
          </h3>
          <p className="text-sm text-amber-800 leading-relaxed max-w-lg mx-auto">
            {notes.notGroundedMessage ||
              'This topic was not found in your uploaded study material. Please choose another topic or upload relevant material.'}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => onOpenChatWithTopic(topic)}
              className="px-4 py-2 text-xs font-semibold text-amber-900 bg-amber-200/80 hover:bg-amber-200 rounded-lg cursor-pointer"
            >
              Ask StudyForge Assistant
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Note Header & Action Controls */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-indigo-600 uppercase tracking-wider">
              StudyForge AI Revision Notes
            </span>
            <span aria-hidden="true">·</span>
            <span>Source Grounded</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif-display">
            {notes.topic}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Generated on {new Date(notes.generatedAt).toLocaleDateString()} at{' '}
            {new Date(notes.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={onRegenerate}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Regenerate Notes"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Regenerate</span>
          </button>

          <button
            onClick={downloadNotesAsMarkdown}
            className="p-2 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download Notes (.md)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          <button
            onClick={onStartQuiz}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Quiz</span>
          </button>
        </div>
      </div>

      {/* 1. Overview */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>01. Topic Overview</span>
        </div>
        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
          {notes.overview}
        </p>
      </section>

      {/* 2. Key Definitions */}
      {notes.definitions && notes.definitions.length > 0 && (
        <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
            <span>02. Important Definitions</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.definitions.map((def, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">{def.term}</h4>
                  {def.context && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {def.context}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{def.definition}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Core Concepts & Mechanics */}
      {notes.keyConcepts && notes.keyConcepts.length > 0 && (
        <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>03. Core Concepts & Practical Mechanics</span>
          </div>

          <div className="space-y-4">
            {notes.keyConcepts.map((concept, idx) => (
              <div
                key={idx}
                className="border-l-3 border-indigo-600 pl-4 py-1 space-y-1.5"
              >
                <h4 className="text-sm font-bold text-slate-900">{concept.title}</h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {concept.explanation}
                </p>
                {concept.example && (
                  <div className="text-xs bg-indigo-50/60 text-indigo-900 p-2.5 rounded-lg font-mono">
                    <strong className="font-semibold text-indigo-950 font-sans">Example: </strong>
                    {concept.example}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Formulas, Rules & Asymptotics */}
      {notes.formulasOrRules && notes.formulasOrRules.length > 0 && (
        <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>04. Formulas & Asymptotic Invariants</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.formulasOrRules.map((formula, idx) => (
              <div
                key={idx}
                className="bg-slate-900 text-slate-100 rounded-xl p-4 space-y-2 border border-slate-800"
              >
                <span className="text-xs font-semibold text-slate-300 block">
                  {formula.name}
                </span>
                <div className="font-mono text-sm text-emerald-400 bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800 tracking-wide">
                  {formula.formula}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {formula.explanation}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Comparisons & Differences */}
      {notes.comparisons && notes.comparisons.length > 0 && (
        <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Scale className="w-3.5 h-3.5 text-indigo-600" />
            <span>05. Differences & Trade-off Matrix</span>
          </div>

          {notes.comparisons.map((comp, idx) => (
            <div key={idx} className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900">{comp.title}</h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-900 font-semibold">
                    <tr>
                      {comp.headers.map((h, i) => (
                        <th key={i} className="px-4 py-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {comp.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/70">
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={`px-4 py-2.5 ${
                              cIdx === 0 ? 'font-medium text-slate-900' : ''
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 6. High-Yield Exam Points & Common Mistakes (Two Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Exam Focus */}
        <section className="bg-emerald-50/40 border border-emerald-200/80 rounded-2xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>High-Yield Exam Focus</span>
          </div>
          <ul className="space-y-2.5">
            {notes.examFocusPoints.map((point, idx) => (
              <li key={idx} className="text-xs text-emerald-950 flex items-start gap-2 leading-relaxed">
                <span className="font-bold text-emerald-600 shrink-0 mt-0.5">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Common Mistakes */}
        <section className="bg-rose-50/40 border border-rose-200/80 rounded-2xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>Common Pitfalls to Avoid</span>
          </div>
          <ul className="space-y-2.5">
            {notes.commonMistakes.map((mistake, idx) => (
              <li key={idx} className="text-xs text-rose-950 flex items-start gap-2 leading-relaxed">
                <span className="font-bold text-rose-600 shrink-0 mt-0.5">•</span>
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* 7. Quick Revision Summary */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Quick Revision Takeaway
        </h4>
        <p className="text-xs text-slate-700 leading-relaxed font-medium">
          {notes.revisionSummary}
        </p>
      </section>

      {/* Footer Launch Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl">
        <div className="space-y-0.5 text-center sm:text-left">
          <p className="text-sm font-bold text-indigo-950">
            Ready to test yourself on {notes.topic}?
          </p>
          <p className="text-xs text-indigo-700">
            Configure questions, difficulty, and practice vs exam simulation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenChatWithTopic(notes.topic)}
            className="px-4 py-2 text-xs font-semibold text-indigo-800 bg-white hover:bg-slate-50 border border-indigo-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ask Questions</span>
          </button>

          <button
            onClick={onStartQuiz}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Start MCQ Quiz</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
