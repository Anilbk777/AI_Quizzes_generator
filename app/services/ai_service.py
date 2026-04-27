from app.infrastructure.llm_provider import ProviderFactory
from app.services.mcq_chain import MCQChain
from app.services.prompt_builder import PromptBuilder
from app.utils.mcq_mapper import MCQMapper
from app.utils.text_chunking import TextChunker
from app.domain.models import Quiz
from app.domain.enums import Difficulty
from app.core.logger import logger
from app.core.exceptions import LLMProviderError, MCQGenerationError


class AIService:
    def __init__(self):
        self._chunker = TextChunker(chunk_size=2000, chunk_overlap=200)

    def generate_mcq(
        self,
        content: str,
        num_questions: int = 5,
        provider_name: str = "groq",
        temperature: float = 0.3,
        difficulty: Difficulty = Difficulty.MEDIUM,
    ) -> Quiz:
        logger.info(
            f"Starting MCQ generation - provider: {provider_name}, "
            f"questions: {num_questions}, difficulty: {difficulty}"
        )

        try:
            # 1. Merge selected chunks into one text — always one LLM call
            merged_content = self._chunker.get_content(content, num_questions)

            # Fallback if chunker returns nothing but original content exists (e.g. short topic)
            if not merged_content and content:
                merged_content = content

            # 2. Build chain once
            chain = self._build_chain(provider_name, temperature, difficulty)

            # 3. Single LLM invocation
            return self._invoke(chain, merged_content, num_questions)

        except (LLMProviderError, MCQGenerationError):
            raise
        except Exception as e:
            logger.exception("Unexpected error in AIService")
            raise MCQGenerationError("An unexpected error occurred during MCQ generation") from e

    def _build_chain(self, provider_name: str, temperature: float, difficulty: Difficulty) -> MCQChain:
        try:
            provider = ProviderFactory.create(
                provider_name=provider_name,
                temperature=temperature,
            )
        except ValueError as e:
            logger.error(f"Provider creation failed: {str(e)}")
            raise LLMProviderError(f"Invalid LLM provider: {str(e)}") from e

        prompt = PromptBuilder().build_mcq_prompt(difficulty=difficulty.value)
        return MCQChain(provider=provider, prompt=prompt)

    def _invoke(self, chain: MCQChain, content: str, num_questions: int) -> Quiz:
        logger.info("Invoking LLM for MCQ generation...")
        try:
            response = chain.chain.invoke({
                "num_questions": num_questions,
                "content": content,
            })
        except Exception as e:
            logger.exception("LLM invocation failed")
            raise MCQGenerationError("Failed to generate MCQs from AI") from e

        try:
            quiz = MCQMapper.to_quiz(response)
            logger.info("MCQ generation completed successfully.")
            return quiz
        except Exception as e:
            logger.exception("Response mapping failed")
            raise MCQGenerationError("Failed to process AI response") from e