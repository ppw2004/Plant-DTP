#!/bin/bash
# 植物数字孪生平台 - 生产环境部署脚本

set -e

echo "========================================="
echo "  植物数字孪生平台 - 生产环境部署"
echo "========================================="
echo ""

# 检查是否以root权限运行
if [ "$EUID" -ne 0 ]; then
    echo "❌ 请使用 sudo 运行此脚本"
    echo "   命令: sudo bash scripts/setup-production.sh"
    exit 1
fi

PROJECT_DIR="/home/pengpeiwen/Plant-DTP"
USER="pengpeiwen"

echo "📦 步骤 1/5: 安装 Nginx..."
apt update
apt install -y nginx

echo ""
echo "📝 步骤 2/5: 配置 Nginx..."
cp "$PROJECT_DIR/nginx-config/plant-dtp.conf" /etc/nginx/sites-available/plant-dtp
ln -sf /etc/nginx/sites-available/plant-dtp /etc/nginx/sites-enabled/plant-dtp
rm -f /etc/nginx/sites-enabled/default

# 测试 Nginx 配置
nginx -t

echo ""
echo "⚙️  步骤 3/5: 配置 systemd 服务..."

# 配置后端服务
sed -i "s|ExecStart=.*|ExecStart=$PROJECT_DIR/backend/venv/bin/python -m uvicorn app.main:app --port 12801 --host 0.0.0.0|" "$PROJECT_DIR/services/plant-dtp-backend.service"
cp "$PROJECT_DIR/services/plant-dtp-backend.service" /etc/systemd/system/

# 配置前端服务（可选，如果使用Nginx提供静态文件，可以不启用）
cp "$PROJECT_DIR/services/plant-dtp-frontend.service" /etc/systemd/system/

# 重新加载 systemd
systemctl daemon-reload

echo ""
echo "🛑 步骤 4/5: 停止旧的进程..."

# 停止可能运行的前后端进程
pkill -f "uvicorn app.main:app" || true
pkill -f "vite.*12800" || true
sleep 2

echo ""
echo "🚀 步骤 5/5: 启动服务..."

# 启动后端服务
systemctl start plant-dtp-backend
systemctl enable plant-dtp-backend

# 启动 Nginx
systemctl start nginx
systemctl enable nginx

echo ""
echo "✅ 部署完成！"
echo ""
echo "========================================="
echo "  服务状态"
echo "========================================="
echo ""

# 检查服务状态
echo "🔍 后端服务状态:"
systemctl is-active plant-dtp-backend && echo "  ✅ 后端运行中" || echo "  ❌ 后端未运行"

echo ""
echo "🔍 Nginx 状态:"
systemctl is-active nginx && echo "  ✅ Nginx 运行中" || echo "  ❌ Nginx 未运行"

echo ""
echo "========================================="
echo "  访问地址"
echo "========================================="
echo ""
echo "  🌐 前端页面: http://82.156.213.38"
echo "  📡 API接口:  http://82.156.213.38/api/v1"
echo ""
echo "========================================="
echo "  管理命令"
echo "========================================="
echo ""
echo "  查看后端日志: tail -f /tmp/plant-backend.log"
echo "  重启后端:     sudo systemctl restart plant-dtp-backend"
echo "  重启Nginx:    sudo systemctl restart nginx"
echo ""
echo "========================================="
