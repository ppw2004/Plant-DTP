"""
植物模型
"""
from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base


class Plant(Base):
    __tablename__ = "plants"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    shelf_id = Column(Integer, ForeignKey("plant_shelves.id", ondelete="SET NULL"), nullable=True)
    shelf_order = Column(Integer, default=0, nullable=False)
    name = Column(String(100), nullable=False)
    scientific_name = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    purchase_date = Column(Date, nullable=True)
    health_status = Column(String(20), default="healthy")
    is_active = Column(Boolean, default=True)

    def to_dict(self, include_images=False, room_name=None):
        """
        转换为字典格式

        Args:
            include_images: 是否包含主图信息
            room_name: 房间名称（需要在外部查询时传入）
        """
        from app.models.plant_image import PlantImage

        data = {
            "id": self.id,
            "roomId": self.room_id,
            "shelfId": self.shelf_id,
            "shelfOrder": self.shelf_order,
            "name": self.name,
            "scientificName": self.scientific_name,
            "description": self.description,
            "purchaseDate": self.purchase_date.isoformat() if self.purchase_date else None,
            "healthStatus": self.health_status,
            "isActive": self.is_active
        }

        # 添加房间名称
        if room_name:
            data["roomName"] = room_name

        # 添加主图信息
        if include_images:
            # 先查找标记为主图的图片
            primary_image = self.db.query(PlantImage).filter(
                PlantImage.plant_id == self.id,
                PlantImage.is_primary == True
            ).first()

            # 如果没有主图，使用第一张图片（按创建时间排序）
            if not primary_image:
                primary_image = self.db.query(PlantImage).filter(
                    PlantImage.plant_id == self.id
                ).order_by(PlantImage.created_at).first()

            if primary_image:
                data["primaryImage"] = primary_image.to_dict()
            else:
                data["primaryImage"] = None

            # 添加图片数量
            data["imageCount"] = self.db.query(PlantImage).filter(
                PlantImage.plant_id == self.id
            ).count()

        return data
