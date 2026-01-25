"""
植物图片 Pydantic Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class PlantImageBase(BaseModel):
    url: str = Field(..., max_length=500)
    caption: Optional[str] = Field(None, max_length=200)
    is_primary: bool = False
    taken_at: Optional[datetime] = None  # 照片拍摄时间


class PlantImageCreate(PlantImageBase):
    pass  # plant_id从URL路径获取


class PlantImageUpdate(BaseModel):
    url: Optional[str] = Field(None, max_length=500)
    caption: Optional[str] = Field(None, max_length=200)
    is_primary: Optional[bool] = None


class PlantImageResponse(BaseModel):
    success: bool
    data: dict
