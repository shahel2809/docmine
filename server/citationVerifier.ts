import type { DocumentChunk, Citation } from '../src/types/index.ts';

export interface VerifiedClaim {
  id: string;
  claimText: string;
  chunkId: string;
  documentId: string;
  documentTitle: string;
  pageNumber: number;
  snippet: string;
  status: 'verified' | 'qualified' | 'unsupported';
  confidence: number;
  highlightedMatch?: string;
  qualificationNote?: string;
}

export interface VerificationResult {
  verifiedClaims: VerifiedClaim[];
  evidenceStatus: 'verified' | 'partial' | 'insufficient';
  evidenceAssessment: string;
  citations: Citation[];
  conflicts: Array<{ docA: string; pageA: number; docB: string; pageB: number; note: string }>;
  abstentionReason?: string;
  supportedRatio: number;
}

export class CitationVerifier {
  // Tokenize text into normalized stems/words
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);
  }

  // Calculate lexical containment ratio (what fraction of claim tokens appear in source chunk)
  private calculateContainment(claimTokens: string[], chunkText: string): number {
    if (claimTokens.length === 0) return 0;
    const lowerChunk = chunkText.toLowerCase();
    let matches = 0;

    for (const token of claimTokens) {
      if (lowerChunk.includes(token)) {
        matches += 1;
      }
    }

    return matches / claimTokens.length;
  }

  // Extract exact matching sentence or snippet from source chunk
  private findBestMatchingSnippet(claimText: string, chunkContent: string): string {
    const sentences = chunkContent.split(/(?<=[.!?])\s+/);
    let bestSent = sentences[0] || chunkContent;
    let maxOverlap = -1;

    const claimTokens = new Set(this.tokenize(claimText));

    for (const sent of sentences) {
      const sentTokens = this.tokenize(sent);
      let matchCount = 0;
      for (const t of sentTokens) {
        if (claimTokens.has(t)) matchCount++;
      }
      if (matchCount > maxOverlap) {
        maxOverlap = matchCount;
        bestSent = sent;
      }
    }

    return bestSent.trim();
  }

  // Verify claims against retrieved chunks
  verifyAnswer(
    claims: Array<{ claimText: string; citedChunkId?: string; pageMentioned?: number }>,
    retrievedChunks: DocumentChunk[]
  ): VerificationResult {
    const chunkMap = new Map<string, DocumentChunk>();
    retrievedChunks.forEach(c => chunkMap.set(c.id, c));

    const verifiedClaims: VerifiedClaim[] = [];
    const validCitationsMap = new Map<string, Citation>();
    let verifiedCount = 0;

    claims.forEach((claim, idx) => {
      let targetChunk: DocumentChunk | undefined;

      // 1. Check if citedChunkId exists in retrieved pool
      if (claim.citedChunkId && chunkMap.has(claim.citedChunkId)) {
        targetChunk = chunkMap.get(claim.citedChunkId);
      } else {
        // Fallback: look for chunk that contains highest token overlap
        let bestOverlap = 0;
        const claimTokens = this.tokenize(claim.claimText);

        retrievedChunks.forEach(c => {
          const overlap = this.calculateContainment(claimTokens, c.content);
          if (overlap > bestOverlap) {
            bestOverlap = overlap;
            targetChunk = c;
          }
        });
      }

      if (!targetChunk) {
        // Claim has no corresponding retrieved evidence -> unsupported
        verifiedClaims.push({
          id: `claim-${idx}`,
          claimText: claim.claimText,
          chunkId: 'none',
          documentId: 'none',
          documentTitle: 'Unverified Source',
          pageNumber: 0,
          snippet: '',
          status: 'unsupported',
          confidence: 0,
          qualificationNote: 'No supporting textbook excerpt found in retrieved passages.'
        });
        return;
      }

      // 2. Enforce ground truth page number from chunk, NEVER accept invented page numbers
      const groundTruthPage = targetChunk.pageNumber;
      const claimTokens = this.tokenize(claim.claimText);
      const containment = this.calculateContainment(claimTokens, targetChunk.content);
      const bestSnippet = this.findBestMatchingSnippet(claim.claimText, targetChunk.content);

      let status: 'verified' | 'qualified' | 'unsupported' = 'verified';
      let qualificationNote: string | undefined;

      if (containment >= 0.45) {
        status = 'verified';
        verifiedCount++;
      } else if (containment >= 0.22) {
        status = 'qualified';
        qualificationNote = `Excerpt in ${targetChunk.documentTitle} (Page ${groundTruthPage}) provides partial context.`;
        verifiedCount += 0.5;
      } else {
        status = 'unsupported';
        qualificationNote = 'Low lexical alignment with source excerpt.';
      }

      verifiedClaims.push({
        id: `claim-${idx}`,
        claimText: claim.claimText,
        chunkId: targetChunk.id,
        documentId: targetChunk.documentId,
        documentTitle: targetChunk.documentTitle,
        pageNumber: groundTruthPage, // strictly enforced!
        snippet: bestSnippet,
        status,
        confidence: Math.round(containment * 100),
        highlightedMatch: bestSnippet,
        qualificationNote
      });

      // Register valid citation
      if (status !== 'unsupported') {
        const citKey = `${targetChunk.documentId}-${groundTruthPage}`;
        if (!validCitationsMap.has(citKey)) {
          validCitationsMap.set(citKey, {
            documentId: targetChunk.documentId,
            documentTitle: targetChunk.documentTitle,
            pageNumber: groundTruthPage,
            snippet: bestSnippet,
            matchScore: Math.round(containment * 100)
          });
        }
      }
    });

    const totalClaims = Math.max(1, claims.length);
    const supportedRatio = Math.round((verifiedCount / totalClaims) * 100);

    let evidenceStatus: 'verified' | 'partial' | 'insufficient' = 'verified';
    let evidenceAssessment = `All claims verified against ${validCitationsMap.size} genuine textbook passages.`;

    if (supportedRatio >= 80) {
      evidenceStatus = 'verified';
      evidenceAssessment = `High confidence: ${supportedRatio}% of claims grounded with exact page citations.`;
    } else if (supportedRatio >= 40) {
      evidenceStatus = 'partial';
      evidenceAssessment = `Partial evidence: Some assertions could only be partially qualified from retrieved passages.`;
    } else {
      evidenceStatus = 'insufficient';
      evidenceAssessment = `Insufficient evidence: Retrieved passages do not adequately substantiate the question claims.`;
    }

    return {
      verifiedClaims,
      evidenceStatus,
      evidenceAssessment,
      citations: Array.from(validCitationsMap.values()),
      conflicts: [],
      supportedRatio,
      abstentionReason: supportedRatio < 30 ? 'The uploaded documents do not contain sufficient evidence to answer this question reliably.' : undefined
    };
  }
}

export const citationVerifier = new CitationVerifier();
