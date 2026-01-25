"""
房间模型
"""
from sqlalchemy import Column, Integer, String, Text
from app.core.database import Base


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    location_type = Column(String(20), default="indoor")
    icon = Column(String(50), nullable=True)
    color = Column(String(7), nullable=True)
    sort_order = Column(Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "locationType": self.location_type,
            "icon": self.icon,
            "color": self.color,
            "sortOrder": self.sort_order
        }
