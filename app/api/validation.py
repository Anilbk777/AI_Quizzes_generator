from app.domain.enums import InputType
from fastapi import HTTPException, UploadFile
from typing import Optional, Any

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

        # Transform data
        if input_type == InputType.FILE:
            file_bytes = await file.read()
            return file_bytes, file.filename
            
        if len(topic) > 1000:
            raise HTTPException(
                status_code=400,
                detail="Topic must not exceed 1000 characters"
            )

        return sources[input_type]
