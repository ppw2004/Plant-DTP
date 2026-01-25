"""
植物Service
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.plant import Plant


class PlantService:
    def __init__(self, db: Session):
        self.db = db

    def get_plants(self, room_id: Optional[int] = None, health_status: Optional[str] = None,
                   search: Optional[str] = None, skip: int = 0, limit: int = 20) -> List[dict]:
        """获取植物列表"""
        query = self.db.query(Plant)
        if room_id:
            query = query.filter(Plant.room_id == room_id)
        if health_status:
            query = query.filter(Plant.health_status == health_status)
        if search:
            query = query.filter(Plant.name.ilike(f"%{search}%"))
        plants = query.order_by(Plant.id).offset(skip).limit(limit).all()
        return [plant.to_dict() for plant in plants]

    def count_plants(self, room_id: Optional[int] = None, health_status: Optional[str] = None,
                     search: Optional[str] = None) -> int:
        """统计植物数量"""
        query = self.db.query(Plant)
        if room_id:
            query = query.filter(Plant.room_id == room_id)
        if health_status:
            query = query.filter(Plant.health_status == health_status)
        if search:
            query = query.filter(Plant.name.ilike(f"%{search}%"))
        return query.count()

    def get_plant(self, plant_id: int) -> Optional[dict]:
        """获取单个植物"""
        plant = self.db.query(Plant).filter(Plant.id == plant_id).first()
        return plant.to_dict() if plant else None

    def create_plant(self, plant_data) -> dict:
        """创建植物"""
        new_plant = Plant(**plant_data.dict())
        self.db.add(new_plant)
        self.db.commit()
        self.db.refresh(new_plant)
        return new_plant.to_dict()

    def update_plant(self, plant_id: int, plant_data) -> Optional[dict]:
        """更新植物"""
        plant = self.db.query(Plant).filter(Plant.id == plant_id).first()
        if not plant:
            return None
        for key, value in plant_data.dict(exclude_unset=True).items():
            setattr(plant, key, value)
        self.db.commit()
        self.db.refresh(plant)
        return plant.to_dict()

    def delete_plant(self, plant_id: int) -> bool:
        """删除植物"""
        plant = self.db.query(Plant).filter(Plant.id == plant_id).first()
        if not plant:
            return False
        self.db.delete(plant)
        self.db.commit()
        return True
