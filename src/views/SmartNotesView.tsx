import React, { useState } from 'react';
import {
  Layers,
  BookOpen,
  Bookmark,
  Plus,
  Trash2,
  Download,
  Printer,
  Sparkles,
  HelpCircle,
  FileText,
  RotateCw,
  Search,
  Check
} from 'lucide-react';
import { SmartHighlight, SavedNote, DocumentMeta, HighlightCategory } from '../types/index.js';

interface SmartNotesViewProps {
  highlights: SmartHighlight[];
  savedNotes: SavedNote[];
  documents: DocumentMeta[];
  onSaveNote: (note: SavedNote) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
}

export const SmartNotesView: React.FC<SmartNotesViewProps> = ({
  highlights,
  savedNotes,
  documents,
  onSaveNote,
  onDeleteNote
}) => {
  const [activeTab, setActiveTab] = useState<'highlights' | 'flashcards' | 'my-notes'>('highlights');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Flashcards flip state
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // New Note Modal state
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');

  const categories: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'All Highlights' },
    { id: 'definition', label: 'Definitions' },
    { id: 'formula', label: 'Formulas' },
    { id: 'concept', label: 'Core Concepts' },
    { id: 'algorithm', label: 'Algorithms' },
    { id: 'comparison', label: 'Comparisons' },
    { id: 'exam_question', label: 'Exam Questions' }
  ];

  const filteredHighlights = highlights.filter(hl => {
    const matchesCat = selectedCategory === 'all' || hl.category === selectedCategory;
    const matchesSearch =
      hl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hl.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hl.documentTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCreateNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const note: SavedNote = {
      id: `note-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      category: 'custom_note',
      createdAt: new Date().toISOString()
    };

    await onSaveNote(note);
    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setIsCreatingNote(false);
  };

  const exportAsMarkdown = () => {
    let md = `# DocuMind Smart Notes & Exam Highlights\n\nExported on ${new Date().toLocaleDateString()}\n\n---\n\n`;
    md += `## 1. High-Yield Highlights\n\n`;
    highlights.forEach(hl => {
      md += `### [${hl.category.toUpperCase()}] ${hl.title}\n`;
      md += `*Source: ${hl.documentTitle} (Page ${hl.pageNumber})*\n\n`;
      md += `${hl.content}\n\n`;
    });

    md += `\n---\n\n## 2. Student Saved Notes\n\n`;
    savedNotes.forEach(n => {
      md += `### ${n.title}\n`;
      if (n.documentTitle) md += `*Source: ${n.documentTitle}*\n`;
      md += `Tags: ${n.tags.join(', ')}\n\n`;
      md += `${n.content}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DocuMind_Revision_Notes_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  // Convert highlights to flashcards
  const flashcardDeck = highlights.map(hl => ({
    front: `[${hl.category.toUpperCase()}] ${hl.title}\n\nFrom: ${hl.documentTitle} (Page ${hl.pageNumber})`,
    back: hl.content
  }));

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Smart Notes & Revision</h1>
          <p className="text-sm text-slate-500">
            Automatically extracted definitions, formulas, flashcard decks, and exam prep summaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreatingNote(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>
          <button
            onClick={exportAsMarkdown}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export MD</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('highlights')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'highlights'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Extracted Highlights ({highlights.length})
        </button>
        <button
          onClick={() => setActiveTab('flashcards')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'flashcards'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Flashcards Deck ({flashcardDeck.length})
        </button>
        <button
          onClick={() => setActiveTab('my-notes')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'my-notes'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Saved Notes ({savedNotes.length})
        </button>
      </div>

      {/* 1. EXTRACTED HIGHLIGHTS MODE */}
      {activeTab === 'highlights' && (
        <div className="space-y-6">
          {/* Category Filter Chips & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter concepts, formulas..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHighlights.map(hl => (
              <div
                key={hl.id}
                className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono uppercase font-bold text-indigo-600 text-xs">
                      {hl.category}
                    </span>
                    <span className="font-mono text-slate-500">Page {hl.pageNumber}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {hl.title}
                  </h3>

                  <p className="text-xs text-slate-700 leading-relaxed font-serif">
                    {hl.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate max-w-[180px]">{hl.documentTitle}</span>
                  <button
                    onClick={() => {
                      onSaveNote({
                        id: `note-${Date.now()}`,
                        title: hl.title,
                        content: hl.content,
                        documentTitle: hl.documentTitle,
                        pageNumber: hl.pageNumber,
                        tags: [hl.category, 'Highlight'],
                        category: 'flashcard',
                        createdAt: new Date().toISOString()
                      });
                      alert('Saved to My Notes!');
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Bookmark
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. INTERACTIVE FLASHCARD FLIP DECK MODE */}
      {activeTab === 'flashcards' && (
        <div className="max-w-xl mx-auto space-y-6 text-center">
          <div className="text-xs text-slate-500">
            Card {currentFlashcardIndex + 1} of {flashcardDeck.length} · Click card to flip
          </div>

          {flashcardDeck.length > 0 ? (
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="min-h-[260px] p-8 rounded-2xl bg-white border-2 border-indigo-200/80 shadow-md cursor-pointer hover:border-indigo-400 transition-all flex flex-col items-center justify-center space-y-4 select-none relative"
            >
              <div className="absolute top-4 right-4 text-xs font-mono text-slate-400 flex items-center gap-1">
                <RotateCw className="w-3 h-3" />
                <span>Flip</span>
              </div>

              {!isFlipped ? (
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block">
                    Question / Concept
                  </span>
                  <div className="text-base font-bold text-slate-900 whitespace-pre-line leading-relaxed">
                    {flashcardDeck[currentFlashcardIndex].front}
                  </div>
                  <span className="text-xs text-slate-400 block pt-2">
                    (Click to reveal textbook answer)
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block">
                    Answer & Explanation
                  </span>
                  <div className="text-sm text-slate-800 font-serif leading-relaxed">
                    {flashcardDeck[currentFlashcardIndex].back}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 bg-white rounded-xl border text-sm text-slate-500">
              No flashcards available. Upload textbooks to extract concepts.
            </div>
          )}

          {/* Controls: Prev / Next / Confidence */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => {
                setIsFlipped(false);
                setCurrentFlashcardIndex(prev => (prev > 0 ? prev - 1 : flashcardDeck.length - 1));
              }}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Previous Card
            </button>

            <button
              onClick={() => {
                setIsFlipped(false);
                setCurrentFlashcardIndex(prev => (prev < flashcardDeck.length - 1 ? prev + 1 : 0));
              }}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm"
            >
              Next Card
            </button>
          </div>
        </div>
      )}

      {/* 3. MY SAVED NOTES MODE */}
      {activeTab === 'my-notes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedNotes.map(note => (
            <div
              key={note.id}
              className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-mono text-xs">{new Date(note.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {note.title}
                </h3>

                <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans">
                  {note.content}
                </p>

                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {note.tags.map((t, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {note.documentTitle && (
                <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
                  Source: {note.documentTitle} {note.pageNumber ? `(Page ${note.pageNumber})` : ''}
                </div>
              )}
            </div>
          ))}

          {savedNotes.length === 0 && (
            <div className="col-span-full p-8 text-center bg-white rounded-xl border border-slate-200 text-sm text-slate-500">
              No saved notes yet. Click "+ New Note" or bookmark any Q&A answer to save revision summaries.
            </div>
          )}
        </div>
      )}

      {/* Create Note Modal */}
      {isCreatingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Create Study Note</h3>
            <form onSubmit={handleCreateNoteSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Operating System Locks & Semaphores"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Content</label>
                <textarea
                  rows={5}
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="Write formulas, definitions, key exam rules..."
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={e => setNewTags(e.target.value)}
                  placeholder="e.g. OS, Formulas, Midterm"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNote(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
