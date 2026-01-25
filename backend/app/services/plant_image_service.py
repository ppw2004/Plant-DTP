"""
植物图片 Service
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.plant_image import PlantImage


class PlantImageService:
    def __init__(self, db: Session):
        self.db = db

    def get_images(self, plant_id: int) -> List[dict]:
        """获取植物的所有图片"""
        images = self.db.query(PlantImage).filter(
            PlantImage.plant_id == plant_id
        ).order_by(PlantImage.sort_order, PlantImage.created_at).all()
        return [img.to_dict() for img in images]

    def get_primary_image(self, plant_id: int) -> Optional[dict]:
        """获取植物的主图"""
        image = self.db.query(PlantImage).filter(
            PlantImage.plant_id == plant_id,
            PlantImage.is_primary == True
        ).first()
        return image.to_dict() if image else None

    def create_image(self, plant_id: int, image_data) -> dict:
        """创建图片记录"""
        # 如果设置为primary，先取消其他primary
        if hasattr(image_data, 'is_primary') and image_data.is_primary:
            self.db.query(PlantImage).filter(
                PlantImage.plant_id == plant_id,
                PlantImage.is_primary == True
            ).update({"is_primary": False})

        new_image = PlantImage(**image_data.dict(), plant_id=plant_id)
        self.db.add(new_image)
        self.db.commit()
        self.db.refresh(new_image)
        return new_image.to_dict()

    def update_image(self, image_id: int, image_data) -> Optional[dict]:
        """更新图片信息"""
        image = self.db.query(PlantImage).filter(PlantImage.id == image_id).first()
        if not image:
            return None

        for key, value in image_data.dict(exclude_unset=True).items():
            setattr(image, key, value)
        self.db.commit()
        self.db.refresh(image)
        return image.to_dict()

    def delete_image(self, image_id: int) -> bool:
        """删除图片"""
        image = self.db.query(PlantImage).filter(PlantImage.id == image_id).first()
        if not image:
            return False
        self.db.delete(image)
        self.db.commit()
        return True
