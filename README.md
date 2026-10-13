# DocuMind — Upload. Understand. Remember.

**DocuMind** is an AI-powered study and exam preparation platform designed for college students. It enables students to upload up to 15 PDF textbooks simultaneously, search across all materials, ask questions with exact page-level citations, highlight high-yield exam concepts, learn mechanisms through interactive animated Mermaid flowcharts, drill in the Quiz Arena, track mistakes adaptively, and follow a personalized revision schedule.

---

## 🌟 Key Features

1. **Dashboard**: High-level study command center tracking uploaded books, mastered topics, quiz performance trends, pending revisions, daily streaks, today's schedule, and recommended review topics.
2. **My Library (Upload Books)**:
   - Simultaneous upload of at least 10 PDF textbooks with drag-and-drop.
   - Text extraction preserving document titles, page counts, and page numbers.
   - Robust handling of scanned, unreadable, or complex PDFs with graceful diagnostics.
   - Pre-loaded with university sample textbooks (Operating Systems, Economics, Molecular Biology).
3. **Ask DocuMind (AI Question Answering)**:
   - Deep search across selected or all textbooks.
   - Answers strictly grounded in retrieved document passages.
   - Guaranteed citations: Document Title, Page Number, and exact supporting passage snippet.
   - Direct verification status: Identifies when evidence is verified, partial, or insufficient.
   - Exam mark options: **2-mark**, **5-mark**, **10-mark**, **short-answer**, and **detailed-explanation**.
4. **Smart Notes & Flashcards**:
   - Automated categorization: Definitions, Formulas, Important Concepts, Algorithms, Comparisons, and Potential Exam Questions.
   - Interactive flip flashcards with confidence self-rating.
   - Export revision summaries in Markdown and printable format.
5. **Visual Learning (Animated Mermaid Flowcharts)**:
   - Step-by-step interactive diagrams powered by Mermaid.js.
   - Dedicated step controller (Play, Pause, Next, Previous, Restart).
   - Node-highlighting synchronized with conceptual explanations and analogies.
6. **Quiz Arena & Adaptive Mistake Tracker**:
   - Generates MCQs, True/False, and Fill-in-the-Blank drills from textbooks.
   - Real-time exam timer and results celebration.
   - **Adaptive Mastery Rule**: Topics are marked "Mastered" only after achieving **85%+ accuracy across at least 2 attempts**—never merely for reading a document.
   - Interactive "Retry Mistakes Only" mode to resolve incorrect answers.
7. **Personalized Study Planner**:
   - Generates a day-by-day revision schedule based on exam dates, daily study hours, and weak topics.
   - One-click "Auto-Reschedule" to adjust pending tasks when deadlines change.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Recharts, Mermaid.js, Motion (Framer Motion).
- **AI Engine**: Google Gemini API (`gemini-3.8-flash` via `@google/genai` TypeScript SDK on server).
- **Node.js Fullstack Server**: Express with Vite middleware, `pdf-parse`, local persistence engine.
- **Python Backend Option**: Python FastAPI, PyMuPDF (`fitz`), SQLite (`documind.db`).

---

## 🚀 Setup & Installation Instructions

### Option A: Running the Full-Stack Application (Vite + Express)

1. **Clone and Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API Key:
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Option B: Running the Python FastAPI Backend on Windows

#### 1. Prerequisites for Windows:
- Python 3.10 or higher installed from [python.org](https://www.python.org/) (ensure "Add Python to PATH" is checked during installation).

#### 2. Setup in Windows PowerShell:
```powershell
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
.\venv\Scripts\Activate.ps1

# Upgrade pip and install dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt

# Initialize the SQLite database
python database.py

# Launch the FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. Setup in Windows Command Prompt (cmd.exe):
```cmd
cd backend
python -m venv venv
venv\Scripts\activate.bat
pip install -r requirements.txt
python database.py
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The interactive FastAPI Swagger documentation will be available at:
`http://localhost:8000/docs`

---

## 📡 API Endpoints Specification

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/upload` | Upload and index up to 15 PDF textbooks simultaneously. |
| `GET` | `/documents` | List all uploaded textbooks and processing status. |
| `DELETE` | `/delete/{document_id}` | Delete a document and its indexed chunks. |
| `POST` | `/ask` | Search across books and generate cited exam answers. |
| `POST` | `/highlights` | Extract definitions, formulas, and concepts from text. |
| `POST` | `/diagram` | Generate Mermaid flowchart and animated step breakdown. |
| `POST` | `/quiz` | Generate MCQ, True/False, or Fill-in-the-blank practice quiz. |
| `GET` | `/progress` | Retrieve mastery scores, mistakes log, and study streaks. |
| `POST` | `/schedule` | Generate personalized daily study schedule. |
