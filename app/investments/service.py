import shutil
from pathlib import Path

from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import settings
from app.exceptions import conflict, not_found
from app.investments.models import Investment
from app.investments.schemas import InvestmentCreate, InvestmentUpdate


def create_investment(db: Session, data: InvestmentCreate) -> Investment:
    investment = Investment(**data.model_dump())
    db.add(investment)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise conflict(f"Investment '{data.investment_name}' already exists")
    db.refresh(investment)
    return investment


def list_investments(
    db: Session, page: int = 1, size: int = 20
) -> tuple[list[Investment], int]:
    total = db.query(func.count(Investment.id)).scalar() or 0
    items = (
        db.query(Investment)
        .order_by(Investment.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )
    return items, total


def get_investment(db: Session, investment_id: int) -> Investment:
    investment = db.query(Investment).filter(Investment.id == investment_id).first()
    if not investment:
        raise not_found(f"Investment {investment_id} not found")
    return investment


def update_investment(
    db: Session, investment_id: int, data: InvestmentUpdate
) -> Investment:
    investment = get_investment(db, investment_id)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(investment, key, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise conflict(f"Investment name '{data.investment_name}' already exists")
    db.refresh(investment)
    return investment


def delete_investment(db: Session, investment_id: int) -> None:
    investment = get_investment(db, investment_id)
    # Remove associated upload folder
    folder = settings.UPLOAD_ROOT / "investments" / investment.investment_name
    if folder.exists():
        shutil.rmtree(folder)
    db.delete(investment)
    db.commit()
