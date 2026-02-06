from datetime import datetime

from pydantic import BaseModel, ConfigDict


class InvestmentCreate(BaseModel):
    investment_name: str
    series: str | None = None
    description: str | None = None


class InvestmentUpdate(BaseModel):
    investment_name: str | None = None
    series: str | None = None
    description: str | None = None


class InvestmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    investment_name: str
    series: str | None
    description: str | None
    created_at: datetime
    updated_at: datetime


class InvestmentListResponse(BaseModel):
    items: list[InvestmentResponse]
    total: int
    page: int
    size: int
