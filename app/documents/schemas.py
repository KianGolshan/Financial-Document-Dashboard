from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    investment_id: int
    document_name: str
    document_date: str | None
    investment_series: str | None
    document_type: str
    file_path: str
    file_size: int
    original_filename: str
    created_at: datetime
    updated_at: datetime


class DocumentListResponse(BaseModel):
    items: list[DocumentResponse]
    total: int
