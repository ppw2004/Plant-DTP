"""
植物养护配置 Service
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.models.plant_config import PlantConfig


class PlantConfigService:
    def __init__(self, db: Session):
        self.db = db

    def get_configs(self, plant_id: int) -> List[dict]:
        """获取植物的所有养护配置"""
        from app.models.task_type import TaskType

        configs = self.db.query(PlantConfig).filter(
            PlantConfig.plant_id == plant_id
        ).order_by(PlantConfig.id).all()

        result = []
        for config in configs:
            config_dict = config.to_dict()
            # 添加任务类型名称和图标
            task_type = self.db.query(TaskType).filter(TaskType.id == config.task_type_id).first()
            if task_type:
                config_dict['taskTypeName'] = task_type.name
                config_dict['taskTypeIcon'] = task_type.icon
            result.append(config_dict)

        return result

    def get_config(self, config_id: int) -> Optional[dict]:
        """获取单个配置"""
        config = self.db.query(PlantConfig).filter(PlantConfig.id == config_id).first()
        return config.to_dict() if config else None

    def create_config(self, plant_id: int, config_data) -> dict:
        """创建养护配置"""
        new_config = PlantConfig(**config_data.dict(), plant_id=plant_id)

        # 设置初始的下次到期时间为创建时间 + 间隔天数
        if new_config.interval_days and not new_config.next_due_at:
            new_config.next_due_at = datetime.now() + timedelta(days=new_config.interval_days)

        self.db.add(new_config)
        self.db.commit()
        self.db.refresh(new_config)
        return new_config.to_dict()

    def update_config(self, config_id: int, config_data) -> Optional[dict]:
        """更新养护配置"""
        config = self.db.query(PlantConfig).filter(PlantConfig.id == config_id).first()
        if not config:
            return None

        for key, value in config_data.dict(exclude_unset=True).items():
            setattr(config, key, value)
        self.db.commit()
        self.db.refresh(config)
        return config.to_dict()

    def delete_config(self, config_id: int) -> bool:
        """删除养护配置"""
        config = self.db.query(PlantConfig).filter(PlantConfig.id == config_id).first()
        if not config:
            return False
        self.db.delete(config)
        self.db.commit()
        return True

    def mark_as_done(self, config_id: int, executed_at: Optional[datetime] = None) -> Optional[dict]:
        """标记任务为已完成，更新下次到期时间"""
        config = self.db.query(PlantConfig).filter(PlantConfig.id == config_id).first()
        if not config:
            return None

        executed_at = executed_at or datetime.now()
        config.last_done_at = executed_at

        # 基于原计划的下次到期时间计算新的周期，而不是基于实际执行时间
        # 这样可以保持养护周期的稳定性，避免提前浇水导致周期前移
        if config.interval_days and config.next_due_at:
            # 使用原计划的 next_due_at 作为基准，加上一个完整周期
            config.next_due_at = config.next_due_at + timedelta(days=config.interval_days)
        elif config.interval_days:
            # 如果没有 next_due_at（第一次完成），使用执行时间计算
            config.next_due_at = executed_at + timedelta(days=config.interval_days)

        self.db.commit()
        self.db.refresh(config)
        return config.to_dict()
