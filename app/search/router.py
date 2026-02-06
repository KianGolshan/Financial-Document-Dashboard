from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.search import service
from app.search.schemas import SearchResponse

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("/", response_model=SearchResponse)
def search(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    results = service.search_documents(db, q)
    return SearchResponse(results=results, total=len(results), query=q)
