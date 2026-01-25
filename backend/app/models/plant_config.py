"""
植物养护配置模型
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from app.core.database import Base


class PlantConfig(Base):
    __tablename__ = "plant_configs"

    id = Column(Integer, primary_key=True, index=True)
    plant_id = Column(Integer, ForeignKey("plants.id", ondelete="CASCADE"), nullable=False)
    task_type_id = Column(Integer, ForeignKey("task_types.id", ondelete="CASCADE"), nullable=False)
    interval_days = Column(Integer, nullable=False, default=7)
    window_period = Column(Integer, nullable=False, default=0)
    last_done_at = Column(DateTime(timezone=True), nullable=True)
    next_due_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    season = Column(String(10), nullable=True)
    notes = Column(Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "plantId": self.plant_id,
            "taskTypeId": self.task_type_id,
            "intervalDays": self.interval_days,
            "windowPeriod": self.window_period,
            "lastDoneAt": self.last_done_at.isoformat() if self.last_done_at else None,
            "nextDueAt": self.next_due_at.isoformat() if self.next_due_at else None,
            "isActive": self.is_active,
            "season": self.season,
            "notes": self.notes
        }
