"""
植物识别 Pydantic Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class PlantPrediction(BaseModel):
    """单个识别结果"""
    rank: int = Field(..., ge=1, le=10)
    name: str = Field(..., min_length=1, max_length=200)
    scientific_name: Optional[str] = Field(None, max_length=200)
    confidence: float = Field(..., ge=0.0, le=1.0)
    baike_url: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "rank": 1,
                "name": "绿萝",
                "scientificName": "Epipremnum aureum",
                "confidence": 0.95,
                "baikeUrl": "https://baike.baidu.com/item/绿萝",
                "description": "绿萝，属于麒麟叶属植物，大型常绿藤本..."
            }
        }


class IdentificationResult(BaseModel):
    """识别结果响应"""
    request_id: str
    predictions: List[PlantPrediction]
    processing_time: float
    cached: bool

    class Config:
        json_schema_extra = {
            "example": {
                "requestId": "req_20241201_001",
                "predictions": [
                    {
                        "rank": 1,
                        "name": "绿萝",
                        "confidence": 0.95,
                        "baikeUrl": "https://baike.baidu.com/item/绿萝"
                    }
                ],
                "processingTime": 1.23,
                "cached": False
            }
        }


class IdentificationCreate(BaseModel):
    """创建识别请求"""
    include_details: bool = Field(default=True, description="是否返回百科信息")


class IdentificationFeedback(BaseModel):
    """识别反馈"""
    feedback: str = Field(..., pattern="^(correct|incorrect|skipped)$")
    plant_id: Optional[int] = None
    correct_name: Optional[str] = Field(None, max_length=200)

    class Config:
        json_schema_extra = {
            "example": {
                "feedback": "correct",
                "plantId": 123,
                "correctName": None
            }
        }


class CreatePlantFromIdentification(BaseModel):
    """基于识别结果创建植物"""
    room_id: int = Field(..., gt=0, alias="roomId")
    shelf_id: Optional[int] = Field(None, alias="shelfId")
    purchase_date: Optional[str] = Field(None, alias="purchaseDate")
    health_status: str = Field(default="healthy", pattern="^(healthy|good|fair|poor|critical)$", alias="healthStatus")

    class Config:
        populate_by_name = True  # 允许使用字段别名
        json_schema_extra = {
            "example": {
                "roomId": 1,
                "shelfId": None,
                "purchaseDate": "2024-01-01",
                "healthStatus": "healthy"
            }
        }


class IdentificationResponse(BaseModel):
    """识别记录响应"""
    id: int
    image_url: str
    image_hash: Optional[str]
    api_provider: str
    request_id: Optional[str]
    predictions: List[PlantPrediction]
    selected_plant_id: Optional[int]
    feedback: Optional[str]
    correct_name: Optional[str]
    processing_time: Optional[float]
    cached: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "imageUrl": "https://example.com/identifications/1.jpg",
                "imageHash": "a3f5d8c9b2e1f4a6...",
                "apiProvider": "baidu",
                "requestId": "req_20241201_001",
                "predictions": [
                    {
                        "rank": 1,
                        "name": "绿萝",
                        "confidence": 0.95
                    }
                ],
                "selectedPlantId": 123,
                "feedback": "correct",
                "correctName": None,
                "processingTime": 1.23,
                "cached": False,
                "createdAt": "2024-12-01T10:00:00Z",
                "updatedAt": "2024-12-01T10:05:00Z"
            }
        }


class IdentificationListResponse(BaseModel):
    """识别记录列表响应"""
    items: List[IdentificationResponse]
    total: int
    page: int
    limit: int
