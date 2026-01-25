"""
任务类型路由
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.task_type import TaskType

router = APIRouter()


@router.get("/task-types", response_model=dict)
async def get_task_types(
    db: Session = Depends(get_db)
):
    """获取所有任务类型"""
    task_types = db.query(TaskType).order_by(TaskType.sort_order).all()

    return {
        "success": True,
        "data": {
            "items": [tt.to_dict() for tt in task_types]
        }
    }
