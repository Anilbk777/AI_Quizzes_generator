# app/services/ai_service.py
from app.infrastructure.llm_provider import ProviderFactory
from app.services.mcq_chain import MCQChain
from app.utils.mcq_mapper import MCQMapper
from app.services.prompt_builder import PromptBuilder
from app.domain.models import Quiz
from app.core.logger import logger
from app.core.exceptions import LLMProviderError, MCQGenerationError

class AIService:
    def generate_mcq(
        self,
        content: str,
        num_questions: int = 5,
        provider_name: str = "groq",
        temperature: float = 0.3,
    ) -> Quiz:
        """
        Generates MCQs using the specified AI provider and content.
        """
        logger.info(f"Starting MCQ generation - provider: {provider_name}, questions: {num_questions}")
        
        try:
            # 1. Initialize Provider
            try:
                provider = ProviderFactory.create(
                    provider_name=provider_name,
                    temperature=temperature,
                )
            except ValueError as e:
                logger.error(f"Provider creation failed: {str(e)}")
                raise LLMProviderError(f"Invalid LLM provider: {str(e)}")

            # 2. Build Chain
            prompt = PromptBuilder().build_mcq_prompt()
            chain = MCQChain(provider=provider, prompt=prompt)
            
            # 3. Invoke LLM
            logger.info("Invoking LLM for MCQ generation...")
            try:
                response = chain.chain.invoke({
                    "num_questions": num_questions,
                    "content": content,
                })
            except Exception as e:
                logger.error(f"LLM invocation failed: {str(e)}")
                raise MCQGenerationError(f"Failed to generate MCQs from AI: {str(e)}")

            # 4. Map Result
            try:
                quiz = MCQMapper.to_quiz(response)
                logger.info("MCQ generation completed successfully.")
                return quiz
            except Exception as e:
                logger.error(f"Response mapping failed: {str(e)}")
                raise MCQGenerationError(f"Failed to process AI response: {str(e)}")

        except (LLMProviderError, MCQGenerationError):
            # Re-raise custom exceptions
            raise
        except Exception as e:
            # Catch unexpected errors
            logger.critical(f"Unexpected error in AI Service: {str(e)}", exc_info=True)
            raise MCQGenerationError(f"An unexpected error occurred during MCQ generation: {str(e)}")