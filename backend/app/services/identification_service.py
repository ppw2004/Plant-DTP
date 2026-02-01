"""
植物识别业务服务
"""
import os
import json
import hashlib
import uuid
from typing import Optional, List, Dict
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.plant_identification import PlantIdentification
from app.models.plant import Plant
from app.models.plant_image import PlantImage
from app.services.baidu_ai_service import baidu_ai_service
from app.core.config import settings
from app.utils.image_utils import create_thumbnail, get_image_dimensions
from pathlib import Path
import shutil


class IdentificationService:
    """植物识别业务服务"""

    def __init__(self, db: Session):
        self.db = db

    async def identify_from_file(
        self,
        file_data: bytes,
        filename: str,
        user_id: Optional[int] = None,
        include_details: bool = True
    ) -> Dict:
        """
        从上传的文件识别植物

        Args:
            file_data: 图片二进制数据
            filename: 原始文件名
            user_id: 用户ID（可选）
            include_details: 是否包含详细信息

        Returns:
            识别结果字典
        """
        # 1. 保存图片到临时目录
        image_url = await self._save_temp_image(file_data, filename)

        # 2. 计算图片哈希
        image_hash = hashlib.md5(file_data).hexdigest()

        # 3. 检查是否有相同图片的识别记录（缓存）
        cached_result = await self._check_cache(image_hash)
        if cached_result:
            # 返回缓存结果
            cached_result["cached"] = True
            return cached_result

        # 4. 调用百度AI识别
        try:
            baike_num = 1 if include_details else 0
            api_result = await baidu_ai_service.identify_plant(file_data, baike_num)

            # 5. 保存识别记录到数据库
            identification = PlantIdentification(
                user_id=user_id,
                image_url=image_url,
                image_hash=image_hash,
                api_provider="baidu",
                request_id=api_result["request_id"],
                predictions=json.dumps(api_result["predictions"]),
                processing_time=api_result["processing_time"],
                cached=False
            )
            self.db.add(identification)
            self.db.commit()
            self.db.refresh(identification)

            # 6. 返回结果
            return {
                "requestId": api_result["request_id"],
                "predictions": api_result["predictions"],
                "processingTime": api_result["processing_time"],
                "cached": False,
                "identificationId": identification.id
            }

        except Exception as e:
            # 识别失败，删除已保存的图片
            self._delete_temp_image(image_url)
            raise e

    async def _save_temp_image(self, file_data: bytes, filename: str) -> str:
        """
        保存临时图片文件

        Args:
            file_data: 图片二进制数据
            filename: 原始文件名

        Returns:
            图片URL
        """
        # 创建临时目录
        temp_dir = settings.IDENTIFICATION_TEMP_DIR
        os.makedirs(temp_dir, exist_ok=True)

        # 生成唯一文件名
        ext = os.path.splitext(filename)[1]
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(temp_dir, unique_filename)

        # 保存文件
        with open(file_path, "wb") as f:
            f.write(file_data)

        # 返回URL（相对路径）
        return f"/{temp_dir}/{unique_filename}"

    def _delete_temp_image(self, image_url: str) -> bool:
        """
        删除临时图片文件

        Args:
            image_url: 图片URL

        Returns:
            是否删除成功
        """
        try:
            file_path = image_url.lstrip("/")
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception:
            return False

    async def _check_cache(self, image_hash: str) -> Optional[Dict]:
        """
        检查是否有缓存的识别结果

        Args:
            image_hash: 图片MD5哈希

        Returns:
            缓存的识别结果，如果没有则返回None
        """
        # 查询24小时内的相同图片记录
        from datetime import timedelta
        from sqlalchemy import and_

        time_threshold = datetime.now() - timedelta(seconds=settings.IDENTIFICATION_CACHE_TTL)

        cached = self.db.query(PlantIdentification).filter(
            and_(
                PlantIdentification.image_hash == image_hash,
                PlantIdentification.created_at >= time_threshold
            )
        ).first()

        if cached:
            predictions = json.loads(cached.predictions)
            return {
                "requestId": cached.request_id,
                "predictions": predictions,
                "processingTime": float(cached.processing_time) if cached.processing_time else 0,
                "cached": True,
                "identificationId": cached.id
            }

        return None

    def get_identification_history(
        self,
        user_id: Optional[int] = None,
        plant_id: Optional[int] = None,
        page: int = 1,
        limit: int = 20
    ) -> Dict:
        """
        获取识别历史记录

        Args:
            user_id: 用户ID筛选
            plant_id: 关联的植物ID筛选
            page: 页码
            limit: 每页数量

        Returns:
            分页的识别记录
        """
        query = self.db.query(PlantIdentification)

        # 筛选条件
        if user_id:
            query = query.filter(PlantIdentification.user_id == user_id)
        if plant_id:
            query = query.filter(PlantIdentification.selected_plant_id == plant_id)

        # 排序和分页
        query = query.order_by(desc(PlantIdentification.created_at))
        total = query.count()
        items = query.offset((page - 1) * limit).limit(limit).all()

        return {
            "items": [item.to_dict(include_plant=True) for item in items],
            "total": total,
            "page": page,
            "limit": limit,
            "totalPages": (total + limit - 1) // limit
        }

    def get_identification_by_id(self, identification_id: int) -> Optional[Dict]:
        """
        获取单个识别记录详情

        Args:
            identification_id: 识别记录ID

        Returns:
            识别记录字典，不存在则返回None
        """
        identification = self.db.query(PlantIdentification).filter(
            PlantIdentification.id == identification_id
        ).first()

        if identification:
            return identification.to_dict(include_plant=True)
        return None

    def submit_feedback(
        self,
        identification_id: int,
        feedback: str,
        plant_id: Optional[int] = None,
        correct_name: Optional[str] = None
    ) -> Optional[Dict]:
        """
        提交识别反馈

        Args:
            identification_id: 识别记录ID
            feedback: 反馈类型 (correct|incorrect|skipped)
            plant_id: 关联的植物ID
            correct_name: 用户修正的正确名称

        Returns:
            更新后的识别记录
        """
        identification = self.db.query(PlantIdentification).filter(
            PlantIdentification.id == identification_id
        ).first()

        if not identification:
            return None

        # 更新反馈信息
        identification.feedback = feedback
        identification.selected_plant_id = plant_id
        identification.correct_name = correct_name
        identification.updated_at = datetime.now()

        self.db.commit()
        self.db.refresh(identification)

        return identification.to_dict()

    def create_plant_from_identification(
        self,
        identification_id: int,
        room_id: int,
        shelf_id: Optional[int] = None,
        purchase_date: Optional[str] = None,
        health_status: str = "healthy"
    ) -> Optional[Dict]:
        """
        基于识别结果创建植物

        Args:
            identification_id: 识别记录ID
            room_id: 房间ID
            shelf_id: 花架ID（可选）
            purchase_date: 购买日期
            health_status: 健康状态

        Returns:
            创建的植物字典
        """
        # 获取识别记录
        identification = self.db.query(PlantIdentification).filter(
            PlantIdentification.id == identification_id
        ).first()

        if not identification:
            return None

        # 获取最佳识别结果
        predictions = json.loads(identification.predictions)
        if not predictions:
            raise ValueError("没有可用的识别结果")

        top_prediction = predictions[0]

        # 解析购买日期
        parsed_purchase_date = None
        if purchase_date:
            try:
                parsed_purchase_date = datetime.strptime(purchase_date, "%Y-%m-%d").date()
            except ValueError:
                pass

        # 创建植物
        plant = Plant(
            room_id=room_id,
            shelf_id=shelf_id,
            name=top_prediction["name"],
            scientific_name=top_prediction.get("scientificName"),
            description=top_prediction.get("description"),
            purchase_date=parsed_purchase_date,
            health_status=health_status,
            identification_id=identification_id,
            source="identify",
            shelf_order=0
        )

        self.db.add(plant)
        self.db.commit()
        self.db.refresh(plant)

        # 将识别照片添加为植物的主图
        try:
            print(f"[DEBUG] 开始添加识别照片 identification_id={identification.id}, plant_id={plant.id}")
            self._add_identification_image_to_plant(identification.id, plant.id)
            print("[DEBUG] 识别照片添加成功")
        except Exception as e:
            # 图片添加失败不影响植物创建
            import traceback
            print(f"添加识别照片失败: {e}")
            traceback.print_exc()

        # 更新识别记录的反馈
        identification.feedback = "correct"
        identification.selected_plant_id = plant.id
        self.db.commit()

        return plant.to_dict(include_images=False)

    def _add_identification_image_to_plant(
        self,
        identification_id: int,
        plant_id: int
    ) -> bool:
        """
        将识别照片添加为植物图片

        Args:
            identification_id: 识别记录ID
            plant_id: 植物ID

        Returns:
            是否添加成功
        """
        # 获取识别记录
        identification = self.db.query(PlantIdentification).filter(
            PlantIdentification.id == identification_id
        ).first()

        if not identification or not identification.image_url:
            return False

        # 原图路径（去掉开头的 /）
        source_path_str = identification.image_url.lstrip('/')
        source_path = Path(source_path_str)

        if not source_path.exists():
            print(f"识别图片不存在: {source_path}")
            return False

        # 创建植物图片目录
        plant_images_dir = Path(settings.UPLOAD_DIR) / "plant_images" / str(plant_id)
        plant_images_dir.mkdir(parents=True, exist_ok=True)

        # 生成新文件名
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        ext = source_path.suffix
        new_filename = f"identification_{identification_id}_{timestamp}{ext}"
        target_path = plant_images_dir / new_filename

        # 复制图片文件
        try:
            shutil.copy2(source_path, target_path)
        except Exception as e:
            print(f"复制图片失败: {e}")
            return False

        # 创建缩略图
        thumbnail_path = plant_images_dir / f"thumb_{new_filename}"
        thumbnail_created = create_thumbnail(target_path, thumbnail_path)

        # 获取图片尺寸
        dimensions = get_image_dimensions(target_path)
        width, height = dimensions if dimensions else (None, None)

        # 获取文件大小
        file_size = target_path.stat().st_size

        # 生成URL路径
        url_path = f"/{target_path}"
        thumbnail_url_path = f"/{thumbnail_path}" if thumbnail_created else None

        # 创建图片记录（作为主图）
        plant_image = PlantImage(
            plant_id=plant_id,
            url=url_path,
            thumbnail_url=thumbnail_url_path,
            caption=f"识别照片 - {identification.predictions and json.loads(identification.predictions)[0].get('name', '未知植物')}",
            is_primary=True,  # 设置为主图
            file_size=file_size,
            width=width,
            height=height,
            taken_at=identification.created_at,
            sort_order=0
        )

        self.db.add(plant_image)
        self.db.commit()

        print(f"成功添加识别照片到植物 {plant_id}: {url_path}")
        return True

    def delete_identification(self, identification_id: int) -> bool:
        """
        删除识别记录

        Args:
            identification_id: 识别记录ID

        Returns:
            是否删除成功
        """
        identification = self.db.query(PlantIdentification).filter(
            PlantIdentification.id == identification_id
        ).first()

        if not identification:
            return False

        # 删除图片文件
        self._delete_temp_image(identification.image_url)

        # 如果有关联的植物，更新其identification_id
        if identification.selected_plant_id:
            plant = self.db.query(Plant).filter(
                Plant.id == identification.selected_plant_id
            ).first()
            if plant:
                plant.identification_id = None

        # 删除记录
        self.db.delete(identification)
        self.db.commit()

        return True
