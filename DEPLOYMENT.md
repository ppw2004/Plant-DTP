# 腾讯云服务器部署指南

## 快速开始

> **5分钟快速部署到 82.156.213.38**

```bash
# 1. 本地构建前端
cd frontend && npm run build

# 2. 上传到服务器
rsync -avz dist/ root@82.156.213.38:/var/www/plant-dtp/

# 3. SSH到服务器配置Nginx
ssh root@82.156.213.38
# 复制下面的Nginx配置并重启服务

# 4. 访问部署的网站
# http://82.156.213.38
```

---

## 服务器信息
- **IP地址**: 82.156.213.38
- **操作系统**: Linux (假设是Ubuntu/Debian/CentOS)
- **前端端口**: 12800 (或80/443用于生产)

## 部署架构

```
用户浏览器
    ↓
Nginx (82.156.213.38:80/443)
    ↓ 静态文件服务
/var/www/plant-dtp/
    ├── index.html
    └── assets/
    ↓ API代理
    ↓ (反向代理到后端)
http://localhost:12801/api/
```

## 部署步骤

### 方案1: 使用SCP直接上传（推荐）

#### 1. 安装Nginx（如果还没安装）

```bash
# SSH登录到服务器
ssh root@82.156.213.38

# Ubuntu/Debian
sudo apt update
sudo apt install -y nginx

# CentOS
sudo yum install -y nginx

# 启动Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 2. 上传前端文件到服务器

在本地机器上执行：

```bash
# 压缩前端文件
cd /home/pengpeiwen/Plant-DTP/frontend
tar -czf plant-dtp-frontend.tar.gz dist/

# 上传到服务器
scp plant-dtp-frontend.tar.gz root@82.156.213.38:/tmp/

# 或者使用rsync（更高效）
rsync -avz dist/ root@82.156.213.38:/var/www/plant-dtp/
```

#### 3. 在服务器上解压和配置

SSH登录到服务器后执行：

```bash
# 创建网站目录
sudo mkdir -p /var/www/plant-dtp

# 如果使用tar上传，需要先解压
cd /var/www/plant-dtp
sudo tar -xzf /tmp/plant-dtp-frontend.tar.gz
sudo rm /tmp/plant-dtp-frontend.tar.gz

# 设置正确的权限
sudo chown -R www-data:www-data /var/www/plant-dtp
sudo chmod -R 755 /var/www/plant-dtp
```

#### 4. 配置Nginx

创建Nginx配置文件：

```bash
sudo nano /etc/nginx/sites-available/plant-dtp
```

添加以下配置：

```nginx
server {
    listen 80;
    server_name 82.156.213.38;  # 或你的域名

    # 前端静态文件
    location / {
        root /var/www/plant-dtp;
        try_files $uri $uri/ /index.html;
        index index.html;

        # 缓存控制
        add_header Cache-Control "public, max-age=3600";
    }

    # API代理到后端
    location /api/ {
        proxy_pass http://localhost:12801/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

启用站点：

```bash
sudo ln -s /etc/nginx/sites-available/plant-dtp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 方案2: 使用自动化脚本

我已经创建了一个自动化部署脚本 `deploy.sh`，可以一键部署。

#### 在本地执行：

```bash
cd /home/pengpeiwen/Plant-DTP/scripts
chmod +x deploy.sh
./deploy.sh
```

这个脚本会自动：
1. 构建前端
2. 上传到服务器
3. 配置Nginx
4. 重启服务

## 配置后端API代理

### 重要：修改后端CORS配置

确保后端允许来自服务器域名的跨域请求。

**方法1：修改配置文件（推荐）**

编辑 `backend/app/core/config.py`，在 `ALLOWED_ORIGINS` 列表中添加生产服务器：

```python
ALLOWED_ORIGINS: List[str] = [
    "http://localhost:12800",
    "http://localhost:5173",
    "http://localhost:12801",
    "http://82.156.213.38",  # 生产环境服务器
    "http://82.156.213.38:80",  # 生产环境80端口
    "https://yourdomain.com",  # 如果有域名（使用HTTPS）
]
```

**方法2：使用环境变量**

在服务器的 `.env` 文件中设置（如果使用环境变量覆盖）：

```bash
# .env文件
ALLOWED_ORIGINS='["http://82.156.213.38","http://localhost:12800"]'
```

**注意**：
- 配置修改后需要重启后端服务
- 如果配置了HTTPS，需要添加 `https://` 开头的域名

## 部署后端

后端同样需要部署到服务器上：

```bash
# 1. 在服务器上创建后端目录
mkdir -p /var/www/plant-dtp/backend

# 2. 上传后端代码
cd /home/pengpeiwen/Plant-DTP
tar -czf backend.tar.gz backend/
scp backend.tar.gz root@82.156.213.38:/var/www/plant-dtp/

# 3. 在服务器上配置和启动
ssh root@82.156.213.38
cd /var/www/plant-dtp
tar -xzf backend.tar.gz
rm backend.tar.gz

# 4. 安装Python依赖并创建虚拟环境
cd /var/www/plant-dtp/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 5. 配置环境变量
cp .env.example .env
nano .env  # 修改数据库连接等配置

# 6. 启动后端服务（使用systemd）
sudo nano /etc/systemd/systemd/plant-dtp-backend.service
```

添加服务配置：

```ini
[Unit]
Description=Plant DTP Backend
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/plant-dtp/backend
Environment="PATH=/var/www/plant-dtp/backend/venv/bin"
ExecStart=/var/www/plant-dtp/backend/venv/bin/uvicorn app.main:app --port 12801 --host 0.0.0.0
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

启动后端服务：

```bash
sudo systemctl daemon-reload
sudo systemctl start plant-dtp-backend
sudo systemctl enable plant-dtp-backend
```

## 域名配置（可选）

如果你有域名，可以配置：

1. **添加A记录**: 将域名指向 `82.156.213.38`
2. **配置HTTPS**:

```bash
# 安装certbot
sudo apt install certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d yourdomain.com

# Certbot会自动配置HTTPS
```

## 防火墙配置

```bash
# Ubuntu/Debian
sudo ufw allow 'Nginx Full'
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 12801  # 后端API（如果需要直接访问）

# CentOS
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 测试部署

```bash
# 检查前端
curl http://82.156.213.38

# 检查API代理
curl http://82.156.213.38/api/v1/rooms

# 检查后端
curl http://localhost:12801/api/v1/rooms
```

## 常见问题

### 1. 404错误
- 检查Nginx配置是否正确
- 确认 `root /var/www/plant-dtp;` 路径下有文件
- 检查Nginx错误日志：`tail -f /var/log/nginx/error.log`

### 2. API请求失败
- 检查后端服务是否运行：`ps aux | grep uvicorn`
- 检查后端日志
- 检查Nginx proxy_pass配置

### 3. 静态文件403/404
- 检查文件权限：`ls -la /var/www/plant-dtp/`
- 确保Nginx用户有读取权限

## 更新部署

以后更新前端时，只需：

```bash
# 本地构建
cd /home/pengpeiwen/Plant-DTP/frontend && npm run build

# 上传（二选一）
rsync -avz dist/ root@82.156.213.38:/var/www/plant-dtp/
# 或
scp -r dist/* root@82.213.38:/var/www/plant-dtp/
```

## 监控日志

```bash
# 查看Nginx访问日志
tail -f /var/log/nginx/access.log

# 查看Nginx错误日志
tail -f /var/log/nginx/error.log

# 查看后端日志
journalctl -u plant-dtp-backend -f
```

## 性能优化建议

1. **启用Gzip压缩**（已在配置中）
2. **配置CDN**（可选）- 将静态文件放到CDN上
3. **启用HTTP/2**（如果使用HTTPS）
4. **数据库连接池优化**
5. **启用Redis缓存**（可选）

---

## 快速部署命令总结

```bash
# 1. 本地构建
cd frontend && npm run build

# 2. 上传
rsync -avz dist/ root@82.213.38:/var/www/plant-dtp/

# 3. 在服务器上配置Nginx
# （复制上面的Nginx配置）

# 4. 重启Nginx
sudo nginx -s reload
```

部署完成后访问: **http://82.156.213.38** 🚀
