from app.factories.strategy_factory import StrategyFactory
from app.services.ai_service import AIService
from app.domain.enums import InputType, Difficulty
from app.domain.models import Quiz

from app.core.logger import logger
from app.core.exceptions import QuizGenerationError

class QuizService:
    def __init__(self):
        self.strategy_factory = StrategyFactory()
        self.ai_service = AIService()

    def generate_quiz(
        self, 
        input_type: InputType, 
        input_data: any, 
        num_questions: int = 5, 
        provider_name: str = "groq",
        difficulty: Difficulty = Difficulty.MEDIUM
    ) -> Quiz:
        logger.info(f"Starting quiz generation for input type: {input_type}, difficulty: {difficulty}")
        try:
            strategy = self.strategy_factory.get_strategy(input_type)
            content = strategy.process(input_data)
            
            if not content or len(content.strip()) < 10:
                raise QuizGenerationError("Processed content is too short to generate a meaningful quiz.")

            quiz = self.ai_service.generate_mcq(
                content=content, 
                num_questions=num_questions, 
                provider_name=provider_name,
                difficulty=difficulty
            )
            return quiz
        except Exception as e:
            logger.exception("Quiz generation failed")
            raise QuizGenerationError(f"Failed to generate quiz: {str(e)}") from e
    