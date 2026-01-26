#!/usr/bin/env python3
"""
批量更新plant_images表中的URL
将 http://localhost:12801/uploads 替换为 /uploads
"""
import sys
from pathlib import Path

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from app.core.config import settings

def fix_image_urls():
    """修复数据库中的图片URL"""
    engine = create_engine(settings.DATABASE_URL, echo=False)

    with engine.connect() as conn:
        # 查看当前有多少条记录需要更新
        result = conn.execute(text("""
            SELECT COUNT(*) as count
            FROM plant_images
            WHERE url LIKE '%localhost:12801/uploads%'
        """))
        count = result.fetchone()[0]
        print(f"找到 {count} 条需要更新的记录")

        if count > 0:
            # 更新URL
            update_result = conn.execute(text("""
                UPDATE plant_images
                SET url = REPLACE(url, 'http://localhost:12801/uploads', '/uploads')
                WHERE url LIKE '%localhost:12801/uploads%'
            """))
            conn.commit()
            print(f"✅ 成功更新 {update_result.rowcount} 条记录")

            # 显示更新后的结果
            result = conn.execute(text("""
                SELECT id, url
                FROM plant_images
                ORDER BY created_at DESC
                LIMIT 10
            """))
            print("\n更新后的URL示例：")
            for row in result:
                print(f"  ID {row[0]}: {row[1]}")
        else:
            print("✅ 没有需要更新的记录")

if __name__ == "__main__":
    try:
        fix_image_urls()
    except Exception as e:
        print(f"❌ 错误: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
