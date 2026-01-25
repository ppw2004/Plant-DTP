"""
任务Service
"""
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta, date
from app.models.plant_config import PlantConfig
from app.models.plant import Plant
from app.models.task_type import TaskType


class TaskService:
    def __init__(self, db: Session):
        self.db = db

    def _format_task(self, config: PlantConfig) -> dict:
        """格式化任务数据"""
        plant = self.db.query(Plant).filter(Plant.id == config.plant_id).first()
        task_type = self.db.query(TaskType).filter(TaskType.id == config.task_type_id).first()

        return {
            "id": config.id,
            "plantId": config.plant_id,
            "plantName": plant.name if plant else None,
            "plant": plant.to_dict() if plant else None,
            "configId": config.id,
            "taskType": task_type.name if task_type else None,
            "dueDate": config.next_due_at.isoformat() if config.next_due_at else None,
            "status": "pending",
            "completedAt": config.last_done_at.isoformat() if config.last_done_at else None,
            "notes": config.notes,
            "createdAt": config.next_due_at.isoformat() if config.next_due_at else None,
        }

    def get_today_tasks(self) -> List[dict]:
        """获取今日任务"""
        today = date.today()
        tomorrow = today + timedelta(days=1)

        # 查询今天到期的任务
        configs = self.db.query(PlantConfig).filter(
            PlantConfig.is_active == True,
            PlantConfig.next_due_at != None,
            PlantConfig.next_due_at >= today,
            PlantConfig.next_due_at < tomorrow
        ).all()

        return [self._format_task(config) for config in configs]

    def get_upcoming_tasks(self, days: int = 7) -> List[dict]:
        """获取即将到期任务"""
        today = date.today()
        future_date = today + timedelta(days=days)

        # 查询未来 days 天内到期的任务（不包括今天）
        configs = self.db.query(PlantConfig).filter(
            PlantConfig.is_active == True,
            PlantConfig.next_due_at != None,
            PlantConfig.next_due_at >= future_date,
            PlantConfig.next_due_at < future_date + timedelta(days=1)
        ).all()

        return [self._format_task(config) for config in configs]

    def get_overdue_tasks(self) -> List[dict]:
        """获取逾期任务"""
        today = date.today()

        # 查询已经过期的任务
        configs = self.db.query(PlantConfig).filter(
            PlantConfig.is_active == True,
            PlantConfig.next_due_at != None,
            PlantConfig.next_due_at < today
        ).all()

        return [self._format_task(config) for config in configs]

    def complete_task(self, task_id: int, note: str = None, executed_at: datetime = None) -> dict:
        """完成任务"""
        from app.services.plant_config_service import PlantConfigService

        service = PlantConfigService(self.db)
        result = service.mark_as_done(task_id, executed_at)

        if not result:
            raise ValueError("任务不存在")

        return result
