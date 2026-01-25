"""
植物养护配置路由
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.schemas.plant_config import PlantConfigCreate, PlantConfigUpdate, PlantConfigResponse
from app.services.plant_config_service import PlantConfigService

router = APIRouter()


@router.get("/plants/{plant_id}/configs", response_model=dict)
async def get_plant_configs(
    plant_id: int,
    db: Session = Depends(get_db)
):
    """获取植物的所有养护配置"""
    service = PlantConfigService(db)
    configs = service.get_configs(plant_id)
    return {
        "success": True,
        "data": {
            "items": configs
        }
    }


@router.post("/plants/{plant_id}/configs", response_model=PlantConfigResponse)
async def create_plant_config(
    plant_id: int,
    config: PlantConfigCreate,
    db: Session = Depends(get_db)
):
    """
    创建植物养护配置

    - **plant_id**: 植物ID
    - **task_type_id**: 任务类型ID（1=浇水, 2=施肥, 3=修剪等）
    - **interval_days**: 间隔天数（1-365）
    - **is_active**: 是否启用
    - **season**: 季节（可选）
    - **notes**: 备注（可选）
    """
    service = PlantConfigService(db)
    try:
        new_config = service.create_config(plant_id, config)
        return {
            "success": True,
            "data": new_config,
            "message": "养护配置创建成功"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/configs/{config_id}", response_model=PlantConfigResponse)
async def update_plant_config(
    config_id: int,
    config_update: PlantConfigUpdate,
    db: Session = Depends(get_db)
):
    """更新养护配置"""
    service = PlantConfigService(db)
    updated_config = service.update_config(config_id, config_update)
    if not updated_config:
        raise HTTPException(status_code=404, detail="配置不存在")
    return {
        "success": True,
        "data": updated_config,
        "message": "配置更新成功"
    }


@router.delete("/configs/{config_id}")
async def delete_plant_config(
    config_id: int,
    db: Session = Depends(get_db)
):
    """删除养护配置"""
    service = PlantConfigService(db)
    success = service.delete_config(config_id)
    if not success:
        raise HTTPException(status_code=404, detail="配置不存在")
    return {
        "success": True,
        "message": "配置已删除"
    }


@router.post("/configs/{config_id}/complete")
async def complete_task(
    config_id: int,
    note: Optional[str] = None,
    executed_at: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """
    完成养护任务

    会自动：
    1. 更新last_done_at
    2. 计算next_due_at
    3. 可选：记录养护日志
    """
    service = PlantConfigService(db)
    updated_config = service.mark_as_done(config_id, executed_at)
    if not updated_config:
        raise HTTPException(status_code=404, detail="配置不存在")

    return {
        "success": True,
        "data": updated_config,
        "message": "任务已完成，下次到期时间已更新"
    }
