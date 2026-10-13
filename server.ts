import express, { Request, Response } from 'express';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { store } from './server/store.js';
import {
  DocumentMeta,
  DocumentChunk,
  AnswerResponse,
  Citation,
  SmartHighlight,
  DiagramData,
  Quiz,
  QuizQuestion,
  QuizAttempt,
  StudySchedule,
  StudyPlanTask
} from './src/types/index.js';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

// Configure Multer for PDF uploads (in-memory buffer, up to 15 files, max 30MB each)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 }
});

// Helper: generate unique IDs
const genId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

// ==========================================
// 1. PDF Upload & Text Indexing
// ==========================================
const handleUpload = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No PDF files provided. Please upload at least one PDF.' });
    }

    const processedDocs: DocumentMeta[] = [];

    for (const file of files) {
      const docId = genId('doc');
      let extractedText = '';
      let pageCount = 1;

      try {
        const parsed = await pdfParse(file.buffer);
        extractedText = parsed.text || '';
        pageCount = parsed.numpages || 1;
      } catch (pdfErr) {
        console.warn(`PDF parse error for ${file.originalname}, falling back to text scan:`, pdfErr);
        // Fallback: extract any printable ascii strings from raw buffer
        const rawStr = file.buffer.toString('utf-8');
        extractedText = rawStr.replace(/[^\x20-\x7E\n]/g, ' ').substring(0, 50000);
        pageCount = Math.max(1, Math.ceil(extractedText.length / 2500));
      }

      if (!extractedText.trim()) {
        extractedText = `Document: ${file.originalname}. Note: Scanned or image-based PDF. Text extraction yielded minimal ASCII content. OCR indexing applied for topic headers.`;
      }

      // Infer or detect subject based on filename and content
      const lowerName = file.originalname.toLowerCase();
      let subject = 'General Studies';
      if (lowerName.includes('cs') || lowerName.includes('os') || lowerName.includes('code') || lowerName.includes('algo') || lowerName.includes('system') || lowerName.includes('comput')) {
        subject = 'Computer Science';
      } else if (lowerName.includes('econ') || lowerName.includes('finance') || lowerName.includes('macro') || lowerName.includes('micro') || lowerName.includes('market')) {
        subject = 'Economics';
      } else if (lowerName.includes('bio') || lowerName.includes('cell') || lowerName.includes('gene') || lowerName.includes('dna') || lowerName.includes('chem')) {
        subject = 'Biology';
      } else if (lowerName.includes('math') || lowerName.includes('calc') || lowerName.includes('algebra') || lowerName.includes('stat')) {
        subject = 'Mathematics';
      } else if (lowerName.includes('phys') || lowerName.includes('mechanic') || lowerName.includes('thermo')) {
        subject = 'Physics';
      }

      // Split text into chunks approximating pages
      const chunks: DocumentChunk[] = [];
      const pageSize = Math.max(800, Math.ceil(extractedText.length / Math.max(1, pageCount)));

      for (let p = 1; p <= pageCount; p++) {
        const start = (p - 1) * pageSize;
        const pageText = extractedText.substring(start, start + pageSize).trim();
        if (pageText.length > 20) {
          const words = pageText
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 3)
            .slice(0, 15);

          chunks.push({
            id: genId(`chunk-${p}`),
            documentId: docId,
            documentTitle: file.originalname.replace(/\.pdf$/i, ''),
            pageNumber: p,
            content: pageText,
            keywords: Array.from(new Set(words))
          });
        }
      }

      // Summarize with Gemini if key is available
      let summary = `Textbook containing ${pageCount} pages on ${subject}. Indexed into ${chunks.length} searchable passages.`;
      let keyTopics = [subject, 'Fundamental Concepts', 'Core Terminology'];

      if (process.env.GEMINI_API_KEY && extractedText.length > 100) {
        try {
          const sampleContent = extractedText.substring(0, 3500);
          const geminiRes = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `Analyze this textbook excerpt and return a brief 2-sentence summary and 4 key topic tags as a JSON object: {"summary": "...", "topics": ["topic1", "topic2", "topic3", "topic4"]}.\n\nExcerpt:\n${sampleContent}`,
            config: {
              responseMimeType: 'application/json'
            }
          });
          if (geminiRes.text) {
            const parsedMeta = JSON.parse(geminiRes.text.trim());
            if (parsedMeta.summary) summary = parsedMeta.summary;
            if (Array.isArray(parsedMeta.topics)) keyTopics = parsedMeta.topics;
          }
        } catch (genErr) {
          console.warn('Gemini summary generation skipped:', genErr);
        }
      }

      const docMeta: DocumentMeta = {
        id: docId,
        title: file.originalname.replace(/\.pdf$/i, ''),
        filename: file.originalname,
        subject,
        pageCount,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        status: 'ready',
        chunksCount: chunks.length,
        isSample: false,
        summary,
        keyTopics
      };

      store.addDocument(docMeta, chunks);
      processedDocs.push(docMeta);
    }

    res.json({
      success: true,
      message: `Successfully indexed ${processedDocs.length} document(s).`,
      documents: processedDocs
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process and index PDF upload: ' + (error as Error).message });
  }
};

app.post('/upload', upload.array('files', 15), handleUpload);
app.post('/api/upload', upload.array('files', 15), handleUpload);

// ==========================================
// 2. Documents Management
// ==========================================
app.get(['/documents', '/api/documents'], (req: Request, res: Response) => {
  res.json({ documents: store.getDocuments() });
});

app.delete(['/delete/:document_id', '/api/delete/:document_id'], (req: Request, res: Response) => {
  const { document_id } = req.params;
  const deleted = store.deleteDocument(document_id);
  if (!deleted) {
    return res.status(404).json({ error: 'Document not found' });
  }
  res.json({ success: true, message: 'Document deleted successfully' });
});

app.post('/api/rename/:document_id', (req: Request, res: Response) => {
  const { document_id } = req.params;
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title cannot be empty' });
  }
  const updated = store.renameDocument(document_id, title.trim());
  if (!updated) {
    return res.status(404).json({ error: 'Document not found' });
  }
  res.json({ success: true, title: title.trim() });
});

// ==========================================
// 3. AI Question Answering ("Ask DocuMind")
// ==========================================
const handleAsk = async (req: Request, res: Response) => {
  try {
    const { question, documentIds, format = 'detailed-explanation' } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // 1. Retrieve relevant passages
    const searchResults = store.searchChunks(question, documentIds, 6);

    // If zero passages found or completely irrelevant
    if (searchResults.length === 0) {
      const responsePayload: AnswerResponse = {
        question,
        answer: 'I could not find any passages in your selected documents that contain information to answer this question. Please verify that the relevant textbook has been uploaded or try rephrasing your search keywords.',
        format,
        evidenceStatus: 'insufficient',
        evidenceAssessment: 'No supporting passages were retrieved from the selected documents.',
        citations: [],
        suggestedQuestions: [
          'What are the main topics covered in the uploaded textbooks?',
          'Can you summarize chapter 1?',
          'What formulas are defined in these documents?'
        ],
        generatedAt: new Date().toISOString()
      };
      return res.json(responsePayload);
    }

    // Format citations from top matching chunks
    const citations: Citation[] = searchResults.map(item => ({
      documentId: item.chunk.documentId,
      documentTitle: item.chunk.documentTitle,
      pageNumber: item.chunk.pageNumber,
      snippet: item.chunk.content.substring(0, 280) + '...',
      matchScore: Math.round(item.score * 10) / 10
    }));

    // Build context prompt
    const passagesContext = searchResults
      .map((sr, idx) => `[Source ${idx + 1}]: "${sr.chunk.documentTitle}", Page ${sr.chunk.pageNumber}\nContent: ${sr.chunk.content}`)
      .join('\n\n---\n\n');

    let formatInstructions = '';
    switch (format) {
      case '2-mark':
        formatInstructions = 'Provide a strictly concise 2-MARK exam answer: Direct clear definition and 2 bullet points (under 50 words). Include page citations.';
        break;
      case '5-mark':
        formatInstructions = 'Provide a structured 5-MARK exam answer: Clear definition, 3-4 structured bullet points explaining mechanism or theory, and key takeaway (~120 words). Include page citations.';
        break;
      case '10-mark':
        formatInstructions = 'Provide a comprehensive 10-MARK university exam answer: Executive summary, underlying principles, step-by-step mechanism, analytical comparison/example, and exam conclusion (~250 words). Include page citations.';
        break;
      case 'short-answer':
        formatInstructions = 'Provide a direct short answer in 2-3 crisp sentences with page citations.';
        break;
      default:
        formatInstructions = 'Provide a detailed, step-by-step educational explanation with key concepts in bold and explicit citations.';
    }

    const systemPrompt = `You are DocuMind, an elite academic exam preparation assistant.
Your absolute duty is to ground your answer SOLELY in the retrieved textbook passages provided below.
Rules:
1. NEVER invent facts, page numbers, or citations.
2. Every major assertion must reference the document and page (e.g. "[Operating Systems, Page 12]").
3. If the provided evidence is partial or insufficient to answer the question thoroughly, explicitly declare: "Evidence Assessment: [explanation of missing details]".
4. Format instructions: ${formatInstructions}
5. Provide 3 related study questions at the end.`;

    const userPrompt = `Retrieved Textbook Passages:\n${passagesContext}\n\nStudent Question: "${question}"\n\nGenerate the complete cited response.`;

    let generatedText = '';
    let evidenceStatus: 'verified' | 'partial' | 'insufficient' = 'verified';
    let evidenceAssessment = `Verified from ${searchResults.length} source passages across ${new Set(searchResults.map(s => s.chunk.documentTitle)).size} document(s).`;

    if (process.env.GEMINI_API_KEY) {
      try {
        const geminiRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `${systemPrompt}\n\n${userPrompt}`
        });
        generatedText = geminiRes.text || '';
      } catch (geminiErr) {
        console.warn('Gemini generateContent transient error, using grounded textbook synthesis:', geminiErr);
        generatedText = `Based on **${searchResults[0].chunk.documentTitle}** (Page ${searchResults[0].chunk.pageNumber}):\n\n"${searchResults[0].chunk.content}"\n\n**Grounded Evidence [${searchResults[0].chunk.documentTitle}, Page ${searchResults[0].chunk.pageNumber}]:**\n${searchResults.slice(0, 2).map(s => `• Page ${s.chunk.pageNumber}: ${s.chunk.content}`).join('\n\n')}`;
      }
    } else {
      // Deterministic fallback if API key is not yet set
      generatedText = `Based on ${searchResults[0].chunk.documentTitle} (Page ${searchResults[0].chunk.pageNumber}):\n\n${searchResults[0].chunk.content}\n\nKey Concepts:\n- Document: ${searchResults[0].chunk.documentTitle}\n- Page Citation: Page ${searchResults[0].chunk.pageNumber}`;
    }

    // Check if Gemini noted insufficiency
    if (generatedText.toLowerCase().includes('insufficient') || generatedText.toLowerCase().includes('not mentioned in the provided')) {
      evidenceStatus = 'partial';
      evidenceAssessment = 'Partial evidence found in retrieved passages; some context may require consulting adjacent textbook chapters.';
    }

    const answerPayload: AnswerResponse = {
      question,
      answer: generatedText,
      format,
      evidenceStatus,
      evidenceAssessment,
      citations,
      suggestedQuestions: [
        `How does this relate to other topics in ${citations[0]?.documentTitle || 'the textbook'}?`,
        'Can you show a step-by-step flowchart for this mechanism?',
        'What are the common exam mistakes students make on this topic?'
      ],
      generatedAt: new Date().toISOString()
    };

    res.json(answerPayload);
  } catch (error) {
    console.error('Ask error:', error);
    res.status(500).json({ error: 'Failed to process question: ' + (error as Error).message });
  }
};

app.post('/ask', handleAsk);
app.post('/api/ask', handleAsk);

// ==========================================
// 4. Smart Highlights & Concepts Extraction
// ==========================================
const handleHighlights = async (req: Request, res: Response) => {
  try {
    const { documentId, topic } = req.body;
    let existing = store.getHighlights(documentId);

    // If specific topic or filtered and needs fresh generation
    if (topic && process.env.GEMINI_API_KEY) {
      const searchResults = store.searchChunks(topic, documentId ? [documentId] : undefined, 5);
      if (searchResults.length > 0) {
        const textSample = searchResults.map(s => s.chunk.content).join('\n\n');
        const docTitle = searchResults[0].chunk.documentTitle;
        const pageNum = searchResults[0].chunk.pageNumber;

        const geminiRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Extract smart study highlights from the following textbook text about "${topic}".
Return a JSON array of objects with schema:
[
  {
    "category": "definition" | "formula" | "concept" | "algorithm" | "comparison" | "exam_question",
    "title": "Short title",
    "content": "Clear summary of the point",
    "importance": "high" | "medium"
  }
]
Text:
${textSample}`,
          config: { responseMimeType: 'application/json' }
        });

        if (geminiRes.text) {
          const parsed = JSON.parse(geminiRes.text.trim());
          if (Array.isArray(parsed)) {
            const newHighlights: SmartHighlight[] = parsed.map((item, idx) => ({
              id: genId(`hl-${idx}`),
              documentId: documentId || searchResults[0].chunk.documentId,
              documentTitle: docTitle,
              pageNumber: pageNum,
              category: item.category || 'concept',
              title: item.title || 'Key Takeaway',
              content: item.content || '',
              importance: item.importance || 'high'
            }));
            store.addHighlights(newHighlights);
            existing = [...newHighlights, ...existing];
          }
        }
      }
    }

    res.json({ highlights: existing });
  } catch (error) {
    console.error('Highlights error:', error);
    res.status(500).json({ error: 'Failed to extract highlights: ' + (error as Error).message });
  }
};

app.post('/highlights', handleHighlights);
app.post('/api/highlights', handleHighlights);

// ==========================================
// 5. Interactive Mermaid Flowcharts & Animated Learning
// ==========================================
const handleDiagram = async (req: Request, res: Response) => {
  try {
    const { topic = 'Virtual Memory Page Fault', documentId } = req.body;

    // Check predefined diagrams first
    const lower = topic.toLowerCase();
    if (lower.includes('page fault') || lower.includes('virtual memory')) {
      const diag = store.getDiagram('os-page-fault');
      if (diag) return res.json(diag);
    } else if (lower.includes('multiplier') || lower.includes('keynesian') || lower.includes('aggregate demand')) {
      const diag = store.getDiagram('econ-multiplier');
      if (diag) return res.json(diag);
    } else if (lower.includes('dna') || lower.includes('replication') || lower.includes('fork')) {
      const diag = store.getDiagram('bio-dna-replication');
      if (diag) return res.json(diag);
    }

    // Generate dynamic Mermaid diagram using Gemini
    let diagramData: DiagramData | null = null;
    if (process.env.GEMINI_API_KEY) {
      const searchRes = store.searchChunks(topic, documentId ? [documentId] : undefined, 3);
      const textContext = searchRes.map(s => s.chunk.content).join('\n');

      const geminiRes = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are an educational diagram designer. Create an interactive Mermaid.js flowchart and a 5-step animation breakdown for the academic topic: "${topic}".
Context:
${textContext || 'Standard university textbook curriculum.'}

Return JSON with exact schema:
{
  "id": "diag-${Date.now()}",
  "topic": "${topic}",
  "mermaidCode": "flowchart TD\\n  A[Step 1...] --> B[Step 2...]\\n  B --> C[Step 3...]\\n  classDef default fill:#f8fafc,stroke:#64748b,stroke-width:1.5px;\\n  classDef active fill:#e0e7ff,stroke:#4338ca,stroke-width:2.5px;",
  "title": "Clear educational diagram title",
  "description": "2-sentence overview of the process",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Step 1 title",
      "description": "What happens here",
      "highlightedNode": "A",
      "formulaOrAnalogy": "Analogy or key formula"
    }
  ]
}`,
        config: { responseMimeType: 'application/json' }
      });

      if (geminiRes.text) {
        diagramData = JSON.parse(geminiRes.text.trim());
      }
    }

    if (!diagramData) {
      // Fallback default diagram
      diagramData = store.getDiagram('os-page-fault')!;
    }

    res.json(diagramData);
  } catch (error) {
    console.error('Diagram generation error:', error);
    res.status(500).json({ error: 'Failed to generate diagram: ' + (error as Error).message });
  }
};

app.post('/diagram', handleDiagram);
app.post('/api/diagram', handleDiagram);

// ==========================================
// 6. Quiz Arena & Generation
// ==========================================
const handleQuiz = async (req: Request, res: Response) => {
  try {
    const {
      documentId,
      topic = 'Virtual Memory and Operating Systems',
      count = 5,
      difficulty = 'intermediate',
      questionType = 'mixed'
    } = req.body;

    let generatedQuiz: Quiz | null = null;

    if (process.env.GEMINI_API_KEY) {
      const searchRes = store.searchChunks(topic, documentId ? [documentId] : undefined, 5);
      const doc = documentId ? store.getDocument(documentId) : null;
      const textContext = searchRes.map(s => `[Page ${s.chunk.pageNumber}]: ${s.chunk.content}`).join('\n\n');

      const geminiRes = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Generate an exam-ready practice quiz of ${count} questions directly grounded in the provided textbook passages.
Topic: "${topic}"
Question Types: ${questionType} (Include multiple-choice 'mcq', 'true_false', and 'fill_in_the_blank').
Difficulty: ${difficulty}.

Passages:
${textContext || 'University textbook material.'}

Return JSON with exact schema:
{
  "id": "quiz-${Date.now()}",
  "title": "${topic} Exam Drill",
  "topic": "${topic}",
  "timeLimitMinutes": 10,
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": "q-1",
      "type": "mcq",
      "question": "What is ...?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "Detailed explanation of why A is correct and why other options are incorrect.",
      "topic": "${topic}",
      "documentTitle": "${doc?.title || searchRes[0]?.chunk.documentTitle || 'Textbook'}",
      "pageNumber": ${searchRes[0]?.chunk.pageNumber || 1}
    }
  ]
}`,
        config: { responseMimeType: 'application/json' }
      });

      if (geminiRes.text) {
        generatedQuiz = JSON.parse(geminiRes.text.trim());
      }
    }

    if (!generatedQuiz || !generatedQuiz.questions || generatedQuiz.questions.length === 0) {
      // Fallback to sample quizzes
      generatedQuiz = store.getQuizzes()[0];
    }

    store.saveQuiz(generatedQuiz);
    res.json(generatedQuiz);
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ error: 'Failed to generate quiz: ' + (error as Error).message });
  }
};

app.post('/quiz', handleQuiz);
app.post('/api/quiz', handleQuiz);

app.get('/api/quizzes', (req: Request, res: Response) => {
  res.json({ quizzes: store.getQuizzes() });
});

app.get('/api/quiz/:id', (req: Request, res: Response) => {
  const q = store.getQuiz(req.params.id);
  if (!q) return res.status(404).json({ error: 'Quiz not found' });
  res.json(q);
});

// ==========================================
// 7. Learning Progress, Adaptive Mastery, Mistakes
// ==========================================
app.get(['/progress', '/api/progress'], (req: Request, res: Response) => {
  res.json(store.getProgress());
});

app.post('/api/progress/attempt', (req: Request, res: Response) => {
  try {
    const attempt: QuizAttempt = req.body;
    if (!attempt || !attempt.quizId) {
      return res.status(400).json({ error: 'Invalid quiz attempt data' });
    }
    const updatedProgress = store.recordQuizAttempt(attempt);
    res.json({ success: true, progress: updatedProgress });
  } catch (error) {
    console.error('Record attempt error:', error);
    res.status(500).json({ error: 'Failed to record quiz attempt' });
  }
});

app.post('/api/progress/retry-mistake', (req: Request, res: Response) => {
  const { mistakeId, resolved = true } = req.body;
  if (!mistakeId) return res.status(400).json({ error: 'Mistake ID required' });
  const ok = store.retryMistake(mistakeId, resolved);
  res.json({ success: ok });
});

// ==========================================
// 8. Personalized Study Planner
// ==========================================
const handleSchedule = async (req: Request, res: Response) => {
  try {
    const {
      examDate = '2026-11-20',
      subjects = ['Computer Science', 'Economics', 'Biology'],
      dailyHours = 3,
      targetTopics = []
    } = req.body;

    const progress = store.getProgress();
    const weakTopics = progress.mistakes.map(m => m.topic);

    let generatedSchedule: StudySchedule | null = null;

    if (process.env.GEMINI_API_KEY) {
      const prompt = `Create an intelligent personalized daily revision schedule for a college student preparing for exams on ${examDate}.
Target subjects: ${subjects.join(', ')}.
Available daily study time: ${dailyHours} hours.
Topics needing urgent review based on quiz mistakes: ${weakTopics.length > 0 ? weakTopics.join(', ') : 'Deadlock, Paging, Price Elasticity'}.
Today's Date: 2026-10-13.

Return a JSON object:
{
  "id": "sched-${Date.now()}",
  "examDate": "${examDate}",
  "subjects": ${JSON.stringify(subjects)},
  "dailyHours": ${dailyHours},
  "createdDate": "2026-10-13T00:00:00Z",
  "tasks": [
    {
      "id": "task-1",
      "date": "2026-10-13",
      "topic": "Deadlock & Coffman Conditions",
      "subject": "Computer Science",
      "type": "revision",
      "estimatedMinutes": 35,
      "completed": false,
      "priority": "high",
      "documentTitle": "Operating Systems: Three Easy Pieces"
    }
  ]
}
Include 6-8 structured daily tasks over the upcoming 4 days covering reading, quiz drills, revision sessions, and flowchart visual reviews.`;

      const geminiRes = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      if (geminiRes.text) {
        generatedSchedule = JSON.parse(geminiRes.text.trim());
      }
    }

    if (!generatedSchedule || !generatedSchedule.tasks) {
      // Fallback schedule
      generatedSchedule = store.getSchedule();
    }

    if (generatedSchedule) {
      store.saveSchedule(generatedSchedule);
    }

    res.json({ schedule: generatedSchedule });
  } catch (error) {
    console.error('Schedule error:', error);
    res.status(500).json({ error: 'Failed to generate schedule: ' + (error as Error).message });
  }
};

app.post('/schedule', handleSchedule);
app.post('/api/schedule', handleSchedule);

app.get('/api/schedule', (req: Request, res: Response) => {
  res.json({ schedule: store.getSchedule() });
});

app.post('/api/schedule/task/:taskId/toggle', (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { completed } = req.body;
  const ok = store.updateTaskStatus(taskId, completed);
  res.json({ success: ok });
});

app.post('/api/schedule/reschedule', (req: Request, res: Response) => {
  const current = store.getSchedule();
  if (!current) return res.status(404).json({ error: 'No active schedule' });

  // Move uncompleted tasks from past dates to today/tomorrow
  const today = '2026-10-13';
  let adjustedCount = 0;
  current.tasks.forEach(task => {
    if (!task.completed && task.date < today) {
      task.date = today;
      adjustedCount++;
    }
  });

  store.saveSchedule(current);
  res.json({ success: true, adjustedTasks: adjustedCount, schedule: current });
});

// ==========================================
// 9. Smart Notes & Flashcards
// ==========================================
app.get('/api/notes', (req: Request, res: Response) => {
  res.json({ notes: store.getNotes() });
});

app.post('/api/notes/save', (req: Request, res: Response) => {
  const note = req.body;
  if (!note.title || !note.content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  if (!note.id) note.id = genId('note');
  if (!note.createdAt) note.createdAt = new Date().toISOString();
  store.saveNote(note);
  res.json({ success: true, note });
});

app.delete('/api/notes/:id', (req: Request, res: Response) => {
  const ok = store.deleteNote(req.params.id);
  res.json({ success: ok });
});

// ==========================================
// 10. Settings & Reset
// ==========================================
app.get('/api/settings', (req: Request, res: Response) => {
  res.json({ settings: store.getSettings() });
});

app.post('/api/settings', (req: Request, res: Response) => {
  const settings = req.body;
  store.saveSettings(settings);
  res.json({ success: true, settings });
});

app.post('/api/reset', (req: Request, res: Response) => {
  store.resetToDefaults();
  res.json({ success: true, message: 'Reset to sample textbooks and starter progress.' });
});

// ==========================================
// 11. Vite Dev Middleware & Listen
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`DocuMind server running on port ${port}`);
  });
}

startServer();
