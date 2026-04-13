import fitz
from app.infrastructure.extractors.base import BaseExtractor
from app.core.exceptions import FileExtractionError, EmptyContentError

class PDFExtractor(BaseExtractor):
    def extract(self, file_bytes: bytes) -> str:
        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text()
            if not text.strip():
                raise EmptyContentError("PDF contains no text")
            return text
        except Exception as e:
            raise FileExtractionError(f"Failed to extract text from PDF: {str(e)}")
