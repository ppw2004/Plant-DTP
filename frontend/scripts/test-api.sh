#!/bin/bash

# 前端 API 测试脚本
# 用于快速测试前端与后端 API 的集成

# Don't exit on error, continue to show all test results
# set -e

API_BASE="http://localhost:12801/api/v1"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=================================================="
echo "🧪 植物数字孪生平台 - API 集成测试"
echo "=================================================="
echo ""

# 检查后端服务
echo -n "检查后端服务... "
if curl -s "${API_BASE%/v1}/health" > /dev/null; then
    echo -e "${GREEN}✅ 运行中${NC}"
else
    echo -e "${RED}❌ 后端服务未运行${NC}"
    exit 1
fi

# 测试函数
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4

    echo -n "测试 $name... "

    if [ "$method" = "GET" ]; then
        response=$(curl -s -X GET "$API_BASE$endpoint" -H "Content-Type: application/json")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -X POST "$API_BASE$endpoint" -H "Content-Type: application/json" -d "$data")
    elif [ "$method" = "PUT" ]; then
        response=$(curl -s -X PUT "$API_BASE$endpoint" -H "Content-Type: application/json" -d "$data")
    elif [ "$method" = "PATCH" ]; then
        response=$(curl -s -X PATCH "$API_BASE$endpoint" -H "Content-Type: application/json" -d "$data")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -X DELETE "$API_BASE$endpoint")
    fi

    if echo "$response" | grep -q '"success":true\|"data"'; then
        echo -e "${GREEN}✅ 通过${NC}"
        return 0
    else
        echo -e "${RED}❌ 失败${NC}"
        echo "响应: $response"
        return 1
    fi
}

echo ""
echo "==================== 房间 API 测试 ===================="

# 获取所有房间
test_endpoint "获取房间列表" "GET" "/rooms/"

# 创建房间
ROOM_ID=$(curl -s -X POST "$API_BASE/rooms/" \
    -H "Content-Type: application/json" \
    -d '{"name":"测试房间","description":"自动化测试房间","locationType":"indoor","icon":"🧪","color":"#1890ff"}' \
    | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')

if [ -n "$ROOM_ID" ]; then
    echo -e "创建测试房间... ${GREEN}✅ (ID: $ROOM_ID)${NC}"

    # 获取单个房间
    test_endpoint "获取单个房间" "GET" "/rooms/$ROOM_ID"

    # 更新房间
    test_endpoint "更新房间" "PATCH" "/rooms/$ROOM_ID" \
        '{"description":"更新后的测试房间"}'

    # 获取房间统计
    test_endpoint "获取房间统计" "GET" "/rooms/$ROOM_ID/stats"
else
    echo -e "${YELLOW}⚠️  跳过房间详细测试（创建失败）${NC}"
fi

echo ""
echo "==================== 植物 API 测试 ===================="

# 获取所有植物
test_endpoint "获取植物列表" "GET" "/plants/"

if [ -n "$ROOM_ID" ]; then
    # 创建植物
    PLANT_ID=$(curl -s -X POST "$API_BASE/plants/" \
        -H "Content-Type: application/json" \
        -d "{\"name\":\"测试植物\",\"scientificName\":\"Test Plant\",\"description\":\"自动化测试植物\",\"room_id\":$ROOM_ID,\"health_status\":\"healthy\"}" \
        | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')

    if [ -n "$PLANT_ID" ]; then
        echo -e "创建测试植物... ${GREEN}✅ (ID: $PLANT_ID)${NC}"

        # 获取单个植物
        test_endpoint "获取单个植物" "GET" "/plants/$PLANT_ID"

        # 更新植物
        test_endpoint "更新植物" "PATCH" "/plants/$PLANT_ID" \
            '{"health_status":"needs_attention"}'

        # 添加图片
        test_endpoint "添加图片URL" "POST" "/plants/$PLANT_ID/images" \
            '{"url":"https://via.placeholder.com/400","caption":"测试图片"}'

        # 获取植物图片
        test_endpoint "获取植物图片" "GET" "/plants/$PLANT_ID/images"

        # 创建养护配置
        test_endpoint "创建养护配置" "POST" "/plants/$PLANT_ID/configs" \
            "{\"task_type_id\":1,\"interval_days\":7}"

        # 获取植物配置
        test_endpoint "获取植物配置" "GET" "/plants/$PLANT_ID/configs"

        # 删除配置
        CONFIG_ID=$(curl -s "$API_BASE/plants/$PLANT_ID/configs" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
        if [ -n "$CONFIG_ID" ]; then
            test_endpoint "删除配置" "DELETE" "/configs/$CONFIG_ID"
        fi

        # 删除植物
        test_endpoint "删除植物" "DELETE" "/plants/$PLANT_ID"
    else
        echo -e "${YELLOW}⚠️  跳过植物详细测试（创建失败）${NC}"
    fi
fi

echo ""
echo "==================== 任务 API 测试 ===================="

# 获取今日任务
test_endpoint "获取今日任务" "GET" "/tasks/today"

# 获取即将到期任务
test_endpoint "获取即将到期任务" "GET" "/tasks/upcoming"

# 获取逾期任务
test_endpoint "获取逾期任务" "GET" "/tasks/overdue"

# 清理测试数据
if [ -n "$ROOM_ID" ]; then
    echo ""
    echo "==================== 清理测试数据 ===================="
    test_endpoint "删除测试房间" "DELETE" "/rooms/$ROOM_ID"
    echo -e "${GREEN}✅ 测试数据已清理${NC}"
fi

echo ""
echo "=================================================="
echo -e "${GREEN}✨ API 测试完成！${NC}"
echo "=================================================="
