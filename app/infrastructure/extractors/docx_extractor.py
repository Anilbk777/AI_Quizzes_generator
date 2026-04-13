from docx import Document
from app.infrastructure.extractors.base import BaseExtractor
from app.core.exceptions import FileExtractionError, EmptyContentError

import io

class DocxExtractor(BaseExtractor):
    def extract(self, file_bytes: bytes) -> str:
        try:
            doc = Document(io.BytesIO(file_bytes))
            text = ""
            for para in doc.paragraphs:
                text += para.text + "\n"
            if not text.strip():
                raise EmptyContentError("DOCX contains no text")
            return text
        except Exception as e:
            raise FileExtractionError(f"Failed to extract text from DOCX: {str(e)}")