import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  X,
  Minimize2,
  Maximize2,
  Trash2,
  Settings,
  Bot,
  User,
  Sparkles,
  ExternalLink,
  Loader2,
  Copy,
  Check,
  Zap,
  Info,
  ChevronDown,
  RefreshCw,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { sendN8nChatMessage, checkN8nStatus } from '../services/api';
import { StudyFile } from '../types';

interface N8nChatWidgetProps {
  files: StudyFile[];
  activeTopic?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'n8n';
  text: string;
  timestamp: string;
  isStatusNotice?: boolean;
  isFallback?: boolean;
  n8nConnected?: boolean;
}

const DEFAULT_WEBHOOK_URL =
  'https://satyaspurthiganta.app.n8n.cloud/webhook/0647e95d-de4d-48e3-98ba-4a68f442c81a/chat';

export const N8nChatWidget: React.FC<N8nChatWidgetProps> = ({ files, activeTopic }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(() => {
    return localStorage.getItem('studyforge_n8n_webhook_url') || DEFAULT_WEBHOOK_URL;
  });
  const [includeContext, setIncludeContext] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Connection check state
  const [connectionStatus, setConnectionStatus] = useState<{
    checked: boolean;
    isLive: boolean;
    activeMode: 'production' | 'test' | 'inactive';
    message: string;
  }>({
    checked: false,
    isLive: false,
    activeMode: 'inactive',
    message: '',
  });
  const [isCheckingConn, setIsCheckingConn] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('studyforge_n8n_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: 'welcome',
        sender: 'n8n',
        text: `Hello! 👋 I'm your **StudyForge AI Assistant**, connected to your **n8n Cloud Workflow**.\n\nAsk me anything about your course materials, algorithmic concepts, revision strategies, or exam prep!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        n8nConnected: false,
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('studyforge_n8n_chat_history', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    localStorage.setItem('studyforge_n8n_webhook_url', webhookUrl);
  }, [webhookUrl]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
      runConnectionCheck();
    }
  }, [isOpen, isMinimized]);

  const runConnectionCheck = async () => {
    setIsCheckingConn(true);
    try {
      const res = await checkN8nStatus(webhookUrl);
      setConnectionStatus({
        checked: true,
        isLive: res.isLive,
        activeMode: res.activeMode,
        message: res.detailMessage || res.help,
      });
    } catch (e: any) {
      setConnectionStatus({
        checked: true,
        isLive: false,
        activeMode: 'inactive',
        message: 'Could not reach webhook',
      });
    } finally {
      setIsCheckingConn(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'cleared-' + Date.now(),
        sender: 'n8n',
        text: 'Chat history cleared. What would you like to study next?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleSendMessage = async (textToSend: string) => {
    const cleanText = textToSend.trim();
    if (!cleanText || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'u-' + Date.now(),
      sender: 'user',
      text: cleanText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    // Build context if enabled
    let contextData = '';
    if (includeContext) {
      const availableFiles = files.filter((f) => f.status === 'ready');
      if (activeTopic) {
        contextData += `Current Study Topic: ${activeTopic}\n`;
      }
      if (availableFiles.length > 0) {
        contextData += `Uploaded Documents: ${availableFiles.map((f) => f.name).join(', ')}\n`;
        const snippet = availableFiles.map((f) => f.extractedText).join('\n\n').slice(0, 3000);
        contextData += `Document Excerpt:\n${snippet}\n`;
      }
    }

    try {
      const response = await sendN8nChatMessage(
        cleanText,
        'sf-session-' + (localStorage.getItem('studyforge_session_id') || Date.now()),
        webhookUrl,
        contextData
      );

      const isLiveResponse = response.status === 'n8n_live';
      const isFallback = response.status === 'active_with_fallback';

      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'n8n',
        text: response.output,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFallback: isFallback,
        n8nConnected: isLiveResponse,
      };

      setMessages((prev) => [...prev, botMsg]);

      // update connection indicator if live returned
      if (isLiveResponse) {
        setConnectionStatus({
          checked: true,
          isLive: true,
          activeMode: 'production',
          message: 'Connected to live n8n workflow',
        });
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'n8n',
          text: `⚠️ **Connection Notice:** Unable to reach server. Please try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    activeTopic ? `Explain ${activeTopic} with an analogy` : 'Explain key concept simply',
    'What are top 3 exam focus points?',
    'Give a real-world software engineering example',
    'Summarize core definitions and edge cases',
  ];

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 backdrop-blur-md text-white text-xs font-medium px-3.5 py-1.5 rounded-full shadow-lg border border-slate-700/60 animate-bounce duration-1000">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Ask n8n AI Assistant</span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open n8n Study Assistant"
            className="group relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 text-white shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/20"
          >
            <div className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
            </div>
            <Zap className="w-6 h-6 text-amber-300 group-hover:rotate-12 transition-transform duration-200" />
          </button>
        </div>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 shadow-2xl bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col ${
            isMinimized
              ? 'bottom-6 right-6 w-80 h-16'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[440px] h-[640px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-indigo-900/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/80 border border-indigo-400/30 flex items-center justify-center shrink-0 shadow-inner">
                <Zap className="w-4 h-4 text-amber-300" />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold text-white tracking-tight truncate">
                    StudyForge Assistant
                  </h3>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-indigo-500/30 text-indigo-300 border border-indigo-400/20">
                    n8n
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-300">
                  {connectionStatus.isLive ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                      <span className="text-emerald-300 truncate">n8n Live Workflow</span>
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>
                      <span className="text-amber-200 truncate">Smart AI (n8n Standby)</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 text-slate-300">
              <button
                onClick={() => setShowHelpModal(!showHelpModal)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title="n8n Activation Guide"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
                  showSettings ? 'bg-white/20 text-white' : ''
                }`}
                title="Webhook Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title="Clear Chat History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Collapsed State Bar */}
          {isMinimized && (
            <div
              onClick={() => setIsMinimized(false)}
              className="flex-1 px-4 flex items-center justify-between cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors text-xs text-slate-600 font-medium"
            >
              <span>Click to reopen n8n AI Chat</span>
              <ChevronDown className="w-4 h-4 text-slate-400 rotate-180" />
            </div>
          )}

          {/* Full Expanded Content */}
          {!isMinimized && (
            <>
              {/* Settings Tray */}
              {showSettings && (
                <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs text-slate-700 animate-in slide-in-from-top-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-indigo-600" />
                      n8n Webhook Configuration
                    </span>
                    <a
                      href="https://satyaspurthiganta.app.n8n.cloud"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
                    >
                      Open n8n <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Chat Webhook URL:
                    </label>
                    <input
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://.../webhook/.../chat"
                      className="w-full text-xs font-mono p-1.5 rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={runConnectionCheck}
                      disabled={isCheckingConn}
                      className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isCheckingConn ? 'animate-spin' : ''}`} />
                      <span>{isCheckingConn ? 'Testing...' : 'Test Connection'}</span>
                    </button>

                    <button
                      onClick={() => setWebhookUrl(DEFAULT_WEBHOOK_URL)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                    >
                      Reset default
                    </button>
                  </div>

                  {connectionStatus.checked && (
                    <div
                      className={`p-2 rounded text-[11px] flex items-start gap-1.5 ${
                        connectionStatus.isLive
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {connectionStatus.isLive ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <strong>{connectionStatus.isLive ? 'Webhook Active:' : 'Standby Mode:'}</strong>{' '}
                        {connectionStatus.message}
                      </div>
                    </div>
                  )}

                  <div className="pt-1 flex items-center justify-between border-t border-slate-200 text-[11px] text-slate-600">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeContext}
                        onChange={(e) => setIncludeContext(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Pass study materials to AI</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Activation Help Modal / Drawer */}
              {showHelpModal && (
                <div className="p-4 bg-indigo-50/90 border-b border-indigo-100 text-xs text-slate-700 space-y-2.5 animate-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-indigo-950 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500" />
                      How to Activate in n8n Cloud
                    </h4>
                    <button
                      onClick={() => setShowHelpModal(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-800">
                    <li>
                      Go to{' '}
                      <a
                        href="https://satyaspurthiganta.app.n8n.cloud"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-indigo-700 underline"
                      >
                        satyaspurthiganta.app.n8n.cloud ↗
                      </a>
                    </li>
                    <li>Open your Chatbot Workflow.</li>
                    <li>
                      Look at the top-right corner of the canvas: switch the toggle from{' '}
                      <span className="font-mono bg-slate-200 px-1 py-0.5 rounded text-[10px]">Inactive</span> to{' '}
                      <span className="font-mono bg-emerald-200 text-emerald-900 font-bold px-1 py-0.5 rounded text-[10px]">Active</span>.
                    </li>
                    <li>That's it! StudyForge AI will instantly route questions directly through your custom n8n nodes.</li>
                  </ol>
                  <p className="text-[11px] text-indigo-800 bg-white/70 p-2 rounded border border-indigo-200">
                    💡 <strong>Smart Backup:</strong> Even when your n8n workflow is in standby, StudyForge AI answers your questions instantly so you can always study without interruption!
                  </p>
                </div>
              )}

              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      {msg.sender === 'user' ? (
                        <>
                          <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                          <span className="text-[11px] font-semibold text-slate-700">You</span>
                        </>
                      ) : (
                        <>
                          <div className="w-4 h-4 rounded bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold">
                            N
                          </div>
                          <span className="text-[11px] font-semibold text-slate-700">
                            n8n Study Agent
                          </span>
                          {msg.n8nConnected ? (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                              n8n Live
                            </span>
                          ) : msg.isFallback ? (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                              StudyForge AI
                            </span>
                          ) : null}
                          <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                        </>
                      )}
                    </div>

                    <div
                      className={`relative group max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                      }`}
                    >
                      {/* Optional fallback disclaimer pill */}
                      {msg.isFallback && (
                        <div className="mb-2 pb-1.5 border-b border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                          <span className="flex items-center gap-1 text-indigo-700 font-medium">
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            Grounded StudyForge AI Response
                          </span>
                          <button
                            onClick={() => setShowHelpModal(true)}
                            className="text-indigo-600 hover:underline cursor-pointer"
                          >
                            Activate n8n ↗
                          </button>
                        </div>
                      )}

                      <div className="whitespace-pre-wrap break-words font-sans">
                        {msg.text}
                      </div>

                      {msg.sender === 'n8n' && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="opacity-0 group-hover:opacity-100 absolute top-1.5 right-1.5 p-1 rounded bg-slate-100/90 hover:bg-slate-200 text-slate-600 transition-opacity cursor-pointer"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold">
                      N
                    </div>
                    <div className="bg-white border border-slate-200 px-3.5 py-2.5 rounded-2xl rounded-bl-xs text-xs text-slate-500 flex items-center gap-2 shadow-xs">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                      <span>Thinking and preparing answer...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Carousel */}
              {messages.length < 4 && (
                <div className="px-3 py-2 bg-slate-100/80 border-t border-slate-200/80 overflow-x-auto whitespace-nowrap flex gap-1.5 text-[11px] no-scrollbar">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="px-2.5 py-1 rounded-full bg-white border border-slate-300 text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-colors shadow-xs cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Footer */}
              <div className="p-3 bg-white border-t border-slate-200">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(inputText);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      activeTopic ? `Ask n8n about ${activeTopic}...` : 'Ask n8n assistant a question...'
                    }
                    disabled={isLoading}
                    className="flex-1 text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isLoading}
                    className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white flex items-center justify-center transition-colors shadow-xs shrink-0 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 px-1">
                  <span className="truncate">
                    Webhook:{' '}
                    <span className="font-mono text-slate-600">
                      {webhookUrl.replace('https://', '').slice(0, 30)}...
                    </span>
                  </span>
                  <span className="text-indigo-600 font-medium">Ready</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
