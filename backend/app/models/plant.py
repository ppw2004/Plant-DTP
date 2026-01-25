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
    shelf_id = Column(Integer, ForeignKey("plant_shelves.id", ondelete="SET NULL"), nullable=True)
    shelf_order = Column(Integer, default=0, nullable=False)
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
            "shelfId": self.shelf_id,
            "shelfOrder": self.shelf_order,
            "name": self.name,
            "scientificName": self.scientific_name,
            "description": self.description,
            "purchaseDate": self.purchase_date.isoformat() if self.purchase_date else None,
            "healthStatus": self.health_status,
            "isActive": self.is_active
        }
