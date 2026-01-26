"""
植物图片模型
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base


class PlantImage(Base):
    __tablename__ = "plant_images"

    id = Column(Integer, primary_key=True, index=True)
    plant_id = Column(Integer, ForeignKey("plants.id", ondelete="CASCADE"), nullable=False)
    url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500), nullable=True)
    caption = Column(String(200), nullable=True)
    is_primary = Column(Boolean, default=False, nullable=False)
    file_size = Column(Integer, nullable=True)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    taken_at = Column(DateTime(timezone=True), nullable=True)  # 照片拍摄时间
    sort_order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def to_dict(self):
        # Helper function to fix localhost URLs
        def fix_url(url):
            if url and isinstance(url, str) and 'localhost:12801/uploads' in url:
                return url.replace('http://localhost:12801/uploads', '/uploads')
            return url

        return {
            "id": self.id,
            "plantId": self.plant_id,
            "url": fix_url(self.url),
            "thumbnailUrl": fix_url(self.thumbnail_url),
            "caption": self.caption,
            "isPrimary": self.is_primary,
            "fileSize": self.file_size,
            "width": self.width,
            "height": self.height,
            "takenAt": self.taken_at.isoformat() if self.taken_at else None,
            "sortOrder": self.sort_order,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }
