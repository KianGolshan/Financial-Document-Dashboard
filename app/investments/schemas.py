from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.securities.schemas import SecurityResponse


class InvestmentCreate(BaseModel):
    investment_name: str
    asset_type: str | None = None
    description: str | None = None
    notes: str | None = None


class InvestmentUpdate(BaseModel):
    investment_name: str | None = None
    asset_type: str | None = None
    description: str | None = None
    notes: str | None = None


class InvestmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    investment_name: str
    asset_type: str | None
    description: str | None
    notes: str | None
    securities: list[SecurityResponse] = []
    created_at: datetime
    updated_at: datetime


class InvestmentListResponse(BaseModel):
    items: list[InvestmentResponse]
    total: int
    page: int
    size: int
