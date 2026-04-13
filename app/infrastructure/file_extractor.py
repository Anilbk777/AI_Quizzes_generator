from app.core.exceptions import UnsupportedFileError
from app.infrastructure.extractors.pdf_extractor import PDFExtractor
from app.infrastructure.extractors.docx_extractor import DocxExtractor
from app.infrastructure.extractors.txt_extractor import TxtExtractor

import logging
logger = logging.getLogger(__name__)

class ExtractorFactory:
    @staticmethod
    def get_extractor(file_name: str):
        file_extension = file_name.split(".")[-1].lower()
        if file_extension == "pdf":
            return PDFExtractor()
        elif file_extension == "docx":
            return DocxExtractor()
        elif file_extension == "txt":
            return TxtExtractor()
        else:
            raise UnsupportedFileError(f"Unsupported file type: {file_extension}")


class FileExtractor:
    def __init__(self):
        self.factory = ExtractorFactory()

    def extract(self, file_name: str, file_bytes: bytes) -> str:
        logger.info(f"Starting extraction for {file_name}")

        try:
            extractor = self.factory.get_extractor(file_name)
            text = extractor.extract(file_bytes)
            logger.info(f"Extraction completed for {file_name}")
            return text
        except UnsupportedFileError:
            logger.error(f"Unsupported file type: {file_name}")
            raise
        except EmptyContentError:
            logger.error(f"Empty content in {file_name}")
            raise
        except FileExtractionError:
            logger.error(f"Extraction failed for {file_name}")
            raise
        except Exception as e:
            logger.exception(f"Unexcepted error during extraction of {file_name}")
            raise FileExtractionError(f"Unexpected error while extracting ") from e
    