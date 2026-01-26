#!/bin/bash

# 快速验证脚本 - x99隧道建立后运行

echo "==================================="
echo "🔍 快速验证部署"
echo "==================================="
echo ""

SERVER_IP="82.156.213.38"
TUNNEL_PORT="12801"

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# 1. 检查隧道
echo "1️⃣ 检查SSH隧道端口 12801..."
if netstat -tuln 2>/dev/null | grep -q ":$TUNNEL_PORT "; then
    echo -e "${GREEN}✅ 端口 12801 正在监听${NC}"
else
    echo -e "${RED}❌ 端口 12801 未监听${NC}"
    echo "请先在 x99 服务器建立隧道"
    exit 1
fi

# 2. 测试后端
echo ""
echo "2️⃣ 测试后端API连接..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "http://localhost:$TUNNEL_PORT/api/v1/rooms" 2>/dev/null)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
    echo -e "${GREEN}✅ 后端连接成功 (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ 后端连接失败 (HTTP $HTTP_CODE)${NC}"
fi

# 3. 测试Nginx代理
echo ""
echo "3️⃣ 测试Nginx代理..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "http://localhost/api/v1/rooms" 2>/dev/null)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
    echo -e "${GREEN}✅ Nginx代理成功 (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ Nginx代理失败 (HTTP $HTTP_CODE)${NC}"
fi

# 4. 测试公网访问
echo ""
echo "4️⃣ 测试公网访问..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "http://$SERVER_IP/api/v1/rooms" 2>/dev/null)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
    echo -e "${GREEN}✅ 公网访问成功 (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ 公网访问失败 (HTTP $HTTP_CODE)${NC}"
fi

echo ""
echo "==================================="
echo "🌐 访问地址: http://$SERVER_IP"
echo "==================================="
