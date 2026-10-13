import React, { useState } from 'react';
import { X, Edit3 } from 'lucide-react';
import { DocumentMeta } from '../types/index.js';

interface RenameDocModalProps {
  document: DocumentMeta | null;
  onClose: () => void;
  onRename: (id: string, newTitle: string) => Promise<void>;
}

export const RenameDocModal: React.FC<RenameDocModalProps> = ({ document, onClose, onRename }) => {
  const [title, setTitle] = useState(document?.title || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!document) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title cannot be empty');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onRename(document.id, title.trim());
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to rename document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-semibold text-slate-900">Rename Textbook</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Document Display Title
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              placeholder="e.g. Operating Systems: Three Easy Pieces"
              autoFocus
            />
            <p className="mt-1 text-xs text-slate-500">
              Original file: {document.filename}
            </p>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? 'Saving...' : 'Save Title'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
