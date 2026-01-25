"""
花架 Pydantic Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional


class PlantShelfBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    sort_order: Optional[int] = 0
    capacity: Optional[int] = 10
    is_default: Optional[bool] = False  # 是否为默认花架


class PlantShelfCreate(PlantShelfBase):
    pass  # room_id 从 URL 获取


class PlantShelfUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    sort_order: Optional[int] = None
    capacity: Optional[int] = None
    # is_default 不能通过更新修改，只能通过数据库直接操作


class PlantShelfResponse(BaseModel):
    success: bool
    data: dict
    message: Optional[str] = None
