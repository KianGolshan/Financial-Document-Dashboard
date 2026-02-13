# Finance-Project

A document management and search application for finance documents. Built with a FastAPI backend and React frontend.
Document extract functionality - parsing PDF uploads for financial tables and results, extracting for storage in the dashboard and export functionality into excel.

## Owner
Kian Golshan

## Prerequisites

- Python 3.12+
- Node.js 18+

## Getting Started

### Backend

```bash
# Install Python dependencies
pip install -r requirements.txt

# Start the API server (runs on http://localhost:8000)
1. uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend

# Install Node dependencies
npm install

# Start the dev server (runs on http://localhost:5173)
2. npm run dev
```

The frontend dev server proxies `/api` requests to the backend automatically.

### Configuration

The backend can be configured via environment variables (prefixed with `FINANCE_`):

| Variable | Default | Description |
|---|---|---|
| `FINANCE_DATABASE_URL` | `sqlite:///./finance.db` | Database connection string |
| `FINANCE_UPLOAD_ROOT` | `uploads` | Directory for uploaded files |
| `FINANCE_MAX_FILE_SIZE` | `52428800` (50 MB) | Max upload size in bytes |

## API

- **Docs**: http://localhost:8000/docs (Swagger UI)
- **Health check**: `GET /health`
- All routes are under `/api/v1` (investments, documents, search)
