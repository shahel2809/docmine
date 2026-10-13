from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class AskRequest(BaseModel):
    question: str
    document_ids: Optional[List[str]] = Field(default_factory=list)
    format: Optional[str] = "detailed-explanation"

class CitationModel(BaseModel):
    document_id: str
    document_title: str
    page_number: int
    snippet: str
    match_score: Optional[float] = None

class AskResponse(BaseModel):
    question: str
    answer: str
    format: str
    evidence_status: str
    evidence_assessment: str
    citations: List[CitationModel]
    suggested_questions: List[str]

class QuizRequest(BaseModel):
    document_id: Optional[str] = None
    topic: Optional[str] = "General Revision"
    count: Optional[int] = 5
    difficulty: Optional[str] = "intermediate"
    question_type: Optional[str] = "mixed"

class DiagramRequest(BaseModel):
    topic: str
    document_id: Optional[str] = None

class HighlightsRequest(BaseModel):
    document_id: Optional[str] = None
    topic: Optional[str] = None

class ScheduleRequest(BaseModel):
    exam_date: str
    subjects: List[str]
    daily_hours: float
    target_topics: Optional[List[str]] = Field(default_factory=list)
