from pydantic import BaseModel, Field
from typing import List


class MCQOption(BaseModel):
    key: str = Field(..., description="A, B, C, D")
    text: str


class MCQQuestion(BaseModel):
    question: str = Field(..., description="The question text")
    options: List[MCQOption] = Field(..., description="List of 4 options")
    correct_option: str = Field(..., description="The key (A/B/C/D) of the correct option")
    explanation: str = Field(..., description="Explanation for the correct answer")
    difficulty: str = Field(..., description="Difficulty level (easy, medium, hard)")


class QuizData(BaseModel):
    questions: List[MCQQuestion]
    num_questions: int
    input_type: str
    model_used: str


class QuizResponse(BaseModel):
    success: bool = True
    data: QuizData
    message: str = "Quiz generated successfully"