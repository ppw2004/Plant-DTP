# 前端-后端集成修复总结

## 修改概述

将前端的 `camelCase` 命名规范修改为后端的 `snake_case` 命名规范，以实现前后端数据的正确对接。

## 修改的文件清单

### 1. 类型定义 (`frontend/src/types/api.ts`)
**修改的字段：**
- `locationType` → `location_type`
- `plantCount` → `plant_count`
- `scientificName` → `scientific_name`
- `roomId` → `room_id`
- `roomName` → `room_name`
- `purchaseDate` → `purchase_date`
- `healthStatus` → `health_status`
- `imageCount` → `image_count`
- `primaryImage` → `primary_image`
- `plantId` → `plant_id`
- `taskType` → `task_type`
- `dueDate` → `due_date`
- `completedAt` → `completed_at`
- `createdAt` → `created_at`
- `task_type_id` (保持不变，后端使用此字段)
- `interval_days` (保持不变，后端使用此字段)
- `last_done_at` (保持不变，后端使用此字段)
- `next_due_at` (保持不变，后端使用此字段)
- `is_primary` (保持不变，后端使用此字段)
- `thumbnail_url` (保持不变，后端使用此字段)
- `file_size` (保持不变，后端使用此字段)
- `sort_order` (保持不变，后端使用此字段)

### 2. 服务层

#### `frontend/src/services/plantService.ts`
- 修改 HTTP 方法：`PUT` → `PATCH`

#### `frontend/src/services/roomService.ts`
- 修改 HTTP 方法：`PUT` → `PATCH`

#### `frontend/src/services/configService.ts`
- 修改端点：`/plants/{plantId}/configs/{configId}` → `/configs/{configId}` (UPDATE/DELETE)
- 修改 HTTP 方法：`PUT` → `PATCH`
- 更新响应数据结构处理

#### `frontend/src/services/dashboardService.ts`
- 重构为聚合多个端点数据（后端无 `/dashboard/stats` 端点）
- 从 `/rooms/`, `/plants/`, `/tasks/today`, `/tasks/upcoming`, `/tasks/overdue` 聚合数据

### 3. 组件层

#### `frontend/src/components/PlantCard.tsx`
- `plant.healthStatus` → `plant.health_status`
- `plant.primaryImage` → `plant.primary_image`
- `plant.scientificName` → `plant.scientific_name`
- `plant.roomName` → `plant.room_name`
- `plant.purchaseDate` → `plant.purchase_date`
- `plant.imageCount` → `plant.image_count`

#### `frontend/src/components/RoomCard.tsx`
- `room.locationType` → `room.location_type`
- `room.plantCount` → `room.plant_count`

#### `frontend/src/components/TaskListItem.tsx`
- `task.taskType` → `task.task_type`
- `task.dueDate` → `task.due_date`
- `task.plantName` → `task.plant_name`
- `task.plantId` → `task.plant_id`
- `task.plant?.primaryImage` → `task.plant?.primary_image`

#### `frontend/src/components/PlantFormModal.tsx`
- 表单字段全部改为 snake_case
- `scientificName` → `scientific_name`
- `roomId` → `room_id`
- `purchaseDate` → `purchase_date`
- `healthStatus` → `health_status`

#### `frontend/src/components/RoomFormModal.tsx`
- 表单字段：`locationType` → `location_type`

#### `frontend/src/components/ImageUpload.tsx`
- `image.isPrimary` → `image.is_primary`
- `image.takenAt` → `image.taken_at`

### 4. Store

#### `frontend/src/store/uiStore.ts`
- `plantFilters.roomId` → `plantFilters.room_id`
- `plantFilters.healthStatus` → `plantFilters.health_status`

### 5. 页面层

#### `frontend/src/pages/Plants.tsx`
- 筛选参数全部改为 snake_case
- `plantFilters.roomId` → `plantFilters.room_id`
- `plantFilters.healthStatus` → `plantFilters.health_status`

#### `frontend/src/pages/Rooms.tsx`
- `room.locationType` → `room.location_type`

## 关键变更说明

### 1. HTTP 方法变更
- 更新操作从 `PUT` 改为 `PATCH`
- 原因：后端 API 使用 `PATCH` 方法进行部分更新

### 2. API 端点变更
- 配置相关操作的端点从 `/plants/{plantId}/configs/{configId}` 改为 `/configs/{configId}`
- 删除配置操作不再需要 plantId

### 3. Dashboard 数据聚合
- 后端不提供 `/dashboard/stats` 端点
- 前端改为从多个端点聚合数据：
  - `/rooms/` - 获取房间总数
  - `/plants/` - 获取植物总数
  - `/tasks/today` - 获取今日任务数
  - `/tasks/upcoming` - 获取即将到期任务数
  - `/tasks/overdue` - 获取逾期任务数

### 4. 配置数据模型变更
- 前端原模型：`taskType` + `frequency` + `frequencyUnit`
- 后端实际模型：`task_type_id` + `interval_days`
- 这是一个较大的架构差异，需要前端调整表单和数据处理逻辑

## 测试建议

1. **基础 CRUD 测试**
   - 创建房间 → 查看房间列表 → 编辑房间 → 删除房间
   - 创建植物 → 查看植物列表 → 编辑植物 → 删除植物

2. **筛选功能测试**
   - 房间类型筛选
   - 植物健康状态筛选
   - 植物房间筛选
   - 植物名称搜索

3. **Dashboard 测试**
   - 检查统计数据是否正确显示
   - 验证数据聚合逻辑

4. **任务管理测试**
   - 查看今日任务
   - 查看即将到期任务
   - 查看逾期任务
   - 完成任务

5. **图片管理测试**
   - 添加图片（URL 方式）
   - 设置主图
   - 删除图片

## 已知问题和限制

1. **配置管理功能不完整**
   - 前端的配置表单使用 `taskType` + `frequency` 模型
   - 后端使用 `task_type_id` + `interval_days` 模型
   - 需要创建任务类型选择器，或者前端需要显示转换逻辑

2. **文件上传功能**
   - 后端已实现文件上传端点
   - 前端 ImageUpload 组件需要进一步测试文件上传功能

3. **Dashboard 性能**
   - Dashboard 需要调用 5 个 API 端点
   - 考虑后续在后端添加 `/dashboard/stats` 端点优化性能

## 后续改进建议

1. **统一命名规范**
   - 考虑在后端添加 API 响应转换层，自动将 snake_case 转换为 camelCase
   - 或在前端添加 axios 拦截器进行自动转换

2. **优化 Dashboard**
   - 在后端实现 `/dashboard/stats` 端点
   - 减少前端请求次数，提高性能

3. **配置管理完善**
   - 添加任务类型选择器
   - 支持从后端获取任务类型列表
   - 表单验证和数据转换逻辑

4. **测试覆盖**
   - 添加单元测试
   - 添加端到端测试
   - API 集成测试

## 编译状态

✅ 前端成功编译，无 TypeScript 错误

## 服务运行状态

- 前端开发服务器：http://localhost:12802
- 后端 API 服务器：http://localhost:12801
- API 文档：http://localhost:12801/docs
