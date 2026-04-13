# app/mappers/mcq_mapper.py
from app.domain.models import Question, Quiz
from app.domain.enums import Difficulty
from app.schemas.mcq_schema import MCQResponseSchema, MCQQuestionSchema


class MCQMapper:
    _DIFFICULTY_MAP = {
        "easy": Difficulty.EASY,
        "medium": Difficulty.MEDIUM,
        "hard": Difficulty.HARD,
    }

    @classmethod
    def to_quiz(cls, response: MCQResponseSchema) -> Quiz:
        questions = [cls._to_question(q) for q in response.questions]
        return Quiz(questions=questions)

    @classmethod
    def _to_question(cls, schema: MCQQuestionSchema) -> Question:
        return Question(
            text=schema.question,
            options=schema._options,
            correct_answer=schema._correct_answer,
            explanation=schema.explanation,
            difficulty=cls._DIFFICULTY_MAP[schema.difficulty],
        )