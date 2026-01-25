"""
花架 Service
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.plant_shelf import PlantShelf
from app.models.plant import Plant


class PlantShelfService:
    def __init__(self, db: Session):
        self.db = db

    def get_shelves(self, room_id: int) -> List[dict]:
        """获取房间的所有花架（默认花架始终在最前）"""
        shelves = (
            self.db.query(PlantShelf)
            .filter(PlantShelf.room_id == room_id)
            .order_by(PlantShelf.is_default.desc(), PlantShelf.sort_order)
            .all()
        )

        result = []
        for shelf in shelves:
            shelf_dict = shelf.to_dict()
            # 获取花架上的植物数量
            plant_count = (
                self.db.query(Plant)
                .filter(Plant.shelf_id == shelf.id)
                .count()
            )
            shelf_dict["plantCount"] = plant_count
            result.append(shelf_dict)

        return result

    def get_shelf(self, shelf_id: int) -> Optional[dict]:
        """获取单个花架"""
        shelf = self.db.query(PlantShelf).filter(PlantShelf.id == shelf_id).first()
        if not shelf:
            return None

        shelf_dict = shelf.to_dict()

        # 获取花架上的植物
        plants = (
            self.db.query(Plant)
            .filter(Plant.shelf_id == shelf_id)
            .order_by(Plant.shelf_order)
            .all()
        )

        shelf_dict["plants"] = [plant.to_dict() for plant in plants]
        shelf_dict["plantCount"] = len(plants)

        return shelf_dict

    def create_shelf(self, room_id: int, shelf_data) -> dict:
        """创建花架"""
        new_shelf = PlantShelf(**shelf_data.dict(), room_id=room_id)

        # 设置 sort_order 为当前最大值 + 1
        max_order = (
            self.db.query(PlantShelf)
            .filter(PlantShelf.room_id == room_id)
            .count()
        )
        new_shelf.sort_order = max_order

        self.db.add(new_shelf)
        self.db.commit()
        self.db.refresh(new_shelf)

        result = new_shelf.to_dict()
        result["plantCount"] = 0
        return result

    def update_shelf(self, shelf_id: int, shelf_data) -> Optional[dict]:
        """更新花架"""
        shelf = self.db.query(PlantShelf).filter(PlantShelf.id == shelf_id).first()
        if not shelf:
            return None

        for key, value in shelf_data.dict(exclude_unset=True).items():
            setattr(shelf, key, value)

        self.db.commit()
        self.db.refresh(shelf)

        result = shelf.to_dict()
        result["plantCount"] = (
            self.db.query(Plant)
            .filter(Plant.shelf_id == shelf_id)
            .count()
        )
        return result

    def delete_shelf(self, shelf_id: int) -> bool:
        """删除花架"""
        shelf = self.db.query(PlantShelf).filter(PlantShelf.id == shelf_id).first()
        if not shelf:
            return False

        self.db.delete(shelf)
        self.db.commit()
        return True

    def reorder_shelves(self, room_id: int, shelf_ids: List[int]) -> bool:
        """重新排序花架（默认花架不参与排序）"""
        shelves = (
            self.db.query(PlantShelf)
            .filter(PlantShelf.room_id == room_id, PlantShelf.is_default == False)
            .all()
        )

        shelf_map = {shelf.id: shelf for shelf in shelves}

        for index, shelf_id in enumerate(shelf_ids):
            if shelf_id in shelf_map:
                shelf_map[shelf_id].sort_order = index

        self.db.commit()
        return True

    def move_plant_to_shelf(
        self, plant_id: int, shelf_id: Optional[int], new_order: Optional[int] = None
    ) -> dict:
        """移动植物到花架"""
        plant = self.db.query(Plant).filter(Plant.id == plant_id).first()
        if not plant:
            return None

        old_shelf_id = plant.shelf_id
        plant.shelf_id = shelf_id

        # 如果移动到花架，更新房间ID为花架所在的房间
        if shelf_id is not None:
            shelf = self.db.query(PlantShelf).filter(PlantShelf.id == shelf_id).first()
            if shelf:
                plant.room_id = shelf.room_id

        # 如果指定了新顺序，设置新顺序
        if new_order is not None:
            plant.shelf_order = new_order
        elif shelf_id is not None:
            # 自动设置为最后
            max_order = (
                self.db.query(Plant)
                .filter(Plant.shelf_id == shelf_id)
                .count()
            )
            plant.shelf_order = max_order

        self.db.commit()
        self.db.refresh(plant)

        return {
            "plant": plant.to_dict(),
            "oldShelfId": old_shelf_id,
            "newShelfId": shelf_id
        }

    def reorder_plants_on_shelf(self, shelf_id: int, plant_orders: List[dict]) -> bool:
        """重新排序花架上的植物

        Args:
            shelf_id: 花架ID
            plant_orders: 植物顺序列表 [{"plant_id": 1, "order": 0}, ...]
        """
        try:
            for item in plant_orders:
                # 支持两种键名格式：plant_id 和 plantId
                plant_id = item.get("plant_id") or item.get("plantId")
                order = item.get("order") or item.get("shelfOrder", 0)

                plant = (
                    self.db.query(Plant)
                    .filter(Plant.id == plant_id, Plant.shelf_id == shelf_id)
                    .first()
                )
                if plant:
                    plant.shelf_order = order
                else:
                    print(f"Warning: Plant {plant_id} not found on shelf {shelf_id}")

            self.db.commit()
            return True
        except Exception as e:
            print(f"Error in reorder_plants_on_shelf: {e}")
            self.db.rollback()
            raise
