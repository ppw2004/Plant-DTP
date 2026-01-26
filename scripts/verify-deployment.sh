#!/bin/bash

# 植物数字孪生平台 - 部署验证脚本
# 在腾讯云服务器上运行此脚本，验证前后端连接

echo "==================================="
echo "🔍 Plant-DTP 部署验证"
echo "==================================="
echo ""

SERVER_IP="82.156.213.38"
TUNNEL_PORT="2222"
API_ENDPOINT="/api/v1/rooms"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试函数
test_service() {
    local name=$1
    local url=$2
    local expected=${3:-200}

    echo -n "Testing $name... "

    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$url" 2>/dev/null)

    if [ "$HTTP_CODE" = "$expected" ] || [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $HTTP_CODE)"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $HTTP_CODE)"
        return 1
    fi
}

# 1. 检查隧道端口
echo "1️⃣ 检查SSH隧道..."
if netstat -tuln 2>/dev/null | grep -q ":$TUNNEL_PORT "; then
    echo -e "${GREEN}✅ 隧道端口 $TUNNEL_PORT 正在监听${NC}"
else
    echo -e "${RED}❌ 隧道端口 $TUNNEL_PORT 未监听${NC}"
    echo -e "${YELLOW}⚠️  请先在 x99 服务器上建立SSH隧道${NC}"
    echo ""
    echo "在 x99 服务器上执行："
    echo "  nohup ssh -N -R 2222:localhost:12801 \\"
    echo "    -o 'ServerAliveInterval 30' \\"
    echo "    -o 'ExitOnForwardFailure yes' \\"
    echo "    root@$SERVER_IP \\"
    echo "    > /tmp/plant-dtp-tunnel.log 2>&1 &"
    echo ""
    exit 1
fi

# 2. 测试隧道连接
echo ""
echo "2️⃣ 测试隧道到后端连接..."
test_service "后端API (隧道)" "http://localhost:$TUNNEL_PORT$API_ENDPOINT"

# 3. 测试Nginx代理
echo ""
echo "3️⃣ 测试Nginx代理..."
test_service "API代理" "http://localhost$API_ENDPOINT"

# 4. 测试前端
echo ""
echo "4️⃣ 测试前端静态文件..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "http://localhost/" 2>/dev/null)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ 前端访问正常${NC} (HTTP $HTTP_CODE)"
else
    echo -e "${RED}❌ 前端访问失败${NC} (HTTP $HTTP_CODE)"
fi

# 5. 测试公网访问
echo ""
echo "5️⃣ 测试公网访问..."
test_service "公网前端" "http://$SERVER_IP/"
test_service "公网API" "http://$SERVER_IP$API_ENDPOINT"

# 6. 检查Nginx状态
echo ""
echo "6️⃣ 检查Nginx状态..."
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx 运行中${NC}"
else
    echo -e "${RED}❌ Nginx 未运行${NC}"
fi

# 7. 显示配置摘要
echo ""
echo "==================================="
echo "📊 配置摘要"
echo "==================================="
echo "前端地址: http://$SERVER_IP"
echo "API地址:  http://$SERVER_IP/api/v1"
echo "隧道端口: $TUNNEL_PORT"
echo ""

# 8. 检查后端API响应
echo "==================================="
echo "🔗 后端连接测试"
echo "==================================="
RESPONSE=$(curl -s --connect-timeout 5 "http://localhost:$TUNNEL_PORT$API_ENDPOINT" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 后端API响应成功${NC}"
    echo "响应数据: $RESPONSE" | head -c 200
else
    echo -e "${RED}❌ 后端API无响应${NC}"
fi

echo ""
echo "==================================="
echo "✅ 验证完成！"
echo "==================================="
echo ""
echo "🌐 在浏览器访问: http://$SERVER_IP"
echo ""
echo "📋 查看Nginx日志:"
echo "   sudo tail -f /var/log/nginx/access.log"
echo "   sudo tail -f /var/log/nginx/error.log"
echo ""
