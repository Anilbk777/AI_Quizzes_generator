from docx import Document
from app.infrastructure.extractors.base import BaseExtractor
from app.core.exceptions import UnsupportedFileError, FileProcessingError, EmptyContentError

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
            raise FileProcessingError(f"Failed to process DOCX: {str(e)}")