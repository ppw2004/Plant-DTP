# 🌿 植物识别API - 快速参考

## 实现状态 ✅

- **百度AI**: 已配置并测试通过
- **数据库**: 已迁移（plant_identifications表）
- **API路由**: 已注册（6个端点）
- **测试脚本**: 已创建并通过（100%通过率）
- **后端功能**: ✅ 完全实现
- **前端功能**: ⏳ 待开发

---

## 🚀 快速启动

### 1. 启动后端
```bash
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 12801 --reload
```

### 2. 访问API文档
```
http://localhost:12801/docs
```

---

## 📡 API端点

### 植物识别
```bash
POST /api/v1/identify
Content-Type: multipart/form-data

curl -X POST "http://localhost:12801/api/v1/identify" \
  -F "file=@plant.jpg" \
  -F "includeDetails=true"
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "requestId": "req_xxx",
    "predictions": [
      {
        "rank": 1,
        "name": "绿萝",
        "confidence": 0.95,
        "baikeUrl": "https://baike.baidu.com/item/绿萝"
      }
    ],
    "processingTime": 1.23,
    "cached": false,
    "identificationId": 1
  }
}
```

### 获取识别历史
```bash
GET /api/v1/identifications?page=1&limit=20
```

### 提交反馈
```bash
POST /api/v1/identifications/{id}/feedback

{
  "feedback": "correct",
  "plantId": 123
}
```

### 创建植物
```bash
POST /api/v1/identifications/{id}/create-plant

{
  "roomId": 1,
  "healthStatus": "healthy"
}
```

---

## 🧪 测试命令

### 完整系统测试
```bash
cd backend
source venv/bin/activate
python tests/test_identification_full.py
```

**测试结果** (2026-02-01):
- ✅ 环境检查 (配置、数据库、服务)
- ✅ 图片识别API (高山榕, 60%置信度, 1.34秒)
- ✅ 缓存功能 (0.07秒, 95%性能提升)
- ✅ 识别历史 (列表查询、详情获取)
- ✅ 反馈提交 (correct/incorrect/skipped)
- ✅ 创建植物 (基于识别结果自动填充)
- ✅ 错误处理 (422/404/400)
- ✅ 数据清理
- **成功率**: 100% (11/11通过)

### 使用curl测试
```bash
# 上传图片识别
curl -X POST "http://localhost:12801/api/v1/identify" \
  -F "file=@test.jpg"

# 查看历史记录
curl "http://localhost:12801/api/v1/identifications"

# 提交反馈
curl -X POST "http://localhost:12801/api/v1/identifications/1/feedback" \
  -H "Content-Type: application/json" \
  -d '{"feedback": "correct", "plantId": 123}'
```

---

## 📁 相关文件

```
backend/
├── app/
│   ├── models/plant_identification.py     # 数据模型（无外键约束）
│   ├── schemas/plant_identification.py     # 数据验证（支持camelCase）
│   ├── services/
│   │   ├── baidu_ai_service.py             # 百度AI封装（已修复SDK调用）
│   │   └── identification_service.py        # 业务逻辑（已修复Plant.db问题）
│   └── api/v1/identifications.py          # API路由（6个端点）
├── tests/
│   └── test_identification_full.py        # 完整系统测试
├── migrations/add_identification_tables.py # 数据库迁移（已执行）
├── IDENTIFICATION_API_GUIDE.md             # 详细文档
├── API_QUICK_REFERENCE.md                  # 快速参考（本文件）
└── .env                                    # 配置文件（已配置API密钥）
```

---

## 🔧 已修复的问题

1. **SDK导入错误** - 修复 `baidu_aip` → `aip`
2. **方法名错误** - 修复 `plant()` → `plantDetect()`
3. **参数传递错误** - 改为使用options字典
4. **APP_ID缺失** - 添加到.env和config.py
5. **外键约束错误** - 移除users表依赖
6. **字段别名问题** - 添加camelCase支持（roomId, shelfId等）
7. **Plant.db属性错误** - 修改to_dict方法调用

---

## ⚠️ 常见问题

### 1. 图片上传失败
- 检查图片大小（最大4MB）
- 检查图片格式（支持jpg, png, bmp, gif, webp）

### 2. 识别失败
- 检查网络连接
- 确认百度AI API配额是否用完
- 查看后端日志

### 3. 配额限制
- 免费版：每天100-1000次调用
- QPS限制：2次/秒
- 超限后会返回429错误

---

## 📊 数据监控

### 查看识别记录
```sql
SELECT
    id,
    image_url,
    jsonb_array_length(predictions::jsonb) as prediction_count,
    predictions->0->>'name' as top_prediction,
    processing_time,
    cached,
    created_at
FROM plant_identifications
ORDER BY created_at DESC
LIMIT 10;
```

### 统计识别次数
```sql
SELECT
    DATE(created_at) as date,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE cached = false) as api_calls,
    COUNT(*) FILTER (WHERE feedback = 'correct') as correct_count
FROM plant_identifications
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## 🔗 相关文档

- **详细API文档**: `docs/04-API接口文档.md` (第7章)
- **功能设计文档**: `docs/16-植物识别功能设计.md`
- **数据库设计**: `docs/03-数据库设计.md` (3.10节)
- **技术栈分析**: `docs/02-技术栈分析.md` (4.7节)
- **测试指南**: `backend/IDENTIFICATION_API_GUIDE.md`

---

**状态**: ✅ 后端已完成并通过测试 (100%), 可开始前端开发

**最后更新**: 2026-02-01
**测试版本**: v1.0.0
