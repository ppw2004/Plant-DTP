# 植物识别API测试指南

## 功能概述

植物识别功能允许用户通过上传图片，自动识别植物种类。基于百度AI植物识别API，支持超过2万种常见植物和8千种花卉的识别。

## 配置百度AI

### 1. 开通服务
1. 访问 [百度智能云控制台](https://console.bce.baidu.com/)
2. 登录/注册账号
3. 进入"人工智能" → "图像识别"
4. 点击"开通服务"，选择"植物识别"
5. 创建应用，获取API Key和Secret Key

### 2. 配置环境变量
编辑 `backend/.env` 文件，填入API密钥：

```bash
BAIDU_AI_API_KEY=你的API_Key
BAIDU_AI_SECRET_KEY=你的Secret_Key
```

### 3. 测试配置
```bash
cd backend
source venv/bin/activate
python -c "from aip import AipImageClassify; print('✅ 配置成功')"
```

## API端点

### 1. 植物识别
**POST** `/api/v1/identify`

上传图片进行植物识别。

**请求**：
- Content-Type: `multipart/form-data`
- 参数：
  - `file`: 图片文件（必填，最大4MB）
  - `includeDetails`: 是否返回百科信息（可选，默认true）

**cURL示例**：
```bash
curl -X POST "http://localhost:12801/api/v1/identify" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@plant.jpg" \
  -F "includeDetails=true"
```

**响应**：
```json
{
  "success": true,
  "data": {
    "requestId": "req_20241201_001",
    "predictions": [
      {
        "rank": 1,
        "name": "绿萝",
        "scientificName": null,
        "confidence": 0.95,
        "baikeUrl": "https://baike.baidu.com/item/绿萝",
        "description": "绿萝，属于麒麟叶属植物..."
      }
    ],
    "processingTime": 1.23,
    "cached": false,
    "identificationId": 1
  }
}
```

### 2. 获取识别历史
**GET** `/api/v1/identifications`

查询参数：
- `page`: 页码（默认1）
- `limit`: 每页数量（默认20）
- `plantId`: 筛选已创建的植物（可选）

### 3. 提交识别反馈
**POST** `/api/v1/identifications/{id}/feedback`

用户确认识别结果是否正确。

**请求体**：
```json
{
  "feedback": "correct",
  "plantId": 123,
  "correctName": null
}
```

### 4. 基于识别结果创建植物
**POST** `/api/v1/identifications/{id}/create-plant`

使用识别结果快速创建植物档案。

**请求体**：
```json
{
  "roomId": 1,
  "shelfId": null,
  "purchaseDate": "2024-01-01",
  "healthStatus": "healthy"
}
```

## Python测试脚本

```python
import requests

API_BASE = "http://localhost:12801/api/v1"

# 1. 测试植物识别
def test_identify():
    url = f"{API_BASE}/identify"

    with open("test_plant.jpg", "rb") as f:
        files = {"file": f}
        data = {"includeDetails": True}

        response = requests.post(url, files=files, data=data)
        result = response.json()

        if result["success"]:
            predictions = result["data"]["predictions"]
            for pred in predictions:
                print(f"{pred['rank']}. {pred['name']} (置信度: {pred['confidence']})")
        else:
            print("识别失败:", result)

# 2. 测试获取历史记录
def test_history():
    url = f"{API_BASE}/identifications"

    response = requests.get(url, params={"page": 1, "limit": 10})
    result = response.json()

    if result["success"]:
        items = result["data"]["items"]
        print(f"共 {result['data']['total']} 条记录")
        for item in items:
            print(f"- {item['imageUrl']}: {item.get('topPrediction', 'N/A')}")

if __name__ == "__main__":
    test_identify()
    test_history()
```

## 错误处理

### 常见错误

**400 - 图片过大**
```json
{
  "success": false,
  "detail": "图片大小不能超过 4MB"
}
```

**500 - 未配置API密钥**
```json
{
  "success": false,
  "detail": "百度AI服务未配置，请联系管理员配置API密钥"
}
```

**500 - 识别失败**
```json
{
  "success": false,
  "detail": "植物识别失败: 网络错误/服务不可用"
}
```

## 数据库表

### plant_identifications
存储识别记录和用户反馈。

- `id`: 主键
- `image_url`: 图片URL
- `image_hash`: MD5哈希（用于去重）
- `predictions`: 识别结果（JSON）
- `selected_plant_id`: 关联的植物ID
- `feedback`: 用户反馈
- `cached`: 是否使用缓存

### plants 表新增字段
- `identification_id`: 关联的识别记录ID
- `source`: 来源（manual/identify）
- `created_at`: 创建时间
- `updated_at`: 更新时间

## 注意事项

1. **图片质量**：建议上传清晰、光线充足的图片
2. **API配额**：免费版每天100-1000次调用，2 QPS限制
3. **缓存机制**：相同图片24小时内会使用缓存结果
4. **隐私保护**：临时识别图片建议定期清理

## 下一步

- [ ] 前端实现拍照识别组件
- [ ] 前端实现识别结果展示页面
- [ ] 添加识别历史查看功能
- [ ] 实现用户反馈收集
- [ ] 添加图片清理定时任务

## 联系方式

如有问题，请查看：
- API文档：`docs/04-API接口文档.md` (第7章)
- 功能设计：`docs/16-植物识别功能设计.md`
