"""
房间Service
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.models.room import Room
from app.models.plant import Plant


class RoomService:
    def __init__(self, db: Session):
        self.db = db

    def get_rooms(self, location_type: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[dict]:
        """获取房间列表"""
        query = self.db.query(Room)
        if location_type:
            query = query.filter(Room.location_type == location_type)
        rooms = query.order_by(Room.sort_order).offset(skip).limit(limit).all()

        # 获取所有房间的植物数量
        room_ids = [room.id for room in rooms]
        plant_counts = (
            self.db.query(Plant.room_id, func.count(Plant.id).label('count'))
            .filter(Plant.room_id.in_(room_ids))
            .group_by(Plant.room_id)
            .all()
        )
        plant_count_map = {row.room_id: row.count for row in plant_counts}

        # 为每个房间添加植物数量
        result = []
        for room in rooms:
            room_dict = room.to_dict()
            room_dict['plantCount'] = plant_count_map.get(room.id, 0)
            result.append(room_dict)

        return result

    def count_rooms(self, location_type: Optional[str] = None) -> int:
        """统计房间数量"""
        query = self.db.query(Room)
        if location_type:
            query = query.filter(Room.location_type == location_type)
        return query.count()

    def get_room(self, room_id: int) -> Optional[dict]:
        """获取单个房间"""
        room = self.db.query(Room).filter(Room.id == room_id).first()
        if not room:
            return None

        room_dict = room.to_dict()
        # 获取房间的植物数量
        plant_count = (
            self.db.query(func.count(Plant.id))
            .filter(Plant.room_id == room_id)
            .scalar()
        )
        room_dict['plantCount'] = plant_count or 0
        return room_dict

    def create_room(self, room_data) -> dict:
        """创建房间"""
        new_room = Room(**room_data.dict())
        self.db.add(new_room)
        self.db.commit()
        self.db.refresh(new_room)
        return new_room.to_dict()

    def update_room(self, room_id: int, room_data) -> Optional[dict]:
        """更新房间"""
        room = self.db.query(Room).filter(Room.id == room_id).first()
        if not room:
            return None
        for key, value in room_data.dict(exclude_unset=True).items():
            setattr(room, key, value)
        self.db.commit()
        self.db.refresh(room)
        return room.to_dict()

    def delete_room(self, room_id: int) -> bool:
        """删除房间"""
        room = self.db.query(Room).filter(Room.id == room_id).first()
        if not room:
            return False
        self.db.delete(room)
        self.db.commit()
        return True
