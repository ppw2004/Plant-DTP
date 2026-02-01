"""
植物识别路由
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.config import settings
from app.schemas.plant_identification import (
    IdentificationResult,
    IdentificationFeedback,
    CreatePlantFromIdentification,
    IdentificationResponse,
    IdentificationListResponse
)
from app.services.identification_service import IdentificationService

router = APIRouter()


@router.post("/identify", response_model=dict)
async def identify_plant(
    file: UploadFile = File(...),
    include_details: bool = Form(True),
    db: Session = Depends(get_db)
):
    """
    植物识别接口

    上传图片进行植物识别，返回Top 3候选结果。

    - **file**: 图片文件（必填，最大4MB）
    - **include_details**: 是否返回百科信息（默认true）

    返回识别结果，包含候选植物列表和置信度。
    """
    # 检查百度AI配置
    if not settings.BAIDU_AI_API_KEY or not settings.BAIDU_AI_SECRET_KEY:
        raise HTTPException(
            status_code=500,
            detail="百度AI服务未配置，请联系管理员配置API密钥"
        )

    # 验证文件大小
    file_data = await file.read()
    if len(file_data) > settings.MAX_IDENTIFICATION_IMAGE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"图片大小不能超过 {settings.MAX_IDENTIFICATION_IMAGE_SIZE // 1024 // 1024}MB"
        )

    # 验证文件类型
    allowed_extensions = ["jpg", "jpeg", "png", "bmp", "gif", "webp"]
    file_ext = file.filename.split(".")[-1].lower() if file.filename else ""
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件格式，请上传以下格式: {', '.join(allowed_extensions)}"
        )

    try:
        service = IdentificationService(db)
        result = await service.identify_from_file(
            file_data=file_data,
            filename=file.filename,
            include_details=include_details
        )

        return {
            "success": True,
            "data": result
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"识别失败: {str(e)}")


@router.get("/identifications", response_model=dict)
async def get_identification_history(
    page: int = 1,
    limit: int = 20,
    plant_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    获取识别历史记录

    - **page**: 页码（默认1）
    - **limit**: 每页数量（默认20）
    - **plant_id**: 可选，筛选已创建的植物

    返回识别历史记录列表，支持分页。
    """
    service = IdentificationService(db)
    result = service.get_identification_history(
        page=page,
        limit=limit,
        plant_id=plant_id
    )

    return {
        "success": True,
        "data": result
    }


@router.get("/identifications/{identification_id}", response_model=dict)
async def get_identification_detail(
    identification_id: int,
    db: Session = Depends(get_db)
):
    """
    获取识别记录详情

    - **identification_id**: 识别记录ID

    返回单个识别记录的详细信息。
    """
    service = IdentificationService(db)
    result = service.get_identification_by_id(identification_id)

    if not result:
        raise HTTPException(status_code=404, detail="识别记录不存在")

    return {
        "success": True,
        "data": result
    }


@router.post("/identifications/{identification_id}/feedback", response_model=dict)
async def submit_identification_feedback(
    identification_id: int,
    feedback: IdentificationFeedback,
    db: Session = Depends(get_db)
):
    """
    提交识别反馈

    用户确认识别结果是否正确，用于数据收集和后续模型优化。

    - **identification_id**: 识别记录ID
    - **feedback**: 反馈类型（correct/incorrect/skipped）
    - **plant_id**: 如果feedback为correct，关联的植物ID
    - **correct_name**: 如果feedback为incorrect，用户修正的正确名称

    返回更新后的识别记录。
    """
    service = IdentificationService(db)
    result = service.submit_feedback(
        identification_id=identification_id,
        feedback=feedback.feedback,
        plant_id=feedback.plant_id,
        correct_name=feedback.correct_name
    )

    if not result:
        raise HTTPException(status_code=404, detail="识别记录不存在")

    return {
        "success": True,
        "message": "反馈已提交",
        "data": result
    }


@router.post("/identifications/{identification_id}/create-plant", response_model=dict)
async def create_plant_from_identification(
    identification_id: int,
    plant_data: CreatePlantFromIdentification,
    db: Session = Depends(get_db)
):
    """
    基于识别结果创建植物

    使用识别结果自动填充植物信息并创建植物档案。

    - **identification_id**: 识别记录ID
    - **room_id**: 房间ID（必填）
    - **shelf_id**: 花架ID（可选）
    - **purchase_date**: 购买日期（可选）
    - **health_status**: 健康状态（默认healthy）

    返回创建的植物信息。
    """
    service = IdentificationService(db)

    try:
        result = service.create_plant_from_identification(
            identification_id=identification_id,
            room_id=plant_data.room_id,
            shelf_id=plant_data.shelf_id,
            purchase_date=plant_data.purchase_date,
            health_status=plant_data.health_status
        )

        return {
            "success": True,
            "message": "植物创建成功",
            "data": {
                "plant": result
            }
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建植物失败: {str(e)}")


@router.delete("/identifications/{identification_id}", response_model=dict)
async def delete_identification(
    identification_id: int,
    db: Session = Depends(get_db)
):
    """
    删除识别记录

    删除识别记录（不会删除已创建的植物）。

    - **identification_id**: 识别记录ID

    注意：如果识别记录已关联到植物，删除后植物的identification_id会被设为NULL。
    """
    service = IdentificationService(db)
    success = service.delete_identification(identification_id)

    if not success:
        raise HTTPException(status_code=404, detail="识别记录不存在")

    return {
        "success": True,
        "message": "识别记录已删除"
    }
