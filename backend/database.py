import sqlite3
import os
import json
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "documind.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Documents table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        filename TEXT NOT NULL,
        subject TEXT NOT NULL,
        page_count INTEGER NOT NULL,
        file_size INTEGER NOT NULL,
        upload_date TEXT NOT NULL,
        status TEXT NOT NULL,
        chunks_count INTEGER NOT NULL,
        is_sample INTEGER DEFAULT 0,
        summary TEXT,
        key_topics TEXT
    )
    """)

    # Chunks table for keyword and semantic search
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chunks (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        document_title TEXT NOT NULL,
        page_number INTEGER NOT NULL,
        content TEXT NOT NULL,
        keywords TEXT,
        FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
    )
    """)

    # Highlights table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS highlights (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        document_title TEXT NOT NULL,
        page_number INTEGER NOT NULL,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        importance TEXT NOT NULL
    )
    """)

    # Mistakes and Progress
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS mistakes (
        id TEXT PRIMARY KEY,
        question_id TEXT NOT NULL,
        question TEXT NOT NULL,
        student_answer TEXT,
        correct_answer TEXT NOT NULL,
        explanation TEXT,
        topic TEXT NOT NULL,
        document_title TEXT,
        page_number INTEGER,
        timestamp TEXT NOT NULL,
        resolved INTEGER DEFAULT 0
    )
    """)

    # Study Schedules
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS schedules (
        id TEXT PRIMARY KEY,
        exam_date TEXT NOT NULL,
        subjects TEXT NOT NULL,
        daily_hours REAL NOT NULL,
        created_date TEXT NOT NULL,
        tasks_json TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()
    print("DocuMind SQLite database initialized successfully.")

if __name__ == "__main__":
    init_db()
