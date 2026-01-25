"""
FastAPI应用主入口
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging
from pathlib import Path

from app.core.config import settings
from app.api.v1 import api_router
from app.core.database import engine, Base

# 导入所有模型（确保它们注册到 Base.metadata）
# 顺序很重要：先导入被引用的表，后导入引用其他表的表
from app.models import room, task_type  # 基础表，无外键
from app.models import plant_shelf  # 依赖 room
from app.models import plant  # 依赖 room 和 plant_shelf
from app.models import plant_image, plant_config  # 依赖 plant 和 task_type

# 配置日志
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时
    logger.info("🚀 Starting Plant DTP API...")
    # 创建数据库表（开发环境）
    if settings.ENVIRONMENT == "development":
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created")
    # 创建上传目录
    upload_dir = Path("uploads/plants")
    upload_dir.mkdir(parents=True, exist_ok=True)
    logger.info(f"✅ Upload directory ready: {upload_dir.absolute()}")
    yield
    # 关闭时
    logger.info("👋 Shutting down Plant DTP API...")


# 创建FastAPI应用
app = FastAPI(
    title="植物数字孪生平台 API",
    description="一个用于管理家庭植物的数字孪生系统",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    lifespan=lifespan
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 健康检查
@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "植物数字孪生平台 API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """健康检查接口"""
    return {
        "status": "healthy",
        "service": "plant-dtp-backend",
        "version": "1.0.0"
    }


# 注册API路由
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

# 挂载静态文件服务
uploads_dir = Path("uploads")
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")


# 全局异常处理
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "服务器内部错误",
                "detail": str(exc) if settings.ENVIRONMENT == "development" else None
            }
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development"
    )
