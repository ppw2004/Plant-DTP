"""
植物养护配置 Pydantic Schemas
"""
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime


class PlantConfigBase(BaseModel):
    task_type_id: int = Field(..., gt=0)
    interval_days: int = Field(..., ge=1, le=365, description="间隔天数，1-365天")
    window_period: int = Field(0, ge=0, le=30, description="窗口期天数，默认0天")
    is_active: bool = True
    season: Optional[str] = Field(None, max_length=10)
    notes: Optional[str] = None


class PlantConfigCreate(PlantConfigBase):
    pass  # plant_id从URL路径获取


class PlantConfigUpdate(BaseModel):
    interval_days: Optional[int] = Field(None, ge=1, le=365)
    window_period: Optional[int] = Field(None, ge=0, le=30)
    is_active: Optional[bool] = None
    season: Optional[str] = Field(None, max_length=10)
    notes: Optional[str] = None


class PlantConfigResponse(BaseModel):
    success: bool
    data: dict
