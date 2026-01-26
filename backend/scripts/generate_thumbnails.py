#!/usr/bin/env python3
"""
为现有图片生成缩略图的脚本
"""
import sys
from pathlib import Path

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import SessionLocal
from app.models.plant_image import PlantImage
from app.utils.image_utils import create_thumbnail
import urllib.request


def generate_thumbnails_for_existing_images():
    """为所有没有缩略图的图片生成缩略图"""
    db = SessionLocal()
    try:
        # 查询所有没有缩略图的图片
        images = db.query(PlantImage).filter(
            PlantImage.thumbnail_url == None,
            PlantImage.url.like('/uploads/plants/%')
        ).all()

        print(f"找到 {len(images)} 张需要生成缩略图的图片")

        success_count = 0
        failed_count = 0

        for image in images:
            try:
                # 提取文件名
                filename = image.url.split('/')[-1]
                original_path = Path('uploads/plants') / filename

                if not original_path.exists():
                    print(f"  ⚠️  文件不存在: {original_path}")
                    failed_count += 1
                    continue

                # 生成缩略图文件名
                thumbnail_filename = f"thumb_{filename}.jpg"
                thumbnail_path = Path('uploads/plants/thumbnails') / thumbnail_filename

                # 生成缩略图
                if create_thumbnail(original_path, thumbnail_path, size=(300, 300), quality=85):
                    # 更新数据库
                    base_url = "http://82.156.213.38:12801"
                    image.thumbnail_url = f"{base_url}/uploads/plants/thumbnails/{thumbnail_filename}"
                    db.commit()
                    success_count += 1
                    print(f"  ✅ 生成缩略图: {thumbnail_filename}")
                else:
                    failed_count += 1
                    print(f"  ❌ 生成失败: {filename}")

            except Exception as e:
                failed_count += 1
                print(f"  ❌ 处理失败 {image.id}: {e}")

        print(f"\n✅ 成功: {success_count}")
        print(f"❌ 失败: {failed_count}")
        print(f"📊 总计: {len(images)}")

    finally:
        db.close()


if __name__ == "__main__":
    generate_thumbnails_for_existing_images()
