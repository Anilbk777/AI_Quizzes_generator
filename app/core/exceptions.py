class FileExtractionError(Exception):
    """Custom exception for file extraction errors"""
    pass

class UnsupportedFileError(FileExtractionError):
    """Custom exception for unsupported file types"""
    pass

class FileProcessingError(FileExtractionError):
    """Custom exception for file processing errors"""
    pass

class EmptyContentError(FileExtractionError):
    """Custom exception for empty content"""
    pass

class AIServiceError(Exception):
    """Base exception for AI service errors"""
    pass

class LLMProviderError(AIServiceError):
    """Exception for LLM provider related errors"""
    pass

class MCQGenerationError(AIServiceError):
    """Exception for MCQ generation failures"""
    pass

class QuizGenerationError(Exception):
    """Exception for quiz generation failures"""
    pass