"""
建议/反馈路由
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.schemas.suggestion import SuggestionCreate, SuggestionUpdate
from app.services.suggestion_service import SuggestionService

router = APIRouter()


@router.get("/")
async def get_suggestions(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """获取建议列表"""
    service = SuggestionService(db)
    suggestions = service.get_suggestions(skip=skip, limit=limit)
    total = service.count_suggestions()

    return {
        "success": True,
        "data": {
            "items": suggestions,
            "pagination": {
                "total": total,
                "skip": skip,
                "limit": limit
            }
        }
    }


@router.post("/")
async def create_suggestion(
    suggestion: SuggestionCreate,
    db: Session = Depends(get_db)
):
    """提交建议"""
    service = SuggestionService(db)
    try:
        new_suggestion = service.create_suggestion(suggestion)
        return {
            "success": True,
            "data": new_suggestion,
            "message": "感谢您的建议！我们会认真考虑。"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{suggestion_id}")
async def get_suggestion(
    suggestion_id: int,
    db: Session = Depends(get_db)
):
    """获取建议详情"""
    service = SuggestionService(db)
    suggestion = service.get_suggestion(suggestion_id)
    if not suggestion:
        raise HTTPException(status_code=404, detail="建议不存在")

    return {
        "success": True,
        "data": suggestion
    }


@router.patch("/{suggestion_id}")
async def update_suggestion(
    suggestion_id: int,
    suggestion_update: SuggestionUpdate,
    db: Session = Depends(get_db)
):
    """更新建议（管理员功能）"""
    service = SuggestionService(db)
    updated_suggestion = service.update_suggestion(suggestion_id, suggestion_update)
    if not updated_suggestion:
        raise HTTPException(status_code=404, detail="建议不存在")
    return {
        "success": True,
        "data": updated_suggestion,
        "message": "建议已更新"
    }


@router.delete("/{suggestion_id}")
async def delete_suggestion(
    suggestion_id: int,
    db: Session = Depends(get_db)
):
    """删除建议（软删除）"""
    service = SuggestionService(db)
    success = service.delete_suggestion(suggestion_id)
    if not success:
        raise HTTPException(status_code=404, detail="建议不存在")

    return {
        "success": True,
        "message": "建议已删除"
    }
