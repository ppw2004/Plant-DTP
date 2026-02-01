#!/usr/bin/env python3
"""
植物识别功能 - 完整系统性测试

测试流程：
1. 环境检查（配置、数据库、服务）
2. API功能测试（识别、历史、反馈、创建植物）
3. 业务流程测试（完整识别到创建植物流程）
4. 异常场景测试（错误处理、边界条件）
5. 性能测试（响应时间、并发）

运行方式：
    python tests/test_identification_full.py
"""

import sys
import os
import time
import json
import requests
from datetime import datetime
from pathlib import Path

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent.parent))

# API配置
BASE_URL = "http://localhost:12801"
API_PREFIX = "/api/v1"


class IdentificationTester:
    """植物识别功能测试器"""

    def __init__(self):
        self.base_url = BASE_URL
        self.api_url = f"{BASE_URL}{API_PREFIX}"
        self.session = requests.Session()
        self.results = {
            "total": 0,
            "passed": 0,
            "failed": 0,
            "skipped": 0,
            "errors": []
        }
        self.test_data = {}

    def log(self, message: str, level: str = "INFO"):
        """记录日志"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        symbol = {
            "INFO": "✅",
            "SUCCESS": "✅",
            "ERROR": "❌",
            "WARN": "⚠️",
            "SKIP": "⊘"
        }
        print(f"[{timestamp}] {symbol.get(level, '📋')} {message}")

    def print_header(self, title: str):
        """打印标题"""
        print("\n" + "=" * 70)
        print(f"  {title}")
        print("=" * 70)

    def assert_true(self, condition: bool, error_msg: str):
        """断言"""
        self.results["total"] += 1
        if condition:
            self.results["passed"] += 1
            return True
        else:
            self.results["failed"] += 1
            self.results["errors"].append(error_msg)
            self.log(f"  ✗ {error_msg}", "ERROR")
            return False

    # ==================== 测试套件 ====================

    def test_1_environment_check(self):
        """测试1：环境检查"""
        self.print_header("测试1：环境检查")

        # 1.1 检查配置文件
        self.log("检查配置文件...")
        from app.core.config import settings
        has_api_key = bool(settings.BAIDU_AI_API_KEY)
        has_secret_key = bool(settings.BAIDU_AI_SECRET_KEY)
        self.assert_true(
            has_api_key and has_secret_key,
            "百度AI API密钥未配置"
        )
        self.log(f"  API Key: {settings.BAIDU_AI_API_KEY[:10]}...")

        # 1.2 检查临时目录
        self.log("检查临时目录...")
        temp_dir = settings.IDENTIFICATION_TEMP_DIR
        os.makedirs(temp_dir, exist_ok=True)
        self.assert_true(
            os.path.exists(temp_dir),
            f"临时目录不存在: {temp_dir}"
        )

        # 1.3 检查数据库表
        self.log("检查数据库表...")
        try:
            from app.core.database import engine
            from sqlalchemy import text

            with engine.connect() as conn:
                # 检查plant_identifications表
                result = conn.execute(text("""
                    SELECT COUNT(*) FROM plant_identifications
                """))
                count = result.scalar()
                self.log(f"  plant_identifications表存在，当前记录数: {count}")

                # 检查plants表是否有新字段
                result = conn.execute(text("""
                    SELECT COUNT(*) FROM plants
                    WHERE identification_id IS NOT NULL
                """))
                identify_count = result.scalar()
                self.log(f"  通过识别创建的植物数: {identify_count}")

        except Exception as e:
            self.assert_true(False, f"数据库检查失败: {str(e)}")

        # 1.4 检查百度AI服务
        self.log("检查百度AI服务...")
        try:
            from app.services.baidu_ai_service import baidu_ai_service
            is_healthy = baidu_ai_service.check_health()
            self.assert_true(is_healthy, "百度AI服务健康检查失败")
        except Exception as e:
            self.assert_true(False, f"百度AI服务初始化失败: {str(e)}")

    def test_2_identification_api(self):
        """测试2：识别API功能"""
        self.print_header("测试2：识别API功能")

        # 查找测试图片
        test_images = list(Path("uploads/plants").glob("*.jpg"))
        if not test_images:
            self.log("没有找到测试图片，跳过此测试", "SKIP")
            self.results["skipped"] += 1
            return

        test_image = test_images[0]
        self.log(f"使用测试图片: {test_image.name}")

        # 2.1 测试图片识别
        self.log("测试图片识别...")
        try:
            with open(test_image, "rb") as f:
                files = {"file": f}
                data = {"includeDetails": True}

                start_time = time.time()
                response = self.session.post(
                    f"{self.api_url}/identify",
                    files=files,
                    data=data
                )
                elapsed = time.time() - start_time

            if response.status_code == 200:
                result = response.json()
                self.assert_true(result.get("success"), "识别API返回失败")

                if result.get("success"):
                    data = result.get("data", {})
                    predictions = data.get("predictions", [])

                    self.log(f"  识别成功！")
                    self.log(f"  响应时间: {elapsed:.2f}秒")
                    self.log(f"  识别结果数: {len(predictions)}")

                    if predictions:
                        top_result = predictions[0]
                        self.log(f"  最佳匹配: {top_result['name']}")
                        self.log(f"  置信度: {top_result['confidence'] * 100:.1f}%")

                        # 保存测试数据
                        self.test_data["identification_id"] = data.get("identificationId")
                        self.test_data["predictions"] = predictions
                    else:
                        self.assert_true(False, "未返回识别结果")

                # 性能断言
                self.assert_true(elapsed < 10, f"响应时间过长: {elapsed:.2f}秒")

            else:
                self.assert_true(False, f"API返回错误状态码: {response.status_code}")

        except Exception as e:
            self.assert_true(False, f"识别请求失败: {str(e)}")

        # 2.2 测试缓存功能
        if self.test_data.get("identification_id"):
            self.log("测试缓存功能...")
            try:
                with open(test_image, "rb") as f:
                    files = {"file": f}
                    data = {"includeDetails": False}

                    start_time = time.time()
                    response = self.session.post(
                        f"{self.api_url}/identify",
                        files=files,
                        data=data
                    )
                    elapsed = time.time() - start_time

                if response.status_code == 200:
                    result = response.json()
                    if result.get("success"):
                        cached = result.get("data", {}).get("cached", False)
                        if cached:
                            self.log(f"  缓存生效！响应时间: {elapsed:.2f}秒")
                        else:
                            self.log(f"  未使用缓存（可能是首次识别）")

            except Exception as e:
                self.log(f"缓存测试失败: {str(e)}", "WARN")

    def test_3_identification_history(self):
        """测试3：识别历史"""
        self.print_header("测试3：识别历史功能")

        # 3.1 获取识别历史列表
        self.log("获取识别历史列表...")
        try:
            response = self.session.get(
                f"{self.api_url}/identifications",
                params={"page": 1, "limit": 10}
            )

            if response.status_code == 200:
                result = response.json()
                self.assert_true(result.get("success"), "获取历史列表失败")

                if result.get("success"):
                    data = result.get("data", {})
                    items = data.get("items", [])
                    total = data.get("total", 0)

                    self.log(f"  历史记录总数: {total}")
                    self.log(f"  返回记录数: {len(items)}")

                    if items:
                        # 保存第一条记录ID用于后续测试
                        first_record = items[0]
                        self.test_data["existing_identification_id"] = first_record.get("id")
                        self.log(f"  第一条记录ID: {first_record.get('id')}")

            else:
                self.assert_true(False, f"API返回错误状态码: {response.status_code}")

        except Exception as e:
            self.assert_true(False, f"获取历史列表失败: {str(e)}")

        # 3.2 获取识别详情
        if self.test_data.get("existing_identification_id"):
            self.log("获取识别记录详情...")
            ident_id = self.test_data["existing_identification_id"]

            try:
                response = self.session.get(
                    f"{self.api_url}/identifications/{ident_id}"
                )

                if response.status_code == 200:
                    result = response.json()
                    self.assert_true(result.get("success"), "获取详情失败")

                    if result.get("success"):
                        data = result.get("data", {})
                        self.log(f"  图片URL: {data.get('imageUrl')}")
                        self.log(f"  API提供商: {data.get('apiProvider')}")

                        predictions = data.get("predictions", [])
                        if predictions:
                            self.log(f"  识别结果数: {len(predictions)}")

                else:
                    self.assert_true(False, f"API返回错误状态码: {response.status_code}")

            except Exception as e:
                self.assert_true(False, f"获取详情失败: {str(e)}")

    def test_4_feedback_and_plant_creation(self):
        """测试4：反馈和植物创建"""
        self.print_header("测试4：反馈和植物创建")

        if not self.test_data.get("identification_id"):
            self.log("没有可用的识别记录ID，跳过此测试", "SKIP")
            self.results["skipped"] += 1
            return

        ident_id = self.test_data["identification_id"]

        # 4.1 测试提交反馈
        self.log("测试提交识别反馈...")
        try:
            # 先创建一个房间（如果没有的话）
            rooms_response = self.session.get(f"{self.api_url}/rooms")
            if rooms_response.status_code == 200:
                rooms_data = rooms_response.json()
                if rooms_data.get("success"):
                    rooms = rooms_data.get("data", {}).get("items", [])
                    if rooms:
                        room_id = rooms[0]["id"]
                        self.log(f"  使用房间ID: {room_id}")
                    else:
                        self.log("  没有可用的房间，跳过植物创建测试", "SKIP")
                        return

            # 提交反馈
            feedback_data = {
                "feedback": "correct",
                "plantId": None
            }

            response = self.session.post(
                f"{self.api_url}/identifications/{ident_id}/feedback",
                json=feedback_data
            )

            if response.status_code == 200:
                result = response.json()
                self.assert_true(result.get("success"), "提交反馈失败")
                if result.get("success"):
                    self.log("  反馈提交成功")

            else:
                self.assert_true(False, f"API返回错误状态码: {response.status_code}")

        except Exception as e:
            self.assert_true(False, f"提交反馈失败: {str(e)}")

        # 4.2 测试基于识别创建植物
        self.log("测试基于识别结果创建植物...")
        try:
            # 创建植物数据
            plant_data = {
                "roomId": room_id,
                "healthStatus": "healthy"
            }

            response = self.session.post(
                f"{self.api_url}/identifications/{ident_id}/create-plant",
                json=plant_data
            )

            if response.status_code == 200:
                result = response.json()
                self.assert_true(result.get("success"), "创建植物失败")

                if result.get("success"):
                    plant = result.get("data", {}).get("plant", {})
                    plant_id = plant.get("id")

                    self.log(f"  植物创建成功！")
                    self.log(f"  植物ID: {plant_id}")
                    self.log(f"  植物名称: {plant.get('name')}")
                    self.log(f"  来源: {plant.get('source')}")

                    # 保存植物ID用于清理测试数据
                    if plant_id:
                        self.test_data["created_plant_id"] = plant_id

            else:
                self.assert_true(False, f"API返回错误状态码: {response.status_code}")

        except Exception as e:
            self.assert_true(False, f"创建植物失败: {str(e)}")

    def test_5_error_handling(self):
        """测试5：错误处理"""
        self.print_header("测试5：错误处理")

        # 5.1 测试上传不支持的文件格式
        self.log("测试不支持的文件格式...")
        try:
            # 创建一个假文本文件
            import io
            fake_file = io.BytesIO(b"not an image")
            fake_file.name = "test.txt"

            files = {"file": ("test.txt", fake_file, "text/plain")}
            data = {"includeDetails": True}

            response = self.session.post(
                f"{self.api_url}/identify",
                files=files,
                data=data
            )

            self.assert_true(
                response.status_code == 400,
                f"未正确拒绝不支持的文件格式，状态码: {response.status_code}"
            )

            if response.status_code == 400:
                self.log("  正确拒绝了不支持的文件格式")

        except Exception as e:
            self.log(f"  错误处理测试失败: {str(e)}", "WARN")

        # 5.2 测试获取不存在的识别记录
        self.log("测试获取不存在的识别记录...")
        try:
            fake_id = 999999
            response = self.session.get(
                f"{self.api_url}/identifications/{fake_id}"
            )

            self.assert_true(
                response.status_code == 404,
                f"未正确返回404，状态码: {response.status_code}"
            )

        except Exception as e:
            self.log(f"  错误处理测试失败: {str(e)}", "WARN")

    def test_6_cleanup(self):
        """测试6：清理测试数据"""
        self.print_header("测试6：清理测试数据")

        if self.test_data.get("created_plant_id"):
            self.log(f"删除测试植物 (ID: {self.test_data['created_plant_id']})...")
            try:
                plant_id = self.test_data["created_plant_id"]
                response = self.session.delete(
                    f"{self.api_url}/plants/{plant_id}"
                )

                if response.status_code in [200, 204]:
                    self.log("  测试植物已删除")
                else:
                    self.log(f"  删除失败，状态码: {response.status_code}", "WARN")

            except Exception as e:
                self.log(f"  删除测试植物失败: {str(e)}", "WARN")

    def print_summary(self):
        """打印测试摘要"""
        self.print_header("测试摘要")

        total = self.results["total"]
        passed = self.results["passed"]
        failed = self.results["failed"]
        skipped = self.results["skipped"]

        print(f"  总测试数: {total}")
        print(f"  通过: {passed}")
        print(f"  失败: {failed}")
        print(f"  跳过: {skipped}")

        if total > 0:
            success_rate = (passed / total) * 100
            print(f"  成功率: {success_rate:.1f}%")

        print()

        if failed > 0:
            print("  失败的测试:")
            for error in self.results["errors"][:10]:
                print(f"    - {error}")

        print()

        if failed == 0:
            self.log("🎉 所有测试通过！植物识别功能运行正常！", "SUCCESS")
        elif passed > failed:
            self.log("⚠️ 部分测试失败，请检查错误信息", "WARN")
        else:
            self.log("❌ 测试失败较多，请检查配置和服务状态", "ERROR")

        print("=" * 70)

    def run_all_tests(self):
        """运行所有测试"""
        print()
        print("🌿 植物识别功能 - 完整系统性测试")
        print()
        print(f"测试目标: {BASE_URL}")
        print(f"开始时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()

        try:
            self.test_1_environment_check()
            self.test_2_identification_api()
            self.test_3_identification_history()
            self.test_4_feedback_and_plant_creation()
            self.test_5_error_handling()
            self.test_6_cleanup()
        except KeyboardInterrupt:
            print("\n\n⚠️ 测试被用户中断")
        except Exception as e:
            print(f"\n\n❌ 测试过程出错: {str(e)}")

        self.print_summary()


def main():
    """主函数"""
    tester = IdentificationTester()
    tester.run_all_tests()


if __name__ == "__main__":
    main()
