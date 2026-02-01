"""
应用配置管理
"""
from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    """应用配置"""

    # 服务器配置
    PORT: int = 12801
    HOST: str = "0.0.0.0"
    ENVIRONMENT: str = "development"

    # 数据库配置
    DATABASE_URL: str

    # CORS配置
    FRONTEND_URL: str = "http://localhost:12800"
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:12800",
        "http://localhost:5173",
        "http://localhost:12801",
        "http://82.156.213.38:12800",  # 生产环境服务器前端端口
        "http://82.156.213.38",       # 生产环境服务器（无端口）
        "http://82.156.213.38:80"     # 生产环境80端口
    ]

    # JWT配置（单用户版不需要，预留）
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7天

    # 文件上传配置
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 5242880  # 5MB
    ALLOWED_IMAGE_EXTENSIONS: List[str] = ["jpg", "jpeg", "png", "gif", "webp"]

    # 日志配置
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/app.log"

    # API配置
    API_V1_PREFIX: str = "/api/v1"

    # 百度AI配置
    BAIDU_AI_APP_ID: str = ""
    BAIDU_AI_API_KEY: str = ""
    BAIDU_AI_SECRET_KEY: str = ""
    BAIDU_AI_PLANT_URL: str = "https://aip.baidubce.com/rest/2.0/image-classify/v1/plant"

    # 植物识别配置
    IDENTIFICATION_CACHE_TTL: int = 86400  # 24小时
    MAX_IDENTIFICATION_IMAGE_SIZE: int = 4194304  # 4MB
    IDENTIFICATION_TEMP_DIR: str = "uploads/identifications"
    BAIDU_AI_QPS: int = 2  # 每秒并发请求数
    BAIDU_AI_TIMEOUT: int = 10  # 请求超时时间（秒）

    # 时区
    TIMEZONE: str = "Asia/Shanghai"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """获取配置单例"""
    return Settings()


settings = get_settings()
