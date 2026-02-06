from datetime import datetime

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    investment_id: Mapped[int] = mapped_column(ForeignKey("investments.id"), nullable=False)
    document_name: Mapped[str] = mapped_column(String(255), nullable=False)
    document_date: Mapped[str | None] = mapped_column(String(50))
    investment_series: Mapped[str | None] = mapped_column(String(100))
    document_type: Mapped[str] = mapped_column(String(20), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size: Mapped[int] = mapped_column(nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    text_content: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, onupdate=datetime.utcnow
    )

    investment: Mapped["Investment"] = relationship(
        "Investment", back_populates="documents"
    )


from app.investments.models import Investment  # noqa: E402, F401
