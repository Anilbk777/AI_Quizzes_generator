from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional, Any
from app.domain.enums import InputType, Difficulty
from app.core.logger import logger
from app.core.exceptions import QuizGenerationError, YouTubeAccessError
from app.services.quiz_service import QuizService
from app.schemas.response import QuizResponse
from app.utils.schema_mapper import SchemaMapper

router = APIRouter()
quiz_service = QuizService()


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

        return sources[input_type]

@router.post("/mcq/generate", response_model=QuizResponse)
async def generate_mcq(
    input_type: InputType = Form(...),
    num_questions: int = Form(5),
    difficulty: Difficulty = Form(Difficulty.MEDIUM),
    provider_name: str = Form("groq"),
    topic: str = Form(None),
    youtube_url: str = Form(None),
    file: UploadFile = File(None),
):
    """
    Endpoint to generate Multiple Choice Questions based on various inputs (topic, file, or YouTube URL).
    """
    try:
        logger.info(
            f"Received MCQ generation request - input_type: {input_type}, "
            f"num_questions: {num_questions}, difficulty: {difficulty}, provider_name: {provider_name}"
        )
        
        # 1. Validate and prepare input data based on type
        input_data = await InputResolver.resolve(
            input_type=input_type,
            topic=topic,
            youtube_url=youtube_url,
            file=file
        )
        # 2. Generate quiz domain model through the service
        quiz = quiz_service.generate_quiz(
            input_type=input_type, 
            input_data=input_data, 
            num_questions=num_questions, 
            provider_name=provider_name,
            difficulty=difficulty
        )
        
        # 3. Map Domain model to API Response Schema
        quiz_data = SchemaMapper.to_quiz_data(
            quiz=quiz, 
            input_type=input_type.value, 
            model_used=provider_name
        )
        
        logger.info("MCQ generation successful")

        return QuizResponse(
            success=True,
            data=quiz_data,
            message="Quiz generated successfully"
        )
    
    except YouTubeAccessError as e:
        logger.warning(f"YouTube access error: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail={
                "error": "youtube_access_blocked",
                "message": str(e),
                "suggestion": "Try again later or submit the video topic as text instead."
            }
        )
    except QuizGenerationError as e:
        logger.error(f"Quiz generation failed: {str(e)}")
        raise HTTPException(status_code=422, detail=str(e))
    except HTTPException:
        # Re-raise explicit HTTP exceptions
        raise
    except Exception as e:
        logger.exception("Unexpected error in MCQ generation")
        raise HTTPException(
            status_code=500, 
            detail="An unexpected error occurred during MCQ generation"
        )
