#!/usr/bin/env python3
"""
植物数字孪生平台 - API 自动化测试脚本

运行方式：
    python tests/test_api.py              # 运行所有测试
    python tests/test_api.py --module=rooms  # 只测试房间模块
    python tests/test_api.py --verbose      # 详细输出
"""

import sys
import json
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import argparse

# API 配置
BASE_URL = "http://localhost:12801"
API_PREFIX = "/api/v1"


class APITester:
    """API 测试器"""

    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.api_url = f"{base_url}{API_PREFIX}"
        self.session = requests.Session()
        self.test_data = {}
        self.results = {
            "total": 0,
            "passed": 0,
            "failed": 0,
            "errors": []
        }

    def log(self, message: str, level: str = "INFO"):
        """记录日志"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] [{level}] {message}")

    def request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        expected_status: int = 200,
        use_base: bool = False
    ) -> Tuple[bool, dict]:
        """发送 HTTP 请求"""
        # use_base=True 时使用 base_url 而不是 api_url（用于健康检查等）
        url = f"{self.base_url if use_base else self.api_url}{endpoint}"
        headers = {"Content-Type": "application/json"}

        try:
            if method.upper() in ["POST", "PATCH", "PUT"]:
                response = self.session.request(
                    method, url, json=data, headers=headers, timeout=5
                )
            else:
                response = self.session.request(method, url, headers=headers, timeout=5)

            success = response.status_code == expected_status
            return success, response.json()

        except requests.exceptions.RequestException as e:
            self.log(f"请求失败: {e}", "ERROR")
            return False, {"error": str(e)}

    def test(self, name: str, assertion: bool, error_msg: str = ""):
        """执行测试断言"""
        self.results["total"] += 1

        if assertion:
            self.results["passed"] += 1
            self.log(f"✅ {name}", "PASS")
            return True
        else:
            self.results["failed"] += 1
            self.log(f"❌ {name}", "FAIL")
            if error_msg:
                self.log(f"   {error_msg}", "ERROR")
                self.results["errors"].append({
                    "test": name,
                    "error": error_msg
                })
            return False

    def setup(self):
        """准备测试环境"""
        self.log("=== 开始测试准备 ===", "INFO")

        # 1. 健康检查
        success, data = self.request("GET", "/health", use_base=True)
        if not success or data.get("status") != "healthy":
            self.log("服务未运行或不健康", "ERROR")
            return False

        self.log("服务健康检查通过", "INFO")

        # 2. 清理旧测试数据（可选）
        # self.cleanup_test_data()

        # 3. 创建测试房间
        success, data = self.request("POST", "/rooms/", {
            "name": "测试房间",
            "description": "用于自动化测试",
            "location_type": "indoor",
            "icon": "test",
            "color": "#999999"
        })

        if success and data.get("success"):
            self.test_data["room_id"] = data["data"]["id"]
            self.log(f"测试房间创建成功，ID: {self.test_data['room_id']}", "INFO")
        else:
            self.log("测试房间创建失败", "ERROR")
            return False

        return True

    def test_rooms(self):
        """测试房间管理模块"""
        self.log("\n=== 测试房间管理模块 ===", "INFO")

        # 1. 获取房间列表
        success, data = self.request("GET", "/rooms/")
        self.test(
            "获取房间列表",
            success and data.get("success"),
            f"响应: {data}"
        )

        # 2. 获取单个房间
        room_id = self.test_data["room_id"]
        success, data = self.request("GET", f"/rooms/{room_id}")
        self.test(
            "获取单个房间",
            success and data.get("data", {}).get("id") == room_id,
            f"响应: {data}"
        )

        # 3. 更新房间
        success, data = self.request("PATCH", f"/rooms/{room_id}", {
            "description": "更新后的测试房间"
        })
        self.test(
            "更新房间信息",
            success and data.get("success")
        )

        # 4. 获取房间统计
        success, data = self.request("GET", f"/rooms/{room_id}/stats")
        self.test(
            "获取房间统计",
            success and data.get("data", {}).get("roomId") == room_id
        )

        # 5. 创建额外房间（测试列表功能）
        success, data = self.request("POST", "/rooms/", {
            "name": "额外测试房间",
            "description": "用于测试列表",
            "location_type": "outdoor"
        })
        if success:
            self.test_data["extra_room_id"] = data["data"]["id"]

    def test_plants(self):
        """测试植物管理模块"""
        self.log("\n=== 测试植物管理模块 ===", "INFO")

        room_id = self.test_data["room_id"]

        # 1. 创建植物
        success, data = self.request("POST", "/plants/", {
            "room_id": room_id,
            "name": "测试植物",
            "scientific_name": "Testus plantus",
            "description": "用于自动化测试的植物",
            "purchase_date": "2024-01-20",
            "health_status": "healthy"
        })

        if success and data.get("success"):
            self.test_data["plant_id"] = data["data"]["id"]
            self.test("创建植物", True)
        else:
            self.test("创建植物", False, f"响应: {data}")
            return

        plant_id = self.test_data["plant_id"]

        # 2. 获取植物列表
        success, data = self.request("GET", "/plants/")
        self.test(
            "获取植物列表",
            success and data.get("success")
        )

        # 3. 按房间筛选植物
        success, data = self.request("GET", f"/plants/?room_id={room_id}")
        self.test(
            "按房间筛选植物",
            success and len(data.get("data", {}).get("items", [])) > 0
        )

        # 4. 获取单个植物
        success, data = self.request("GET", f"/plants/{plant_id}")
        self.test(
            "获取单个植物",
            success and data.get("data", {}).get("id") == plant_id
        )

        # 5. 更新植物
        success, data = self.request("PATCH", f"/plants/{plant_id}", {
            "description": "更新后的测试植物",
            "health_status": "thriving"
        })
        self.test(
            "更新植物信息",
            success and data.get("success")
        )

        # 6. 创建第二株植物（测试级联删除）
        success, data = self.request("POST", "/plants/", {
            "room_id": room_id,
            "name": "测试植物2",
            "description": "用于测试删除"
        })
        if success:
            self.test_data["plant_id_2"] = data["data"]["id"]

    def test_images(self):
        """测试图片管理模块"""
        self.log("\n=== 测试图片管理模块 ===", "INFO")

        plant_id = self.test_data.get("plant_id")
        if not plant_id:
            self.log("跳过图片测试（未找到植物ID）", "WARN")
            return

        # 1. 添加图片（主图）
        success, data = self.request("POST", f"/plants/{plant_id}/images", {
            "url": "/uploads/test_image_1.jpg",
            "caption": "测试图片1 - 主图",
            "taken_at": "2024-01-25T10:00:00",
            "is_primary": True
        })

        if success and data.get("success"):
            self.test_data["image_id"] = data["data"]["id"]
            self.test_data["image_id_2"] = None  # 占位
            self.test("添加主图", True)
        else:
            self.test("添加主图", False, f"响应: {data}")
            return

        image_id = self.test_data["image_id"]

        # 2. 添加第二张图片
        success, data = self.request("POST", f"/plants/{plant_id}/images", {
            "url": "/uploads/test_image_2.jpg",
            "caption": "测试图片2",
            "taken_at": "2024-01-26T11:00:00",
            "is_primary": False
        })

        if success and data.get("success"):
            self.test_data["image_id_2"] = data["data"]["id"]
            self.test("添加第二张图片", True)

        # 3. 获取植物所有图片
        success, data = self.request("GET", f"/plants/{plant_id}/images")
        self.test(
            "获取所有图片",
            success and len(data.get("data", {}).get("items", [])) >= 2
        )

        # 4. 获取主图
        success, data = self.request("GET", f"/plants/{plant_id}/images/primary")
        self.test(
            "获取主图",
            success and data.get("data", {}).get("isPrimary") == True
        )

        # 5. 更新图片
        success, data = self.request("PATCH", f"/images/{image_id}", {
            "caption": "更新后的测试图片"
        })
        self.test(
            "更新图片信息",
            success and data.get("success")
        )

        # 6. 测试主图唯一性（设置为第二张为主图）
        if self.test_data.get("image_id_2"):
            success, data = self.request("PATCH", f"/images/{self.test_data['image_id_2']}", {
                "is_primary": True
            })
            self.test(
                "主图唯一性",
                success and data.get("success")
            )

    def test_configs(self):
        """测试养护配置模块"""
        self.log("\n=== 测试养护配置模块 ===", "INFO")

        plant_id = self.test_data.get("plant_id")
        if not plant_id:
            self.log("跳过配置测试（未找到植物ID）", "WARN")
            return

        # 1. 创建浇水配置
        success, data = self.request("POST", f"/plants/{plant_id}/configs", {
            "task_type_id": 1,  # 浇水
            "interval_days": 14,
            "notes": "14天浇水一次"
        })

        if success and data.get("success"):
            self.test_data["config_id"] = data["data"]["id"]
            self.test("创建浇水配置", True)
        else:
            self.test("创建浇水配置", False, f"响应: {data}")
            return

        config_id = self.test_data["config_id"]

        # 2. 创建施肥配置
        success, data = self.request("POST", f"/plants/{plant_id}/configs", {
            "task_type_id": 2,  # 施肥
            "interval_days": 30,
            "notes": "每月施肥一次"
        })

        if success and data.get("success"):
            self.test_data["config_id_2"] = data["data"]["id"]
            self.test("创建施肥配置", True)

        # 3. 获取植物所有配置
        success, data = self.request("GET", f"/plants/{plant_id}/configs")
        self.test(
            "获取所有配置",
            success and len(data.get("data", {}).get("items", [])) >= 2
        )

        # 4. 更新配置
        success, data = self.request("PATCH", f"/configs/{config_id}", {
            "interval_days": 10,
            "notes": "更新为10天浇水一次"
        })
        self.test(
            "更新配置",
            success and data.get("success")
        )

        # 5. 记录任务完成
        now = datetime.now()
        next_due = now + timedelta(days=10)
        success, data = self.request("PATCH", f"/configs/{config_id}", {
            "last_done_at": now.isoformat(),
            "next_due_at": next_due.isoformat()
        })
        self.test(
            "记录任务完成",
            success and data.get("success")
        )

    def test_cascade_delete(self):
        """测试级联删除"""
        self.log("\n=== 测试级联删除 ===", "INFO")

        plant_id_2 = self.test_data.get("plant_id_2")
        if not plant_id_2:
            self.log("跳过级联删除测试", "WARN")
            return

        # 为第二株植物添加图片和配置
        self.request("POST", f"/plants/{plant_id_2}/images", {
            "url": "/uploads/test_delete.jpg",
            "caption": "测试删除"
        })
        self.request("POST", f"/plants/{plant_id_2}/configs", {
            "task_type_id": 1,
            "interval_days": 7
        })

        # 删除植物
        success, data = self.request("DELETE", f"/plants/{plant_id_2}")
        self.test(
            "删除植物",
            success and data.get("success")
        )

        # 验证图片和配置也被删除
        # 植物被删除后，查询其图片应该返回空列表
        success, data = self.request("GET", f"/plants/{plant_id_2}/images")
        items_count = len(data.get("data", {}).get("items", []))
        self.test(
            "验证级联删除图片",
            success and items_count == 0  # 成功返回但列表为空
        )

        # 同样验证配置
        success, data = self.request("GET", f"/plants/{plant_id_2}/configs")
        items_count = len(data.get("data", {}).get("items", []))
        self.test(
            "验证级联删除配置",
            success and items_count == 0  # 成功返回但列表为空
        )

    def cleanup(self):
        """清理测试数据"""
        self.log("\n=== 清理测试数据 ===", "INFO")

        # 删除测试房间（会级联删除植物）
        room_id = self.test_data.get("room_id")
        if room_id:
            success, _ = self.request("DELETE", f"/rooms/{room_id}")
            if success:
                self.log(f"测试房间 {room_id} 已删除", "INFO")

        # 删除额外房间
        extra_room_id = self.test_data.get("extra_room_id")
        if extra_room_id:
            self.request("DELETE", f"/rooms/{extra_room_id}")
            self.log(f"额外测试房间 {extra_room_id} 已删除", "INFO")

    def print_summary(self):
        """打印测试总结"""
        print("\n" + "="*60)
        print("📊 测试总结")
        print("="*60)

        total = self.results["total"]
        passed = self.results["passed"]
        failed = self.results["failed"]
        pass_rate = (passed / total * 100) if total > 0 else 0

        print(f"总计测试: {total}")
        print(f"✅ 通过: {passed}")
        print(f"❌ 失败: {failed}")
        print(f"通过率: {pass_rate:.1f}%")

        if self.results["errors"]:
            print("\n❌ 失败详情:")
            for error in self.results["errors"]:
                print(f"  - {error['test']}")
                print(f"    {error['error']}")

        print("="*60)

        return failed == 0


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="API 自动化测试")
    parser.add_argument(
        "--module",
        choices=["all", "rooms", "plants", "images", "configs"],
        default="all",
        help="测试模块"
    )
    parser.add_argument(
        "--skip-cleanup",
        action="store_true",
        help="跳过清理测试数据"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="详细输出"
    )
    args = parser.parse_args()

    tester = APITester()

    try:
        # 准备测试环境
        if not tester.setup():
            print("❌ 测试环境准备失败")
            return 1

        # 运行测试
        if args.module in ["all", "rooms"]:
            tester.test_rooms()

        if args.module in ["all", "plants"]:
            tester.test_plants()

        if args.module in ["all", "images"]:
            tester.test_images()

        if args.module in ["all", "configs"]:
            tester.test_configs()

        if args.module == "all":
            tester.test_cascade_delete()

        # 清理测试数据
        if not args.skip_cleanup:
            tester.cleanup()

        # 打印总结
        success = tester.print_summary()
        return 0 if success else 1

    except KeyboardInterrupt:
        print("\n\n⚠️  测试被中断")
        return 1
    except Exception as e:
        print(f"\n❌ 测试执行出错: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
