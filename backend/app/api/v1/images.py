"""
植物图片管理路由
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from pathlib import Path

from app.core.database import get_db
from app.schemas.plant_image import PlantImageCreate, PlantImageUpdate, PlantImageResponse
from app.services.plant_image_service import PlantImageService

router = APIRouter()

# Upload directory configuration
UPLOAD_DIR = Path("uploads/plants")
THUMBNAIL_DIR = Path("uploads/plants/thumbnails")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
THUMBNAIL_DIR.mkdir(parents=True, exist_ok=True)

# File size limit (10MB)
MAX_FILE_SIZE = 10 * 1024 * 1024

# Allowed file types
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp"
}


def get_file_extension(filename: str) -> str:
    """Get file extension from filename"""
    return Path(filename).suffix.lower()


def generate_unique_filename(original_filename: str) -> str:
    """Generate unique filename"""
    ext = get_file_extension(original_filename)
    unique_name = f"{uuid.uuid4()}{ext}"
    return unique_name


@router.get("/plants/{plant_id}/images", response_model=dict)
async def get_plant_images(
    plant_id: int,
    db: Session = Depends(get_db)
):
    """获取植物的所有图片"""
    service = PlantImageService(db)
    images = service.get_images(plant_id)
    return {
        "success": True,
        "data": images
    }


@router.get("/plants/{plant_id}/images/{image_id}", response_model=dict)
async def get_plant_image(
    plant_id: int,
    image_id: int,
    db: Session = Depends(get_db)
):
    """获取植物的特定图片"""
    from app.models.plant_image import PlantImage

    image = db.query(PlantImage).filter(
        PlantImage.id == image_id,
        PlantImage.plant_id == plant_id
    ).first()

    if not image:
        raise HTTPException(status_code=404, detail="图片不存在")

    return {
        "success": True,
        "data": image.to_dict()
    }


@router.post("/plants/{plant_id}/images", response_model=dict)
async def add_plant_image(
    plant_id: int,
    image: PlantImageCreate,
    db: Session = Depends(get_db)
):
    """添加植物图片 (通过URL)"""
    service = PlantImageService(db)
    try:
        new_image = service.create_image(plant_id, image)
        return {
            "success": True,
            "data": new_image
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/plants/{plant_id}/images/upload", response_model=dict)
async def upload_plant_image_file(
    plant_id: int,
    request: Request,
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    is_primary: Optional[bool] = Form(False),
    capture_date: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """上传植物图片文件"""
    import logging
    logger = logging.getLogger(__name__)
    from datetime import datetime
    from app.utils.image_utils import create_thumbnail_from_bytes, get_image_dimensions

    # Debug logging
    logger.info(f"Upload request received:")
    logger.info(f"  plant_id: {plant_id}")
    logger.info(f"  file: {file}, filename: {file.filename if file else None}, content_type: {file.content_type if file else None}")
    logger.info(f"  description: {description}")
    logger.info(f"  is_primary: {is_primary}")
    logger.info(f"  capture_date: {capture_date}")

    # Validate file type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件类型。允许的类型: {', '.join(ALLOWED_MIME_TYPES)}"
        )

    # Read file content
    content = await file.read()

    # Validate file size
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"文件大小超过限制 (最大 {MAX_FILE_SIZE // (1024*1024)}MB)"
        )

    # Generate unique filename
    filename = generate_unique_filename(file.filename or "image.jpg")
    file_path = UPLOAD_DIR / filename

    # Save original file
    with open(file_path, "wb") as f:
        f.write(content)

    # Generate thumbnail
    thumbnail_filename = f"thumb_{filename}.jpg"
    thumbnail_path = THUMBNAIL_DIR / thumbnail_filename
    create_thumbnail_from_bytes(content, thumbnail_path, size=(300, 300), quality=85)

    # Get image dimensions
    dimensions = get_image_dimensions(file_path)

    # Generate file URL (dynamic based on request)
    if request:
        base_url = f"{request.url.scheme}://{request.url.netloc}"
        file_url = f"{base_url}/uploads/plants/{filename}"
        thumbnail_url = f"{base_url}/uploads/plants/thumbnails/{thumbnail_filename}"
    else:
        file_url = f"http://localhost:12801/uploads/plants/{filename}"
        thumbnail_url = f"http://localhost:12801/uploads/plants/thumbnails/{thumbnail_filename}"

    # Parse capture date if provided
    parsed_capture_date = None
    if capture_date:
        try:
            parsed_capture_date = datetime.fromisoformat(capture_date.replace('Z', '+00:00'))
        except:
            pass

    # Create image record
    service = PlantImageService(db)
    try:
        image_data = PlantImageCreate(
            url=file_url,
            thumbnail_url=thumbnail_url,
            caption=description,
            is_primary=is_primary,
            taken_at=parsed_capture_date,
            file_size=len(content),
            width=dimensions[0] if dimensions else None,
            height=dimensions[1] if dimensions else None
        )
        new_image = service.create_image(plant_id, image_data)
        return {
            "success": True,
            "data": new_image
        }
    except Exception as e:
        # Delete files if database operation fails
        if file_path.exists():
            file_path.unlink()
        if thumbnail_path.exists():
            thumbnail_path.unlink()
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/plants/{plant_id}/images/{image_id}", response_model=dict)
async def update_plant_image(
    plant_id: int,
    image_id: int,
    image_update: PlantImageUpdate,
    db: Session = Depends(get_db)
):
    """更新图片信息"""
    service = PlantImageService(db)
    updated_image = service.update_image(image_id, image_update)
    if not updated_image:
        raise HTTPException(status_code=404, detail="图片不存在")
    return {
        "success": True,
        "data": updated_image
    }


@router.patch("/plants/{plant_id}/images/{image_id}/primary", response_model=dict)
async def set_primary_image_endpoint(
    plant_id: int,
    image_id: int,
    db: Session = Depends(get_db)
):
    """设置为主图"""
    from app.models.plant_image import PlantImage

    # Get the target image
    image = db.query(PlantImage).filter(
        PlantImage.id == image_id,
        PlantImage.plant_id == plant_id
    ).first()

    if not image:
        raise HTTPException(status_code=404, detail="图片不存在")

    # Unset all other primary images for this plant
    db.query(PlantImage).filter(
        PlantImage.plant_id == plant_id,
        PlantImage.is_primary == True
    ).update({"is_primary": False})

    # Set this image as primary
    image.is_primary = True
    db.commit()
    db.refresh(image)

    return {
        "success": True,
        "data": image.to_dict()
    }


@router.delete("/plants/{plant_id}/images/{image_id}")
async def delete_plant_image(
    plant_id: int,
    image_id: int,
    db: Session = Depends(get_db)
):
    """删除图片"""
    from app.models.plant_image import PlantImage

    # Get image
    image = db.query(PlantImage).filter(
        PlantImage.id == image_id,
        PlantImage.plant_id == plant_id
    ).first()

    if not image:
        raise HTTPException(status_code=404, detail="图片不存在")

    # Try to delete the file if it's a local upload
    try:
        if "/uploads/plants/" in image.url:
            filename = image.url.split("/")[-1]
            file_path = UPLOAD_DIR / filename
            if file_path.exists():
                file_path.unlink()
    except:
        pass  # Continue with database deletion even if file deletion fails

    # Delete from database
    service = PlantImageService(db)
    success = service.delete_image(image_id)
    if not success:
        raise HTTPException(status_code=404, detail="图片不存在")
    return {
        "success": True,
        "message": "图片已删除"
    }


@router.get("/plants/{plant_id}/images/primary", response_model=dict)
async def get_primary_image(
    plant_id: int,
    db: Session = Depends(get_db)
):
    """获取植物的主图"""
    service = PlantImageService(db)
    image = service.get_primary_image(plant_id)
    if not image:
        raise HTTPException(status_code=404, detail="未找到主图")
    return {
        "success": True,
        "data": image
    }
