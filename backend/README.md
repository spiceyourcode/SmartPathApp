# SmartPath Backend API

AI-powered learning and career guidance system for Kenyan high school students (Grades 7-12).

## Features

- **User Management**: Registration, login, and profile management with JWT authentication
- **Academic Report Analysis**: Upload and analyze school reports with OCR support
- **AI Flashcard Generation**: Generate personalized study flashcards using LLM
- **Performance Analytics**: Track grades, trends, and predictions
- **Career Recommendations**: AI-powered career matching based on academic performance
- **Study Planning**: Intelligent study schedules and time management
- **Learning Insights**: Personalized feedback and recommendations

## Tech Stack

- **Framework**: FastAPI (Python 3.12+)
- **Database**: Supabase (managed PostgreSQL via SQLAlchemy ORM)
- **Authentication**: JWT tokens
- **LLM Integration**: Google Gemini (gemini-pro)
- **File Storage**: Local filesystem (configurable for S3/Supabase Storage)
- **OCR**: Tesseract OCR
- **Caching**: Redis (optional)

## Prerequisites

- Python 3.12 or higher
- Supabase account & project (PostgreSQL 17)
- Redis (optional, for caching)
- Tesseract OCR (for document processing)

## Installation

### 1. Clone the repository

```bash
cd backend
```

### 2. Create virtual environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```


Update `.env` with:


- JWT secret key (generate with: `openssl rand -hex 32`)
- Google Gemini API key
- Any other overrides you need
- LLM model 
- the postgres database url 


### 5. Initialize database connection

```bash
python database.py
```

This will verify the Supabase connection and create tables if they are missing.

## Running the Application

### Development Mode

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Using Docker

```bash
# Build and run with docker-compose
docker-compose up --build

# Or build Docker image
docker build -t smartpath-backend .
docker run -p 8000:8000 --env-file .env smartpath-backend
```

> **Note:** The Docker setup expects your `.env` file to contain valid Supabase credentials. No local PostgreSQL container is started.

## API Documentation

Once the server is running, access:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get token
- `GET /api/v1/auth/profile` - Get user profile

### Reports
- `POST /api/v1/reports/upload` - Upload academic report (file)
- `POST /api/v1/reports/upload-json` - Upload report data (JSON)
- `GET /api/v1/reports/history` - Get report history
- `POST /api/v1/reports/analyze` - Analyze a report

### Performance
- `GET /api/v1/performance/dashboard` - Get performance dashboard
- `GET /api/v1/performance/trends` - Get grade trends
- `GET /api/v1/performance/predictions` - Get grade predictions

### Flashcards
- `POST /api/v1/flashcards/generate` - Generate flashcards
- `GET /api/v1/flashcards/list` - List flashcards
- `POST /api/v1/flashcards/{id}/review` - Review a flashcard
- `POST /api/v1/flashcards/{id}/evaluate` - Evaluate answer

### Career
- `GET /api/v1/career/recommendations` - Get career recommendations
- `POST /api/v1/career/quiz` - Career interest quiz
- `GET /api/v1/career/{id}/details` - Get career details

### Study Plans
- `POST /api/v1/study-plans/generate` - Generate study plan
- `GET /api/v1/study-plans/active` - Get active plans
- `PUT /api/v1/study-plans/{id}/update` - Update plan
- `POST /api/v1/study-plans/{id}/log-session` - Log study session

### Insights
- `GET /api/v1/insights/feedback` - Get academic feedback
- `GET /api/v1/insights/learning-tips` - Get learning tips
- `GET /api/v1/insights/academic-analysis` - Get analysis

## Usage Examples

### Register a User

```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "securepassword123",
    "full_name": "John Doe",
    "user_type": "student",
    "grade_level": 10,
    "curriculum_type": "CBC"
  }'
```

### Login

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "securepassword123"
  }'
```

### Upload Report (with token)

```bash
curl -X POST "http://localhost:8000/api/v1/reports/upload-json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "term": "Term 1",
    "year": 2024,
    "report_date": "2024-03-15T00:00:00",
    "grades_json": {
      "Mathematics": "A",
      "English": "B+",
      "Physics": "B",
      "Chemistry": "A-"
    }
  }'
```

### Generate Flashcards

```bash
curl -X POST "http://localhost:8000/api/v1/flashcards/generate" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Mathematics",
    "topic": "Algebra",
    "count": 5,
    "grade_level": 10
  }'
```

## Project Structure

```
backend/
├── main.py              # FastAPI application and routes
├── models.py            # Pydantic models for validation
├── database.py          # SQLAlchemy models and database setup
├── services.py          # Business logic services
├── llm_service.py       # LLM integration (Google Gemini)
├── auth.py              # Authentication and JWT handling
├── utils.py             # Utility functions and algorithms
├── config.py            # Configuration management
├── requirements.txt     # Python dependencies
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose setup
├── .env.supabase        # Environment variables template
└── README.md            # This file
```

## Algorithms Implemented

1. **Grade Analysis**: Convert Kenyan grades (A-E) to numeric, calculate GPA
2. **Trend Analysis**: Linear regression for grade trends
3. **Weakness Identification**: Identify subjects below threshold
4. **Career Matching**: Subject-to-career mapping with scoring
5. **Study Planning**: Allocate study hours based on weaknesses
6. **Spaced Repetition**: Leitner system for flashcard reviews
7. **Performance Prediction**: Forecast future grades based on trends

## Kenyan Context

The system is specifically designed for:
- Kenyan grading system (A, B+, B, C+, C, D+, D, E)
- CBC and 8-4-4 curricula
- Kenyan universities and course requirements
- Local job market considerations
- Cultural context in recommendations

## Environment Variables

Key environment variables (see `.env.supabase` for full list):

- `SUPABASE_DB_URL`: Supabase PostgreSQL connection string
- `DATABASE_URL`: Usually set to `${SUPABASE_DB_URL}`
- `SUPABASE_URL` / `SUPABASE_KEY`: Supabase project credentials
- `SECRET_KEY`: JWT secret (generate with `openssl rand -hex 32`)
- `GEMINI_API_KEY`: Google Gemini API key
- `LLM_PROVIDER`: `gemini`
- `LLM_MODEL`: `gemini-pro` (or another Gemini model)

## Development

### Running Tests

```bash
pytest
```

### Code Formatting

```bash
black .
isort .
```

### Type Checking

```bash
mypy .
```

## Production Deployment

1. Set `DEBUG=False` in `.env`
2. Use a strong `SECRET_KEY`
3. Configure proper CORS origins
4. Set up database connection pooling
5. Use a production WSGI server (Gunicorn + Uvicorn workers)
6. Set up reverse proxy (Nginx)
7. Configure SSL/TLS
8. Set up monitoring and logging

## Troubleshooting

### Database Connection Issues

- Verify your Supabase project is healthy
- Check `SUPABASE_DB_URL` / `DATABASE_URL` format
- Make sure the database password is correct
- Confirm that tables exist in Supabase Table Editor

### LLM API Errors

- Verify `GEMINI_API_KEY` is set correctly
- Check Gemini quota/limits in Google AI Studio
- Review backend logs for error details

### OCR Not Working

- Install Tesseract: `apt-get install tesseract-ocr` (Linux) or `brew install tesseract` (Mac)
- Set `TESSERACT_CMD` in `.env` if needed

## License

[Your License Here]

## Support

For issues and questions, please open an issue on GitHub.

## Contributing

Contributions are welcome! Please follow the code style and submit pull requests.

