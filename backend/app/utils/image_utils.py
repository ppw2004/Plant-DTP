"""
图片处理工具
"""
from PIL import Image
from pathlib import Path
from typing import Optional
import io


def create_thumbnail(
    image_path: Path,
    thumbnail_path: Path,
    size: tuple = (300, 300),
    quality: int = 85
) -> bool:
    """
    创建图片缩略图

    Args:
        image_path: 原图路径
        thumbnail_path: 缩略图保存路径
        size: 缩略图尺寸 (width, height)
        quality: JPEG质量 (1-100)

    Returns:
        bool: 是否成功创建
    """
    try:
        # 打开图片
        with Image.open(image_path) as img:
            # 转换为RGB（处理RGBA等格式）
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')

            # 创建缩略图，保持宽高比
            img.thumbnail(size, Image.Resampling.LANCZOS)

            # 确保缩略图目录存在
            thumbnail_path.parent.mkdir(parents=True, exist_ok=True)

            # 保存缩略图
            img.save(thumbnail_path, 'JPEG', quality=quality, optimize=True)

            return True
    except Exception as e:
        print(f"创建缩略图失败: {e}")
        return False


def create_thumbnail_from_bytes(
    image_bytes: bytes,
    thumbnail_path: Path,
    size: tuple = (300, 300),
    quality: int = 85
) -> bool:
    """
    从字节流创建缩略图

    Args:
        image_bytes: 图片字节数据
        thumbnail_path: 缩略图保存路径
        size: 缩略图尺寸 (width, height)
        quality: JPEG质量 (1-100)

    Returns:
        bool: 是否成功创建
    """
    try:
        # 从字节流打开图片
        with Image.open(io.BytesIO(image_bytes)) as img:
            # 转换为RGB
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')

            # 创建缩略图
            img.thumbnail(size, Image.Resampling.LANCZOS)

            # 确保目录存在
            thumbnail_path.parent.mkdir(parents=True, exist_ok=True)

            # 保存缩略图
            img.save(thumbnail_path, 'JPEG', quality=quality, optimize=True)

            return True
    except Exception as e:
        print(f"从字节流创建缩略图失败: {e}")
        return False


def get_image_dimensions(image_path: Path) -> Optional[tuple]:
    """
    获取图片尺寸

    Args:
        image_path: 图片路径

    Returns:
        tuple: (width, height) 或 None
    """
    try:
        with Image.open(image_path) as img:
            return img.size
    except:
        return None
