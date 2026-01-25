# API 测试指南

## 📋 目录
- [环境准备](#环境准备)
- [基础测试](#基础测试)
- [房间管理](#房间管理)
- [植物管理](#植物管理)
- [植物图片](#植物图片)
- [养护配置](#养护配置)
- [完整测试流程](#完整测试流程)

---

## 🔧 环境准备

### 1. 确保服务运行

```bash
# 检查后端服务
curl http://localhost:12801/health

# 检查数据库
docker ps | grep plant-dtp-db
```

### 2. 安装测试工具

```bash
# 推荐工具
sudo apt install httpie jq  # httpie 是更友好的 curl
# 或者只使用 curl（已预装）
```

### 3. 准备测试数据

```bash
# 运行测试数据准备脚本
cd /home/pengpeiwen/Plant-DTP/backend
python scripts/prepare_test_data.py
```

---

## 🏥 基础测试

### 健康检查

```bash
curl http://localhost:12801/health
```

**预期响应：**
```json
{
  "status": "healthy",
  "service": "plant-dtp-backend",
  "version": "1.0.0"
}
```

### API 文档访问

浏览器访问：http://localhost:12801/docs

---

## 🏠 房间管理

### 1. 创建房间

```bash
curl -X POST http://localhost:12801/api/v1/rooms/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "阳光房",
    "description": "朝南的阳光房，光线充足",
    "location_type": "indoor",
    "icon": "sun",
    "color": "#FF9800",
    "sort_order": 1
  }' | jq
```

**预期响应：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "阳光房",
    "description": "朝南的阳光房，光线充足",
    "locationType": "indoor",
    "icon": "sun",
    "color": "#FF9800",
    "sortOrder": 1
  }
}
```

### 2. 获取所有房间

```bash
curl http://localhost:12801/api/v1/rooms/ | jq
```

### 3. 获取单个房间

```bash
curl http://localhost:12801/api/v1/rooms/1 | jq
```

### 4. 更新房间

```bash
curl -X PATCH http://localhost:12801/api/v1/rooms/1 \
  -H "Content-Type: application/json" \
  -d '{
    "description": "改造后的阳光房",
    "color": "#4CAF50"
  }' | jq
```

### 5. 删除房间

```bash
curl -X DELETE http://localhost:12801/api/v1/rooms/1 | jq
```

### 6. 获取房间统计

```bash
curl http://localhost:12801/api/v1/rooms/1/stats | jq
```

**预期响应：**
```json
{
  "success": true,
  "data": {
    "roomId": 1,
    "roomName": "阳光房",
    "totalPlants": 3,
    "activePlants": 3
  }
}
```

---

## 🗺️ 花架管理

### 1. 获取房间的所有花架

```bash
curl http://localhost:12801/api/v1/rooms/1/shelves | jq
```

**预期响应：**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "roomId": 1,
        "name": "默认花架",
        "description": "房间的默认花架",
        "sortOrder": 0,
        "capacity": 100,
        "isActive": true,
        "isDefault": true
      },
      {
        "id": 2,
        "roomId": 1,
        "name": "窗边花架",
        "description": "朝南窗边的花架",
        "sortOrder": 1,
        "capacity": 10,
        "isActive": true,
        "isDefault": false
      }
    ]
  }
}
```

### 2. 获取单个花架及其植物

```bash
curl http://localhost:12801/api/v1/shelves/2 | jq
```

### 3. 创建花架

```bash
curl -X POST http://localhost:12801/api/v1/rooms/1/shelves \
  -H "Content-Type: application/json" \
  -d '{
    "name": "阳台花架",
    "description": "东侧阳台的多层花架",
    "capacity": 15
  }' | jq
```

**预期响应：**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "roomId": 1,
    "name": "阳台花架",
    "description": "东侧阳台的多层花架",
    "sortOrder": 2,
    "capacity": 15,
    "isActive": true,
    "isDefault": false
  },
  "message": "花架创建成功"
}
```

### 4. 更新花架

```bash
curl -X PATCH http://localhost:12801/api/v1/shelves/2 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "窗边花架（改造后）",
    "capacity": 12
  }' | jq
```

### 5. 删除花架

```bash
curl -X DELETE http://localhost:12801/api/v1/shelves/3 | jq
```

**注意**：默认花架不能删除

### 6. 重新排序房间的花架

```bash
curl -X POST http://localhost:12801/api/v1/rooms/1/shelves/reorder \
  -H "Content-Type: application/json" \
  -d '[2, 4, 5]' | jq
```

**说明**：默认花架不参与排序，只对普通花架排序

### 7. 移动植物到花架

```bash
curl -X POST http://localhost:12801/api/v1/plants/1/move \
  -H "Content-Type: application/json" \
  -d '{
    "shelfId": 2,
    "newOrder": 0
  }' | jq
```

**说明**：
- `shelfId`: 目标花架ID（null表示移出花架）
- `newOrder`: 新位置顺序（可选，默认为最后）

### 8. 重新排序花架上的植物

```bash
curl -X POST http://localhost:12801/api/v1/shelves/2/plants/reorder \
  -H "Content-Type: application/json" \
  -d '[
    {"plantId": 1, "order": 0},
    {"plantId": 3, "order": 1},
    {"plantId": 2, "order": 2}
  ]' | jq
```

---

## 🌿 植物管理

### 1. 创建植物

```bash
curl -X POST http://localhost:12801/api/v1/plants/ \
  -H "Content-Type: application/json" \
  -d '{
    "room_id": 1,
    "name": "小红花仙人球",
    "scientific_name": "Mammillaria hahniana",
    "description": "美丽的仙人球，开花时很漂亮",
    "purchase_date": "2024-01-20",
    "health_status": "healthy",
    "is_active": true
  }' | jq
```

**预期响应：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "roomId": 1,
    "name": "小红花仙人球",
    "scientificName": "Mammillaria hahniana",
    "description": "美丽的仙人球，开花时很漂亮",
    "purchaseDate": "2024-01-20",
    "healthStatus": "healthy",
    "isActive": true
  }
}
```

### 2. 获取所有植物

```bash
curl http://localhost:12801/api/v1/plants/ | jq
```

### 3. 获取房间内的植物

```bash
curl http://localhost:12801/api/v1/plants/?room_id=1 | jq
```

### 4. 获取单个植物

```bash
curl http://localhost:12801/api/v1/plants/1 | jq
```

### 5. 更新植物信息

```bash
curl -X PATCH http://localhost:12801/api/v1/plants/1 \
  -H "Content-Type: application/json" \
  -d '{
    "description": "长势很好，已经开花",
    "health_status": "thriving"
  }' | jq
```

### 6. 删除植物

```bash
curl -X DELETE http://localhost:12801/api/v1/plants/1 | jq
```

---

## 📸 植物图片

### 1. 添加图片（含拍摄时间）

```bash
curl -X POST http://localhost:12801/api/v1/plants/1/images \
  -H "Content-Type: application/json" \
  -d '{
    "url": "/uploads/3a57a7420415d90bdb936558e6e62b00.jpg",
    "caption": "小红花仙人球 - 刚买来的样子",
    "taken_at": "2024-01-25T12:08:00",
    "is_primary": true
  }' | jq
```

**预期响应：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "plantId": 1,
    "url": "/uploads/3a57a7420415d90bdb936558e6e62b00.jpg",
    "thumbnailUrl": null,
    "caption": "小红花仙人球 - 刚买来的样子",
    "isPrimary": true,
    "fileSize": null,
    "width": null,
    "height": null,
    "takenAt": "2024-01-25T12:08:00+00:00",
    "sortOrder": 0,
    "createdAt": "2026-01-25T04:33:20.145852+00:00"
  }
}
```

### 2. 添加多张图片

```bash
# 第一张（主图）
curl -X POST http://localhost:12801/api/v1/plants/1/images \
  -H "Content-Type: application/json" \
  -d '{
    "url": "/uploads/image1.jpg",
    "caption": "整体照",
    "taken_at": "2024-01-20T10:00:00",
    "is_primary": true
  }' | jq

# 第二张（细节图）
curl -X POST http://localhost:12801/api/v1/plants/1/images \
  -H "Content-Type: application/json" \
  -d '{
    "url": "/uploads/image2.jpg",
    "caption": "花朵特写",
    "taken_at": "2024-01-20T10:05:00",
    "is_primary": false
  }' | jq
```

### 3. 获取植物的所有图片

```bash
curl http://localhost:12801/api/v1/plants/1/images | jq
```

**预期响应：**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "plantId": 1,
        "url": "/uploads/image1.jpg",
        "caption": "整体照",
        "isPrimary": true,
        "takenAt": "2024-01-20T10:00:00+00:00"
      },
      {
        "id": 2,
        "plantId": 1,
        "url": "/uploads/image2.jpg",
        "caption": "花朵特写",
        "isPrimary": false,
        "takenAt": "2024-01-20T10:05:00+00:00"
      }
    ]
  }
}
```

### 4. 获取植物的主图

```bash
curl http://localhost:12801/api/v1/plants/1/images/primary | jq
```

### 5. 更新图片信息

```bash
curl -X PATCH http://localhost:12801/api/v1/images/1 \
  -H "Content-Type: application/json" \
  -d '{
    "caption": "更新后的说明",
    "is_primary": false
  }' | jq
```

### 6. 删除图片

```bash
curl -X DELETE http://localhost:12801/api/v1/images/1 | jq
```

---

## ⚙️ 养护配置

### 1. 创建养护配置

```bash
curl -X POST http://localhost:12801/api/v1/plants/1/configs \
  -H "Content-Type: application/json" \
  -d '{
    "task_type_id": 1,
    "interval_days": 14,
    "notes": "14天浇水一次，冬季减少频率"
  }' | jq
```

**预期响应：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "plantId": 1,
    "taskTypeId": 1,
    "intervalDays": 14,
    "lastDoneAt": null,
    "nextDueAt": null,
    "isActive": true,
    "season": null,
    "notes": "14天浇水一次，冬季减少频率"
  }
}
```

### 2. 创建多个养护配置

```bash
# 浇水配置
curl -X POST http://localhost:12801/api/v1/plants/1/configs \
  -H "Content-Type: application/json" \
  -d '{
    "task_type_id": 1,
    "interval_days": 14,
    "notes": "14天浇水一次"
  }' | jq

# 施肥配置
curl -X POST http://localhost:12801/api/v1/plants/1/configs \
  -H "Content-Type: application/json" \
  -d '{
    "task_type_id": 2,
    "interval_days": 30,
    "notes": "每月施肥一次"
  }' | jq

# 喷雾配置
curl -X POST http://localhost:12801/api/v1/plants/1/configs \
  -H "Content-Type: application/json" \
  -d '{
    "task_type_id": 5,
    "interval_days": 3,
    "notes": "每3天喷雾一次增加湿度"
  }' | jq
```

### 3. 获取植物的所有配置

```bash
curl http://localhost:12801/api/v1/plants/1/configs | jq
```

**预期响应：**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "plantId": 1,
        "taskTypeId": 1,
        "taskName": "浇水",
        "intervalDays": 14,
        "notes": "14天浇水一次"
      },
      {
        "id": 2,
        "plantId": 1,
        "taskTypeId": 2,
        "taskName": "施肥",
        "intervalDays": 30,
        "notes": "每月施肥一次"
      }
    ]
  }
}
```

### 4. 更新养护配置

```bash
curl -X PATCH http://localhost:12801/api/v1/configs/1 \
  -H "Content-Type: application/json" \
  -d '{
    "interval_days": 10,
    "notes": "夏季改为10天浇水一次"
  }' | jq
```

### 5. 标记任务完成（更新下次到期时间）

```bash
curl -X PATCH http://localhost:12801/api/v1/configs/1 \
  -H "Content-Type: application/json" \
  -d '{
    "last_done_at": "2024-01-25T10:00:00",
    "next_due_at": "2024-02-08T10:00:00"
  }' | jq
```

### 6. 删除养护配置

```bash
curl -X DELETE http://localhost:12801/api/v1/configs/1 | jq
```

---

## 🎯 完整测试流程

### 场景：管理一株新植物

```bash
#!/bin/bash
# 完整流程：添加一株植物并配置养护

# 1. 创建房间
echo "步骤1: 创建房间..."
ROOM_RESPONSE=$(curl -s -X POST http://localhost:12801/api/v1/rooms/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "客厅",
    "description": "朝南客厅",
    "location_type": "indoor",
    "icon": "sofa",
    "color": "#4CAF50"
  }')

ROOM_ID=$(echo $ROOM_RESPONSE | jq -r '.data.id')
echo "✅ 房间创建成功，ID: $ROOM_ID"

# 2. 创建植物
echo -e "\n步骤2: 创建植物..."
PLANT_RESPONSE=$(curl -s -X POST http://localhost:12801/api/v1/plants/ \
  -H "Content-Type: application/json" \
  -d "{
    \"room_id\": $ROOM_ID,
    \"name\": \"龟背竹\",
    \"scientific_name\": \"Monstera deliciosa\",
    \"description\": \"大型观叶植物\",
    \"purchase_date\": \"2024-01-15\",
    \"health_status\": \"healthy\"
  }")

PLANT_ID=$(echo $PLANT_RESPONSE | jq -r '.data.id')
echo "✅ 植物创建成功，ID: $PLANT_ID"

# 3. 添加图片
echo -e "\n步骤3: 添加图片..."
curl -s -X POST http://localhost:12801/api/v1/plants/$PLANT_ID/images \
  -H "Content-Type: application/json" \
  -d '{
    "url": "/uploads/monstera.jpg",
    "caption": "龟背竹刚买来时",
    "taken_at": "2024-01-15T14:30:00",
    "is_primary": true
  }' | jq
echo "✅ 图片添加成功"

# 4. 配置养护
echo -e "\n步骤4: 配置养护..."
curl -s -X POST http://localhost:12801/api/v1/plants/$PLANT_ID/configs \
  -H "Content-Type: application/json" \
  -d '{
    "task_type_id": 1,
    "interval_days": 7,
    "notes": "每周浇水一次，保持土壤湿润"
  }' | jq
echo "✅ 养护配置成功"

# 5. 查看完整信息
echo -e "\n步骤5: 查看完整信息..."
curl -s http://localhost:12801/api/v1/plants/$PLANT_ID | jq

echo -e "\n🎉 完整流程测试完成！"
```

---

## 📊 测试检查清单

### 基础功能
- [ ] 健康检查接口正常
- [ ] API文档可访问
- [ ] 数据库连接正常

### 房间管理
- [ ] 创建房间
- [ ] 获取房间列表
- [ ] 获取单个房间
- [ ] 更新房间信息
- [ ] 删除房间
- [ ] 获取房间统计

### 植物管理
- [ ] 创建植物
- [ ] 获取植物列表
- [ ] 按房间筛选植物
- [ ] 获取单个植物
- [ ] 更新植物信息
- [ ] 删除植物

### 花架管理
- [ ] 获取房间的所有花架
- [ ] 获取单个花架及其植物
- [ ] 创建花架
- [ ] 更新花架
- [ ] 删除花架（普通花架）
- [ ] 重新排序房间的花架
- [ ] 移动植物到花架
- [ ] 重新排序花架上的植物
- [ ] 默认花架不能删除
- [ ] 默认花架不参与排序

### 图片管理
- [ ] 添加图片（含拍摄时间）
- [ ] 添加多张图片
- [ ] 获取植物所有图片
- [ ] 获取主图
- [ ] 更新图片信息
- [ ] 删除图片
- [ ] 主图唯一性（只能有一张主图）

### 养护配置
- [ ] 创建养护配置
- [ ] 创建多个配置
- [ ] 获取植物配置列表
- [ ] 更新配置
- [ ] 记录完成时间
- [ ] 计算下次到期时间
- [ ] 删除配置

### 数据完整性
- [ ] 外键约束生效
- [ ] 删除房间时植物级联删除
- [ ] 删除花架时植物shelf_id设为NULL
- [ ] 删除植物时图片和配置级联删除
- [ ] 主图唯一性约束
- [ ] 日期时间格式正确
- [ ] 新植物自动分配到默认花架

---

## 🐛 常见问题

### 1. 外键错误

**问题：** `Foreign key associated with column...could not find table`

**解决：**
```bash
# 重启后端服务
pkill -f "uvicorn app.main:app"
cd /home/pengpeiwen/Plant-DTP/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 12801 --reload
```

### 2. 端口被占用

**问题：** `Address already in use`

**解决：**
```bash
# 查找占用进程
lsof -i :12801
# 杀死进程
kill -9 <PID>
```

### 3. 数据库连接失败

**问题：** `could not connect to server`

**解决：**
```bash
# 检查数据库容器
docker ps | grep plant-dtp-db

# 重启数据库
docker restart plant-dtp-db
```

---

## 📝 测试记录模板

```markdown
### 测试日期：2024-01-25
### 测试人员：[姓名]
### 测试环境：开发/测试

| 功能模块 | 测试项 | 结果 | 备注 |
|---------|--------|------|------|
| 基础功能 | 健康检查 | ✅ 通过 | - |
| 房间管理 | 创建房间 | ✅ 通过 | - |
| 房间管理 | 删除房间 | ❌ 失败 | 外键错误 |
| 植物管理 | 创建植物 | ✅ 通过 | - |
| ... | ... | ... | ... |

### 发现的问题
1. [问题描述]
   - 重现步骤：
   - 预期结果：
   - 实际结果：

### 改进建议
1. [建议内容]
```

---

## 🚀 自动化测试

运行完整的自动化测试脚本：

```bash
cd /home/pengpeiwen/Plant-DTP/backend
python tests/test_api.py
```

查看测试报告：

```bash
python tests/test_api.py --report
```
