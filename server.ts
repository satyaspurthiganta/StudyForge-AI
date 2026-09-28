import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import multer from 'multer';
import mammoth from 'mammoth';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper function to extract text from buffer
async function extractTextFromUploadedFile(file: Express.Multer.File): Promise<string> {
  const mimeType = file.mimetype;
  const originalName = file.originalname.toLowerCase();

  if (mimeType.includes('text') || originalName.endsWith('.txt') || originalName.endsWith('.md')) {
    return file.buffer.toString('utf-8');
  }

  if (
    mimeType.includes('wordprocessingml') ||
    mimeType.includes('msword') ||
    originalName.endsWith('.docx')
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return result.value;
    } catch (err) {
      console.error('Mammoth docx extraction error:', err);
    }
  }

  // If PDF or PPTX, try Gemini multimodal extraction if available, or text string extraction
  if (originalName.endsWith('.pdf') || mimeType === 'application/pdf') {
    try {
      if (process.env.GEMINI_API_KEY) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              inlineData: {
                data: file.buffer.toString('base64'),
                mimeType: 'application/pdf',
              },
            },
            {
              text: 'Extract and transcribe all readable text, modules, chapters, formulas, definitions, and concepts from this academic study document. Output clean, raw text only.',
            },
          ],
        });
        if (response.text) return response.text;
      }
    } catch (pdfErr) {
      console.warn('Gemini PDF transcription fallback:', pdfErr);
    }

    // Fallback: extract ASCII strings from PDF buffer
    const raw = file.buffer.toString('latin1');
    const matches = raw.match(/[a-zA-Z0-9.,;:?!'’"()\-_\n\r\t ]{4,}/g);
    if (matches && matches.length > 0) {
      return matches.join(' ');
    }
  }

  // Generic fallback for other documents
  const textMatches = file.buffer.toString('latin1').match(/[a-zA-Z0-9 .,!?:;'\-\n]{4,}/g);
  return textMatches ? textMatches.join(' ') : file.buffer.toString('utf-8');
}

// 1. Upload & Extract Text API
app.post('/api/extract-text', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const text = await extractTextFromUploadedFile(req.file);
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

    // Detect topics/modules quickly using regex or Gemini
    const detectedTopics: string[] = ['Entire Material'];
    const lines = text.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (
        /^(module|chapter|unit|section|part|\d+\.\d+|\b[A-Z\s]{4,}\b)/i.test(trimmed) &&
        trimmed.length > 3 &&
        trimmed.length < 60
      ) {
        const cleaned = trimmed.replace(/^[#=*-]+\s*/, '');
        if (!detectedTopics.includes(cleaned) && detectedTopics.length < 15) {
          detectedTopics.push(cleaned);
        }
      }
    }

    res.json({
      text,
      wordCount,
      detectedTopics,
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype || 'application/octet-stream',
    });
  } catch (error: any) {
    console.error('Error processing upload:', error);
    res.status(500).json({ error: error.message || 'Failed to extract text from document' });
  }
});

// 2. Detect Topics API
app.post('/api/detect-topics', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text content is required' });
    }

    const sample = text.slice(0, 15000);
    const prompt = `You are an academic curriculum analyzer for StudyForge AI.
Analyze the following study material text and identify the key modules, chapters, and topics covered in it.
Extract 6 to 12 distinct, clear topics that a student would want to study or take a quiz on.
Return a clean JSON array of strings containing the topic titles.

Study Material Sample:
${sample}
`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return res.json({ topics: ['Entire Material', ...parsed] });
      }
    } catch (genError) {
      console.warn('Gemini topic extraction fallback:', genError);
    }

    // Heuristic fallback
    const topics = ['Entire Material'];
    const lines = text.split('\n');
    for (const line of lines) {
      const match = line.match(/(?:module|chapter|unit|\d+\.\d+)\s*[:.-]?\s*([a-zA-Z0-9 &()\-]+)/i);
      if (match && match[1]) {
        const topic = match[0].trim();
        if (!topics.includes(topic) && topics.length < 10) topics.push(topic);
      }
    }
    if (topics.length === 1) {
      topics.push('Key Definitions & Concepts', 'Core Principles', 'Practical Applications', 'Summary & Review');
    }
    res.json({ topics });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to detect topics' });
  }
});

// 3. Generate Notes API (Strictly Grounded)
app.post('/api/generate-notes', async (req, res) => {
  try {
    const { studyMaterial, topic, scopeType } = req.body;
    if (!studyMaterial) {
      return res.status(400).json({ error: 'Study material is required' });
    }

    // Truncate safely if super large
    const materialExcerpt = studyMaterial.slice(0, 45000);

    const prompt = `You are the study notes generator for StudyForge AI.
CRITICAL GROUNDING DIRECTIVE:
You must strictly base all generated notes on the provided study material.
Do NOT invent information that is not present in the user's study material.
If the student asks to study a topic that is NOT present or covered in the provided study material, you MUST set "grounded": false and provide the exact message:
"This topic was not found in your uploaded study material. Please choose another topic or upload relevant material."

STUDENT'S REQUESTED TOPIC: "${topic || 'Entire Material'}"
SCOPE: "${scopeType || 'topic'}"

PROVIDED STUDY MATERIAL:
"""
${materialExcerpt}
"""

If the topic IS found in the material (or if topic is "Entire Material"):
Generate concise, well-structured, understandable study notes containing:
1. Topic overview (clear 2-3 paragraph summary)
2. Important definitions with context
3. Key concepts with explanations and practical examples
4. Formulas, rules, or algorithms where applicable
5. Differences/comparisons (structured as table headers and rows)
6. Exam-focused points (key points students must remember for exams)
7. Common mistakes or confusing concepts to watch out for
8. Quick revision summary

Return JSON matching this exact structure:
{
  "grounded": true,
  "topic": string,
  "overview": string,
  "definitions": [
    { "term": string, "definition": string, "context": string }
  ],
  "keyConcepts": [
    { "title": string, "explanation": string, "example": string }
  ],
  "formulasOrRules": [
    { "name": string, "formula": string, "explanation": string }
  ],
  "comparisons": [
    {
      "title": string,
      "headers": [string, string, ...],
      "rows": [[string, string, ...], ...]
    }
  ],
  "examFocusPoints": [string, ...],
  "commonMistakes": [string, ...],
  "revisionSummary": string
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      if (parsed.grounded === false) {
        return res.json({
          grounded: false,
          notGroundedMessage:
            parsed.notGroundedMessage ||
            'This topic was not found in your uploaded study material. Please choose another topic or upload relevant material.',
        });
      }
      return res.json({
        ...parsed,
        id: 'notes-' + Date.now(),
        generatedAt: new Date().toISOString(),
      });
    }

    res.status(500).json({ error: 'Empty response from model' });
  } catch (error: any) {
    console.error('Error generating notes:', error);
    res.status(500).json({ error: error.message || 'Failed to generate study notes' });
  }
});

// 4. Generate Quiz API (Strictly Grounded MCQs)
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const {
      studyMaterial,
      topic,
      questionCount = 10,
      difficulty = 'medium',
      allowMultipleCorrect = false,
      isExamMode = false,
    } = req.body;

    if (!studyMaterial) {
      return res.status(400).json({ error: 'Study material is required' });
    }

    const materialExcerpt = studyMaterial.slice(0, 45000);

    const prompt = `You are the quiz master for StudyForge AI.
CRITICAL GROUNDING DIRECTIVE:
Generate multiple-choice questions (MCQs) STRICTLY from the selected topic and provided study material.
Do NOT invent information that is not present in the user's study material.
If the topic "${topic}" is not present in the study material, set "grounded": false and return:
"This topic was not found in your uploaded study material. Please choose another topic or upload relevant material."

STUDENT CONFIGURATION:
- Topic: "${topic || 'Entire Material'}"
- Number of Questions: ${questionCount}
- Difficulty: ${difficulty} (Easy = recall/definitions, Medium = conceptual understanding, Hard = problem solving & edge cases, Mixed = balanced mix)
- Multiple-Correct: ${allowMultipleCorrect ? 'Allowed' : 'Single correct answer only'}
- Exam Mode: ${isExamMode}

CRITICAL MCQ RULES:
1. Each question must have exactly 4 options labeled A, B, C, D.
2. Questions must test understanding, definitions, concept application, important facts, differences, and problem-solving based directly on the text.
3. Wrong options must be realistic and plausible distractors based on related concepts in the material (no silly or giveaway options).
4. Provide a clear explanation for why the correct answer is right and why the distractors are wrong.
5. Provide a "sourceReference" indicating the module, section, or concept in the study material from which this question was drawn.
6. Provide a "topicCategory" such as "Definitions", "Concepts", "Applications", "Comparison", or "Complexity Analysis".
7. Provide a concise helpful "hint" (especially valuable for Practice Mode).

STUDY MATERIAL:
"""
${materialExcerpt}
"""

Return JSON in this format:
{
  "grounded": true,
  "topic": string,
  "questions": [
    {
      "id": "q1",
      "questionNumber": 1,
      "question": string,
      "options": [
        { "id": "A", "text": string },
        { "id": "B", "text": string },
        { "id": "C", "text": string },
        { "id": "D", "text": string }
      ],
      "correctAnswer": "A", // or ["A", "C"] if multiple correct is requested
      "explanation": string,
      "topicCategory": string,
      "sourceReference": string,
      "hint": string
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      if (parsed.grounded === false) {
        return res.json({
          grounded: false,
          notGroundedMessage:
            parsed.notGroundedMessage ||
            'This topic was not found in your uploaded study material. Please choose another topic or upload relevant material.',
        });
      }

      // Ensure IDs and numbers are clean
      const questions = (parsed.questions || []).map((q: any, idx: number) => ({
        ...q,
        id: q.id || `q-${idx + 1}`,
        questionNumber: idx + 1,
      }));

      return res.json({
        grounded: true,
        topic: parsed.topic || topic,
        questions,
      });
    }

    res.status(500).json({ error: 'Failed to generate quiz questions' });
  } catch (error: any) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ error: error.message || 'Failed to generate quiz' });
  }
});

// 5. Generate Revision Notes for Weak Topics API
app.post('/api/generate-weak-notes', async (req, res) => {
  try {
    const { studyMaterial, weakTopics, previousMistakes } = req.body;
    if (!studyMaterial || !weakTopics || weakTopics.length === 0) {
      return res.status(400).json({ error: 'Study material and weak topics are required' });
    }

    const materialExcerpt = studyMaterial.slice(0, 40000);
    const mistakesSummary = (previousMistakes || [])
      .slice(0, 8)
      .map(
        (m: any, i: number) =>
          `Mistake ${i + 1}: Question: "${m.question}" | User chose: ${m.userAnswer} | Correct: ${m.correctAnswer} | Topic: ${m.topicCategory}`
      )
      .join('\n');

    const prompt = `You are the adaptive learning specialist for StudyForge AI.
The student took a quiz and demonstrated weaknesses in these specific topic areas:
${weakTopics.map((t: string) => `- ${t}`).join('\n')}

Their logged quiz mistakes:
${mistakesSummary || 'Missed conceptual and application questions in these topic areas.'}

STUDY MATERIAL:
"""
${materialExcerpt}
"""

Task:
Generate a high-impact, targeted Revision Note package focused strictly on fixing the student's weaknesses.
Address the root misconceptions, provide clear definitions, contrast commonly confused ideas, and highlight memory rules/exam tricks directly based on the study material.

Return JSON in this format:
{
  "grounded": true,
  "topic": "Targeted Revision: " + string,
  "overview": string,
  "definitions": [
    { "term": string, "definition": string, "context": string }
  ],
  "keyConcepts": [
    { "title": string, "explanation": string, "example": string }
  ],
  "formulasOrRules": [
    { "name": string, "formula": string, "explanation": string }
  ],
  "comparisons": [
    {
      "title": string,
      "headers": [string, string, ...],
      "rows": [[string, string, ...], ...]
    }
  ],
  "examFocusPoints": [string, ...],
  "commonMistakes": [string, ...],
  "revisionSummary": string
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      return res.json({
        ...parsed,
        id: 'weak-notes-' + Date.now(),
        generatedAt: new Date().toISOString(),
      });
    }

    res.status(500).json({ error: 'Failed to generate weak topic revision notes' });
  } catch (error: any) {
    console.error('Error generating weak notes:', error);
    res.status(500).json({ error: error.message || 'Failed to generate revision notes' });
  }
});

// 6. Ask Your Material (AI Chat grounded in study material)
app.post('/api/ask-material', async (req, res) => {
  try {
    const { studyMaterial, question, chatHistory = [] } = req.body;
    if (!studyMaterial || !question) {
      return res.status(400).json({ error: 'Study material and question are required' });
    }

    const materialExcerpt = studyMaterial.slice(0, 45000);
    const historyContext = (chatHistory || [])
      .slice(-6)
      .map((m: any) => `${m.role === 'user' ? 'Student' : 'StudyForge AI'}: ${m.content}`)
      .join('\n');

    const prompt = `You are "Ask Your Material" - an academic study assistant for StudyForge AI.
CRITICAL GROUNDING DIRECTIVE:
1. Answer the student's question PRIMARILY using the provided study material.
2. If the student's question cannot be answered from the study material, explicitly state:
"Note: This specific detail is not found in your uploaded study material, but here is the general academic explanation..." and clearly distinguish external knowledge from what is in their material.
3. Be clear, encouraging, structured, and student-focused. Use bullet points and bold terms for key concepts.
4. If citations or section references are present in the text, cite them (e.g., "[From Module 2, Section 2.1]").

STUDY MATERIAL:
"""
${materialExcerpt}
"""

RECENT CONVERSATION HISTORY:
${historyContext}

STUDENT QUESTION: "${question}"

Provide a comprehensive, pedagogical answer. At the very end of your response, on a new line, include a JSON-like tag:
[METADATA: {"grounded": true or false, "citations": ["Module X Section Y", ...]}]
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const fullText = response.text || '';
    let answerText = fullText;
    let grounded = true;
    let citations: string[] = [];

    const metaMatch = fullText.match(/\[METADATA:\s*({.*?})\]/s);
    if (metaMatch) {
      answerText = fullText.replace(metaMatch[0], '').trim();
      try {
        const meta = JSON.parse(metaMatch[1]);
        grounded = meta.grounded !== false;
        citations = meta.citations || [];
      } catch (e) {
        // ignore parse error
      }
    }

    res.json({
      answer: answerText,
      grounded,
      citations,
    });
  } catch (error: any) {
    console.error('Error in ask-material:', error);
    res.status(500).json({ error: error.message || 'Failed to answer question' });
  }
});

// N8N Webhook Status Check
app.get('/api/n8n-status', async (req, res) => {
  try {
    const rawUrl = (req.query.url as string) || 'https://satyaspurthiganta.app.n8n.cloud/webhook/0647e95d-de4d-48e3-98ba-4a68f442c81a/chat';
    const cleanUrl = rawUrl.trim();

    // Check production URL
    const prodUrl = cleanUrl.replace('/webhook-test/', '/webhook/');
    const testUrl = cleanUrl.replace('/webhook/', '/webhook-test/');

    let isLive = false;
    let activeMode: 'production' | 'test' | 'inactive' = 'inactive';
    let detailMessage = '';

    const [prodResult, testResult] = await Promise.allSettled([
      fetch(prodUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatInput: 'ping', action: 'loadPreviousSession' }),
        signal: AbortSignal.timeout(2500),
      }),
      fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatInput: 'ping', action: 'loadPreviousSession' }),
        signal: AbortSignal.timeout(2500),
      }),
    ]);

    if (prodResult.status === 'fulfilled' && prodResult.value.status === 200) {
      isLive = true;
      activeMode = 'production';
      detailMessage = 'Production webhook is Active and responding';
    } else if (testResult.status === 'fulfilled' && testResult.value.status === 200) {
      isLive = true;
      activeMode = 'test';
      detailMessage = 'Test webhook is listening (execute workflow mode)';
    } else {
      isLive = false;
      activeMode = 'inactive';
      detailMessage = 'Workflow is in standby mode. Toggle to Active in n8n Cloud.';
    }

    res.json({
      isLive,
      activeMode,
      detailMessage,
      checkedUrl: activeMode === 'test' ? testUrl : prodUrl,
      help: isLive
        ? 'Connected to your n8n cloud workflow!'
        : 'In n8n Cloud editor, toggle the Active switch at the top-right to ON.',
    });
  } catch (err: any) {
    res.status(500).json({ isLive: false, error: err.message });
  }
});

// N8N Webhook Chat Proxy Endpoint
app.post('/api/n8n-chat', async (req, res) => {
  try {
    const {
      message,
      sessionId,
      webhookUrl = 'https://satyaspurthiganta.app.n8n.cloud/webhook/0647e95d-de4d-48e3-98ba-4a68f442c81a/chat',
      context = '',
    } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const payload = {
      chatInput: message,
      message: message,
      sessionId: sessionId || 'studyforge-session-' + Date.now(),
      action: 'sendMessage',
      context: context || undefined,
    };

    const targetUrl = webhookUrl.trim();
    let n8nSuccess = false;
    let n8nOutput = '';
    let n8nRawNotice: any = null;

    // 1. Try calling the primary n8n target URL
    try {
      const n8nResponse = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      });

      const responseText = await n8nResponse.text();
      let responseData: any;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { text: responseText };
      }

      if (n8nResponse.ok && n8nResponse.status === 200) {
        n8nSuccess = true;
        if (typeof responseData === 'string') {
          n8nOutput = responseData;
        } else if (responseData.output) {
          n8nOutput = typeof responseData.output === 'string' ? responseData.output : JSON.stringify(responseData.output);
        } else if (responseData.text) {
          n8nOutput = responseData.text;
        } else if (responseData.response) {
          n8nOutput = responseData.response;
        } else if (responseData.message) {
          n8nOutput = responseData.message;
        } else if (Array.isArray(responseData) && responseData.length > 0) {
          n8nOutput = responseData[0].output || responseData[0].text || JSON.stringify(responseData[0]);
        } else {
          n8nOutput = JSON.stringify(responseData);
        }
      } else {
        n8nRawNotice = responseData;
      }
    } catch (primaryErr: any) {
      console.warn('Primary n8n fetch error:', primaryErr.message);
    }

    // 2. If primary failed and URL has /webhook/, try test webhook if it might be running
    if (!n8nSuccess && targetUrl.includes('/webhook/')) {
      const testUrl = targetUrl.replace('/webhook/', '/webhook-test/');
      try {
        const testRes = await fetch(testUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(4000),
        });

        if (testRes.ok && testRes.status === 200) {
          const testText = await testRes.text();
          let testData: any;
          try {
            testData = JSON.parse(testText);
          } catch (e) {
            testData = { text: testText };
          }
          n8nSuccess = true;
          n8nOutput = testData.output || testData.text || testData.response || testText;
        }
      } catch (testErr: any) {
        // ignore test url error
      }
    }

    // 3. Return the real n8n response if successful
    if (n8nSuccess && n8nOutput.trim().length > 0) {
      return res.json({
        output: n8nOutput,
        sessionId: payload.sessionId,
        status: 'n8n_live',
        n8nConnected: true,
      });
    }

    // 4. SMART RESOLUTION: If n8n workflow is currently in standby / inactive,
    // ALWAYS provide a comprehensive, intelligent academic answer using Gemini AI
    // so the student is NEVER blocked or presented with a broken chat experience.
    const studyAssistantPrompt = `You are StudyForge AI Assistant (acting on behalf of the student's connected study agent).
The student asked the following question:
"${message}"

${context ? `Here is the relevant Study Context & Documents from their workspace:\n${context}\n` : ''}

INSTRUCTIONS:
1. Provide a direct, highly informative, student-friendly answer to the student's question.
2. Structure your response with clear headings, bullet points, and code/math snippets where relevant.
3. Be clear, encouraging, and academically thorough.
4. If study documents were provided above, reference concepts and terminology from them.`;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: studyAssistantPrompt,
    });

    const fallbackAnswer =
      aiResponse.text ||
      'I have processed your query based on your study materials. Please feel free to ask follow-up questions or request specific examples.';

    return res.json({
      output: fallbackAnswer,
      sessionId: payload.sessionId,
      status: 'active_with_fallback',
      n8nConnected: false,
      n8nNotice: {
        message: 'n8n workflow is currently in standby mode (inactive in Cloud).',
        hint: 'To route responses 100% through your custom n8n canvas nodes, toggle the workflow switch to "Active" in your n8n cloud dashboard.',
        webhookUrl: targetUrl,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/n8n-chat:', error);
    res.status(500).json({ error: error.message || 'Failed to communicate with chat engine' });
  }
});

// Mount Vite or serve static files
async function setupServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`StudyForge AI server listening on http://localhost:${PORT}`);
  });
}

setupServer();
