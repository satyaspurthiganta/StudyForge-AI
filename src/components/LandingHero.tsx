import React from 'react';
import {
  Sparkles,
  UploadCloud,
  FileCheck,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Target,
  BrainCircuit,
  GraduationCap,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface LandingHeroProps {
  onStartStudying: () => void;
  onTrySampleMaterial: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartStudying,
  onTrySampleMaterial,
}) => {
  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* 1. Main Hero Block */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-b from-white via-indigo-50/20 to-slate-50 border border-slate-200/80 p-6 sm:p-12 lg:p-16 shadow-xs">
        {/* Subtle decorative background grids */}
        <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Subtle editorial kicker without pill badge */}
          <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-wider text-indigo-700 uppercase">
            <Sparkles className="w-4 h-4 text-indigo-600 inline" />
            <span>AI-Powered Academic Intelligence</span>
            <span aria-hidden="true">·</span>
            <span>Zero Hallucination Grounding</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 font-serif-display leading-[1.12]">
            Turn your study material into{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-700 via-indigo-600 to-violet-700 underline decoration-indigo-200 decoration-wavy decoration-from-font">
              smarter preparation.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Upload your lecture PDFs, DOCX notes, slides, or syllabus files. StudyForge AI analyzes the source text to generate topic-specific revision notes, realistic 4-option MCQ quizzes, and adaptive weak-concept remediation.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartStudying}
              className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
            >
              <span>Start Studying</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onTrySampleMaterial}
              className="w-full sm:w-auto px-6 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              <span>Try with Sample Material</span>
              <span className="text-xs text-slate-400 font-normal">(Data Structures)</span>
            </button>
          </div>

          {/* Trust markers & grounding promise */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Strict Document Grounding</span>
            </div>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <div className="flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-indigo-600" />
              <span>PDF, DOCX, PPTX & TXT Supported</span>
            </div>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <div className="flex items-center gap-1.5">
              <Target className="w-4 h-4 text-amber-600" />
              <span>Adaptive Weak-Topic Detection</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive 5-Step Learning Loop Visualizer */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-serif-display">
            The StudyForge Learning Workflow
          </h2>
          <p className="text-sm text-slate-600">
            How your raw documents become exam-ready comprehension in five structured steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              step: '01',
              title: 'Upload Materials',
              desc: 'Upload PDFs, notes, or slides. Content is parsed and indexed.',
              icon: UploadCloud,
              color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
            },
            {
              step: '02',
              title: 'Select Topic',
              desc: 'Pick an entire unit or drill down to a specific chapter or concept.',
              icon: Layers,
              color: 'text-sky-600 bg-sky-50 border-sky-100',
            },
            {
              step: '03',
              title: 'AI Revision Notes',
              desc: 'Structured overviews, definitions, formulas, and comparison tables.',
              icon: Sparkles,
              color: 'text-violet-600 bg-violet-50 border-violet-100',
            },
            {
              step: '04',
              title: 'Targeted MCQ Quiz',
              desc: 'Solve 4-option grounded MCQs with detailed explanations & citations.',
              icon: CheckCircle,
              color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
            },
            {
              step: '05',
              title: 'Fix Weak Areas',
              desc: 'Automated weak-concept diagnosis with targeted refresher notes.',
              icon: Target,
              color: 'text-rose-600 bg-rose-50 border-rose-100',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      STEP {item.step}
                    </span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Core Feature Pillars Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 hover:border-slate-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Source-Grounded Accuracy
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Unlike generic AI that invents ungrounded facts, StudyForge answers and questions are sourced strictly from your uploaded files. If a requested concept isn't in your text, you are informed immediately.
          </p>
          <div className="pt-2 text-xs font-medium text-slate-500 border-t border-slate-100 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Guaranteed verifiable citations</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 hover:border-slate-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Exam & Practice MCQ Modes
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Test yourself under timed Exam Mode conditions (hidden answers, strict timer) or switch to Practice Mode for real-time explanations, hints, and concept clarifications question-by-question.
          </p>
          <div className="pt-2 text-xs font-medium text-slate-500 border-t border-slate-100 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
            <span>Plausible, syllabus-aligned distractors</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 hover:border-slate-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center font-bold">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Adaptive Weak-Topic Masteries
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Every quiz evaluates your topical mastery. Missed questions trigger automated weak-topic detection, giving you one-click tailored revision packs focused precisely on resolving your misconceptions.
          </p>
          <div className="pt-2 text-xs font-medium text-slate-500 border-t border-slate-100 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />
            <span>Targeted remedial study notes</span>
          </div>
        </div>
      </section>

      {/* 4. Interactive Callout */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <h3 className="text-2xl font-bold font-serif-display">
            Ready to test yourself on your course material?
          </h3>
          <p className="text-sm text-slate-300">
            Upload your files now or load our pre-configured Data Structures Coursepack to experience the notes and quiz engine immediately.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onTrySampleMaterial}
            className="px-5 py-3 text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Load Sample Material
          </button>
          <button
            onClick={onStartStudying}
            className="px-6 py-3 text-sm font-semibold text-slate-950 bg-white hover:bg-slate-100 rounded-xl transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>Upload Notes</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
