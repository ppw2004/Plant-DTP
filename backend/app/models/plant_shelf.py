"""
花架模型
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from app.core.database import Base


class PlantShelf(Base):
    __tablename__ = "plant_shelves"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    sort_order = Column(Integer, default=0, nullable=False)
    capacity = Column(Integer, default=10, nullable=False)  # 花架容量
    is_active = Column(Boolean, default=True, nullable=False)
    is_default = Column(Boolean, default=False, nullable=False)  # 是否为默认花架

    def to_dict(self):
        return {
            "id": self.id,
            "roomId": self.room_id,
            "name": self.name,
            "description": self.description,
            "sortOrder": self.sort_order,
            "capacity": self.capacity,
            "isActive": self.is_active,
            "isDefault": self.is_default
        }
