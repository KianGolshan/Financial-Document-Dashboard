from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.search import service
from app.search.schemas import SearchResponse

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("/", response_model=SearchResponse)
def search(
    q: str = Query(..., min_length=1),
    investment_id: int | None = Query(None),
    security_id: int | None = Query(None),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    db: Session = Depends(get_db),
):
    results = service.search_documents(
        db, q,
        investment_id=investment_id,
        security_id=security_id,
        date_from=date_from,
        date_to=date_to,
    )
    return SearchResponse(results=results, total=len(results), query=q)
