from app.domain.models import Quiz, Question
from app.schemas.response import QuizData, MCQQuestion, MCQOption


class SchemaMapper:
    @classmethod
    def to_quiz_data(
        cls, 
        quiz: Quiz, 
        input_type: str, 
        model_used: str
    ) -> QuizData:
        """
        Maps a Quiz domain model to a QuizData Pydantic schema.
        """
        mcq_questions = [cls._map_question(q) for q in quiz.questions]
        return QuizData(
            questions=mcq_questions,
            num_questions=len(mcq_questions),
            input_type=input_type,
            model_used=model_used
        )

    @classmethod
    def _map_question(cls, question: Question) -> MCQQuestion:
        """
        Maps a single Question domain model to an MCQQuestion schema.
        """
        keys = ["A", "B", "C", "D"]
        options = []
        correct_option_key = "A"

        for i, option_text in enumerate(question.options):
            key = keys[i]
            options.append(MCQOption(key=key, text=option_text))
            if option_text == question.correct_answer:
                correct_option_key = key

        return MCQQuestion(
            question=question.text,
            options=options,
            correct_option=correct_option_key,
            explanation=question.explanation,
            difficulty=question.difficulty.value if hasattr(question.difficulty, "value") else str(question.difficulty)
        )
