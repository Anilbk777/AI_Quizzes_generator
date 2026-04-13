from abc import ABC, abstractmethod

class BaseExtractor(ABC):
    @abstractmethod
    def extract(self, file_bytes: bytes) -> str:
        """Extract text from a file"""
        pass