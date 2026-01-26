#!/bin/bash
# 修复 Nginx 静态文件访问权限问题

set -e

echo "========================================="
echo "  修复 Nginx 静态文件访问权限"
echo "========================================="
echo ""

# 检查是否以root权限运行
if [ "$EUID" -ne 0 ]; then
    echo "❌ 请使用 sudo 运行此脚本"
    echo "   命令: sudo bash scripts/fix-nginx-static.sh"
    exit 1
fi

PROJECT_DIR="/home/pengpeiwen/Plant-DTP"
WWW_DIR="/var/www/plant-dtp"

echo "📁 步骤 1/4: 创建 /var/www/plant-dtp 目录..."
mkdir -p "$WWW_DIR"

echo ""
echo "📦 步骤 2/4: 复制静态文件到 /var/www/plant-dtp..."
cp -r "$PROJECT_DIR/frontend/dist/"* "$WWW_DIR/"

echo ""
echo "🔧 步骤 3/4: 设置正确的文件权限..."
chown -R www-data:www-data "$WWW_DIR"
chmod -R 755 "$WWW_DIR"

echo ""
echo "📝 步骤 4/4: 更新 Nginx 配置..."
sed -i 's|root /home/pengpeiwen/Plant-DTP/frontend/dist;|root /var/www/plant-dtp;|' /etc/nginx/sites-available/plant-dtp

# 测试配置
nginx -t

# 重新加载 Nginx
systemctl reload nginx

echo ""
echo "✅ 修复完成！"
echo ""
echo "========================================="
echo "  验证部署"
echo "========================================="
echo ""

# 测试访问
if curl -s -o /dev/null -w "%{http_code}" http://localhost/ | grep -q "200"; then
    echo "✅ 前端页面正常 (HTTP 200)"
else
    echo "❌ 前端页面可能有问题"
fi

if curl -s -o /dev/null -w "%{http_code}" http://localhost/api/v1/health | grep -q "200"; then
    echo "✅ API 代理正常 (HTTP 200)"
else
    echo "⚠️  API 代理可能需要检查"
fi

echo ""
echo "========================================="
echo "  访问地址"
echo "========================================="
echo ""
echo "  🌐 本地访问: http://localhost"
echo "  🌐 外部访问: http://82.156.213.38"
echo "  📡 API 地址: http://82.156.213.38/api/v1"
echo ""
echo "========================================="
echo "  文件位置"
echo "========================================="
echo ""
echo "  静态文件目录: $WWW_DIR"
echo "  Nginx 配置: /etc/nginx/sites-available/plant-dtp"
echo ""
echo "========================================="
