#!/usr/bin/env python3
"""
修复数据库中的缩略图URL（去除双重的.jpg.jpg扩展名）
"""
import sys
from pathlib import Path

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import SessionLocal
from app.models.plant_image import PlantImage


def fix_thumbnail_urls():
    """修复缩略图URL中的双重扩展名"""
    db = SessionLocal()
    try:
        # 查询所有有问题的缩略图URL
        images = db.query(PlantImage).filter(
            PlantImage.thumbnail_url.like('%.jpg.jpg')
        ).all()

        print(f"找到 {len(images)} 个需要修复的缩略图URL")

        for image in images:
            # 去除双重扩展名
            old_url = image.thumbnail_url
            new_url = old_url.replace('.jpg.jpg', '.jpg')
            image.thumbnail_url = new_url
            print(f"  ✅ 修复: {old_url} -> {new_url}")

        db.commit()
        print(f"\n✅ 成功修复 {len(images)} 条记录")

    finally:
        db.close()


if __name__ == "__main__":
    fix_thumbnail_urls()
