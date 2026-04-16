from abc import ABC, abstractmethod
from app.core.config import settings

from langchain_core.language_models import BaseChatModel
from langchain_groq import ChatGroq
# from langchain_deepseek import ChatDeepSeek
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI

from dataclasses import dataclass


@dataclass
class BaseLLMProvider(ABC):
    model_name: str
    temperature: float = 0.3

    @abstractmethod
    def get_llm(self) -> BaseChatModel:
        pass

@dataclass
class GroqProvider(BaseLLMProvider):
    model_name: str = "llama-3.3-70b-versatile"

    def get_llm(self) -> BaseChatModel:
        return ChatGroq(
            model=self.model_name,
            temperature=self.temperature,
            api_key=settings.GROQ_API_KEY,
        )

@dataclass
class DeepSeekProvider(BaseLLMProvider):
    model_name: str = "deepseek-chat"

    def get_llm(self) -> BaseChatModel:
        return ChatOpenAI(
            model=self.model_name,
            temperature=self.temperature,
            api_key=settings.DEEPSEEK_API_KEY,
            base_url="https://api.deepseek.com",
        )

@dataclass
class GeminiProvider(BaseLLMProvider):
    model_name: str = "gemini-2.5-flash"

    def get_llm(self) -> BaseChatModel:
        return ChatGoogleGenerativeAI(
            model=self.model_name,
            temperature=self.temperature,
            api_key=settings.GEMINI_API_KEY,
        )

class ProviderFactory:
    _registry: dict[str, type[BaseLLMProvider]] = {
        "groq": GroqProvider,
        "deepseek": DeepSeekProvider,
        "gemini": GeminiProvider,
    }

    @classmethod
    def create(
        cls,
        provider_name: str,
        temperature: float = 0.3,
    ) -> BaseLLMProvider:
        provider_cls = cls._registry.get(provider_name.lower())
        if not provider_cls:
            raise ValueError(
                f"Unknown provider '{provider_name}'. "
                f"Available: {list(cls._registry.keys())}"
            )
        return provider_cls(temperature=temperature)