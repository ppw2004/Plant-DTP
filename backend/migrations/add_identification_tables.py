"""
添加植物识别功能数据库迁移

运行此脚本添加植物识别相关的数据库表和字段
"""
from sqlalchemy import create_engine, text
from app.core.config import settings
import sys


def migrate():
    """执行数据库迁移"""
    engine = create_engine(settings.DATABASE_URL)

    with engine.connect() as conn:
        # 开始事务
        trans = conn.begin()

        try:
            print("开始数据库迁移...")

            # 1. 创建 plant_identifications 表
            print("创建 plant_identifications 表...")
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS plant_identifications (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER,
                    image_url VARCHAR(500) NOT NULL,
                    image_hash VARCHAR(64) UNIQUE,
                    api_provider VARCHAR(50) NOT NULL DEFAULT 'baidu',
                    request_id VARCHAR(100),
                    predictions TEXT NOT NULL,
                    selected_plant_id INTEGER REFERENCES plants(id) ON DELETE SET NULL,
                    feedback VARCHAR(20),
                    correct_name VARCHAR(200),
                    processing_time DECIMAL(5, 2),
                    cached BOOLEAN NOT NULL DEFAULT FALSE,
                    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
                )
            """))

            # 2. 创建索引
            print("创建索引...")
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_identifications_user
                ON plant_identifications(user_id)
            """))
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_identifications_image_hash
                ON plant_identifications(image_hash)
            """))
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_identifications_selected_plant
                ON plant_identifications(selected_plant_id)
            """))
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_identifications_created_at
                ON plant_identifications(created_at DESC)
            """))

            # 3. 为 plants 表添加新字段
            print("为 plants 表添加新字段...")
            try:
                conn.execute(text("""
                    ALTER TABLE plants
                    ADD COLUMN IF NOT EXISTS identification_id INTEGER
                    REFERENCES plant_identifications(id) ON DELETE SET NULL
                """))
            except Exception as e:
                if "already exists" not in str(e):
                    print(f"添加 identification_id 字段时出错: {e}")

            try:
                conn.execute(text("""
                    ALTER TABLE plants
                    ADD COLUMN IF NOT EXISTS source VARCHAR(20)
                    NOT NULL DEFAULT 'manual'
                """))
            except Exception as e:
                if "already exists" not in str(e):
                    print(f"添加 source 字段时出错: {e}")

            try:
                conn.execute(text("""
                    ALTER TABLE plants
                    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP
                    NOT NULL DEFAULT NOW()
                """))
            except Exception as e:
                if "already exists" not in str(e):
                    print(f"添加 created_at 字段时出错: {e}")

            try:
                conn.execute(text("""
                    ALTER TABLE plants
                    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP
                    NOT NULL DEFAULT NOW()
                """))
            except Exception as e:
                if "already exists" not in str(e):
                    print(f"添加 updated_at 字段时出错: {e}")

            # 4. 为 plants 表创建新索引
            print("为 plants 表创建新索引...")
            try:
                conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_plants_identification_id
                    ON plants(identification_id)
                """))
            except Exception as e:
                print(f"创建索引时出错: {e}")

            # 提交事务
            trans.commit()
            print("\n✅ 数据库迁移完成！")

        except Exception as e:
            # 回滚事务
            trans.rollback()
            print(f"\n❌ 迁移失败: {e}")
            sys.exit(1)


if __name__ == "__main__":
    migrate()
