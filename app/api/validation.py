from app.domain.enums import InputType
from fastapi import HTTPException, UploadFile
from typing import Optional, Any
import re

class InputResolver:
    """
    Responsible for validating and transforming incoming request data.
    Keeps controller clean and ensures single responsibility.
    """

    @staticmethod
    async def resolve(
        input_type: InputType,
        topic: Optional[str],
        youtube_url: Optional[str],
        file: Optional[UploadFile],
    ) -> Any:
        sources = {
            InputType.TOPIC: topic,
            InputType.YOUTUBE: youtube_url,
            InputType.FILE: file,
        }

        #  Ensure exactly one input source is provided
        provided_sources = [k for k, v in sources.items() if v is not None]
        if len(provided_sources) != 1:
            raise HTTPException(
                status_code=400,
                detail="Exactly one input source must be provided"
            )

        # Ensure it matches input_type
        if provided_sources[0] != input_type:
            raise HTTPException(
                status_code=400,
                detail=f"Mismatch between input_type ({input_type}) and provided data"
            )
        if input_type == InputType.FILE:
            if file and file.filename.split(".")[-1].lower() not in ["pdf", "doc", "docx", "txt"]:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid file type"
                )
            file_bytes = await file.read()
            return file_bytes, file.filename
            
        if input_type == InputType.TOPIC:
            if len(topic) > 1000:
                raise HTTPException(
                    status_code=400,
                    detail="Topic must not exceed 1000 characters"
                )
        
        if input_type == InputType.YOUTUBE:
            if not InputResolver.is_valid_youtube_url(youtube_url):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid YouTube URL"
                )

        return sources[input_type]

    @staticmethod
    def is_valid_youtube_url(url: str) -> bool:
        youtube_regex = r"^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})$"
        return re.match(youtube_regex, url) is not None
