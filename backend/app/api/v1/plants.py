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


@router.get("/")
async def get_plants(
    room_id: Optional[int] = None,
    health_status: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    获取植物列表

    - **room_id**: 可选，筛选房间ID
    - **health_status**: 可选，健康状态筛选
    - **search**: 可选，搜索关键词
    - **skip**: 跳过记录数
    - **limit**: 返回记录数
    """
    service = PlantService(db)
    plants = service.get_plants(
        room_id=room_id,
        health_status=health_status,
        search=search,
        skip=skip,
        limit=limit
    )
    total = service.count_plants(
        room_id=room_id,
        health_status=health_status,
        search=search
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


@router.post("/")
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
async def delete_plant(
    plant_id: int,
    db: Session = Depends(get_db)
):
    """删除植物"""
    service = PlantService(db)
    success = service.delete_plant(plant_id)
    if not success:
        raise HTTPException(status_code=404, detail="植物不存在")

    return {
        "success": True,
        "message": "植物已删除"
    }
