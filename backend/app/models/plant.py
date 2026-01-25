"""
植物模型
"""
from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base


class Plant(Base):
    __tablename__ = "plants"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    name = Column(String(100), nullable=False)
    scientific_name = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    purchase_date = Column(Date, nullable=True)
    health_status = Column(String(20), default="healthy")
    is_active = Column(Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "roomId": self.room_id,
            "name": self.name,
            "scientificName": self.scientific_name,
            "description": self.description,
            "purchaseDate": self.purchase_date.isoformat() if self.purchase_date else None,
            "healthStatus": self.health_status,
            "isActive": self.is_active
        }
