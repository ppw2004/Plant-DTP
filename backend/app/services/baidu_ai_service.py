"""
百度AI植物识别服务
"""
import hashlib
import time
import json
from typing import List, Dict, Optional
from aip import AipImageClassify
from app.core.config import settings


class BaiduAIService:
    """百度AI植物识别服务"""

    def __init__(self):
        """初始化百度AI客户端"""
        self.client = AipImageClassify(
            settings.BAIDU_AI_APP_ID,
            settings.BAIDU_AI_API_KEY,
            settings.BAIDU_AI_SECRET_KEY
        )

    async def identify_plant(
        self,
        image_data: bytes,
        baike_num: int = 1
    ) -> Dict:
        """
        调用百度植物识别API

        Args:
            image_data: 图片二进制数据
            baike_num: 返回百科信息数量（0-5）

        Returns:
            包含识别结果的字典

        Raises:
            ValueError: 图片格式或大小不符合要求
            RuntimeError: API调用失败
        """
        # 验证图片大小
        if len(image_data) > settings.MAX_IDENTIFICATION_IMAGE_SIZE:
            raise ValueError(f"图片大小不能超过 {settings.MAX_IDENTIFICATION_IMAGE_SIZE // 1024 // 1024}MB")

        # 计算图片哈希（用于去重）
        image_hash = hashlib.md5(image_data).hexdigest()

        # 调用API
        try:
            start_time = time.time()
            # plantDetect使用options字典传递参数
            options = {"baike_num": baike_num}
            result = self.client.plantDetect(image_data, options)
            processing_time = time.time() - start_time

            # 检查API错误
            if "error_code" in result:
                error_msg = result.get("error_msg", "未知错误")
                raise RuntimeError(f"百度API调用失败: {error_msg} (错误码: {result['error_code']})")

            # 解析结果
            predictions = self._parse_result(result)

            return {
                "request_id": f"req_{int(time.time())}_{image_hash[:8]}",
                "predictions": predictions,
                "processing_time": round(processing_time, 2),
                "cached": False,
                "image_hash": image_hash
            }

        except Exception as e:
            raise RuntimeError(f"植物识别失败: {str(e)}")

    def _parse_result(self, api_result: dict) -> List[Dict]:
        """
        解析百度API返回结果

        Args:
            api_result: API返回的原始结果

        Returns:
            标准化的识别结果列表
        """
        predictions = []

        if "result" not in api_result:
            return predictions

        for idx, item in enumerate(api_result["result"], start=1):
            prediction = {
                "rank": idx,
                "name": item.get("name", ""),
                "scientificName": None,  # 百度API不返回学名
                "confidence": round(item.get("score", 0.0), 2),
                "baikeUrl": None,
                "description": None
            }

            # 添加百科信息
            if "baike_info" in item:
                baike_info = item["baike_info"]
                prediction["baikeUrl"] = baike_info.get("baike_url")
                prediction["description"] = baike_info.get("description")

            predictions.append(prediction)

        return predictions

    def get_access_token(self) -> str:
        """
        获取访问令牌（OAuth 2.0）

        Returns:
            访问令牌字符串
        """
        # baidu-aip SDK会自动处理token，这个方法预留用于手动获取
        return ""

    def check_health(self) -> bool:
        """
        检查服务健康状态

        Returns:
            服务是否可用
        """
        try:
            # 简单检查API Key是否配置
            if not settings.BAIDU_AI_API_KEY or not settings.BAIDU_AI_SECRET_KEY:
                return False
            return True
        except Exception:
            return False


# 全局单例
baidu_ai_service = BaiduAIService()
