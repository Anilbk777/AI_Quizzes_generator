from fastapi import FastAPI
from app.api.routes import router
from dotenv import load_dotenv
import uvicorn
import os

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="AI Quiz Generator API")

app.include_router(router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Quiz Generator API"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)