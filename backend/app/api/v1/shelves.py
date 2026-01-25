"""
花架路由
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.plant_shelf import PlantShelfCreate, PlantShelfUpdate, PlantShelfResponse
from app.services.plant_shelf_service import PlantShelfService

router = APIRouter()


@router.get("/rooms/{room_id}/shelves", response_model=dict)
async def get_room_shelves(
    room_id: int,
    db: Session = Depends(get_db)
):
    """获取房间的所有花架"""
    service = PlantShelfService(db)
    shelves = service.get_shelves(room_id)
    return {
        "success": True,
        "data": {
            "items": shelves
        }
    }


@router.get("/shelves/{shelf_id}", response_model=dict)
async def get_shelf(
    shelf_id: int,
    db: Session = Depends(get_db)
):
    """获取单个花架及其植物"""
    service = PlantShelfService(db)
    shelf = service.get_shelf(shelf_id)
    if not shelf:
        raise HTTPException(status_code=404, detail="花架不存在")
    return {
        "success": True,
        "data": shelf
    }


@router.post("/rooms/{room_id}/shelves", response_model=PlantShelfResponse)
async def create_shelf(
    room_id: int,
    shelf: PlantShelfCreate,
    db: Session = Depends(get_db)
):
    """创建花架"""
    service = PlantShelfService(db)
    try:
        new_shelf = service.create_shelf(room_id, shelf)
        return {
            "success": True,
            "data": new_shelf,
            "message": "花架创建成功"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/shelves/{shelf_id}", response_model=PlantShelfResponse)
async def update_shelf(
    shelf_id: int,
    shelf: PlantShelfUpdate,
    db: Session = Depends(get_db)
):
    """更新花架"""
    service = PlantShelfService(db)
    updated_shelf = service.update_shelf(shelf_id, shelf)
    if not updated_shelf:
        raise HTTPException(status_code=404, detail="花架不存在")
    return {
        "success": True,
        "data": updated_shelf,
        "message": "花架更新成功"
    }


@router.delete("/shelves/{shelf_id}", response_model=dict)
async def delete_shelf(
    shelf_id: int,
    db: Session = Depends(get_db)
):
    """删除花架"""
    service = PlantShelfService(db)
    success = service.delete_shelf(shelf_id)
    if not success:
        raise HTTPException(status_code=404, detail="花架不存在")
    return {
        "success": True,
        "message": "花架已删除"
    }


@router.post("/rooms/{room_id}/shelves/reorder", response_model=dict)
async def reorder_shelves(
    room_id: int,
    shelf_ids: List[int],
    db: Session = Depends(get_db)
):
    """重新排序房间的花架"""
    service = PlantShelfService(db)
    service.reorder_shelves(room_id, shelf_ids)
    return {
        "success": True,
        "message": "花架排序已更新"
    }


@router.post("/plants/{plant_id}/move", response_model=dict)
async def move_plant(
    plant_id: int,
    shelf_id: int | None,
    new_order: int | None = None,
    db: Session = Depends(get_db)
):
    """移动植物到花架

    - **plant_id**: 植物ID
    - **shelf_id**: 目标花架ID（null表示移出花架）
    - **new_order**: 新位置顺序（可选，默认为最后）
    """
    service = PlantShelfService(db)
    result = service.move_plant_to_shelf(plant_id, shelf_id, new_order)
    if not result:
        raise HTTPException(status_code=404, detail="植物不存在")
    return {
        "success": True,
        "data": result,
        "message": "植物已移动"
    }


@router.post("/shelves/{shelf_id}/plants/reorder", response_model=dict)
async def reorder_plants(
    shelf_id: int,
    plant_orders: List[dict],
    db: Session = Depends(get_db)
):
    """重新排序花架上的植物

    - **shelf_id**: 花架ID
    - **plant_orders**: 植物顺序列表 [{"plantId": 1, "order": 0}, ...]
    """
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Reorder plants request: shelf_id={shelf_id}, plant_orders={plant_orders}")

    try:
        service = PlantShelfService(db)
        service.reorder_plants_on_shelf(shelf_id, plant_orders)
        logger.info("Successfully reordered plants")
        return {
            "success": True,
            "message": "植物排序已更新"
        }
    except Exception as e:
        logger.error(f"Error reordering plants: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
