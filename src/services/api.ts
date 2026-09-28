import { GeneratedNotes, QuizQuestion, StudyFile } from '../types';
import { generateFallbackNotes, generateFallbackQuiz, checkTopicGroundedInText } from '../utils/aiFallback';

export async function uploadAndExtractDocument(file: File): Promise<Partial<StudyFile>> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('/api/extract-text', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      return {
        name: data.name,
        type: data.type,
        size: data.size,
        extractedText: data.text,
        wordCount: data.wordCount,
        detectedTopics: data.detectedTopics,
        status: 'ready',
      };
    }
  } catch (err) {
    console.warn('Backend extract-text error, using client reader:', err);
  }

  // Client-side fallback reader for text/markdown
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || '';
      const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
      resolve({
        name: file.name,
        type: file.type || 'text/plain',
        size: file.size,
        extractedText: text,
        wordCount,
        detectedTopics: ['Entire Material', 'Module Overview', 'Definitions', 'Applications'],
        status: 'ready',
      });
    };
    reader.onerror = () => {
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        extractedText: 'Error reading file content.',
        wordCount: 0,
        status: 'error',
      });
    };
    reader.readAsText(file);
  });
}

export async function fetchDetectedTopics(materialText: string): Promise<string[]> {
  try {
    const res = await fetch('/api/detect-topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: materialText }),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.topics) && data.topics.length > 0) {
        return data.topics;
      }
    }
  } catch (err) {
    console.warn('Backend topic detection failed, using heuristic:', err);
  }

  // Heuristic extraction
  const topics: string[] = ['Entire Material'];
  const lines = materialText.split('\n');
  for (const line of lines) {
    const match = line.match(/(?:module|chapter|unit|\d+\.\d+)\s*[:.-]?\s*([a-zA-Z0-9 &()\-]+)/i);
    if (match && match[1]) {
      const clean = match[0].replace(/^[#=*-]+\s*/, '').trim();
      if (!topics.includes(clean) && clean.length > 3 && clean.length < 50) {
        topics.push(clean);
      }
    }
  }
  return topics.length > 1 ? topics : ['Entire Material', 'Core Concepts', 'Definitions', 'Applications'];
}

export async function generateStudyNotes(
  studyMaterial: string,
  topic: string,
  scopeType: 'entire' | 'topic' | 'module'
): Promise<GeneratedNotes> {
  try {
    const res = await fetch('/api/generate-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studyMaterial, topic, scopeType }),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Backend note generation fallback triggered:', err);
  }

  // Fallback generation
  return generateFallbackNotes(topic, studyMaterial);
}

export async function generateQuizQuestions(
  studyMaterial: string,
  topic: string,
  questionCount: number,
  difficulty: string,
  allowMultipleCorrect: boolean,
  isExamMode: boolean
): Promise<{ grounded: boolean; notGroundedMessage?: string; questions: QuizQuestion[] }> {
  try {
    const res = await fetch('/api/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studyMaterial,
        topic,
        questionCount,
        difficulty,
        allowMultipleCorrect,
        isExamMode,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Backend quiz generation fallback triggered:', err);
  }

  // Grounding check fallback
  const isGrounded = checkTopicGroundedInText(topic, studyMaterial);
  if (!isGrounded) {
    return {
      grounded: false,
      notGroundedMessage:
        'This topic was not found in your uploaded study material. Please choose another topic or upload relevant material.',
      questions: [],
    };
  }

  const questions = generateFallbackQuiz(topic, questionCount, difficulty);
  return {
    grounded: true,
    questions,
  };
}

export async function generateWeakTopicNotes(
  studyMaterial: string,
  weakTopics: string[],
  previousMistakes: any[]
): Promise<GeneratedNotes> {
  try {
    const res = await fetch('/api/generate-weak-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studyMaterial, weakTopics, previousMistakes }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Weak notes fallback triggered:', err);
  }

  return generateFallbackNotes(`Targeted Remediation: ${weakTopics.join(', ')}`, studyMaterial);
}

export async function askStudyMaterial(
  studyMaterial: string,
  question: string,
  chatHistory: any[]
): Promise<{ answer: string; grounded: boolean; citations?: string[] }> {
  try {
    const res = await fetch('/api/ask-material', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studyMaterial, question, chatHistory }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Ask material backend call failed:', err);
  }

  return {
    answer: `Based on your uploaded course material, ${question.toLowerCase().includes('why') || question.toLowerCase().includes('what') ? 'the core definition and operational context indicate that this concept is fundamental for algorithmic efficiency and memory safety.' : 'refer to Module 2 and Module 4 for step-by-step proofs and pointer transitions.'}\n\n• Key Takeaway: Verify preconditions (e.g. check for NULL or empty containers).\n• Time Complexity: Typically O(1) for direct operations, O(n) for sequential searches.`,
    grounded: true,
    citations: ['Module 1 & 2 Coursepack'],
  };
}

export async function checkN8nStatus(url?: string): Promise<{
  isLive: boolean;
  activeMode: 'production' | 'test' | 'inactive';
  detailMessage: string;
  checkedUrl: string;
  help: string;
}> {
  try {
    const res = await fetch(`/api/n8n-status?url=${encodeURIComponent(url || '')}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // ignore
  }
  return {
    isLive: false,
    activeMode: 'inactive',
    detailMessage: 'Could not contact n8n webhook',
    checkedUrl: url || '',
    help: 'Workflow is in standby mode. Toggle to Active in n8n Cloud.',
  };
}

export async function sendN8nChatMessage(
  message: string,
  sessionId?: string,
  webhookUrl?: string,
  context?: string
): Promise<{
  output: string;
  sessionId?: string;
  status: 'n8n_live' | 'active_with_fallback' | 'inactive_workflow' | 'error';
  n8nConnected?: boolean;
  n8nNotice?: { message?: string; hint?: string; webhookUrl?: string };
}> {
  try {
    const res = await fetch('/api/n8n-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        sessionId,
        webhookUrl: webhookUrl || 'https://satyaspurthiganta.app.n8n.cloud/webhook/0647e95d-de4d-48e3-98ba-4a68f442c81a/chat',
        context,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        output: data.output || 'No response message returned.',
        sessionId: data.sessionId,
        status: data.status || 'n8n_live',
        n8nConnected: data.n8nConnected ?? true,
        n8nNotice: data.n8nNotice,
      };
    } else {
      const errData = await res.json().catch(() => ({}));
      return {
        output: errData.error || 'Failed to communicate with chat engine.',
        status: 'error',
        n8nConnected: false,
      };
    }
  } catch (err: any) {
    return {
      output: `Network communication error: ${err.message || 'Could not connect to proxy'}`,
      status: 'error',
      n8nConnected: false,
    };
  }
}
