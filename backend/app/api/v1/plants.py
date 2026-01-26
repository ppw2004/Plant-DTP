"""
植物管理路由
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.schemas.plant import PlantCreate, PlantUpdate, PlantResponse
from app.services.plant_service import PlantService

router = APIRouter()


@router.get("")
async def get_plants(
    room_id: Optional[int] = None,
    health_status: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    is_active: Optional[bool] = True,
    db: Session = Depends(get_db)
):
    """
    获取植物列表

    - **room_id**: 可选，筛选房间ID
    - **health_status**: 可选，健康状态筛选
    - **search**: 可选，搜索关键词
    - **is_active**: 可选，是否只获取活跃植物（默认true），设为false获取归档植物
    - **skip**: 跳过记录数
    - **limit**: 返回记录数
    """
    service = PlantService(db)
    # 如果is_active参数被明确指定
    active_filter = is_active if is_active is not None else True
    plants = service.get_plants(
        room_id=room_id,
        health_status=health_status,
        search=search,
        skip=skip,
        limit=limit,
        is_active=active_filter
    )
    total = service.count_plants(
        room_id=room_id,
        health_status=health_status,
        search=search,
        is_active=active_filter
    )

    return {
        "success": True,
        "data": {
            "items": plants,
            "pagination": {
                "total": total,
                "skip": skip,
                "limit": limit
            }
        }
    }


@router.post("")
async def create_plant(
    plant: PlantCreate,
    db: Session = Depends(get_db)
):
    """
    创建植物

    - **name**: 植物名称（必填）
    - **scientific_name**: 学名
    - **description**: 描述
    - **room_id**: 所属房间ID（必填）
    - **purchase_date**: 购买日期
    - **health_status**: 健康状态
    """
    service = PlantService(db)
    try:
        new_plant = service.create_plant(plant)
        return {
            "success": True,
            "data": new_plant
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{plant_id}")
async def get_plant(
    plant_id: int,
    db: Session = Depends(get_db)
):
    """获取植物详情"""
    service = PlantService(db)
    plant = service.get_plant(plant_id)
    if not plant:
        raise HTTPException(status_code=404, detail="植物不存在")

    return {
        "success": True,
        "data": plant
    }


@router.patch("/{plant_id}")
async def update_plant(
    plant_id: int,
    plant_update: PlantUpdate,
    db: Session = Depends(get_db)
):
    """更新植物信息"""
    service = PlantService(db)
    try:
        updated_plant = service.update_plant(plant_id, plant_update)
        if not updated_plant:
            raise HTTPException(status_code=404, detail="植物不存在")
        return {
            "success": True,
            "data": updated_plant
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{plant_id}")
async def archive_plant(
    plant_id: int,
    db: Session = Depends(get_db)
):
    """归档植物（软删除，可恢复）"""
    service = PlantService(db)
    success = service.archive_plant(plant_id)
    if not success:
        raise HTTPException(status_code=404, detail="植物不存在")

    return {
        "success": True,
        "message": "植物已归档"
    }


@router.post("/{plant_id}/restore")
async def restore_plant(
    plant_id: int,
    db: Session = Depends(get_db)
):
    """恢复归档的植物"""
    service = PlantService(db)
    plant = service.restore_plant(plant_id)
    if not plant:
        raise HTTPException(status_code=404, detail="植物不存在")

    return {
        "success": True,
        "data": plant,
        "message": "植物已恢复"
    }


@router.delete("/{plant_id}/permanent")
async def permanent_delete_plant(
    plant_id: int,
    db: Session = Depends(get_db)
):
    """永久删除植物（不可恢复）"""
    service = PlantService(db)
    success = service.permanent_delete_plant(plant_id)
    if not success:
        raise HTTPException(status_code=404, detail="植物不存在")

    return {
        "success": True,
        "message": "植物已永久删除"
    }
