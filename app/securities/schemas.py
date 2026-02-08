from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SecurityCreate(BaseModel):
    description: str | None = None
    investment_round: str | None = None
    investment_date: str | None = None
    investment_size: float | None = None
    price_per_share: float | None = None
    notes: str | None = None


class SecurityUpdate(BaseModel):
    description: str | None = None
    investment_round: str | None = None
    investment_date: str | None = None
    investment_size: float | None = None
    price_per_share: float | None = None
    notes: str | None = None


class SecurityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    investment_id: int
    description: str | None
    investment_round: str | None
    investment_date: str | None
    investment_size: float | None
    price_per_share: float | None
    notes: str | None
    created_at: datetime
    updated_at: datetime


class SecurityListResponse(BaseModel):
    items: list[SecurityResponse]
    total: int
