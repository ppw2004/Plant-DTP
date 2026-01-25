# 植物数字孪生平台 - API接口文档

## 1. 接口规范

### 1.1 基础信息

- **Base URL**: `http://localhost:3000/api` (开发环境)
- **API版本**: v1
- **数据格式**: JSON
- **字符编码**: UTF-8

### 1.2 通用约定

#### 请求头
```
Content-Type: application/json
Authorization: Bearer <token> (如需要认证)
```

#### 响应格式
```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "timestamp": "2024-12-01T10:00:00Z"
}
```

#### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {}
  },
  "timestamp": "2024-12-01T10:00:00Z"
}
```

### 1.3 HTTP状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 204 | 删除成功（无返回内容） |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 422 | 数据验证失败 |
| 500 | 服务器错误 |

### 1.4 分页参数

```
GET /api/resource?page=1&limit=20&sortBy=createdAt&order=desc
```

**响应格式**：
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

## 2. 认证模块（可选）

### 2.1 用户注册

**接口**: `POST /auth/register`

**请求体**:
```json
{
  "username": "plantlover",
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**响应**: `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "plantlover",
      "email": "user@example.com",
      "createdAt": "2024-12-01T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2.2 用户登录

**接口**: `POST /auth/login`

**请求体**:
```json
{
  "username": "plantlover",
  "password": "securepassword123"
}
```

**响应**: `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "plantlover",
      "email": "user@example.com",
      "avatarUrl": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2.3 获取当前用户信息

**接口**: `GET /auth/me`

**响应**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "plantlover",
    "email": "user@example.com",
    "avatarUrl": null,
    "createdAt": "2024-12-01T10:00:00Z"
  }
}
```

---

## 3. 房间管理模块

### 3.1 获取房间列表

**接口**: `GET /rooms`

**查询参数**:
```
?locationType=indoor&sortBy=sortOrder&order=asc
```

**响应**: `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "客厅",
        "description": "朝南的客厅，光线充足",
        "locationType": "indoor",
        "icon": "sofa",
        "color": "#4CAF50",
        "sortOrder": 1,
        "plantCount": 5,
        "createdAt": "2024-12-01T10:00:00Z",
        "updatedAt": "2024-12-01T10:00:00Z"
      }
    ],
    "pagination": null
  }
}
```

### 3.2 创建房间

**接口**: `POST /rooms`

**请求体**:
```json
{
  "name": "卧室",
  "description": "主卧，有落地窗",
  "locationType": "indoor",
  "icon": "bed",
  "color": "#2196F3",
  "sortOrder": 2
}
```

**响应**: `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "卧室",
    "description": "主卧，有落地窗",
    "locationType": "indoor",
    "icon": "bed",
    "color": "#2196F3",
    "sortOrder": 2,
    "plantCount": 0,
    "createdAt": "2024-12-01T10:00:00Z",
    "updatedAt": "2024-12-01T10:00:00Z"
  }
}
```

### 3.3 获取房间详情

**接口**: `GET /rooms/:id`

**响应**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "客厅",
    "description": "朝南的客厅，光线充足",
    "locationType": "indoor",
    "icon": "sofa",
    "color": "#4CAF50",
    "sortOrder": 1,
    "plantCount": 5,
    "plants": [
      {
        "id": 1,
        "name": "绿萝",
        "scientificName": "Epipremnum aureum",
        "primaryImageUrl": "https://example.com/image.jpg",
        "healthStatus": "healthy"
      }
    ],
    "createdAt": "2024-12-01T10:00:00Z",
    "updatedAt": "2024-12-01T10:00:00Z"
  }
}
```

### 3.4 更新房间

**接口**: `PATCH /rooms/:id`

**请求体**:
```json
{
  "name": "大客厅",
  "description": "朝南的大客厅，光线非常充足"
}
```

**响应**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "大客厅",
    "description": "朝南的大客厅，光线非常充足",
    "locationType": "indoor",
    "icon": "sofa",
    "color": "#4CAF50",
    "sortOrder": 1,
    "plantCount": 5,
    "createdAt": "2024-12-01T10:00:00Z",
    "updatedAt": "2024-12-01T11:00:00Z"
  }
}
```

### 3.5 删除房间

**接口**: `DELETE /rooms/:id`

**响应**: `204 No Content`

**注意**: 删除房间前需要处理房间内的植物（移至其他房间或一并删除）

---

## 4. 花架管理模块

### 4.1 获取房间的所有花架

**接口**: `GET /rooms/:roomId/shelves`

**响应**: `200 OK`
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

### 4.2 获取单个花架及其植物

**接口**: `GET /shelves/:shelfId`

**响应**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 2,
    "roomId": 1,
    "name": "窗边花架",
    "description": "朝南窗边的花架",
    "sortOrder": 1,
    "capacity": 10,
    "isActive": true,
    "isDefault": false,
    "plants": [
      {
        "id": 1,
        "name": "绿萝",
        "shelfOrder": 0,
        "healthStatus": "healthy"
      },
      {
        "id": 2,
        "name": "龟背竹",
        "shelfOrder": 1,
        "healthStatus": "healthy"
      }
    ]
  }
}
```

### 4.3 创建花架

**接口**: `POST /rooms/:roomId/shelves`

**请求体**:
```json
{
  "name": "阳台花架",
  "description": "东侧阳台的花架",
  "capacity": 15
}
```

**响应**: `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 3,
    "roomId": 1,
    "name": "阳台花架",
    "description": "东侧阳台的花架",
    "sortOrder": 2,
    "capacity": 15,
    "isActive": true,
    "isDefault": false
  },
  "message": "花架创建成功"
}
```

### 4.4 更新花架

**接口**: `PATCH /shelves/:shelfId`

**请求体**:
```json
{
  "name": "窗边花架（改造后）",
  "description": "已加装补光灯",
  "capacity": 12
}
```

**响应**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 2,
    "roomId": 1,
    "name": "窗边花架（改造后）",
    "description": "已加装补光灯",
    "sortOrder": 1,
    "capacity": 12,
    "isActive": true,
    "isDefault": false
  },
  "message": "花架更新成功"
}
```

### 4.5 删除花架

**接口**: `DELETE /shelves/:shelfId`

**响应**: `204 No Content`

**注意**:
- 默认花架不能删除
- 删除花架后，该花架上的植物的 shelf_id 会被设为 NULL

### 4.6 重新排序房间的花架

**接口**: `POST /rooms/:roomId/shelves/reorder`

**请求体**:
```json
[2, 3, 1]
```

**说明**: 提供花架ID列表，按新顺序排列

**响应**: `200 OK`
```json
{
  "success": true,
  "message": "花架排序已更新"
}
```

**注意**: 默认花架不参与排序，始终在第一位

### 4.7 移动植物到花架

**接口**: `POST /plants/:plantId/move`

**请求参数**:
- `shelfId`: 目标花架ID（null表示移出花架）
- `newOrder`: 新位置顺序（可选，默认为最后）

**请求体**:
```json
{
  "shelfId": 2,
  "newOrder": 0
}
```

**响应**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "roomId": 1,
    "shelfId": 2,
    "shelfOrder": 0,
    "name": "绿萝"
  },
  "message": "植物已移动"
}
```

### 4.8 重新排序花架上的植物

**接口**: `POST /shelves/:shelfId/plants/reorder`

**请求体**:
```json
[
  {"plantId": 1, "order": 0},
  {"plantId": 3, "order": 1},
  {"plantId": 2, "order": 2}
]
```

**响应**: `200 OK`
```json
{
  "success": true,
  "message": "植物排序已更新"
}
```

---

## 5. 植物管理模块

### 5.1 获取植物列表

**接口**: `GET /plants`

**查询参数**:
```
?roomId=1&healthStatus=healthy&page=1&limit=20&search=绿萝&sortBy=createdAt&order=desc
```

**响应**: `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "绿萝",
        "scientificName": "Epipremnum aureum",
        "description": "喜阴植物，容易养护",
        "room": {
          "id": 1,
          "name": "客厅"
        },
        "primaryImageUrl": "https://example.com/image.jpg",
        "purchaseDate": "2024-01-01",
        "healthStatus": "healthy",
        "isActive": true,
        "nextTasks": [
          {
            "taskType": "浇水",
            "nextDueAt": "2024-12-05T10:00:00Z",
            "daysRemaining": 4,
            "overdue": false
          }
        ],
        "createdAt": "2024-12-01T10:00:00Z",
        "updatedAt": "2024-12-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

### 5.2 创建植物

**接口**: `POST /plants`

**请求体**:
```json
{
  "name": "绿萝",
  "scientificName": "Epipremnum aureum",
  "description": "喜阴植物，容易养护，适合室内",
  "roomId": 1,
  "purchaseDate": "2024-01-01",
  "healthStatus": "healthy",
  "configs": [
    {
      "taskTypeId": 1,
      "intervalDays": 7
    },
    {
      "taskTypeId": 2,
      "intervalDays": 30
    }
  ]
}
```

**响应**: `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "绿萝",
    "scientificName": "Epipremnum aureum",
    "description": "喜阴植物，容易养护，适合室内",
    "roomId": 1,
    "room": {
      "id": 1,
      "name": "客厅"
    },
    "purchaseDate": "2024-01-01",
    "healthStatus": "healthy",
    "primaryImageUrl": null,
    "isActive": true,
    "configs": [],
    "createdAt": "2024-12-01T10:00:00Z",
    "updatedAt": "2024-12-01T10:00:00Z"
  }
}
```

### 5.3 获取植物详情

**接口**: `GET /plants/:id`

**响应**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "绿萝",
    "scientificName": "Epipremnum aureum",
    "description": "喜阴植物，容易养护，适合室内",
    "roomId": 1,
    "room": {
      "id": 1,
      "name": "客厅"
    },
    "purchaseDate": "2024-01-01",
    "healthStatus": "healthy",
    "primaryImageUrl": "https://example.com/image.jpg",
    "images": [
      {
        "id": 1,
        "url": "https://example.com/image.jpg",
        "thumbnailUrl": "https://example.com/thumb.jpg",
        "caption": "全貌",
        "isPrimary": true
      }
    ],
    "isActive": true,
    "configs": [
      {
        "id": 1,
        "taskType": {
          "id": 1,
          "name": "浇水",
          "icon": "💧",
          "code": "watering"
        },
        "intervalDays": 7,
        "lastDoneAt": "2024-11-28T10:00:00Z",
        "nextDueAt": "2024-12-05T10:00:00Z",
        "isActive": true,
        "progress": 57.1,
        "daysRemaining": 4,
        "overdue": false
      }
    ],
    "recentLogs": [
      {
        "id": 1,
        "taskType": {
          "name": "浇水",
          "icon": "💧"
        },
        "executedAt": "2024-11-28T10:00:00Z",
        "note": "正常浇水",
        "result": "success"
      }
    ],
    "createdAt": "2024-12-01T10:00:00Z",
    "updatedAt": "2024-12-01T10:00:00Z"
  }
}
```

### 5.4 更新植物

**接口**: `PATCH /plants/:id`

**请求体**:
```json
{
  "name": "大绿萝",
  "description": "长得很好的绿萝",
  "healthStatus": "good"
}
```

**响应**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "大绿萝",
    "scientificName": "Epipremnum aureum",
    "description": "长得很好的绿萝",
    "roomId": 1,
    "room": {
      "id": 1,
      "name": "客厅"
    },
    "purchaseDate": "2024-01-01",
    "healthStatus": "good",
    "primaryImageUrl": "https://example.com/image.jpg",
    "isActive": true,
    "createdAt": "2024-12-01T10:00:00Z",
    "updatedAt": "2024-12-01T12:00:00Z"
  }
}
```

### 5.5 删除植物

**接口**: `DELETE /plants/:id`

**响应**: `204 No Content`

### 5.6 批量操作植物

**接口**: `PATCH /plants/batch`

**请求体**:
```json
{
  "action": "moveToRoom",
  "plantIds": [1, 2, 3],
  "data": {
    "roomId": 2
  }
}
```

**支持的操作**:
- `moveToRoom`: 批量移动到房间
- `archive`: 批量归档
- `delete`: 批量删除
- `updateHealthStatus`: 批量更新健康状态

**响应**: `200 OK`
```json
{
  "success": true,
  "data": {
    "updated": 3
  }
}
```

---

## 6. 植物图片模块

### 6.1 上传图片

**接口**: `POST /plants/:plantId/images`

**请求类型**: `multipart/form-data`

**请求参数**:
```
file: <binary>
caption: "正面照"
isPrimary: true
```

**响应**: `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "url": "https://example.com/uploads/plant_1_20241201.jpg",
    "thumbnailUrl": "https://example.com/uploads/plant_1_20241201_thumb.jpg",
    "caption": "正面照",
    "isPrimary": true,
    "fileSize": 1024000,
    "width": 1920,
    "height": 1080,
    "sortOrder": 0,
    "createdAt": "2024-12-01T10:00:00Z"
  }
}
```

### 6.2 设置主图

**接口**: `PATCH /plants/:plantId/images/:imageId/primary`

**响应**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "isPrimary": true
  }
}
```

### 6.3 删除图片

**接口**: `DELETE /plants/:plantId/images/:imageId`

**响应**: `204 No Content`

---

## 7. 任务类型模块

### 7.1 获取任务类型列表

**接口**: `GET /task-types`

**查询参数**:
```
?isSystem=true
```

**响应**: `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "浇水",
        "code": "watering",
        "icon": "💧",
        "description": "定期浇水保持土壤湿润",
        "defaultInterval": 7,
        "isSystem": true,
        "sortOrder": 1
      },
      {
        "id": 2,
        "name": "施肥",
        "code": "fertilizing",
        "icon": "🌱",
        "description": "每月施肥一次促进生长",
        "defaultInterval": 30,
        "isSystem": true,
        "sortOrder": 2
      }
    ],
    "pagination": null
  }
}
```

### 7.2 创建自定义任务类型

**接口**: `POST /task-types`

**请求体**:
```json
{
  "name": "除虫",
  "code": "pest_control",
  "icon": "🐛",
  "description": "定期检查并清除虫害",
  "defaultInterval": 14,
  "sortOrder": 10
}
```

**响应**: `201 Created`

---

## 8. 植物养护配置模块

### 8.1 获取植物的养护配置

**接口**: `GET /plants/:plantId/configs`

**响应**: `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "taskType": {
          "id": 1,
          "name": "浇水",
          "icon": "💧",
          "code": "watering"
        },
        "intervalDays": 7,
        "lastDoneAt": "2024-11-28T10:00:00Z",
        "nextDueAt": "2024-12-05T10:00:00Z",
        "isActive": true,
        "season": null,
        "progress": 57.1,
        "daysRemaining": 4,
        "overdue": false,
        "notes": null
      }
    ]
  }
}
```

### 8.2 创建养护配置

**接口**: `POST /plants/:plantId/configs`

**请求体**:
```json
{
  "taskTypeId": 1,
  "intervalDays": 7,
  "season": null,
  "notes": "夏季需要增加浇水频率"
}
```

**响应**: `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 2,
    "plantId": 1,
    "taskType": {
      "id": 1,
      "name": "浇水",
      "icon": "💧"
    },
    "intervalDays": 7,
    "lastDoneAt": null,
    "nextDueAt": null,
    "isActive": true,
    "season": null,
    "notes": "夏季需要增加浇水频率",
    "createdAt": "2024-12-01T10:00:00Z",
    "updatedAt": "2024-12-01T10:00:00Z"
  }
}
```

### 8.3 更新养护配置

**接口**: `PATCH /plants/:plantId/configs/:configId`

**请求体**:
```json
{
  "intervalDays": 5,
  "isActive": true
}
```

**响应**: `200 OK`

### 8.4 删除养护配置

**接口**: `DELETE /plants/:plantId/configs/:configId`

**响应**: `204 No Content`

---

## 9. 养护记录模块

### 9.1 获取养护记录列表

**接口**: `GET /care-logs`

**查询参数**:
```
?plantId=1&taskTypeId=1&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=20
```

**响应**: `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "plant": {
          "id": 1,
          "name": "绿萝",
          "primaryImageUrl": "https://example.com/image.jpg"
        },
        "taskType": {
          "id": 1,
          "name": "浇水",
          "icon": "💧"
        },
        "executedAt": "2024-11-28T10:00:00Z",
        "note": "正常浇水500ml",
        "result": "success",
        "images": [],
        "createdAt": "2024-11-28T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

### 9.2 获取植物的养护历史

**接口**: `GET /plants/:plantId/care-logs`

**查询参数**:
```
?page=1&limit=10
```

**响应**: `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "taskType": {
          "name": "浇水",
          "icon": "💧"
        },
        "executedAt": "2024-11-28T10:00:00Z",
        "note": "正常浇水500ml",
        "result": "success",
        "images": [
          {
            "url": "https://example.com/log_1.jpg"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### 9.3 记录养护操作

**接口**: `POST /care-logs`

**请求体**:
```json
{
  "plantId": 1,
  "taskTypeId": 1,
  "executedAt": "2024-12-01T10:00:00Z",
  "note": "浇水600ml，叶片状态良好",
  "result": "success",
  "imageUrls": [
    "https://example.com/care_log_1.jpg"
  ]
}
```

**响应**: `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 2,
    "plantId": 1,
    "plant": {
      "id": 1,
      "name": "绿萝"
    },
    "taskTypeId": 1,
    "taskType": {
      "id": 1,
      "name": "浇水",
      "icon": "💧"
    },
    "executedAt": "2024-12-01T10:00:00Z",
    "note": "浇水600ml，叶片状态良好",
    "result": "success",
    "images": [
      {
        "id": 1,
        "url": "https://example.com/care_log_1.jpg"
      }
    ],
    "createdAt": "2024-12-01T10:00:00Z",
    "updatedAt": "2024-12-01T10:00:00Z"
  }
}
```

**注意**: 创建养护记录后，系统会自动更新对应的`plant_configs`（`lastDoneAt`和`nextDueAt`）

### 9.4 快速记录（推荐使用）

**接口**: `POST /plants/:plantId/care-logs/quick`

**请求体**:
```json
{
  "taskTypeId": 1,
  "note": "完成浇水"
}
```

**说明**: `executedAt`默认为当前时间，`result`默认为success

**响应**: `201 Created`

### 9.5 更新养护记录

**接口**: `PATCH /care-logs/:logId`

**请求体**:
```json
{
  "note": "浇水800ml，修正记录",
  "executedAt": "2024-12-01T09:00:00Z"
}
```

**响应**: `200 OK`

### 9.6 删除养护记录

**接口**: `DELETE /care-logs/:logId`

**响应**: `204 No Content`

---

## 10. 任务提醒模块

### 10.1 获取今日任务

**接口**: `GET /tasks/today`

**响应**: `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "plant": {
          "id": 1,
          "name": "绿萝",
          "scientificName": "Epipremnum aureum",
          "primaryImageUrl": "https://example.com/image.jpg",
          "room": {
            "id": 1,
            "name": "客厅"
          }
        },
        "taskType": {
          "id": 1,
          "name": "浇水",
          "icon": "💧"
        },
        "config": {
          "id": 1,
          "intervalDays": 7
        },
        "dueDate": "2024-12-01T00:00:00Z",
        "overdue": false,
        "daysRemaining": 0,
        "lastDoneAt": "2024-11-24T10:00:00Z"
      }
    ]
  }
}
```

### 10.2 获取即将到期任务

**接口**: `GET /tasks/upcoming`

**查询参数**:
```
?days=7
```

**响应**: `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "plant": {
          "id": 1,
          "name": "绿萝",
          "room": {
            "name": "客厅"
          }
        },
        "taskType": {
          "name": "浇水",
          "icon": "💧"
        },
        "dueDate": "2024-12-05T00:00:00Z",
        "daysRemaining": 4,
        "overdue": false
      }
    ]
  }
}
```

### 10.3 获取逾期任务

**接口**: `GET /tasks/overdue`

**响应**: `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "plant": {
          "id": 2,
          "name": "仙人掌",
          "room": {
            "name": "阳台"
          }
        },
        "taskType": {
          "name": "浇水",
          "icon": "💧"
        },
        "dueDate": "2024-11-28T00:00:00Z",
        "daysOverdue": 3,
        "lastDoneAt": "2024-11-14T10:00:00Z"
      }
    ]
  }
}
```

### 10.4 快速完成任务

**接口**: `POST /tasks/:taskId/complete`

**请求体**:
```json
{
  "note": "已完成",
  "executedAt": "2024-12-01T10:00:00Z"
}
```

**说明**: 自动创建养护记录并更新配置

**响应**: `201 Created`

---

## 11. 统计分析模块

### 11.1 获取仪表盘数据

**接口**: `GET /stats/dashboard`

**响应**: `200 OK`
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalPlants": 50,
      "totalRooms": 5,
      "healthyPlants": 42,
      "todayTasks": 8,
      "overdueTasks": 2
    },
    "plantsByRoom": [
      {
        "room": {
          "id": 1,
          "name": "客厅",
          "color": "#4CAF50"
        },
        "count": 15
      }
    ],
    "plantsByHealth": [
      {
        "status": "healthy",
        "count": 42
      },
      {
        "status": "good",
        "count": 6
      },
      {
        "status": "poor",
        "count": 2
      }
    ],
    "recentActivity": [
      {
        "type": "care_log",
        "plantName": "绿萝",
        "taskName": "浇水",
        "createdAt": "2024-12-01T10:00:00Z"
      }
    ]
  }
}
```

### 11.2 获取养护统计

**接口**: `GET /stats/care`

**查询参数**:
```
?period=month&plantId=1
```

**period**: week, month, quarter, year

**响应**: `200 OK`
```json
{
  "success": true,
  "data": {
    "period": "month",
    "startDate": "2024-12-01",
    "endDate": "2024-12-31",
    "totalLogs": 45,
    "byTaskType": [
      {
        "taskType": {
          "name": "浇水",
          "icon": "💧"
        },
        "count": 20
      },
      {
        "taskType": {
          "name": "施肥",
          "icon": "🌱"
        },
        "count": 5
      }
    ],
    "completionRate": 95.5,
    "dailyChart": [
      {
        "date": "2024-12-01",
        "count": 5
      }
    ]
  }
}
```

### 11.3 获取植物健康度报告

**接口**: `GET /stats/health-report`

**响应**: `200 OK`
```json
{
  "success": true,
  "data": {
    "overallHealth": 85,
    "plants": [
      {
        "plant": {
          "id": 1,
          "name": "绿萝",
          "primaryImageUrl": "https://example.com/image.jpg"
        },
        "healthScore": 90,
        "careTimeliness": 95,
        "lastCareDate": "2024-11-28T10:00:00Z",
        "overdueTasks": 0
      }
    ]
  }
}
```

---

## 12. 导出模块

### 12.1 导出植物清单

**接口**: `GET /exports/plants`

**查询参数**:
```
?format=xlsx&roomId=1
```

**format**: xlsx, csv

**响应**: `200 OK`
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="plants_20241201.xlsx"

<binary file>
```

### 12.2 导出养护记录

**接口**: `GET /exports/care-logs`

**查询参数**:
```
?format=csv&startDate=2024-01-01&endDate=2024-12-31
```

**响应**: `200 OK`
```
Content-Type: text/csv
Content-Disposition: attachment; filename="care_logs_20241201.csv"

<binary file>
```

### 12.3 导出养护报告

**接口**: `POST /exports/care-report`

**请求体**:
```json
{
  "plantIds": [1, 2, 3],
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "format": "pdf"
}
```

**format**: pdf, xlsx

**响应**: `200 OK`
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="care_report_20241201.pdf"

<binary file>
```

---

## 13. 系统配置模块

### 13.1 获取系统配置

**接口**: `GET /settings`

**响应**: `200 OK`
```json
{
  "success": true,
  "data": {
    "timezone": "Asia/Shanghai",
    "dateFormat": "YYYY-MM-DD",
    "theme": "light",
    "notifications": {
      "enabled": true,
      "advanceReminder": 1
    }
  }
}
```

### 13.2 更新系统配置

**接口**: `PATCH /settings`

**请求体**:
```json
{
  "theme": "dark",
  "notifications": {
    "enabled": true,
    "advanceReminder": 2
  }
}
```

**响应**: `200 OK`

---

## 14. 错误码说明

| 错误码 | 说明 | HTTP状态码 |
|--------|------|-----------|
| `UNAUTHORIZED` | 未授权，需要登录 | 401 |
| `FORBIDDEN` | 禁止访问 | 403 |
| `NOT_FOUND` | 资源不存在 | 404 |
| `VALIDATION_ERROR` | 数据验证失败 | 422 |
| `DUPLICATE_RESOURCE` | 资源冲突（如用户名重复） | 409 |
| `INTERNAL_ERROR` | 服务器内部错误 | 500 |
| `DATABASE_ERROR` | 数据库错误 | 500 |
| `INVALID_CREDENTIALS` | 用户名或密码错误 | 401 |
| `TOKEN_EXPIRED` | Token已过期 | 401 |
| `INVALID_TOKEN` | 无效的Token | 401 |
| `ROOM_NOT_EMPTY` | 房间不为空，无法删除 | 409 |
| `FILE_TOO_LARGE` | 文件过大 | 413 |
| `INVALID_FILE_TYPE` | 不支持的文件类型 | 422 |

**错误响应示例**：
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "数据验证失败",
    "details": {
      "name": ["名称不能为空"],
      "email": ["邮箱格式不正确"]
    }
  },
  "timestamp": "2024-12-01T10:00:00Z"
}
```

---

## 15. 数据模型（TypeScript）

### 15.1 核心类型定义

```typescript
// 通用类型
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  timestamp: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination | null;
}

// 用户类型
interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// 房间类型
interface Room {
  id: number;
  userId: number | null;
  name: string;
  description: string | null;
  locationType: 'indoor' | 'outdoor' | 'balcony' | 'garden';
  icon: string | null;
  color: string | null;
  sortOrder: number;
  plantCount?: number;
  createdAt: string;
  updatedAt: string;
}

// 任务类型
interface TaskType {
  id: number;
  name: string;
  code: string;
  icon: string | null;
  description: string | null;
  defaultInterval: number;
  isSystem: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// 植物类型
interface Plant {
  id: number;
  userId: number | null;
  roomId: number;
  name: string;
  scientificName: string | null;
  description: string | null;
  purchaseDate: string | null;
  healthStatus: 'healthy' | 'good' | 'fair' | 'poor' | 'critical';
  primaryImageId: number | null;
  primaryImageUrl: string | null;
  isActive: boolean;
  room?: Room;
  images?: PlantImage[];
  configs?: PlantConfig[];
  createdAt: string;
  updatedAt: string;
}

// 植物图片
interface PlantImage {
  id: number;
  plantId: number;
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
  isPrimary: boolean;
  fileSize: number | null;
  width: number | null;
  height: number | null;
  sortOrder: number;
  createdAt: string;
}

// 养护配置
interface PlantConfig {
  id: number;
  plantId: number;
  taskTypeId: number;
  taskType?: TaskType;
  intervalDays: number;
  lastDoneAt: string | null;
  nextDueAt: string | null;
  isActive: boolean;
  season: 'spring' | 'summer' | 'autumn' | 'winter' | 'all' | null;
  notes: string | null;
  progress?: number;
  daysRemaining?: number;
  overdue?: boolean;
  createdAt: string;
  updatedAt: string;
}

// 养护记录
interface CareLog {
  id: number;
  plantId: number;
  plant?: Plant;
  taskTypeId: number;
  taskType?: TaskType;
  executedAt: string;
  note: string | null;
  result: 'success' | 'skipped' | 'failed' | null;
  images?: CareLogImage[];
  createdAt: string;
  updatedAt: string;
}

// 养护记录图片
interface CareLogImage {
  id: number;
  careLogId: number;
  url: string;
  caption: string | null;
  sortOrder: number;
  createdAt: string;
}

// 任务提醒
interface TaskReminder {
  plant: {
    id: number;
    name: string;
    scientificName: string | null;
    primaryImageUrl: string | null;
    room: {
      id: number;
      name: string;
    };
  };
  taskType: {
    id: number;
    name: string;
    icon: string | null;
  };
  config: {
    id: number;
    intervalDays: number;
  };
  dueDate: string;
  overdue: boolean;
  daysRemaining: number;
  lastDoneAt: string | null;
}

// 仪表盘统计
interface DashboardStats {
  summary: {
    totalPlants: number;
    totalRooms: number;
    healthyPlants: number;
    todayTasks: number;
    overdueTasks: number;
  };
  plantsByRoom: Array<{
    room: {
      id: number;
      name: string;
      color: string | null;
    };
    count: number;
  }>;
  plantsByHealth: Array<{
    status: string;
    count: number;
  }>;
  recentActivity: Array<{
    type: string;
    plantName: string;
    taskName: string;
    createdAt: string;
  }>;
}
```

---

## 16. 使用示例

### 16.1 创建完整的植物记录

```bash
# 1. 创建房间
curl -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "name": "客厅",
    "locationType": "indoor",
    "color": "#4CAF50"
  }'

# 2. 创建植物（带养护配置）
curl -X POST http://localhost:3000/api/plants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "绿萝",
    "scientificName": "Epipremnum aureum",
    "roomId": 1,
    "configs": [
      {"taskTypeId": 1, "intervalDays": 7},
      {"taskTypeId": 2, "intervalDays": 30}
    ]
  }'

# 3. 上传图片
curl -X POST http://localhost:3000/api/plants/1/images \
  -F "file=@plant.jpg" \
  -F "caption=正面照" \
  -F "isPrimary=true"
```

### 16.2 记录养护操作

```bash
# 方式1: 完整记录
curl -X POST http://localhost:3000/api/care-logs \
  -H "Content-Type: application/json" \
  -d '{
    "plantId": 1,
    "taskTypeId": 1,
    "note": "浇水500ml",
    "result": "success"
  }'

# 方式2: 快速记录（推荐）
curl -X POST http://localhost:3000/api/plants/1/care-logs/quick \
  -H "Content-Type: application/json" \
  -d '{
    "taskTypeId": 1,
    "note": "完成浇水"
  }'

# 方式3: 完成任务提醒
curl -X POST http://localhost:3000/api/tasks/5/complete \
  -H "Content-Type: application/json" \
  -d '{
    "note": "按时完成"
  }'
```

### 16.3 查询即将到期的任务

```bash
# 查询今日任务
curl http://localhost:3000/api/tasks/today

# 查询未来7天任务
curl http://localhost:3000/api/tasks/upcoming?days=7

# 查询逾期任务
curl http://localhost:3000/api/tasks/overdue
```

---

## 17. API测试工具推荐

### 17.1 Thunder Client（VS Code插件）
- 安装插件：`Thunder Client`
- 导入API集合
- 保存环境变量

### 17.2 Postman
- 导入JSON格式的API定义
- 使用环境变量管理不同环境
- 自动化测试脚本

### 17.3 示例环境变量

```json
{
  "baseUrl": "http://localhost:3000/api",
  "token": "your-jwt-token-here"
}
```

---

## 18. WebSocket接口（可选）

如需实时更新任务提醒，可使用WebSocket：

### 18.1 连接

```
ws://localhost:3000/ws
```

### 18.2 订阅任务更新

**客户端发送**:
```json
{
  "action": "subscribe",
  "channel": "tasks"
}
```

**服务器推送**:
```json
{
  "type": "task_due",
  "data": {
    "plantId": 1,
    "plantName": "绿萝",
    "taskName": "浇水",
    "dueDate": "2024-12-05T00:00:00Z"
  }
}
```

---

## 19. 开发计划

### MVP阶段API（V1.0）
- ✅ 房间管理 CRUD
- ✅ 植物管理 CRUD
- ✅ 养护配置管理
- ✅ 养护记录管理
- ✅ 任务提醒查询
- ✅ 基础统计

### V1.1新增API
- 🔲 图片管理优化
- 🔲 批量操作
- 🔲 数据导出
- 🔲 高级统计

### V2.0新增API
- 🔲 多用户认证
- 🔲 权限管理
- 🔲 数据分享
- 🔲 WebSocket实时通知
