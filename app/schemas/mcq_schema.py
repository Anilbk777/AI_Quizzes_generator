
from pydantic import BaseModel, Field, model_validator
from typing import Literal

class MCQQuestionSchema(BaseModel):
    question: str = Field(...,description="The MCQ question text, must not be empty")
    option_a: str = Field(...,description="Option A — plausible but wrong (unless correct)")
    option_b: str = Field(...,description="Option B — plausible but wrong (unless correct)")
    option_c: str = Field(...,description="Option C — plausible but wrong (unless correct)")
    option_d: str = Field(...,description="Option D — plausible but wrong (unless correct)")
    correct_option: Literal["A", "B", "C", "D"] = Field(...,
        description="The letter of the correct option"
    )
    explanation: str = Field(...,
        description="Concise explanation of why the correct option is right", min_length=10, max_length=500
    )
    difficulty: Literal["easy", "medium", "hard"] = Field(...,
        description="Cognitive difficulty of this question"
    )

    @model_validator(mode="after")
    def build_internals(self) -> "MCQQuestionSchema":
        self._options = [self.option_a, self.option_b, self.option_c, self.option_d]
        self._correct_answer = {
            "A": self.option_a,
            "B": self.option_b,
            "C": self.option_c,
            "D": self.option_d,
        }[self.correct_option]
        return self


class MCQResponseSchema(BaseModel):
    topic: str = Field(...,description="The topic these questions cover")
    questions: list[MCQQuestionSchema] = Field(...,
        description="Exactly as many questions as requested, no more no less"
    )

    @model_validator(mode="after")
    def validate_no_duplicate_questions(self) -> "MCQResponseSchema":
        texts = [q.question.strip().lower() for q in self.questions]
        if len(texts) != len(set(texts)):
            raise ValueError("Duplicate questions found — all questions must be unique")
        return self