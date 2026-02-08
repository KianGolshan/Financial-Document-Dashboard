from datetime import datetime

from sqlalchemy import ForeignKey, String, Text, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Security(Base):
    __tablename__ = "securities"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    investment_id: Mapped[int] = mapped_column(ForeignKey("investments.id"), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    investment_round: Mapped[str | None] = mapped_column(String(100))
    investment_date: Mapped[str | None] = mapped_column(String(50))
    investment_size: Mapped[float | None] = mapped_column(Float)
    price_per_share: Mapped[float | None] = mapped_column(Float)
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, onupdate=datetime.utcnow
    )

    investment: Mapped["Investment"] = relationship(
        "Investment", back_populates="securities"
    )
    documents: Mapped[list["Document"]] = relationship(
        "Document", back_populates="security", cascade="all, delete-orphan"
    )


from app.investments.models import Investment  # noqa: E402, F401
from app.documents.models import Document  # noqa: E402, F401
