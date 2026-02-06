from datetime import datetime

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Investment(Base):
    __tablename__ = "investments"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    investment_name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    series: Mapped[str | None] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, onupdate=datetime.utcnow
    )

    documents: Mapped[list["Document"]] = relationship(
        "Document", back_populates="investment", cascade="all, delete-orphan"
    )


# Avoid circular import — resolved at runtime by SQLAlchemy
from app.documents.models import Document  # noqa: E402, F401
