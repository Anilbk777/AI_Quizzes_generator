# AI Quiz Generator

**Transform any topic, YouTube video, or file into AI-generated multiple-choice quizzes in seconds.**

🚀 **Live Demo:** [ai-quizzes-generator.vercel.app](https://ai-quizzes-generator.vercel.app)

## Features

✨ **Multiple Input Sources:**
- Text topics
- PDF, DOCX, DOC, TXT files
- YouTube video transcripts

🧠 **AI-Powered:**
- Supports Groq and Google Gemini LLMs
- Dynamic prompt engineering
- Intelligent MCQ generation

⚙️ **Customizable Options:**
- Question count: 5, 10, 15, 20
- Difficulty levels: Easy, Medium, Hard
- Multiple LLM providers

📥 **Easy Export:**
- Download quizzes as PDF
- Export results and explanations

## Tech Stack

**Backend:**
- Python 3.11
- FastAPI + Uvicorn
- LangChain (LLM orchestration)
- PyMuPDF, python-docx (document parsing)
- youtube-transcript-api

**Frontend:**
- HTML5, CSS3, JavaScript
- Responsive UI with animations
- jsPDF integration

**DevOps:**
- Docker (multi-stage build)
- Non-root containerization

**Language Distribution:**
- Python (30.4%) | CSS (31%) | JavaScript (24.2%) | HTML (12.1%) | Dockerfile (2.3%)

## Quick Start

### Prerequisites
- Python 3.11+
- Docker (optional)
- API keys: Groq API or Google Gemini

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Anilbk777/AI_Quizzes_generator.git
   cd AI_Quizzes_generator
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Run the backend:**
   ```bash
   python app/main.py
   ```

   Server runs at `http://localhost:8000`

5. **Serve the frontend:**
   ```bash
   # Using Python's simple HTTP server
   cd frontend
   python -m http.server 3000
   ```

   Access at `http://localhost:3000`

### Docker

```bash
docker build -t ai-quiz-generator .
docker run -p 8000:8000 --env-file .env ai-quiz-generator
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Welcome message |
| `/health` | GET | Health check |
| `/api/mcq/generate` | POST | Generate quiz from input |

### POST `/api/mcq/generate`

**Parameters:**
- `input_type` (enum): `topic`, `file`, `youtube`
- `topic` (string, optional): Topic for MCQ generation
- `youtube_url` (string, optional): YouTube video URL
- `file` (file, optional): PDF/DOCX/DOC/TXT document
- `num_questions` (int, default: 5): 5, 10, 15, or 20
- `difficulty` (enum, default: `medium`): `easy`, `medium`, `hard`
- `provider_name` (string, default: `groq`): `groq` or `gemini`

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [...],
    "input_source": "...",
    "model_used": "..."
  },
  "message": "Quiz generated successfully"
}
```

## Project Structure

```
AI_Quizzes_generator/
├── app/
│   ├── api/              # API routes & validation
│   ├── core/             # Config, logging, exceptions
│   ├── domain/           # Enums, data models
│   ├── factories/        # LLM provider factories
│   ├── infrastructure/   # Document parsing utilities
│   ├── schemas/          # Pydantic request/response models
│   ├── services/         # Business logic
│   │   ├── ai_service.py
│   │   ├── quiz_service.py
│   │   ├── mcq_chain.py
│   │   └── prompt_builder.py
│   ├── strategies/       # Quiz generation strategies
│   ├── utils/            # Utility functions
│   └── main.py           # FastAPI app entry point
├── frontend/             # Static web interface
│   ├── index.html
│   ├── app.js
│   ├── api.js
│   └── style.css
├── Dockerfile            # Multi-stage Docker build
├── requirements.txt      # Python dependencies
└── README.md
```

## Environment Variables

Create a `.env` file:

```env
# Groq API (if using Groq provider)
GROQ_API_KEY=your_groq_api_key

# Google Gemini (if using Gemini provider)
GOOGLE_API_KEY=your_google_api_key

# Optional
LOG_LEVEL=info
API_HOST=0.0.0.0
API_PORT=8000
```

## Key Features Explained

### 1. **Multiple Input Handlers**
- **Text Input:** Direct topic submission
- **File Upload:** Parses PDF, DOCX, DOC, TXT files
- **YouTube Integration:** Extracts transcripts from public videos

### 2. **Intelligent MCQ Generation**
- Contextual prompt engineering
- Difficulty-level adaptation
- Multiple-choice options validation

### 3. **LLM Flexibility**
- Pluggable LLM providers
- Factory pattern for provider instantiation
- Support for Groq (fast, free) and Google Gemini

### 4. **Frontend Features**
- Real-time progress tracking
- Interactive quiz UI
- Answer explanations
- PDF export functionality

## Supported File Formats

| Format | Extension | Support |
|--------|-----------|---------|
| PDF    | .pdf      | ✅ |
| Word   | .docx     | ✅ |
| Word   | .doc      | ✅ |
| Text   | .txt      | ✅ |
| Max File Size | - | 10 MB |

## Error Handling

The API gracefully handles common errors:

- **YouTube Access Blocked:** Returns 503 with suggestion to use text input
- **Invalid File Format:** 400 Bad Request
- **Quiz Generation Failure:** 500 Internal Server Error with details
- **Missing Parameters:** 400 Bad Request

## Performance

- **Multi-stage Docker build:** Minimal image size
- **Non-root user execution:** Enhanced security
- **Pre-built dependency wheels:** Fast container startup
- **2 Uvicorn workers:** Concurrent request handling

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

- [ ] Support for more document formats (EPUB, RTF)
- [ ] Custom MCQ templates
- [ ] Quiz analytics and performance tracking
- [ ] Multi-language support
- [ ] User authentication and quiz history

## License

This project is open source. Check the repository for license details.

## Support

- 📧 Issues: [GitHub Issues](https://github.com/Anilbk777/AI_Quizzes_generator/issues)
- 🌐 Live Demo: [ai-quizzes-generator.vercel.app](https://ai-quizzes-generator.vercel.app)

---

**Built with ❤️ for educators and learners worldwide.**
