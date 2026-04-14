from fastapi import FastAPI
from app.api.routes import router
import uvicorn

app = FastAPI(title="AI Quiz Generator API")

app.include_router(router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Quiz Generator API"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)