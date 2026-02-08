import shutil
from pathlib import Path

from sqlalchemy.orm import Session

from app.config import settings
from app.exceptions import not_found
from app.investments.service import get_investment
from app.securities.models import Security
from app.securities.schemas import SecurityCreate, SecurityUpdate


def create_security(db: Session, investment_id: int, data: SecurityCreate) -> Security:
    get_investment(db, investment_id)
    security = Security(investment_id=investment_id, **data.model_dump())
    db.add(security)
    db.commit()
    db.refresh(security)
    return security


def list_securities(db: Session, investment_id: int) -> tuple[list[Security], int]:
    get_investment(db, investment_id)
    items = (
        db.query(Security)
        .filter(Security.investment_id == investment_id)
        .order_by(Security.created_at.desc())
        .all()
    )
    return items, len(items)


def get_security(db: Session, investment_id: int, security_id: int) -> Security:
    security = (
        db.query(Security)
        .filter(Security.id == security_id, Security.investment_id == investment_id)
        .first()
    )
    if not security:
        raise not_found(f"Security {security_id} not found for investment {investment_id}")
    return security


def update_security(
    db: Session, investment_id: int, security_id: int, data: SecurityUpdate
) -> Security:
    security = get_security(db, investment_id, security_id)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(security, key, value)
    db.commit()
    db.refresh(security)
    return security


def delete_security(db: Session, investment_id: int, security_id: int) -> None:
    security = get_security(db, investment_id, security_id)
    investment = get_investment(db, investment_id)
    # Remove security subfolder if it exists
    folder = settings.UPLOAD_ROOT / "investments" / investment.investment_name / f"security_{security_id}"
    if folder.exists():
        shutil.rmtree(folder)
    db.delete(security)
    db.commit()
