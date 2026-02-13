from datetime import datetime

from pydantic import BaseModel, ConfigDict


class LineItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category: str
    label: str
    value: float | None
    is_total: bool
    indent_level: int
    sort_order: int


class FinancialStatementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    document_id: int
    statement_type: str
    period: str
    period_end_date: str | None
    currency: str | None
    unit: str | None
    source_pages: str | None
    created_at: datetime
    line_items: list[LineItemResponse]


class ParseJobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    document_id: int
    status: str
    total_chunks: int
    completed_chunks: int
    error_message: str | None
    created_at: datetime
    updated_at: datetime


class DocumentStatementsResponse(BaseModel):
    parse_job: ParseJobResponse | None
    statements: list[FinancialStatementResponse]
