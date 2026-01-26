"""
植物Service
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.plant import Plant
from app.models.plant_shelf import PlantShelf


class PlantService:
    def __init__(self, db: Session):
        self.db = db

    def get_plants(self, room_id: Optional[int] = None, health_status: Optional[str] = None,
                   search: Optional[str] = None, skip: int = 0, limit: int = 20,
                   is_active: bool = True) -> List[dict]:
        """获取植物列表（包含主图和房间名称）"""
        from sqlalchemy.orm import joinedload
        from app.models.room import Room

        # 使用 JOIN 来获取房间名称，避免 N+1 查询
        query = self.db.query(
            Plant, Room.name.label('room_name')
        ).join(
            Room, Plant.room_id == Room.id
        ).filter(Plant.is_active == is_active)

        if room_id:
            query = query.filter(Plant.room_id == room_id)
        if health_status:
            query = query.filter(Plant.health_status == health_status)
        if search:
            query = query.filter(Plant.name.ilike(f"%{search}%"))

        query = query.order_by(Plant.id).offset(skip).limit(limit)
        results = query.all()

        # 为每个植物对象传递 db session
        result = []
        for plant, room_name in results:
            # 临时绑定 db session 到 plant 对象
            plant.db = self.db
            result.append(plant.to_dict(include_images=True, room_name=room_name))
        return result

    def count_plants(self, room_id: Optional[int] = None, health_status: Optional[str] = None,
                     search: Optional[str] = None, is_active: bool = True) -> int:
        """统计植物数量"""
        query = self.db.query(Plant).filter(Plant.is_active == is_active)
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
        """创建植物（自动分配到默认花架）"""
        # 创建植物对象
        new_plant = Plant(**plant_data.dict())

        # 如果没有指定花架，自动分配到房间的默认花架
        if new_plant.shelf_id is None:
            default_shelf = (
                self.db.query(PlantShelf)
                .filter(
                    PlantShelf.room_id == new_plant.room_id,
                    PlantShelf.is_default == True
                )
                .first()
            )
            if default_shelf:
                # 获取当前最大的order
                max_order = (
                    self.db.query(Plant)
                    .filter(Plant.shelf_id == default_shelf.id)
                    .count()
                )
                new_plant.shelf_id = default_shelf.id
                new_plant.shelf_order = max_order

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

    def archive_plant(self, plant_id: int) -> bool:
        """归档植物（软删除）"""
        plant = self.db.query(Plant).filter(Plant.id == plant_id).first()
        if not plant:
            return False
        plant.is_active = False
        self.db.commit()
        return True

    def restore_plant(self, plant_id: int) -> Optional[dict]:
        """恢复归档的植物"""
        plant = self.db.query(Plant).filter(Plant.id == plant_id).first()
        if not plant:
            return None
        plant.is_active = True
        self.db.commit()
        self.db.refresh(plant)
        return plant.to_dict()

    def permanent_delete_plant(self, plant_id: int) -> bool:
        """永久删除植物"""
        plant = self.db.query(Plant).filter(Plant.id == plant_id).first()
        if not plant:
            return False
        self.db.delete(plant)
        self.db.commit()
        return True
