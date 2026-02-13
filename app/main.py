from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.investments.router import router as investments_router
from app.documents.router import router as documents_router
from app.search.router import router as search_router
from app.securities.router import router as securities_router
from app.financial_parsing.router import router as financial_parsing_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Finance Document Management API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(investments_router, prefix="/api/v1")
app.include_router(documents_router, prefix="/api/v1")
app.include_router(search_router, prefix="/api/v1")
app.include_router(securities_router, prefix="/api/v1")
app.include_router(financial_parsing_router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok"}
