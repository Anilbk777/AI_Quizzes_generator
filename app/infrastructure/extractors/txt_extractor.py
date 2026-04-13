from app.infrastructure.extractors.base import BaseExtractor
from app.core.exceptions import FileExtractionError, EmptyContentError

class TxtExtractor(BaseExtractor):
    def extract(self, file_bytes: bytes) -> str:
        try:
            text = file_bytes.decode("utf-8")
            if not text.strip():
                raise EmptyContentError("TXT contains no text")
            return text
        except Exception as e:
            raise FileExtractionError(f"Failed to extract text from TXT: {str(e)}")