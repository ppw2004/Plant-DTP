#!/bin/bash

# 自动化部署脚本
# 使用方法: ./deploy.sh [环境]

set -e  # 遇到错误立即退出

# 配置
SERVER_IP="82.156.213.38"
SERVER_USER="root"  # 可改为其他用户
REMOTE_DIR="/var/www/plant-dtp"
FRONTEND_DIR="./frontend/dist"

echo "==================================="
echo "植物数字孪生平台 - 自动化部署脚本"
echo "==================================="
echo "服务器: $SERVER_USER@$SERVER_IP"
echo ""

# 检查是否已构建
if [ ! -d "$FRONTEND_DIR" ]; then
  echo "❌ 错误: dist目录不存在"
  echo "请先运行: npm run build"
  exit 1
fi

echo "✅ 找到构建文件: $FRONTEND_DIR"

echo ""
echo "📦 开始部署..."
echo ""

# 1. 测试服务器连接
echo "1️⃣ 测试服务器连接..."
if ssh -o ConnectTimeout=5 $SERVER_USER@$SERVER_IP "echo 'Connected'" > /dev/null 2>&1; then
  echo "✅ 服务器连接成功"
else
  echo "❌ 无法连接到服务器"
  echo "请检查:"
  echo "  - 服务器IP是否正确: $SERVER_IP"
  echo "  - SSH服务是否运行: ssh $SERVER_USER@$SERVER_IP"
  echo "  - 网络连接是否正常"
  exit 1
fi

# 2. 在服务器上准备目录
echo ""
echo "2️⃣ 准备服务器目录..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
  # 创建目录
  sudo mkdir -p $REMOTE_DIR

  # 备份旧版本（可选）
  if [ -d "$REMOTE_DIR/dist" ]; then
    sudo mv $REMOTE_DIR/dist $REMOTE_DIR/dist.backup.$(date +%Y%m%d_%H%M%S) || true
  fi

  # 确保目录存在
  sudo mkdir -p $REMOTE_DIR

  echo "✅ 目录准备完成"
ENDSSH

# 3. 上传文件
echo ""
echo "3️⃣ 上传前端文件..."
rsync -avz --delete \
  --exclude='.DS_Store' \
  --exclude='.git' \
  $FRONTEND_DIR/ \
  $SERVER_USER@$SERVER_IP:$REMOTE_DIR/

echo "✅ 文件上传完成"

# 4. 配置Nginx
echo ""
echo "4️⃣ 配置Nginx..."

# 创建Nginx配置
cat > /tmp/plant-dtp-nginx.conf << 'EOF'
server {
    listen 80;
    server_name $SERVER_IP;

    root $REMOTE_DIR;
    index index.html;

    # 前端静态文件
    location / {
        try_files \$uri \$uri/ /index.html;

        # 缓存控制
        add_header Cache-Control "public, max-age=3600";

        # 安全头
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-Content-Type-Options "nosniff";
        add_header X-XSS-Protection "1; mode=block";
    }

    # API代理到后端
    location /api/ {
        proxy_pass http://localhost:12801/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_cache_bypass \$http_upgrade;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_comp_level 6;
}
EOF

# 上传配置文件
scp /tmp/plant-dtp-nginx.conf $SERVER_USER@$SERVER_IP:/tmp/plant-dtp-nginx.conf

# 在服务器上应用配置
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
  # 检查Nginx配置
  sudo nginx -t

  # 如果存在旧配置，先备份
  if [ -f /etc/nginx/sites-available/plant-dtp ]; then
    sudo cp /etc/nginx/sites-available/plant-dtp /etc/nginx/sites-available/plant-dtp.backup
  fi

  # 应用新配置
  sudo cp /tmp/plant-dtp-nginx.conf /etc/nginx/sites-available/plant-dtp

  # 启用站点
  if [ ! -L /etc/nginx/sites-enabled/plant-dtp ]; then
    sudo ln -s /etc/nginx/sites-available/plant-dtp /etc/nginx/sites-enabled/plant-dtp
  fi

  # 设置文件权限
  sudo chown -R www-data:www-data $REMOTE_DIR
  sudo chmod -R 755 $REMOTE_DIR

  # 重启Nginx
  sudo nginx -s reload

  echo "✅ Nginx配置完成"
ENDSSH

echo ""
echo "5️⃣ 验证部署..."
sleep 2

# 测试前端
HTTP_CODE=$(curl -s -o "%{http_code}" http://$SERVER_IP/ --connect-timeout 10)
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ 前端访问成功"
else
  echo "❌ 前端访问失败 (HTTP $HTTP_CODE)"
fi

# 测试API代理
API_CODE=$(curl -s -o "%{http_code}" http://$SERVER_IP/api/v1/rooms --connect-timeout 10)
if [ "$API_CODE" = "200" ] || [ "$API_CODE" = "404" ]; then
  echo "✅ API代理配置成功"
else
  echo "⚠️  API代理可能需要检查"
fi

echo ""
echo "==================================="
echo "🎉 部署完成！"
echo "==================================="
echo ""
echo "🌐 访问地址: http://$SERVER_IP"
echo ""
echo "📝 下次更新部署时，只需:"
echo "   1. 本地构建: npm run build"
echo "   2. 上传: rsync -avz dist/ $SERVER_USER@$SERVER_IP:$REMOTE_DIR/"
echo ""
echo "📋 查看Nginx日志:"
echo "   ssh $SERVER_USER@$SERVER_IP tail -f /var/log/nginx/access.log"
echo ""
echo "📋 重启Nginx:"
echo "   ssh $SERVER_USER@$SERVER_IP sudo nginx -s reload"
echo ""
