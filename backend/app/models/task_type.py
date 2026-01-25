"""
任务类型模型
"""
from sqlalchemy import Column, Integer, String, Text, Boolean
from app.core.database import Base


class TaskType(Base):
    __tablename__ = "task_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    icon = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    default_interval = Column(Integer, default=7)
    is_system = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "code": self.code,
            "icon": self.icon,
            "description": self.description,
            "defaultInterval": self.default_interval,
            "isSystem": self.is_system,
            "sortOrder": self.sort_order
        }
