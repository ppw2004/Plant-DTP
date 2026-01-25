# 快速开始指南

## 🚀 5分钟快速启动

### 前置要求

```bash
# 检查Python版本（需要3.11+）
python3 --version

# 检查Node.js版本（需要18+）
node --version

# 检查PostgreSQL（或使用Docker）
docker --version
```

### 方式一：使用初始化脚本（推荐）

```bash
# 1. 克隆项目
cd /home/pengpeiwen/Plant-DTP

# 2. 运行初始化脚本
bash scripts/init_project.sh

# 3. 配置数据库
nano backend/.env
# 修改 DATABASE_URL 为你的数据库连接
```

### 方式二：手动设置

## 步骤1: 启动数据库（Docker）

```bash
cd /home/pengpeiwen/Plant-DTP

# 启动PostgreSQL容器
docker run -d \
  --name plant-dtp-db \
  -e POSTGRES_USER=plantdtp \
  -e POSTGRES_PASSWORD=your_secure_password \
  -e POSTGRES_DB=plant_dtp \
  -p 12803:5432 \
  -v plant_dtp_data:/var/lib/postgresql/data \
  postgres:16-alpine

# 等待数据库启动
sleep 5

# 验证连接
docker exec -it plant-dtp-db psql -U plantdtp -d plant_dtp -c "SELECT 1;"
```

## 步骤2: 配置后端

```bash
cd backend

# 创建Python虚拟环境
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 复制环境变量文件
cp .env.example .env

# 编辑.env文件
nano .env
```

### backend/.env 配置示例

```env
PORT=12801
HOST=0.0.0.0
ENVIRONMENT=development

# 数据库连接
DATABASE_URL=postgresql://plantdtp:your_secure_password@localhost:12803/plant_dtp

# CORS
FRONTEND_URL=http://localhost:12800
ALLOWED_ORIGINS=["http://localhost:12800","http://localhost:5173"]

# 其他配置...
SECRET_KEY=your-secret-key-here
LOG_LEVEL=INFO
```

## 步骤3: 初始化数据库

```bash
# 确保在backend目录且虚拟环境已激活
cd backend
source venv/bin/activate

# 运行数据库迁移（创建表）
alembic upgrade head

# 填充初始数据（任务类型等）
python scripts/seed_data.py
```

## 步骤4: 启动后端服务

```bash
cd backend
source venv/bin/activate

# 方式1: 直接运行（开发环境）
uvicorn app.main:app --host 0.0.0.0 --port 12801 --reload

# 方式2: 使用systemd服务（生产环境）
sudo systemctl start plant-dtp-backend
```

### 验证后端运行

```bash
# 访问健康检查
curl http://localhost:12801/health

# 访问API文档
# 浏览器打开: http://localhost:12801/docs
```

## 步骤5: 配置前端

```bash
cd frontend

# 安装依赖
npm install

# 复制环境变量
cp .env.example .env.local
```

### frontend/.env.local 配置

```env
VITE_API_BASE_URL=http://localhost:12801/api/v1
```

## 步骤6: 启动前端服务

```bash
cd frontend

# 开发环境
npm run dev

# 生产构建
npm run build
```

### 验证前端运行

```bash
# 开发环境访问
# 浏览器打开: http://localhost:5173

# 生产环境（需要Nginx）
# http://localhost:12800
```

## 📊 服务状态检查

```bash
# 检查所有服务
echo "=== 服务状态检查 ==="

# 检查数据库
docker ps | grep plant-dtp-db

# 检查后端
curl -s http://localhost:12801/health | jq .

# 检查前端（开发环境）
curl -s http://localhost:5173 | head -n 5

# 检查端口占用
sudo lsof -i :12800 -i :12801 -i :12803
```

## 🛠️ 常用命令

### 后端管理

```bash
# 进入后端目录
cd backend

# 激活虚拟环境
source venv/bin/activate

# 启动开发服务器
uvicorn app.main:app --host 0.0.0.0 --port 12801 --reload

# 查看日志
tail -f logs/app.log

# 数据库迁移
alembic revision --autogenerate -m "描述"
alembic upgrade head

# 退出虚拟环境
deactivate
```

### 前端管理

```bash
cd frontend

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint

# 代码格式化
npm run format
```

### Docker管理

```bash
# 启动数据库
docker start plant-dtp-db

# 停止数据库
docker stop plant-dtp-db

# 查看日志
docker logs -f plant-dtp-db

# 进入数据库
docker exec -it plant-dtp-db psql -U plantdtp -d plant_dtp

# 备份数据库
docker exec plant-dtp-db pg_dump -U plantdtp plant_dtp > backup_$(date +%Y%m%d).sql

# 恢复数据库
docker exec -i plant-dtp-db psql -U plantdtp plant_dtp < backup_20240125.sql
```

## 🔧 故障排查

### 问题1: 数据库连接失败

```bash
# 检查PostgreSQL是否运行
docker ps | grep postgres

# 检查端口
telnet localhost 12803

# 查看数据库日志
docker logs plant-dtp-db

# 重新启动数据库
docker restart plant-dtp-db
```

### 问题2: 后端启动失败

```bash
# 检查虚拟环境
which python
# 应该显示: backend/venv/bin/python

# 检查依赖
pip list

# 查看详细错误
uvicorn app.main:app --host 0.0.0.0 --port 12801 --log-level debug
```

### 问题3: 前端无法访问后端

```bash
# 检查CORS配置
# 查看 backend/app/main.py 中的CORS设置

# 检查后端是否运行
curl http://localhost:12801/health

# 检查防火墙
sudo ufw status
sudo ufw allow 12801/tcp
```

### 问题4: 端口被占用

```bash
# 查找占用进程
sudo lsof -i :12801

# 杀死进程
sudo kill -9 <PID>

# 或修改端口
# 编辑 backend/.env
PORT=12802
```

## 📱 访问应用

### 开发环境

- **前端**: http://localhost:5173
- **后端API**: http://localhost:12801
- **API文档**: http://localhost:12801/docs
- **数据库管理**: http://localhost:12805 (pgAdmin)

### 生产环境

- **应用**: http://your-domain.com:12800
- **API**: http://your-domain.com:12801/api/v1
- **API文档**: http://your-domain.com:12801/docs

## 🎯 下一步

1. ✅ 服务已启动
2. 📖 阅读 [API接口文档](./docs/04-API接口文档.md)
3. 💡 查看 [端口配置说明](./docs/06-端口配置说明.md)
4. 🚀 开始开发你的功能！

## 📞 获取帮助

```bash
# 查看项目文档
ls docs/

# 查看日志
tail -f backend/logs/app.log

# 重启所有服务
docker restart plant-dtp-db
sudo systemctl restart plant-dtp-backend
sudo systemctl restart nginx
```

---

**提示**: 第一次启动建议使用开发模式，所有日志都会实时显示，方便调试。
