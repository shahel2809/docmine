import fitz  # PyMuPDF
import re
from typing import List, Dict, Any, Tuple

def extract_pdf_content(file_bytes: bytes, filename: str) -> Tuple[List[Dict[str, Any]], int, str]:
    """
    Extracts text page-by-page from PDF bytes using PyMuPDF (fitz).
    Preserves exact document names and page numbers.
    Gracefully handles scanned, unreadable, or corrupted documents.
    """
    chunks = []
    total_pages = 0
    full_text = []

    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        total_pages = len(doc)

        for page_num in range(1, total_pages + 1):
            page = doc.load_page(page_num - 1)
            text = page.get_text("text").strip()

            if not text:
                # Handle scanned or image-only page
                text = f"[Page {page_num} in {filename} contains visual diagrams or scanned tables.]"

            full_text.append(text)

            # Extract basic keywords for search index
            clean_words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
            keywords = list(set(clean_words))[:20]

            chunks.append({
                "page_number": page_num,
                "content": text,
                "keywords": keywords
            })

        doc.close()
    except Exception as e:
        print(f"Error parsing PDF {filename} with PyMuPDF: {e}")
        # Fallback text extraction
        total_pages = 1
        fallback_text = f"Document: {filename}. Note: Scanned or complex format. Indexing fallback applied."
        chunks.append({
            "page_number": 1,
            "content": fallback_text,
            "keywords": ["document", "scanned", "fallback"]
        })
        full_text.append(fallback_text)

    return chunks, total_pages, "\n\n".join(full_text)
