from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.investments import service
from app.investments.schemas import (
    InvestmentCreate,
    InvestmentListResponse,
    InvestmentResponse,
    InvestmentUpdate,
)

router = APIRouter(prefix="/investments", tags=["Investments"])


@router.post("/", response_model=InvestmentResponse, status_code=status.HTTP_201_CREATED)
def create_investment(data: InvestmentCreate, db: Session = Depends(get_db)):
    return service.create_investment(db, data)


@router.get("/", response_model=InvestmentListResponse)
def list_investments(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    items, total = service.list_investments(db, page, size)
    return InvestmentListResponse(items=items, total=total, page=page, size=size)


@router.get("/{investment_id}", response_model=InvestmentResponse)
def get_investment(investment_id: int, db: Session = Depends(get_db)):
    return service.get_investment(db, investment_id)


@router.put("/{investment_id}", response_model=InvestmentResponse)
def update_investment(
    investment_id: int, data: InvestmentUpdate, db: Session = Depends(get_db)
):
    return service.update_investment(db, investment_id, data)


@router.delete("/{investment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_investment(investment_id: int, db: Session = Depends(get_db)):
    service.delete_investment(db, investment_id)
