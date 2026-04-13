from typing import List
from app.domain.enums import Difficulty


class Question:
    def __init__(
        self,
        text: str,
        options: List[str],
        correct_answer: str,
        explanation: str,
        difficulty: Difficulty = Difficulty.MEDIUM,
    ):
        self._validate(text, options, correct_answer)

        self.text = text
        self.options = options
        self.correct_answer = correct_answer
        self.explanation = explanation
        self.difficulty = difficulty

    def _validate(self, text: str, options: List[str], correct_answer: str):
        if not text:
            raise ValueError("Question text cannot be empty")

        if not options or len(options) != 4:
            raise ValueError("A question must have exactly 4 options")

        if correct_answer not in options:
            raise ValueError("Correct answer must be one of the options")

    def is_correct(self, answer: str) -> bool:
        return answer == self.correct_answer

    def __repr__(self):
        return f"<Question(text={self.text[:30]}..., difficulty={self.difficulty})>"


class Quiz:
    def __init__(self, questions: List[Question]):
        self._validate(questions)
        self.questions = questions

    def _validate(self, questions: List[Question]):
        if not questions:
            raise ValueError("Quiz must contain at least one question")

    def total_questions(self) -> int:
        return len(self.questions)

    def get_questions(self) -> List[Question]:
        return self.questions

    def __repr__(self):
        return f"<Quiz(total_questions={len(self.questions)})>"
