"""
植物Pydantic Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date


class PlantBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    scientific_name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    room_id: int
    purchase_date: Optional[date] = None
    health_status: str = "healthy"


class PlantCreate(PlantBase):
    pass


class PlantUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    scientific_name: Optional[str] = None
    description: Optional[str] = None
    room_id: Optional[int] = None
    purchase_date: Optional[date] = None
    health_status: Optional[str] = None


class PlantResponse(BaseModel):
    success: bool
    data: dict
