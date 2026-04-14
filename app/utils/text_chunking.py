from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
import random
from app.core.logger import logger

class TextChunker:
    def __init__(
        self,
        chunk_size: int = 2000,
        chunk_overlap: int = 200,
    ):
        self._splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ".", " "],
        )

    def create_documents(self, text: str) -> list[Document]:
        docs = self._splitter.create_documents([text])
        return [
            doc for doc in docs
            if len(doc.page_content.strip()) > 5
        ]

    def get_content(self, text: str, num_questions: int, max_chars: int = 30000) -> str:
        """
        Returns a single merged string ready to send to the LLM.
        - Small content  → returns as is
        - Large content  → randomly samples chunks and merges them
        """
        documents = self.create_documents(text)

        if len(documents) <= num_questions:
            selected = documents
        else:
            logger.info(f"Sampling {num_questions} chunks from {len(documents)} total chunks")
            selected = random.sample(documents, k=num_questions)

        content = "\n\n".join(doc.page_content for doc in selected)
        
        if len(content) > max_chars:
            logger.warning(f"Merged content ({len(content)} chars) exceeds safety limit ({max_chars}). Truncating.")
            return content[:max_chars]
            
        return content