"""
植物模型
"""
from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
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
    identification_id = Column(Integer, ForeignKey("plant_identifications.id"), nullable=True)
    source = Column(String(20), default="manual", nullable=False)  # manual | identify
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

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
            "identificationId": self.identification_id,
            "source": self.source,
            "isActive": self.is_active,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None
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

    def get_primary_image_url(self):
        """获取主图URL"""
        from app.models.plant_image import PlantImage
        from app.core.database import get_db

        db = next(get_db())
        try:
            # 先查找标记为主图的图片
            primary_image = db.query(PlantImage).filter(
                PlantImage.plant_id == self.id,
                PlantImage.is_primary == True
            ).first()

            # 如果没有主图，使用第一张图片
            if not primary_image:
                primary_image = db.query(PlantImage).filter(
                    PlantImage.plant_id == self.id
                ).order_by(PlantImage.created_at).first()

            return primary_image.url if primary_image else None
        finally:
            db.close()
