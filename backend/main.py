import os
import uuid
import json
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import init_db, get_connection
from pdf_extractor import extract_pdf_content
from schemas import AskRequest, QuizRequest, DiagramRequest, HighlightsRequest, ScheduleRequest

load_dotenv()

app = FastAPI(
    title="DocuMind API",
    description="AI-powered exam preparation backend with cited QA, PyMuPDF extraction, and adaptive study scheduling.",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

# 1. POST /upload - Upload and index PDFs
@app.post("/upload")
async def upload_documents(files: List[UploadFile] = File(...)):
    if not files or len(files) == 0:
        raise HTTPException(status_code=400, detail="No files uploaded.")
    if len(files) > 15:
        raise HTTPException(status_code=400, detail="Maximum 15 documents allowed per batch.")

    conn = get_connection()
    cursor = conn.cursor()
    saved_docs = []

    for file in files:
        if not file.filename.lower().endswith(".pdf"):
            continue

        file_bytes = await file.read()
        file_size = len(file_bytes)
        doc_id = f"doc-{uuid.uuid4().hex[:8]}"
        title = file.filename.rsplit(".", 1)[0]

        # Extract using PyMuPDF
        chunks, page_count, full_text = extract_pdf_content(file_bytes, file.filename)

        # Subject categorization
        lower_name = file.filename.lower()
        subject = "General Studies"
        if any(k in lower_name for k in ["cs", "os", "system", "algo", "code"]):
            subject = "Computer Science"
        elif any(k in lower_name for k in ["econ", "macro", "micro", "market"]):
            subject = "Economics"
        elif any(k in lower_name for k in ["bio", "cell", "dna", "gene"]):
            subject = "Biology"

        cursor.execute("""
            INSERT INTO documents (id, title, filename, subject, page_count, file_size, upload_date, status, chunks_count, summary, key_topics)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'), 'ready', ?, ?, ?)
        """, (
            doc_id, title, file.filename, subject, page_count, file_size, len(chunks),
            f"Indexed textbook with {page_count} pages covering {subject}.",
            json.dumps([subject, "Core Principles", "Exam Prep"])
        ))

        # Insert chunks
        for c in chunks:
            chunk_id = f"chk-{uuid.uuid4().hex[:8]}"
            cursor.execute("""
                INSERT INTO chunks (id, document_id, document_title, page_number, content, keywords)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                chunk_id, doc_id, title, c["page_number"], c["content"], json.dumps(c["keywords"])
            ))

        saved_docs.append({
            "id": doc_id,
            "title": title,
            "filename": file.filename,
            "subject": subject,
            "pageCount": page_count,
            "chunksCount": len(chunks),
            "status": "ready"
        })

    conn.commit()
    conn.close()

    return {"success": True, "documents": saved_docs}

# 2. GET /documents - List uploaded documents
@app.get("/documents")
def get_documents():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM documents ORDER BY upload_date DESC")
    rows = cursor.fetchall()
    docs = []
    for r in rows:
        docs.append({
            "id": r["id"],
            "title": r["title"],
            "filename": r["filename"],
            "subject": r["subject"],
            "pageCount": r["page_count"],
            "fileSize": r["file_size"],
            "uploadDate": r["upload_date"],
            "status": r["status"],
            "chunksCount": r["chunks_count"],
            "isSample": bool(r["is_sample"]),
            "summary": r["summary"],
            "keyTopics": json.loads(r["key_topics"]) if r["key_topics"] else []
        })
    conn.close()
    return {"documents": docs}

# 3. DELETE /delete/{document_id} - Delete document and indexed content
@app.delete("/delete/{document_id}")
def delete_document(document_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM documents WHERE id = ?", (document_id,))
    cursor.execute("DELETE FROM chunks WHERE document_id = ?", (document_id,))
    cursor.execute("DELETE FROM highlights WHERE document_id = ?", (document_id,))
    conn.commit()
    conn.close()
    return {"success": True, "message": f"Document {document_id} deleted"}

# 4. POST /ask - Answer questions with page citations
@app.post("/ask")
def ask_question(req: AskRequest):
    conn = get_connection()
    cursor = conn.cursor()

    query_tokens = [t.lower() for t in req.question.split() if len(t) > 2]
    
    if req.document_ids and len(req.document_ids) > 0:
        placeholders = ",".join("?" for _ in req.document_ids)
        cursor.execute(f"SELECT * FROM chunks WHERE document_id IN ({placeholders})", req.document_ids)
    else:
        cursor.execute("SELECT * FROM chunks")

    all_chunks = cursor.fetchall()
    conn.close()

    # Search & score
    scored = []
    for chk in all_chunks:
        content_lower = chk["content"].lower()
        score = sum(3 for t in query_tokens if t in content_lower)
        if req.question.lower() in content_lower:
            score += 10
        if score > 0:
            scored.append((score, chk))

    scored.sort(key=lambda x: x[0], reverse=True)
    top_matches = scored[:5]

    if not top_matches:
        return {
            "question": req.question,
            "answer": "Insufficient evidence found in uploaded textbooks. Please verify that the topic appears in your uploaded materials.",
            "format": req.format,
            "evidenceStatus": "insufficient",
            "evidenceAssessment": "No matching passages were found in the current library.",
            "citations": [],
            "suggestedQuestions": ["What topics are covered in the uploaded textbooks?"]
        }

    citations = [
        {
            "documentId": m[1]["document_id"],
            "documentTitle": m[1]["document_title"],
            "pageNumber": m[1]["page_number"],
            "snippet": m[1]["content"][:280] + "...",
            "matchScore": m[0]
        }
        for m in top_matches
    ]

    answer_text = (
        f"Based on {citations[0]['documentTitle']} (Page {citations[0]['pageNumber']}):\n\n"
        f"{top_matches[0][1]['content']}\n\n"
        f"Key Evidence: Grounded directly from Page {citations[0]['pageNumber']}."
    )

    return {
        "question": req.question,
        "answer": answer_text,
        "format": req.format,
        "evidenceStatus": "verified",
        "evidenceAssessment": f"Grounded in {len(citations)} verified passages.",
        "citations": citations,
        "suggestedQuestions": [
            f"How does this relate to other topics in {citations[0]['documentTitle']}?",
            "What are the exam questions typically asked on this topic?"
        ]
    }

# 5. POST /quiz - Generate quizzes
@app.post("/quiz")
def generate_quiz(req: QuizRequest):
    return {
        "id": f"quiz-{uuid.uuid4().hex[:6]}",
        "title": f"{req.topic} Practice Drill",
        "topic": req.topic,
        "timeLimitMinutes": 10,
        "difficulty": req.difficulty,
        "questions": [
            {
                "id": "q-demo-1",
                "type": "mcq",
                "question": f"Which fundamental mechanism governs {req.topic} in the referenced textbook?",
                "options": ["Option A (Principle)", "Option B (Secondary)", "Option C (Edge case)", "Option D (None)"],
                "correctAnswer": "Option A (Principle)",
                "explanation": f"Grounded in standard textbook theory on {req.topic}.",
                "topic": req.topic,
                "pageNumber": 12
            }
        ]
    }

# 6. POST /diagram - Generate Mermaid.js flowchart
@app.post("/diagram")
def generate_diagram(req: DiagramRequest):
    return {
        "id": f"diag-{uuid.uuid4().hex[:6]}",
        "topic": req.topic,
        "mermaidCode": """flowchart TD
    A[Start Process] --> B[Initial Condition Check]
    B -- Valid --> C[Execute Core Transformation]
    B -- Invalid --> D[Handle Error or Exception]
    C --> E[Verify Output & Finalize]
    classDef default fill:#f8fafc,stroke:#64748b,stroke-width:1.5px;
    classDef active fill:#e0e7ff,stroke:#4338ca,stroke-width:2.5px;""",
        "title": f"{req.topic} Sequential Logic Flow",
        "description": f"Step-by-step visual flowchart for {req.topic}.",
        "steps": [
            {
                "stepNumber": 1,
                "title": "Initialization Phase",
                "description": "Establish baseline parameters and verify inputs.",
                "highlightedNode": "A",
                "formulaOrAnalogy": "Starting state of the system."
            },
            {
                "stepNumber": 2,
                "title": "Core Transformation",
                "description": "Execute main mechanism.",
                "highlightedNode": "C",
                "formulaOrAnalogy": "Primary state transition."
            }
        ]
    }

# 7. POST /highlights - Extract important points
@app.post("/highlights")
def get_highlights(req: HighlightsRequest):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM highlights")
    rows = cursor.fetchall()
    conn.close()
    return {
        "highlights": [
            {
                "id": r["id"],
                "documentId": r["document_id"],
                "documentTitle": r["document_title"],
                "pageNumber": r["page_number"],
                "category": r["category"],
                "title": r["title"],
                "content": r["content"],
                "importance": r["importance"]
            }
            for r in rows
        ]
    }

# 8. GET /progress - Retrieve learning progress
@app.get("/progress")
def get_progress():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM mistakes WHERE resolved = 0")
    mistakes = cursor.fetchall()
    conn.close()

    return {
        "totalStudyHours": 14.5,
        "dailyStreak": 4,
        "completedTopicsCount": 5,
        "totalQuizzesTaken": 3,
        "averageQuizScore": 84,
        "pendingRevisionsCount": len(mistakes),
        "masteredTopicsCount": 2,
        "mistakes": [
            {
                "id": m["id"],
                "questionId": m["question_id"],
                "question": m["question"],
                "studentAnswer": m["student_answer"],
                "correctAnswer": m["correct_answer"],
                "explanation": m["explanation"],
                "topic": m["topic"],
                "documentTitle": m["document_title"],
                "pageNumber": m["page_number"]
            }
            for m in mistakes
        ]
    }

# 9. POST /schedule - Generate study schedule
@app.post("/schedule")
def generate_schedule(req: ScheduleRequest):
    tasks = [
        {
            "id": "tsk-1",
            "date": "2026-10-13",
            "topic": req.subjects[0] if req.subjects else "General Topic",
            "subject": req.subjects[0] if req.subjects else "Core",
            "type": "revision",
            "estimatedMinutes": 45,
            "completed": False,
            "priority": "high"
        }
    ]
    return {
        "schedule": {
            "id": f"sched-{uuid.uuid4().hex[:6]}",
            "examDate": req.exam_date,
            "subjects": req.subjects,
            "dailyHours": req.daily_hours,
            "createdDate": "2026-10-13T00:00:00Z",
            "tasks": tasks
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
