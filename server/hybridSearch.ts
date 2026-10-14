import { spawn } from 'child_process';
import path from 'path';
import type { DocumentChunk } from '../src/types/index.ts';

export interface SearchResultItem {
  chunk: DocumentChunk;
  score: number;
  highlightSnippet?: string;
  sourceType: 'fts5' | 'semantic' | 'hybrid';
  rankFts: number;
  rankSemantic: number;
}

export class HybridSearchEngine {
  private scriptPath: string;

  constructor() {
    this.scriptPath = path.resolve(process.cwd(), 'server', 'fts5_engine.py');
  }

  // Execute python FTS5 helper
  private async runFts5Command(action: string, inputData?: any, arg?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const args = [this.scriptPath, action];
      if (arg) args.push(arg);

      const py = spawn('python3', args);
      let stdout = '';
      let stderr = '';

      if (inputData) {
        py.stdin.write(JSON.stringify(inputData));
        py.stdin.end();
      }

      py.stdout.on('data', data => {
        stdout += data.toString();
      });

      py.stderr.on('data', data => {
        stderr += data.toString();
      });

      py.on('close', code => {
        if (code !== 0) {
          console.warn(`FTS5 script exited with code ${code}:`, stderr);
          return resolve(null);
        }
        try {
          const res = JSON.parse(stdout.trim());
          resolve(res);
        } catch (e) {
          resolve(null);
        }
      });
    });
  }

  // Initialize SQLite FTS5 table
  async initialize(): Promise<void> {
    await this.runFts5Command('init');
  }

  // Bulk index chunks into FTS5
  async indexChunks(chunks: DocumentChunk[]): Promise<void> {
    if (chunks.length === 0) return;
    await this.runFts5Command('add', { chunks });
  }

  // Delete document chunks from FTS5
  async deleteDocument(documentId: string): Promise<void> {
    await this.runFts5Command('delete', undefined, documentId);
  }

  // Semantic term overlap / cosine score calculator
  private calculateSemanticScore(query: string, content: string, keywords: string[]): number {
    const qTokens = query.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
    if (qTokens.length === 0) return 0;

    const contentLower = content.toLowerCase();
    let score = 0;

    // Phrase match
    if (contentLower.includes(query.toLowerCase())) {
      score += 15;
    }

    // Keyword match
    for (const token of qTokens) {
      if (keywords.some(k => k.toLowerCase().includes(token))) {
        score += 4;
      }
      const count = (contentLower.match(new RegExp(token, 'g')) || []).length;
      score += Math.min(count * 1.5, 6);
    }

    return score;
  }

  // Query Decomposition for complex multi-part questions
  decomposeQuery(query: string): string[] {
    const subqueries = [query];

    // Check for "vs", "versus", "and", "compare"
    if (/\b(vs|versus|compare|contrast|difference between)\b/i.test(query)) {
      const parts = query.split(/\b(vs|versus|and|compared to|difference between)\b/i);
      parts.forEach(p => {
        const cleaned = p.trim().replace(/^(the|a|an)\s+/i, '');
        if (cleaned.length > 5 && !subqueries.includes(cleaned)) {
          subqueries.push(cleaned);
        }
      });
    }

    return subqueries.slice(0, 3);
  }

  // Perform Hybrid Search (FTS5 + Semantic + RRF)
  async hybridSearch(
    query: string,
    allChunks: DocumentChunk[],
    documentIds?: string[],
    limit = 6
  ): Promise<SearchResultItem[]> {
    if (!query.trim()) return [];

    const subqueries = this.decomposeQuery(query);
    const candidateMap = new Map<string, { chunk: DocumentChunk; ftsScore: number; semScore: number; highlight?: string; rankFts: number; rankSem: number }>();

    // Step 1: Run SQLite FTS5 Search for subqueries
    for (const subq of subqueries) {
      const ftsRes = await this.runFts5Command('search', {
        query: subq,
        documentIds: documentIds && documentIds.length > 0 ? documentIds : undefined,
        limit: limit * 2
      });

      if (ftsRes && Array.isArray(ftsRes.results)) {
        ftsRes.results.forEach((r: any, idx: number) => {
          const chunk = allChunks.find(c => c.id === r.chunkId);
          if (chunk) {
            const existing = candidateMap.get(chunk.id) || {
              chunk,
              ftsScore: 0,
              semScore: 0,
              highlight: r.highlightSnippet,
              rankFts: 999,
              rankSem: 999
            };
            existing.ftsScore = Math.max(existing.ftsScore, r.score);
            existing.rankFts = Math.min(existing.rankFts, idx + 1);
            if (r.highlightSnippet) existing.highlight = r.highlightSnippet;
            candidateMap.set(chunk.id, existing);
          }
        });
      }
    }

    // Step 2: Semantic scoring across filtered chunks
    const targetChunks = documentIds && documentIds.length > 0
      ? allChunks.filter(c => documentIds.includes(c.documentId))
      : allChunks;

    const scoredSemantic = targetChunks.map(c => ({
      chunk: c,
      score: this.calculateSemanticScore(query, c.content, c.keywords)
    })).filter(s => s.score > 0).sort((a, b) => b.score - a.score);

    scoredSemantic.forEach((item, idx) => {
      const existing = candidateMap.get(item.chunk.id) || {
        chunk: item.chunk,
        ftsScore: 0,
        semScore: 0,
        rankFts: 999,
        rankSem: 999
      };
      existing.semScore = item.score;
      existing.rankSem = idx + 1;
      candidateMap.set(item.chunk.id, existing);
    });

    // Step 3: Reciprocal Rank Fusion (RRF) Reranking
    // RRF(d) = 1 / (60 + rankFts) + 1 / (60 + rankSem)
    const combined: SearchResultItem[] = [];

    candidateMap.forEach(val => {
      const rrfScore = (1 / (60 + val.rankFts)) + (1 / (60 + val.rankSem));
      let sourceType: 'fts5' | 'semantic' | 'hybrid' = 'hybrid';
      if (val.rankFts < 999 && val.rankSem === 999) sourceType = 'fts5';
      else if (val.rankFts === 999 && val.rankSem < 999) sourceType = 'semantic';

      combined.push({
        chunk: val.chunk,
        score: Math.round(rrfScore * 10000) / 100, // Normalized score
        highlightSnippet: val.highlight,
        sourceType,
        rankFts: val.rankFts,
        rankSemantic: val.rankSem
      });
    });

    combined.sort((a, b) => b.score - a.score);
    return combined.slice(0, limit);
  }

  // Cross-document Conflict Detector
  detectConflicts(results: SearchResultItem[]): Array<{ docA: string; pageA: number; docB: string; pageB: number; topic: string; note: string }> {
    const conflicts = [];
    const docMap = new Map<string, SearchResultItem[]>();

    results.forEach(r => {
      const list = docMap.get(r.chunk.documentId) || [];
      list.push(r);
      docMap.set(r.chunk.documentId, list);
    });

    // If multiple documents retrieved, check for contrasting claims
    const docIds = Array.from(docMap.keys());
    if (docIds.length >= 2) {
      const itemsA = docMap.get(docIds[0])!;
      const itemsB = docMap.get(docIds[1])!;

      // Simple heuristic for contrasting perspectives
      const textA = itemsA.map(i => i.chunk.content.toLowerCase()).join(' ');
      const textB = itemsB.map(i => i.chunk.content.toLowerCase()).join(' ');

      if (
        (textA.includes('increase') && textB.includes('decrease')) ||
        (textA.includes('positive') && textB.includes('negative')) ||
        (textA.includes('hardware') && textB.includes('software'))
      ) {
        conflicts.push({
          docA: itemsA[0].chunk.documentTitle,
          pageA: itemsA[0].chunk.pageNumber,
          docB: itemsB[0].chunk.documentTitle,
          pageB: itemsB[0].chunk.pageNumber,
          topic: 'Potential Perspective Variation',
          note: `Different textbooks emphasize alternative facets (e.g. ${itemsA[0].chunk.documentTitle} vs ${itemsB[0].chunk.documentTitle}).`
        });
      }
    }

    return conflicts;
  }
}

export const hybridSearchEngine = new HybridSearchEngine();
