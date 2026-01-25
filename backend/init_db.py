"""
数据库初始化脚本
创建表并填充初始数据
"""
from sqlalchemy import create_engine, text
from app.core.config import settings
from app.models import room, plant, task_type
from app.core.database import Base


def init_database():
    """初始化数据库"""
    print("🗄️  开始初始化数据库...")

    # 创建所有表
    engine = create_engine(settings.DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    print("✅ 数据库表创建完成")

    # 填充初始数据
    from sqlalchemy.orm import sessionmaker
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        # 检查是否已有数据
        if db.query(task_type.TaskType).count() > 0:
            print("⚠️  数据已有初始数据，跳过填充")
            return

        # 填充任务类型
        task_types = [
            task_type.TaskType(
                name="浇水",
                code="watering",
                icon="💧",
                description="定期浇水保持土壤湿润",
                default_interval=7,
                is_system=True,
                sort_order=1
            ),
            task_type.TaskType(
                name="施肥",
                code="fertilizing",
                icon="🌱",
                description="每月施肥一次促进生长",
                default_interval=30,
                is_system=True,
                sort_order=2
            ),
            task_type.TaskType(
                name="修剪",
                code="pruning",
                icon="✂️",
                description="定期修剪枯叶和过密的枝条",
                default_interval=60,
                is_system=True,
                sort_order=3
            ),
            task_type.TaskType(
                name="换盆",
                code="repotting",
                icon="🪴",
                description="每年或隔年换盆一次",
                default_interval=365,
                is_system=True,
                sort_order=4
            ),
            task_type.TaskType(
                name="喷雾",
                code="spraying",
                icon="🌿",
                description="增加空气湿度",
                default_interval=3,
                is_system=True,
                sort_order=5
            )
        ]

        for tt in task_types:
            db.add(tt)

        # 添加示例房间
        rooms = [
            room.Room(
                name="客厅",
                description="朝南的客厅，光线充足",
                location_type="indoor",
                icon="sofa",
                color="#4CAF50",
                sort_order=1
            ),
            room.Room(
                name="阳台",
                description="朝东阳台，早上阳光好",
                location_type="balcony",
                icon="sun",
                color="#FF9800",
                sort_order=2
            )
        ]

        for r in rooms:
            db.add(r)

        db.commit()
        print("✅ 初始数据填充完成")
        print(f"   - {len(task_types)} 个任务类型")
        print(f"   - {len(rooms)} 个示例房间")

    except Exception as e:
        print(f"❌ 初始化失败: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_database()
    print("\n🎉 数据库初始化完成！")
