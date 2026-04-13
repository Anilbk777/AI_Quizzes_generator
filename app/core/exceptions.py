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