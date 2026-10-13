import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  BookmarkPlus,
  ExternalLink,
  HelpCircle,
  ChevronRight,
  Filter
} from 'lucide-react';
import { DocumentMeta, AnswerResponse, Citation, AnswerFormat } from '../types/index.js';
import { SourcePassageModal } from '../components/SourcePassageModal.js';

interface AskDocuMindViewProps {
  documents: DocumentMeta[];
  selectedDocId?: string;
  onSaveToNotes: (title: string, content: string, docTitle?: string, pageNum?: number) => void;
}

export const AskDocuMindView: React.FC<AskDocuMindViewProps> = ({
  documents,
  selectedDocId,
  onSaveToNotes
}) => {
  const [question, setQuestion] = useState('');
  const [targetDocId, setTargetDocId] = useState<string>(selectedDocId || 'all');
  const [format, setFormat] = useState<AnswerFormat>('detailed-explanation');
  const [loading, setLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<AnswerResponse | null>(null);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedNoteSuccess, setSavedNoteSuccess] = useState(false);

  const samplePrompts = [
    { text: 'Explain the 4 Coffman conditions for deadlock in operating systems.', doc: 'doc-os-ostep' },
    { text: 'How does the Keynesian multiplier work when MPC = 0.8?', doc: 'doc-econ-principles' },
    { text: 'Why is the lagging strand synthesized discontinuously in DNA replication?', doc: 'doc-bio-molecular' },
    { text: 'What happens during a Page Fault kernel trap?', doc: 'doc-os-ostep' }
  ];

  const handleAsk = async (promptToUse?: string) => {
    const q = promptToUse || question;
    if (!q.trim()) return;

    setLoading(true);
    setCurrentResponse(null);
    setSavedNoteSuccess(false);

    try {
      const docIds = targetDocId === 'all' ? undefined : [targetDocId];
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q.trim(),
          documentIds: docIds,
          format
        })
      });

      if (!res.ok) {
        throw new Error('Server error while answering question');
      }

      const data: AnswerResponse = await res.json();
      setCurrentResponse(data);
    } catch (err) {
      alert('Failed to generate answer: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!currentResponse) return;
    navigator.clipboard.writeText(currentResponse.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNote = () => {
    if (!currentResponse) return;
    const firstCit = currentResponse.citations[0];
    onSaveToNotes(
      `Q&A: ${currentResponse.question.substring(0, 50)}...`,
      currentResponse.answer,
      firstCit?.documentTitle,
      firstCit?.pageNumber
    );
    setSavedNoteSuccess(true);
    setTimeout(() => setSavedNoteSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* View Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ask DocuMind</h1>
        <p className="text-sm text-slate-500">
          Search across all uploaded textbooks. Every answer is strictly grounded with source page citations.
        </p>
      </div>

      {/* Query Formulation Console */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        {/* Controls Bar: Document Scope & Format */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          {/* Document Scope Selector */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700 whitespace-nowrap">Textbook Scope:</span>
            <select
              value={targetDocId}
              onChange={e => setTargetDocId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="all">Search Across All Uploaded Books ({documents.length})</option>
              {documents.map(d => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.pageCount} pgs)
                </option>
              ))}
            </select>
          </div>

          {/* Exam Mark / Format Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="font-medium text-slate-700 whitespace-nowrap mr-1">Exam Format:</span>
            {(
              [
                { id: '2-mark', label: '2-Mark' },
                { id: '5-mark', label: '5-Mark' },
                { id: '10-mark', label: '10-Mark' },
                { id: 'short-answer', label: 'Short' },
                { id: 'detailed-explanation', label: 'Detailed' }
              ] as const
            ).map(fmt => (
              <button
                key={fmt.id}
                onClick={() => setFormat(fmt.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  format === fmt.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input box */}
        <div className="relative">
          <textarea
            rows={3}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Ask anything about your textbooks (e.g. 'What is the function of the Translation Lookaside Buffer (TLB)?' or 'Derive the Keynesian Multiplier')..."
            className="w-full p-4 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-slate-900 resize-none"
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleAsk();
              }
            }}
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              Tip: Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border text-xs">Ctrl+Enter</kbd> to submit
            </span>

            <button
              onClick={() => handleAsk()}
              disabled={loading || !question.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Searching...' : 'Ask DocuMind'}</span>
            </button>
          </div>
        </div>

        {/* Suggested Prompts */}
        <div className="pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-500 font-medium block mb-2">
            High-Yield Exam Prompts to Test:
          </span>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuestion(p.text);
                  setTargetDocId(p.doc);
                  handleAsk(p.text);
                }}
                className="text-xs text-left px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
              >
                "{p.text}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State Indicator */}
      {loading && (
        <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900">
            Searching Library & Verifying Evidence
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Extracting page-level passages, comparing sources, and grounding answers strictly in retrieved text...
          </p>
        </div>
      )}

      {/* Response Card */}
      {currentResponse && !loading && (
        <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
          {/* Verification Banner */}
          <div
            className={`p-4 rounded-xl flex items-start gap-3 border ${
              currentResponse.evidenceStatus === 'verified'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : currentResponse.evidenceStatus === 'partial'
                ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                : 'bg-rose-50/70 border-rose-200 text-rose-900'
            }`}
          >
            {currentResponse.evidenceStatus === 'verified' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <div className="text-xs font-bold tracking-tight uppercase">
                Evidence Status: {currentResponse.evidenceStatus}
              </div>
              <p className="text-xs opacity-90 leading-relaxed">
                {currentResponse.evidenceAssessment}
              </p>
            </div>
          </div>

          {/* Formatted Answer Body */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="capitalize font-mono">Format: {currentResponse.format}</span>
              <span>Generated in compliance with academic grounding policy</span>
            </div>

            <div className="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed whitespace-pre-line font-sans">
              {currentResponse.answer}
            </div>
          </div>

          {/* Source Citations Section */}
          {currentResponse.citations.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Verified Textbook Citations ({currentResponse.citations.length}):
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentResponse.citations.map((cit, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-all space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 truncate max-w-[200px]">
                          {cit.documentTitle}
                        </span>
                        <span className="font-mono text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                          Page {cit.pageNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-3 font-serif italic">
                        "{cit.snippet}"
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveCitation(cit)}
                      className="self-start text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-2"
                    >
                      <span>Open Source Passage</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Footer: Save to Notes, Copy, Follow-ups */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Answer'}</span>
              </button>

              <button
                onClick={handleSaveNote}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>{savedNoteSuccess ? 'Saved to Notes!' : 'Save to Smart Notes'}</span>
              </button>
            </div>

            {currentResponse.suggestedQuestions && currentResponse.suggestedQuestions.length > 0 && (
              <div className="w-full pt-3 space-y-1.5">
                <span className="text-xs text-slate-500 font-medium block">
                  Suggested Follow-up Questions:
                </span>
                <div className="flex flex-col gap-1">
                  {currentResponse.suggestedQuestions.map((sq, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setQuestion(sq);
                        handleAsk(sq);
                      }}
                      className="text-xs text-left text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                    >
                      <ChevronRight className="w-3 h-3" />
                      <span>{sq}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Source Passage Modal */}
      {activeCitation && (
        <SourcePassageModal
          citation={activeCitation}
          onClose={() => setActiveCitation(null)}
        />
      )}
    </div>
  );
};
