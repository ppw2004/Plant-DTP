"""
植物识别记录模型
"""
from sqlalchemy import Column, Integer, String, Text, DECIMAL, Boolean, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class PlantIdentification(Base):
    __tablename__ = "plant_identifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)  # 单用户应用，预留字段但不设置外键
    image_url = Column(String(500), nullable=False)
    image_hash = Column(String(64), nullable=True, unique=True)  # MD5哈希，用于去重
    api_provider = Column(String(50), default="baidu", nullable=False)
    request_id = Column(String(100), nullable=True)
    predictions = Column(Text, nullable=False)  # JSON字符串存储识别结果
    selected_plant_id = Column(Integer, ForeignKey("plants.id"), nullable=True)
    feedback = Column(String(20), nullable=True)  # correct | incorrect | skipped
    correct_name = Column(String(200), nullable=True)
    processing_time = Column(DECIMAL(5, 2), nullable=True)
    cached = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # 关系
    plant = relationship("Plant", foreign_keys=[selected_plant_id])

    __table_args__ = (
        Index('idx_identifications_user', 'user_id'),
        Index('idx_identifications_image_hash', 'image_hash'),
        Index('idx_identifications_selected_plant', 'selected_plant_id'),
        Index('idx_identifications_created_at', 'created_at'),
    )

    def to_dict(self, include_plant=False):
        """
        转换为字典格式

        Args:
            include_plant: 是否包含关联的植物信息
        """
        import json

        data = {
            "id": self.id,
            "imageUrl": self.image_url,
            "imageHash": self.image_hash,
            "apiProvider": self.api_provider,
            "requestId": self.request_id,
            "predictions": json.loads(self.predictions) if self.predictions else [],
            "selectedPlantId": self.selected_plant_id,
            "feedback": self.feedback,
            "correctName": self.correct_name,
            "processingTime": float(self.processing_time) if self.processing_time else None,
            "cached": self.cached,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }

        # 添加关联的植物信息
        if include_plant and self.plant:
            data["selectedPlant"] = {
                "id": self.plant.id,
                "name": self.plant.name,
                "primaryImageUrl": self.plant.get_primary_image_url()
            }

        return data

    def get_top_prediction(self):
        """获取置信度最高的识别结果"""
        import json
        predictions = json.loads(self.predictions) if self.predictions else []
        return predictions[0] if predictions else None
