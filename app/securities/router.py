from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.securities import service
from app.securities.schemas import (
    SecurityCreate,
    SecurityListResponse,
    SecurityResponse,
    SecurityUpdate,
)

router = APIRouter(
    prefix="/investments/{investment_id}/securities",
    tags=["Securities"],
)


@router.post("/", response_model=SecurityResponse, status_code=status.HTTP_201_CREATED)
def create_security(
    investment_id: int, data: SecurityCreate, db: Session = Depends(get_db)
):
    return service.create_security(db, investment_id, data)


@router.get("/", response_model=SecurityListResponse)
def list_securities(investment_id: int, db: Session = Depends(get_db)):
    items, total = service.list_securities(db, investment_id)
    return SecurityListResponse(items=items, total=total)


@router.get("/{security_id}", response_model=SecurityResponse)
def get_security(
    investment_id: int, security_id: int, db: Session = Depends(get_db)
):
    return service.get_security(db, investment_id, security_id)


@router.put("/{security_id}", response_model=SecurityResponse)
def update_security(
    investment_id: int,
    security_id: int,
    data: SecurityUpdate,
    db: Session = Depends(get_db),
):
    return service.update_security(db, investment_id, security_id, data)


@router.delete("/{security_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_security(
    investment_id: int, security_id: int, db: Session = Depends(get_db)
):
    service.delete_security(db, investment_id, security_id)
