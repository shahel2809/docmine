import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Search,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Filter,
  FileCheck
} from 'lucide-react';
import { DocumentMeta } from '../types/index.js';
import { RenameDocModal } from '../components/RenameDocModal.js';
import { ActiveTab } from '../components/Navbar.js';

interface LibraryViewProps {
  documents: DocumentMeta[];
  onUploadFiles: (files: File[]) => Promise<void>;
  onDeleteDocument: (id: string) => Promise<void>;
  onRenameDocument: (id: string, newTitle: string) => Promise<void>;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectDocumentForAsk: (docId: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  documents,
  onUploadFiles,
  onDeleteDocument,
  onRenameDocument,
  setActiveTab,
  onSelectDocumentForAsk
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [renamingDoc, setRenamingDoc] = useState<DocumentMeta | null>(null);
  const [selectedDocDetails, setSelectedDocDetails] = useState<DocumentMeta | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const subjects = ['All', 'Computer Science', 'Economics', 'Biology', 'General Studies'];

  const filteredDocs = documents.filter(doc => {
    const matchesSubject = selectedSubject === 'All' || doc.subject === selectedSubject;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.summary && doc.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSubject && matchesSearch;
  });

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const pdfFiles = Array.from(files).filter(f => f.name.toLowerCase().endsWith('.pdf'));

    if (pdfFiles.length === 0) {
      alert('Please upload PDF files.');
      return;
    }

    setUploading(true);
    setUploadProgressText(`Uploading and indexing ${pdfFiles.length} textbook(s)...`);

    try {
      await onUploadFiles(pdfFiles);
    } catch (err) {
      alert('Upload failed: ' + (err as Error).message);
    } finally {
      setUploading(false);
      setUploadProgressText('');
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Textbook Library</h1>
          <p className="text-sm text-slate-500">
            Upload up to 15 PDFs simultaneously. Full-text page indexing for precise citations.
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm self-start md:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload PDFs</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 scale-[1.005]'
            : 'border-slate-300 hover:border-slate-400 bg-white shadow-xs'
        }`}
      >
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-900">
              Drag & drop textbooks here, or browse files
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Supports simultaneous multi-file upload (up to 15 PDFs, 30MB each).
            </p>
          </div>
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-xs text-indigo-600 font-medium">
              <span className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span>{uploadProgressText}</span>
            </div>
          ) : (
            <div className="text-xs text-slate-400">
              Preserves page numbering and extracts text chunks for Q&A.
            </div>
          )}
        </div>
      </div>

      {/* Search & Subject Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Subject Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {subjects.map(subj => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedSubject === subj
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search books, topics..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map(doc => (
          <div
            key={doc.id}
            className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{doc.subject}</span>
                  {doc.isSample && (
                    <>
                      <span>·</span>
                      <span className="text-slate-400 font-mono">Sample Data</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setRenamingDoc(doc)}
                    title="Rename Document"
                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${doc.title}" from library?`)) {
                        onDeleteDocument(doc.id);
                      }
                    }}
                    title="Delete Document"
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">
                  {doc.filename}
                </p>
              </div>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {doc.summary || 'Indexed academic textbook ready for question answering.'}
              </p>

              {doc.keyTopics && doc.keyTopics.length > 0 && (
                <div className="text-xs text-slate-500 space-x-1">
                  <span className="font-medium text-slate-600">Topics:</span>
                  <span>{doc.keyTopics.slice(0, 3).join(', ')}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>{doc.pageCount} Pages ({doc.chunksCount} Passages)</span>
                <span className="text-emerald-700 font-sans font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ready</span>
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    onSelectDocumentForAsk(doc.id);
                    setActiveTab('ask');
                  }}
                  className="flex-1 py-1.5 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors text-center"
                >
                  Ask This Book
                </button>
                <button
                  onClick={() => setSelectedDocDetails(doc)}
                  className="py-1.5 px-3 text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                >
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredDocs.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-900">No textbooks found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No documents matched your search or filter. Try a different query or drag-and-drop a PDF textbook above.
            </p>
          </div>
        )}
      </div>

      {/* Document Details Modal */}
      {selectedDocDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">{selectedDocDetails.title}</h3>
              <button
                onClick={() => setSelectedDocDetails(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div>
                <span className="font-semibold text-slate-800">Filename:</span> {selectedDocDetails.filename}
              </div>
              <div>
                <span className="font-semibold text-slate-800">Subject:</span> {selectedDocDetails.subject}
              </div>
              <div>
                <span className="font-semibold text-slate-800">Pages Extracted:</span> {selectedDocDetails.pageCount}
              </div>
              <div>
                <span className="font-semibold text-slate-800">Passage Chunks:</span> {selectedDocDetails.chunksCount}
              </div>
              <div>
                <span className="font-semibold text-slate-800">File Size:</span> {(selectedDocDetails.fileSize / (1024 * 1024)).toFixed(2)} MB
              </div>
              <div>
                <span className="font-semibold text-slate-800">Indexed Summary:</span>
                <p className="mt-1 p-3 bg-slate-50 rounded-lg text-slate-700 leading-relaxed font-serif">
                  {selectedDocDetails.summary}
                </p>
              </div>
              {selectedDocDetails.keyTopics && (
                <div>
                  <span className="font-semibold text-slate-800">Key Indexed Topics:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedDocDetails.keyTopics.map((t, idx) => (
                      <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedDocDetails(null)}
                className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renamingDoc && (
        <RenameDocModal
          document={renamingDoc}
          onClose={() => setRenamingDoc(null)}
          onRename={onRenameDocument}
        />
      )}
    </div>
  );
};
