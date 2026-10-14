import sqlite3
import sys
import json
import os
import re

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "documind_fts.db")

def get_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    with conn:
        conn.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
            chunk_id,
            document_id,
            document_title,
            page_number UNINDEXED,
            content,
            tokenize='porter unicode61'
        );
        """)
        conn.execute("""
        CREATE TABLE IF NOT EXISTS metadata (
            key TEXT PRIMARY KEY,
            value TEXT
        );
        """)
    conn.close()

def add_chunks(chunks):
    conn = get_db()
    with conn:
        for c in chunks:
            # Delete existing if any
            conn.execute("DELETE FROM chunks_fts WHERE chunk_id = ?", (c["id"],))
            conn.execute(
                "INSERT INTO chunks_fts(chunk_id, document_id, document_title, page_number, content) VALUES (?, ?, ?, ?, ?)",
                (c["id"], c["documentId"], c["documentTitle"], str(c["pageNumber"]), c["content"])
            )
    conn.close()

def delete_document(doc_id):
    conn = get_db()
    with conn:
        conn.execute("DELETE FROM chunks_fts WHERE document_id = ?", (doc_id,))
    conn.close()

def sanitize_fts_query(query):
    # Keep alphanumeric words, quote phrases or join with OR
    words = re.findall(r'\b[a-zA-Z0-9_\-]{2,}\b', query)
    if not words:
        return ""
    # Use OR across terms and also phrase match
    return " OR ".join(f'"{w}"' for w in words)

def search_chunks(query, document_ids=None, limit=10):
    sanitized = sanitize_fts_query(query)
    if not sanitized:
        return []

    conn = get_db()
    cursor = conn.cursor()

    sql = """
    SELECT
        chunk_id,
        document_id,
        document_title,
        page_number,
        content,
        bm25(chunks_fts) as bm25_rank,
        snippet(chunks_fts, 4, '<mark>', '</mark>', '...', 24) as snippet_highlight
    FROM chunks_fts
    WHERE chunks_fts MATCH ?
    """
    params = [sanitized]

    if document_ids and len(document_ids) > 0:
        placeholders = ",".join("?" for _ in document_ids)
        sql += f" AND document_id IN ({placeholders})"
        params.extend(document_ids)

    sql += " ORDER BY bm25_rank ASC LIMIT ?"
    params.append(limit)

    cursor.execute(sql, params)
    rows = cursor.fetchall()
    conn.close()

    results = []
    for r in rows:
        results.append({
            "chunkId": r["chunk_id"],
            "documentId": r["document_id"],
            "documentTitle": r["document_title"],
            "pageNumber": int(r["page_number"]),
            "content": r["content"],
            "score": abs(float(r["bm25_rank"])),
            "highlightSnippet": r["snippet_highlight"]
        })
    return results

def count_chunks():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT count(*) as cnt FROM chunks_fts")
    cnt = cursor.fetchone()["cnt"]
    conn.close()
    return cnt

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No action specified"}))
        sys.exit(1)

    action = sys.argv[1]

    if action == "init":
        init_db()
        print(json.dumps({"status": "ok"}))

    elif action == "add":
        data = json.loads(sys.stdin.read())
        add_chunks(data.get("chunks", []))
        print(json.dumps({"status": "ok", "count": len(data.get("chunks", []))}))

    elif action == "delete":
        doc_id = sys.argv[2] if len(sys.argv) > 2 else ""
        delete_document(doc_id)
        print(json.dumps({"status": "ok", "deleted": doc_id}))

    elif action == "search":
        data = json.loads(sys.stdin.read())
        res = search_chunks(
            data.get("query", ""),
            data.get("documentIds", None),
            data.get("limit", 10)
        )
        print(json.dumps({"results": res}))

    elif action == "count":
        print(json.dumps({"count": count_chunks()}))
    else:
        print(json.dumps({"error": f"Unknown action {action}"}))
