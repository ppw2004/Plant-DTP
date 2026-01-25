#!/usr/bin/env python3
"""
测试数据准备脚本

用于快速准备演示和测试用的数据

运行方式：
    python scripts/prepare_test_data.py [--clean]
    --clean: 先清理所有数据再创建
"""

import sys
import os
import argparse
from pathlib import Path

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models import room, plant, task_type, plant_image, plant_config


def prepare_test_data(clean: bool = False):
    """准备测试数据"""

    print("🌱 开始准备测试数据...")

    db = SessionLocal()

    try:
        # 1. 清理数据（如果需要）
        if clean:
            print("🧹 清理现有数据...")
            db.query(plant_image.PlantImage).delete()
            db.query(plant_config.PlantConfig).delete()
            db.query(plant.Plant).delete()
            db.query(room.Room).delete()
            db.commit()
            print("✅ 数据清理完成")

        # 2. 创建房间
        print("\n🏠 创建房间...")
        rooms_data = [
            {
                "name": "阳光房",
                "description": "朝南的阳光房，全年光照充足",
                "location_type": "indoor",
                "icon": "sun",
                "color": "#FF9800",
                "sort_order": 1
            },
            {
                "name": "客厅",
                "description": "宽敞明亮的客厅",
                "location_type": "indoor",
                "icon": "sofa",
                "color": "#4CAF50",
                "sort_order": 2
            },
            {
                "name": "阳台",
                "description": "朝东阳台，早晨阳光好",
                "location_type": "balcony",
                "icon": "sun",
                "color": "#2196F3",
                "sort_order": 3
            }
        ]

        created_rooms = []
        for room_data in rooms_data:
            new_room = room.Room(**room_data)
            db.add(new_room)
            created_rooms.append(new_room)

        db.commit()
        print(f"✅ 创建了 {len(created_rooms)} 个房间")

        # 3. 创建植物
        print("\n🌿 创建植物...")

        # 阳光房的植物
        plants_data = [
            # 阳光房
            {
                "room_id": created_rooms[0].id,
                "name": "小红花仙人球",
                "scientific_name": "Mammillaria hahniana",
                "description": "美丽的仙人球，开花时粉色小花环绕球体",
                "purchase_date": "2024-01-20",
                "health_status": "healthy",
                "is_active": True
            },
            {
                "room_id": created_rooms[0].id,
                "name": "金琥仙人球",
                "scientific_name": "Echinocactus grusonii",
                "description": "大型球形仙人掌，金刺非常壮观",
                "purchase_date": "2023-06-15",
                "health_status": "thriving",
                "is_active": True
            },
            # 客厅
            {
                "room_id": created_rooms[1].id,
                "name": "龟背竹",
                "scientific_name": "Monstera deliciosa",
                "description": "大型观叶植物，叶片独特如龟背",
                "purchase_date": "2023-03-10",
                "health_status": "healthy",
                "is_active": True
            },
            {
                "room_id": created_rooms[1].id,
                "name": "橡皮树",
                "scientific_name": "Ficus elastica",
                "description": "叶片厚实光亮，很好养护",
                "purchase_date": "2023-05-20",
                "health_status": "thriving",
                "is_active": True
            },
            # 阳台
            {
                "room_id": created_rooms[2].id,
                "name": "多肉组合",
                "scientific_name": "Succulent Plants",
                "description": "多种多肉植物组合种植",
                "purchase_date": "2024-01-10",
                "health_status": "healthy",
                "is_active": True
            }
        ]

        created_plants = []
        for plant_data in plants_data:
            new_plant = plant.Plant(**plant_data)
            db.add(new_plant)
            created_plants.append(new_plant)

        db.commit()
        print(f"✅ 创建了 {len(created_plants)} 株植物")

        # 4. 添加图片
        print("\n📸 添加图片...")
        images_data = [
            {
                "plant_id": created_plants[0].id,  # 小红花仙人球
                "url": "/uploads/3a57a7420415d90bdb936558e6e62b00.jpg",
                "caption": "小红花仙人球 - 刚买来的样子",
                "is_primary": True,
                "file_size": 2300000,
                "width": 3024,
                "height": 4032
            },
            {
                "plant_id": created_plants[0].id,
                "url": "/uploads/cactus_flower.jpg",
                "caption": "开花时的样子",
                "is_primary": False,
                "file_size": 1800000,
                "width": 2880,
                "height": 3840
            },
            {
                "plant_id": created_plants[2].id,  # 龟背竹
                "url": "/uploads/monstera.jpg",
                "caption": "龟背竹整体照",
                "is_primary": True,
                "file_size": 2500000,
                "width": 3200,
                "height": 4200
            }
        ]

        for img_data in images_data:
            new_image = plant_image.PlantImage(**img_data)
            db.add(new_image)

        db.commit()
        print(f"✅ 添加了 {len(images_data)} 张图片")

        # 5. 创建养护配置
        print("\n⚙️  创建养护配置...")
        configs_data = [
            # 小红花仙人球
            {
                "plant_id": created_plants[0].id,
                "task_type_id": 1,  # 浇水
                "interval_days": 14,
                "notes": "14天浇水一次，冬季减少到20天"
            },
            {
                "plant_id": created_plants[0].id,
                "task_type_id": 2,  # 施肥
                "interval_days": 60,
                "notes": "每2个月施肥一次"
            },
            # 金琥仙人球
            {
                "plant_id": created_plants[1].id,
                "task_type_id": 1,
                "interval_days": 21,
                "notes": "21天浇水一次，耐旱"
            },
            # 龟背竹
            {
                "plant_id": created_plants[2].id,
                "task_type_id": 1,
                "interval_days": 7,
                "notes": "每周浇水一次，保持土壤湿润"
            },
            {
                "plant_id": created_plants[2].id,
                "task_type_id": 5,  # 喷雾
                "interval_days": 2,
                "notes": "每2天喷雾一次，增加空气湿度"
            },
            # 橡皮树
            {
                "plant_id": created_plants[3].id,
                "task_type_id": 1,
                "interval_days": 10,
                "notes": "10天浇水一次"
            },
            # 多肉组合
            {
                "plant_id": created_plants[4].id,
                "task_type_id": 1,
                "interval_days": 15,
                "notes": "15天浇水一次，宁干勿湿"
            }
        ]

        for config_data in configs_data:
            new_config = plant_config.PlantConfig(**config_data)
            db.add(new_config)

        db.commit()
        print(f"✅ 创建了 {len(configs_data)} 个养护配置")

        # 6. 打印统计信息
        print("\n📊 测试数据统计:")
        print(f"   房间: {len(created_rooms)} 个")
        print(f"   植物: {len(created_plants)} 株")
        print(f"   图片: {len(images_data)} 张")
        print(f"   配置: {len(configs_data)} 个")

        # 7. 详细数据
        print("\n📋 详细数据:")
        for r in created_rooms:
            plants_in_room = [p for p in created_plants if p.room_id == r.id]
            print(f"\n🏠 {r.name} ({r.description})")
            print(f"   植物: {len(plants_in_room)} 株")
            for p in plants_in_room:
                configs = db.query(plant_config.PlantConfig).filter(
                    plant_config.PlantConfig.plant_id == p.id
                ).all()
                images = db.query(plant_image.PlantImage).filter(
                    plant_image.PlantImage.plant_id == p.id
                ).all()
                print(f"      • {p.name} ({p.health_status})")
                print(f"        配置: {len(configs)} 个, 图片: {len(images)} 张")

        print("\n🎉 测试数据准备完成！")

        return True

    except Exception as e:
        print(f"\n❌ 准备测试数据失败: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return False

    finally:
        db.close()


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="准备测试数据")
    parser.add_argument(
        "--clean",
        action="store_true",
        help="先清理所有数据再创建"
    )
    args = parser.parse_args()

    success = prepare_test_data(clean=args.clean)
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
