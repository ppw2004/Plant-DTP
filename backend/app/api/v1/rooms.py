"""
房间管理路由
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.room import RoomCreate, RoomUpdate, RoomResponse, RoomListResponse
from app.services.room_service import RoomService

router = APIRouter()


@router.get("/", response_model=RoomListResponse)
async def get_rooms(
    location_type: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    获取房间列表

    - **location_type**: 可选，筛选位置类型（indoor/outdoor/balcony/garden）
    - **skip**: 跳过记录数
    - **limit**: 返回记录数
    """
    service = RoomService(db)
    rooms = service.get_rooms(location_type=location_type, skip=skip, limit=limit)
    total = service.count_rooms(location_type=location_type)

    return {
        "success": True,
        "data": {
            "items": rooms,
            "pagination": {
                "total": total,
                "skip": skip,
                "limit": limit
            }
        }
    }


@router.post("/", response_model=RoomResponse)
async def create_room(
    room: RoomCreate,
    db: Session = Depends(get_db)
):
    """
    创建房间

    - **name**: 房间名称（必填）
    - **description**: 房间描述
    - **location_type**: 位置类型
    - **icon**: 图标名称
    - **color**: 颜色代码（#FFFFFF格式）
    - **sort_order**: 排序顺序
    """
    service = RoomService(db)
    try:
        new_room = service.create_room(room)
        return {
            "success": True,
            "data": new_room
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{room_id}", response_model=RoomResponse)
async def get_room(
    room_id: int,
    db: Session = Depends(get_db)
):
    """获取房间详情"""
    service = RoomService(db)
    room = service.get_room(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="房间不存在")

    return {
        "success": True,
        "data": room
    }


@router.patch("/{room_id}", response_model=RoomResponse)
async def update_room(
    room_id: int,
    room_update: RoomUpdate,
    db: Session = Depends(get_db)
):
    """更新房间信息"""
    service = RoomService(db)
    try:
        updated_room = service.update_room(room_id, room_update)
        if not updated_room:
            raise HTTPException(status_code=404, detail="房间不存在")
        return {
            "success": True,
            "data": updated_room
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{room_id}")
async def delete_room(
    room_id: int,
    db: Session = Depends(get_db)
):
    """
    删除房间

    注意：如果房间内有植物，需要先处理植物
    """
    service = RoomService(db)
    try:
        success = service.delete_room(room_id)
        if not success:
            raise HTTPException(status_code=404, detail="房间不存在")
        return {
            "success": True,
            "message": "房间已删除"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
