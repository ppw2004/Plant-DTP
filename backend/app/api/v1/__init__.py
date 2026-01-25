"""
API v1 路由聚合
"""
from fastapi import APIRouter
from app.api.v1 import rooms, plants, tasks, images, configs, task_types, shelves, suggestions

api_router = APIRouter()

# 注册各个模块的路由
api_router.include_router(
    rooms.router,
    prefix="/rooms",
    tags=["rooms"]
)

api_router.include_router(
    plants.router,
    prefix="/plants",
    tags=["plants"]
)

api_router.include_router(
    tasks.router,
    prefix="/tasks",
    tags=["tasks"]
)

api_router.include_router(
    images.router,
    tags=["images"]
)

api_router.include_router(
    configs.router,
    tags=["configs"]
)

api_router.include_router(
    task_types.router,
    tags=["task-types"]
)

api_router.include_router(
    shelves.router,
    tags=["shelves"]
)

api_router.include_router(
    suggestions.router,
    prefix="/suggestions",
    tags=["suggestions"]
)
