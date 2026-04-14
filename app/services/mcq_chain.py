# app/chain/mcq_chain.py
from langchain_core.runnables import Runnable
from langchain_core.prompts import ChatPromptTemplate
from app.infrastructure.llm_provider import BaseLLMProvider
from app.schemas.mcq_schema import MCQResponseSchema
from app.core.logger import logger
from app.core.exceptions import MCQGenerationError


class MCQChain:
    def __init__(self, provider: BaseLLMProvider, prompt: ChatPromptTemplate):
        self._provider = provider
        self._prompt = prompt
        self._chain: Runnable | None = None

    def build(self) -> Runnable:
        """
        Builds the LangChain runnable chain.
        """
        try:
            llm = self._provider.get_llm()
            self._chain = self._prompt | llm.with_structured_output(MCQResponseSchema)
            return self._chain
        except Exception as e:
            logger.exception("Failed to build MCQ chain")
            raise MCQGenerationError("Error during MCQ chain construction") from e

    def switch_provider(self, provider: BaseLLMProvider) -> Runnable:
        """
        Switches the LLM provider and rebuilds the chain.
        """
        self._provider = provider
        return self.build()

    @property
    def chain(self) -> Runnable:
        """
        Returns the constructed chain, building it if necessary.
        """
        if self._chain is None:
            self.build()
        return self._chain