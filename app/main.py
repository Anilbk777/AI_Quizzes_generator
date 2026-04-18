from fastapi import FastAPI
from app.api.routes import router
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI Quiz Generator API")

app.include_router(router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Quiz Generator API"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)