# services/input/file_strategy.py

from .base import InputStrategy
from app.infrastructure.file_extractor import FileExtractor
from app.core.logger import logger
from app.core.exceptions import FileProcessingError

class FileStrategy(InputStrategy):
    """
    Strategy for processing file input.
    """
    def __init__(self):
        self.extractor = FileExtractor()

    def process(self, file_data) -> str:
        file_bytes, filename = file_data
        try:
            return self.extractor.extract(file_bytes, filename)
        except Exception as e:
            logger.error(f"File extraction failed: {str(e)}")
            raise FileProcessingError(f"Failed to process file: {str(e)}")