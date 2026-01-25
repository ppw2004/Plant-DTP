"""
房间Pydantic Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional


class RoomBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = None
    location_type: str = "indoor"
    icon: Optional[str] = None
    color: Optional[str] = None
    sort_order: int = 0


class RoomCreate(RoomBase):
    pass


class RoomUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = None
    location_type: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    sort_order: Optional[int] = None


class RoomResponse(BaseModel):
    success: bool
    data: dict


class RoomListResponse(BaseModel):
    success: bool
    data: dict
