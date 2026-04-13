from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.domain.enums import InputType
from app.core.logger import logger
from app.core.exceptions import QuizGenerationError
from app.services.quiz_service import QuizService
from app.schemas.response import QuizResponse
from app.utils.schema_mapper import SchemaMapper

router = APIRouter()
quiz_service = QuizService()

@router.post("/mcq/generate", response_model=QuizResponse)
async def generate_mcq(
    input_type: InputType = Form(...),
    num_questions: int = Form(5),
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
            f"num_questions: {num_questions}, provider_name: {provider_name}"
        )
        
        # 1. Validate and prepare input data based on type
        input_data = None
        if input_type == InputType.TOPIC:
            if not topic:
                raise HTTPException(status_code=400, detail="Topic is required for topic input type")
            input_data = topic
        elif input_type == InputType.YOUTUBE:
            if not youtube_url:
                raise HTTPException(status_code=400, detail="YouTube URL is required for YouTube input type")
            input_data = youtube_url
        elif input_type == InputType.FILE:
            if not file:
                raise HTTPException(status_code=400, detail="File is required for file input type")
            file_bytes = await file.read()
            input_data = (file_bytes, file.filename)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported input type: {input_type}")
        
        # 2. Generate quiz domain model through the service
        quiz = quiz_service.generate_quiz(
            input_type=input_type, 
            input_data=input_data, 
            num_questions=num_questions, 
            provider_name=provider_name
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
    
    except QuizGenerationError as e:
        logger.error(f"Quiz generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except HTTPException:
        # Re-raise explicit HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error in MCQ generation: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail="An unexpected error occurred during MCQ generation"
        )
