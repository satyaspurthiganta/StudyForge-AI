import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  ShieldCheck,
  BookOpen,
  User,
  Bot,
  Loader2,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { MaterialChatMessage, StudyFile } from '../types';
import { askStudyMaterial } from '../services/api';

interface AskMaterialViewProps {
  files: StudyFile[];
  initialTopic?: string;
  chatMessages: MaterialChatMessage[];
  onMessagesChange: (messages: MaterialChatMessage[]) => void;
}

export const AskMaterialView: React.FC<AskMaterialViewProps> = ({
  files,
  initialTopic,
  chatMessages,
  onMessagesChange,
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const combinedText = files
    .filter((f) => f.status === 'ready')
    .map((f) => f.extractedText)
    .join('\n\n');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoading]);

  const quickPrompts = [
    `Explain ${initialTopic || 'this topic'} like I am a beginner.`,
    'What are the most important points for an exam?',
    'Give me a concrete real-world example.',
    'Explain the difference between these two core concepts.',
    'What common pitfalls or mistakes should I avoid on a test?',
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: MaterialChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toISOString(),
      groundedInMaterial: true,
    };

    const newHistory = [...chatMessages, userMsg];
    onMessagesChange(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await askStudyMaterial(combinedText, userMsg.content, newHistory);
      const botMsg: MaterialChatMessage = {
        id: 'msg-bot-' + Date.now(),
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toISOString(),
        groundedInMaterial: response.grounded,
        sourceCitations: response.citations,
      };

      onMessagesChange([...newHistory, botMsg]);
    } catch (err: any) {
      const errorMsg: MaterialChatMessage = {
        id: 'msg-err-' + Date.now(),
        role: 'assistant',
        content:
          'Unable to query your materials right now. Please verify your document text or try again.',
        timestamp: new Date().toISOString(),
        groundedInMaterial: false,
      };
      onMessagesChange([...newHistory, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    onMessagesChange([]);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6 flex flex-col h-[calc(100vh-10rem)]">
      {/* Top Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Document Grounded Assistant</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-serif-display mt-0.5">
            Ask Your Study Material
          </h2>
          <p className="text-xs text-slate-500">
            Asking across {files.length} active documents ({files.reduce((a, b) => a + (b.wordCount || 0), 0).toLocaleString()} words)
          </p>
        </div>

        {chatMessages.length > 0 && (
          <button
            onClick={clearChat}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        )}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs flex-1 overflow-y-auto space-y-4">
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 py-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 font-serif-display">
                Ask anything from your uploaded files
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                StudyForge answers queries by referencing your coursepack. If information isn't present in your files, you will be notified explicitly.
              </p>
            </div>

            {/* Quick Prompts */}
            <div className="w-full space-y-2 pt-2 text-left">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block text-center">
                Quick Starters
              </span>
              <div className="space-y-1.5">
                {quickPrompts.slice(0, 4).map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    className="w-full text-left p-2.5 bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/80 hover:border-indigo-200 rounded-xl text-xs text-slate-700 transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <span>{prompt}</span>
                    <span className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-semibold">
                      Ask →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white shadow-xs rounded-tr-none'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-line select-text">{msg.content}</div>

                {msg.role === 'assistant' && (
                  <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      {msg.groundedInMaterial ? (
                        <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Grounded in Material</span>
                        </span>
                      ) : (
                        <span className="text-amber-700 flex items-center gap-1 font-semibold">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Contains External Clarification</span>
                        </span>
                      )}
                    </div>

                    {msg.sourceCitations && msg.sourceCitations.length > 0 && (
                      <span className="text-slate-500 font-mono">
                        Citations: {msg.sourceCitations.join(', ')}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-center gap-2.5 text-xs text-slate-500 p-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Consulting uploaded study materials...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box & Quick Prompt Pill Bar */}
      <div className="space-y-2 shrink-0">
        {chatMessages.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {quickPrompts.slice(0, 3).map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="whitespace-nowrap px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 text-xs transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask a question about your study material (e.g. explain BST insertion)..."
            className="w-full pl-4 pr-12 py-3.5 bg-white border border-slate-300 rounded-2xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
