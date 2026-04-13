from app.factories.strategy_factory import StrategyFactory
from app.services.ai_service import AIService
from app.domain.enums import InputType
from app.domain.models import Quiz

from app.core.logger import logger
from app.core.exceptions import QuizGenerationError

class QuizService:
    def __init__(self):
        self.strategy_factory = StrategyFactory()
        self.ai_service = AIService()

    def generate_quiz(self, input_type: InputType, input_data: any, num_questions: int = 5, provider_name:str = "groq") -> Quiz:
        logger.info(f"Starting quiz generation for input type: {input_type}")
        try:
            strategy = self.strategy_factory.get_strategy(input_type)
            content = strategy.process(input_data)
            quiz = self.ai_service.generate_mcq(content, num_questions, provider_name)
            return quiz
        except Exception as e:
            logger.error(f"Quiz generation failed: {str(e)}")
            raise QuizGenerationError(f"Failed to generate quiz: {str(e)}")
    