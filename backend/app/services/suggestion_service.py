"""
建议 Service
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.suggestion import Suggestion


class SuggestionService:
    def __init__(self, db: Session):
        self.db = db

    def get_suggestions(self, skip: int = 0, limit: int = 50, is_active: bool = True) -> List[dict]:
        """获取建议列表"""
        query = self.db.query(Suggestion).filter(Suggestion.is_active == is_active)
        suggestions = query.order_by(Suggestion.created_at.desc()).offset(skip).limit(limit).all()
        return [suggestion.to_dict() for suggestion in suggestions]

    def count_suggestions(self, is_active: bool = True) -> int:
        """统计建议数量"""
        return self.db.query(Suggestion).filter(Suggestion.is_active == is_active).count()

    def get_suggestion(self, suggestion_id: int) -> Optional[dict]:
        """获取单个建议"""
        suggestion = self.db.query(Suggestion).filter(Suggestion.id == suggestion_id).first()
        return suggestion.to_dict() if suggestion else None

    def create_suggestion(self, suggestion_data) -> dict:
        """创建建议"""
        new_suggestion = Suggestion(**suggestion_data.dict())
        self.db.add(new_suggestion)
        self.db.commit()
        self.db.refresh(new_suggestion)
        return new_suggestion.to_dict()

    def update_suggestion(self, suggestion_id: int, suggestion_data) -> Optional[dict]:
        """更新建议"""
        suggestion = self.db.query(Suggestion).filter(Suggestion.id == suggestion_id).first()
        if not suggestion:
            return None
        for key, value in suggestion_data.dict(exclude_unset=True).items():
            setattr(suggestion, key, value)
        self.db.commit()
        self.db.refresh(suggestion)
        return suggestion.to_dict()

    def delete_suggestion(self, suggestion_id: int) -> bool:
        """删除建议（软删除）"""
        suggestion = self.db.query(Suggestion).filter(Suggestion.id == suggestion_id).first()
        if not suggestion:
            return False
        suggestion.is_active = False
        self.db.commit()
        return True
