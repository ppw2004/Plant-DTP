"""
任务提醒路由
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date, datetime

from app.core.database import get_db
from app.services.task_service import TaskService

router = APIRouter()


@router.get("/today")
async def get_today_tasks(
    db: Session = Depends(get_db)
):
    """获取今日任务"""
    service = TaskService(db)
    tasks = service.get_today_tasks()
    return {
        "success": True,
        "data": {
            "items": tasks
        }
    }


@router.get("/upcoming")
async def get_upcoming_tasks(
    days: int = 7,
    db: Session = Depends(get_db)
):
    """
    获取即将到期任务

    - **days**: 查询天数（默认7天）
    """
    service = TaskService(db)
    tasks = service.get_upcoming_tasks(days=days)
    return {
        "success": True,
        "data": {
            "items": tasks
        }
    }


@router.get("/overdue")
async def get_overdue_tasks(
    db: Session = Depends(get_db)
):
    """获取逾期任务"""
    service = TaskService(db)
    tasks = service.get_overdue_tasks()
    return {
        "success": True,
        "data": {
            "items": tasks
        }
    }


@router.post("/{task_id}/complete")
async def complete_task(
    task_id: int,
    note: Optional[str] = None,
    executed_at: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """
    完成任务

    - **task_id**: 任务配置ID
    - **note**: 备注信息
    - **executed_at**: 执行时间（可选，默认当前时间）
    """
    service = TaskService(db)
    try:
        care_log = service.complete_task(
            task_id=task_id,
            note=note,
            executed_at=executed_at or datetime.now()
        )
        return {
            "success": True,
            "data": care_log,
            "message": "任务已完成"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
