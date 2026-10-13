import React from 'react';
import { X, BookOpen, ExternalLink, Check, Copy } from 'lucide-react';
import { Citation } from '../types/index.js';

interface SourcePassageModalProps {
  citation: Citation | null;
  onClose: () => void;
}

export const SourcePassageModal: React.FC<SourcePassageModalProps> = ({ citation, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!citation) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(citation.snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 truncate max-w-md">
                {citation.documentTitle}
              </h3>
              <p className="text-xs text-slate-500">
                Verified Citation · Page {citation.pageNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Primary Textbook Evidence</span>
            {citation.matchScore && (
              <span className="font-mono">Relevance Score: {citation.matchScore}</span>
            )}
          </div>

          <div className="p-4 rounded-lg bg-amber-50/60 border border-amber-200/60 text-slate-800 text-sm leading-relaxed font-serif">
            <span className="text-amber-800 font-mono text-xs block mb-1 font-sans font-medium">
              Exact Supporting Passage (Page {citation.pageNumber}):
            </span>
            "{citation.snippet}"
          </div>

          <div className="text-xs text-slate-500 leading-relaxed">
            <p>
              DocuMind grounds all generated answers directly in this textbook passage. Page numbers reflect the official pagination extracted from the indexed PDF.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded border border-slate-300 bg-white transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Passage'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
