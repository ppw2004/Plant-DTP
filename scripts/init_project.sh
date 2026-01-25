#!/bin/bash

# 植物数字孪生平台 - 项目初始化脚本
# 此脚本会创建所有必需的配置文件和基础代码

set -e  # 遇到错误立即退出

echo "🌿 开始初始化植物数字孪生平台..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 创建后端Python虚拟环境
echo -e "${BLUE}[1/8] 创建Python虚拟环境...${NC}"
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓ 虚拟环境创建成功${NC}"
else
    echo -e "${YELLOW}⚠ 虚拟环境已存在${NC}"
fi

# 2. 激活虚拟环境并安装依赖
echo ""
echo -e "${BLUE}[2/8] 安装Python依赖...${NC}"
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
echo -e "${GREEN}✓ 依赖安装完成${NC}"

# 3. 创建环境变量文件
echo ""
echo -e "${BLUE}[3/8] 配置环境变量...${NC}"
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ .env文件已创建，请编辑配置数据库连接${NC}"
else
    echo -e "${YELLOW}⚠ .env文件已存在${NC}"
fi

# 4. 初始化数据库迁移
echo ""
echo -e "${BLUE}[4/8] 初始化数据库...${NC}"
# 等待用户配置数据库
echo -e "${YELLOW}请先配置.env文件中的数据库连接${NC}"
read -p "数据库配置完成了吗？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # 创建alembic配置
    alembic init alembic
    echo -e "${GREEN}✓ Alembic已初始化${NC}"
fi

# 5. 创建必需目录
echo ""
echo -e "${BLUE}[5/8] 创建目录结构...${NC}"
mkdir -p logs uploads
mkdir -p frontend/src/{pages,components,hooks,services,store,types,utils,assets}
mkdir -p frontend/public
echo -e "${GREEN}✓ 目录结构创建完成${NC}"

# 6. 前端初始化
echo ""
echo -e "${BLUE}[6/8] 初始化前端项目...${NC}"
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✓ 前端依赖安装完成${NC}"
else
    echo -e "${YELLOW}⚠ 前端依赖已安装${NC}"
fi

# 7. 创建Docker配置
echo ""
echo -e "${BLUE}[7/8] 创建Docker配置...${NC}"
cd ..
mkdir -p docker
echo -e "${GREEN}✓ Docker配置目录已创建${NC}"

# 8. 完成提示
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  项目初始化完成！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📚 后续步骤："
echo ""
echo "1. 配置数据库连接:"
echo "   cd backend"
echo "   nano .env"
echo ""
echo "2. 运行数据库迁移:"
echo "   alembic upgrade head"
echo ""
echo "3. 填充初始数据:"
echo "   python scripts/init_db.py"
echo ""
echo "4. 启动后端服务:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   uvicorn app.main:app --host 0.0.0.0 --port 12801 --reload"
echo ""
echo "5. 启动前端服务:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "📖 查看文档:"
echo "   docs/06-端口配置说明.md"
echo ""
