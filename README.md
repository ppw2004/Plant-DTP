# 植物数字孪生平台 (Plant Digital Twin Platform)

> 🌿 一个现代化的植物管理系统，帮助你轻松记录和养护家中的每一株植物

## 📋 项目简介

植物数字孪生平台是一个全栈Web应用，旨在帮助植物爱好者系统化管理家中的植物。通过数字化的方式记录植物信息、设置养护提醒、追踪养护历史，让植物养护变得更加科学和高效。

### ✨ 核心功能

- **🏠 房间管理** - 创建和管理不同的房间位置（客厅、卧室、阳台等），支持自定义图标和颜色
- **🪴 花架管理** - 在房间内创建花架，支持拖拽排序花架和植物
- **🌿 植物档案** - 记录每株植物的详细信息（名称、品种、图片、简介等）
- **📷 图片管理** - 支持URL添加和文件上传两种方式，可设置主图
- **⏰ 养护提醒** - 配置各类养护任务（浇水、施肥、修剪等）的间隔时间
- **📝 养护记录** - 记录每次养护操作，形成完整的养护历史
- **📊 进度展示** - 直观展示到下次养护的时间进度和剩余天数
- **📈 数据统计** - 查看植物数量、养护操作统计、健康度评估等
- **🔄 拖拽排序** - 支持花架和植物的拖拽排序，可视化调整植物位置

## 🗂️ 项目文档

| 文档 | 描述 |
|------|------|
| [需求规格说明书](./docs/01-需求规格说明书.md) | 详细的功能需求、验收标准和界面需求 |
| [技术栈分析](./docs/02-技术栈分析.md) | 前后端技术选型、方案对比和最终推荐 |
| [数据库设计](./docs/03-数据库设计.md) | 完整的ER图、表结构设计和Prisma Schema |
| [API接口文档](./docs/04-API接口文档.md) | RESTful API设计、请求响应示例和TypeScript类型 |
| [前端测试指南](./docs/07-前端测试指南.md) | 前端组件和页面测试指南 |
| [前端测试用例](./docs/08-前端测试用例.md) | 前端功能测试用例文档 |
| [健康小程序集成规则](./docs/09-健康小程序集成规则.md) | 第三方健康小程序集成规范 |

## 🛠️ 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **路由**: React Router v6
- **状态管理**: Zustand
- **数据获取**: TanStack Query (React Query)
- **UI组件**: Ant Design / shadcn/ui
- **样式**: TailwindCSS
- **表单**: React Hook Form + Zod
- **图表**: Recharts

### 后端
- **运行时**: Python 3.11+
- **框架**: FastAPI
- **ORM**: SQLAlchemy
- **数据库**: PostgreSQL (端口 12803)
- **验证**: Pydantic
- **AI功能**: 预留 OpenAI、Transformers 等库接口

### 部署
- **容器化**: Docker + Docker Compose
- **反向代理**: Nginx
- **进程管理**: PM2

## 📦 快速开始

### 端口配置

本项目所有服务运行在 **12800+** 端口：

| 端口 | 服务 | 说明 |
|------|------|------|
| **12800** | 前端 | Nginx托管React应用 |
| **12801** | 后端API | FastAPI服务 |
| **12803** | PostgreSQL | 数据库服务 |

详细配置请查看 [端口配置说明](./docs/06-端口配置说明.md)

### 一键启动（推荐）

```bash
# 运行初始化脚本
bash scripts/init_project.sh
```

### 手动安装

详细的安装步骤请查看 [快速开始指南](./QUICKSTART.md)

**简单版**：

1. **启动数据库** (Docker)
```bash
docker run -d --name plant-dtp-db \
  -e POSTGRES_USER=plantdtp \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=plant_dtp \
  -p 12803:5432 \
  postgres:16-alpine
```

2. **启动后端**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # 编辑数据库连接
uvicorn app.main:app --port 12801 --reload
```

3. **启动前端**
```bash
cd frontend
npm install
npm run dev  # http://localhost:5173
```

4. **访问应用**
   - API文档: http://localhost:12801/docs
   - 前端开发: http://localhost:5173

## 📂 项目结构

```
Plant-DTP/
├── docs/                   # 项目文档
├── backend/                # 后端项目
│   ├── app/
│   │   ├── api/           # API路由
│   │   │   └── v1/        # v1版本API
│   │   ├── models/        # SQLAlchemy数据模型
│   │   ├── schemas/       # Pydantic验证模式
│   │   ├── services/      # 业务逻辑层
│   │   └── main.py        # FastAPI应用入口
│   ├── tests/             # 后端测试
│   └── requirements.txt   # Python依赖
├── frontend/               # 前端项目
│   ├── src/
│   │   ├── components/    # React组件
│   │   ├── pages/         # 页面组件
│   │   ├── hooks/         # 自定义Hooks
│   │   ├── services/      # API服务层
│   │   ├── store/         # Zustand状态管理
│   │   ├── types/         # TypeScript类型定义
│   │   └── main.tsx       # 应用入口
│   └── package.json
├── scripts/                # 脚本工具
└── README.md
```

## 🔌 API 端点

### 房间管理
- `GET /api/v1/rooms` - 获取房间列表
- `POST /api/v1/rooms` - 创建房间
- `GET /api/v1/rooms/{id}` - 获取房间详情
- `GET /api/v1/rooms/{id}/plants` - 获取房间的植物
- `PATCH /api/v1/rooms/{id}` - 更新房间
- `DELETE /api/v1/rooms/{id}` - 删除房间
- `GET /api/v1/rooms/{id}/stats` - 获取房间统计

### 花架管理
- `GET /api/v1/rooms/{room_id}/shelves` - 获取房间的花架列表
- `POST /api/v1/rooms/{room_id}/shelves` - 创建花架
- `GET /api/v1/shelves/{id}` - 获取花架详情
- `PATCH /api/v1/shelves/{id}` - 更新花架
- `DELETE /api/v1/shelves/{id}` - 删除花架
- `POST /api/v1/rooms/{room_id}/shelves/reorder` - 重新排序花架

### 植物管理
- `GET /api/v1/plants` - 获取植物列表（支持筛选和分页）
- `POST /api/v1/plants` - 创建植物
- `GET /api/v1/plants/{id}` - 获取植物详情
- `PATCH /api/v1/plants/{id}` - 更新植物
- `DELETE /api/v1/plants/{id}` - 删除植物
- `POST /api/v1/shelves/{shelf_id}/plants/{plant_id}` - 移动植物到花架
- `POST /api/v1/shelves/{shelf_id}/plants/reorder` - 重新排序花架上的植物

### 图片管理
- `GET /api/v1/plants/{plant_id}/images` - 获取植物图片列表
- `POST /api/v1/plants/{plant_id}/images` - 添加图片（URL方式）
- `POST /api/v1/plants/{plant_id}/images/upload` - 上传图片文件
- `PATCH /api/v1/images/{image_id}` - 更新图片信息
- `POST /api/v1/images/{image_id}/set-primary` - 设置主图
- `DELETE /api/v1/images/{image_id}` - 删除图片

### 养护配置
- `GET /api/v1/plants/{plant_id}/configs` - 获取植物养护配置
- `POST /api/v1/plants/{plant_id}/configs` - 创建养护配置
- `PATCH /api/v1/configs/{config_id}` - 更新养护配置
- `DELETE /api/v1/configs/{config_id}` - 删除养护配置

### 任务管理
- `GET /api/v1/tasks/today` - 获取今日任务
- `GET /api/v1/tasks/upcoming` - 获取即将到期任务
- `GET /api/v1/tasks/overdue` - 获取逾期任务
- `POST /api/v1/tasks/{task_id}/complete` - 完成任务

### 任务类型
- `GET /api/v1/task-types` - 获取所有任务类型

详细API文档请查看 [API接口文档](./docs/04-API接口文档.md)

## 🗄️ 数据库设计

系统包含以下主要数据表：

- `rooms` - 房间表
- `plant_shelves` - 花架表
- `plants` - 植物表
- `plant_images` - 植物图片表
- `task_types` - 任务类型表
- `plant_configs` - 植物养护配置表
- `care_logs` - 养护记录表

完整的数据库设计请查看 [数据库设计文档](./docs/03-数据库设计.md)

## 📱 页面预览

### 主要页面

1. **仪表盘** - 今日任务提醒、即将到期任务、植物和房间统计
2. **房间管理** - 房间列表、创建编辑房间、查看房间详情
3. **植物管理** - 支持网格视图和花架视图，植物CRUD操作、筛选和搜索
4. **任务管理** - 今日任务、即将到期任务、逾期任务，支持完成任务操作

## 🎯 开发路线图

### V1.0 (MVP) - 当前版本
- [x] 需求分析和文档编写
- [x] 后端API完整实现（房间、花架、植物、图片、配置、任务）
- [x] 前端基础架构（React + TypeScript + Vite）
- [x] 房间和花架管理功能
- [x] 植物CRUD操作
- [x] 图片管理（URL和文件上传）
- [x] 拖拽排序功能
- [x] 养护任务系统
- [x] Dashboard统计展示

### V1.1 - 计划中
- [ ] 养护记录完整功能
- [ ] 任务完成历史记录
- [ ] 数据统计图表
- [ ] 响应式设计优化
- [ ] 移动端适配

### V2.0 - 未来规划
- [ ] 多用户支持
- [ ] 数据导出功能
- [ ] PWA支持（离线使用）
- [ ] 社区分享功能
- [ ] AI养护建议

## 🤝 贡献指南

欢迎贡献代码、提出建议或报告问题！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 开发规范

### Git 提交规范

采用 Conventional Commits 规范：

```bash
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构代码
test: 测试相关
chore: 构建/工具链相关
```

### 代码规范

- **TypeScript**: 使用严格模式
- **ESLint**: 遵循项目配置的规则
- **Prettier**: 统一代码格式
- **注释**: 关键逻辑必须添加注释

## 📄 License

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

**开始使用**: 请查看 [项目初始化指南](./docs/05-项目初始化指南.md)

**API文档**: [API接口文档](./docs/04-API接口文档.md)

**问题反馈**: 请提交 GitHub Issue
