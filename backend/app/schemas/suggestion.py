"""
建议 Pydantic Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class SuggestionBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1, max_length=5000)
    category: str = Field(default="功能请求")
    priority: str = Field(default="medium")


class SuggestionCreate(SuggestionBase):
    pass


class SuggestionUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, min_length=1, max_length=5000)
    status: Optional[str] = None
    priority: Optional[str] = None


class SuggestionResponse(BaseModel):
    success: bool
    data: dict
    message: Optional[str] = None
