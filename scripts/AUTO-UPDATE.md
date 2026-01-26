# Plant-DTP 自动更新部署系统

## 📋 脚本说明

### 1. auto-update.sh - 自动更新脚本

智能化的自动更新部署脚本，支持：
- ✅ 自动检测代码更新
- ✅ 智能依赖管理（仅当 package.json 变化时重新安装）
- ✅ 自动备份旧版本
- ✅ 构建失败自动回滚
- ✅ 完整的日志记录
- ✅ 部署验证

### 2. setup-auto-update.sh - 定时任务配置

交互式配置定时任务的脚本。

---

## 🚀 快速开始

### 一键设置定时任务

```bash
/root/Plant-DTP/scripts/setup-auto-update.sh
```

按提示选择更新频率，自动配置 cron 定时任务。

---

## 📖 使用方法

### 手动执行更新

```bash
# 智能更新（检查代码变更）
/root/Plant-DTP/scripts/auto-update.sh

# 强制更新（不检查代码变更）
/root/Plant-DTP/scripts/auto-update.sh --force
```

### 查看定时任务

```bash
# 查看所有定时任务
crontab -l

# 编辑定时任务
crontab -e
```

### 查看更新日志

```bash
# 实时查看日志
tail -f /var/log/plant-dtp-update.log

# 查看最近 50 行
tail -50 /var/log/plant-dtp-update.log
```

---

## ⏰ Cron 表达式说明

```
* * * * * 命令
│ │ │ │ │
│ │ │ │ └─ 星期 (0-7, 0和7都是周日)
│ │ │ └─── 月份 (1-12)
│ │ └───── 日期 (1-31)
│ └─────── 小时 (0-23)
└───────── 分钟 (0-59)
```

### 常用示例

```bash
# 每小时
0 * * * *

# 每天凌晨 2 点
0 2 * * *

# 每天上午 9 点和下午 6 点
0 9,18 * * *

# 每周一凌晨 3 点
0 3 * * 1

# 每月 1 号凌晨 4 点
0 4 1 * *

# 每 30 分钟
*/30 * * * *
```

---

## 🔧 工作流程

```
1. 检查代码更新
   ↓
2. 拉取最新代码 (git pull)
   ↓
3. 检查 package.json 变化
   ↓ (有变化)
4. 重新安装依赖 (npm install)
   ↓
5. 构建前端 (npm run build)
   ↓ (失败则回滚)
6. 部署到 Nginx 目录
   ↓
7. 验证部署
   ↓
8. 清理旧备份 (>7天)
   ↓
9. 记录日志
```

---

## 📂 文件结构

```
/var/www/plant-dtp/
├── backups/              # 备份目录
│   └── backup_20260126_133000/
├── index.html            # 部署的文件
└── assets/

/var/log/
└── plant-dtp-update.log  # 更新日志
```

---

## 🛠️ 高级配置

### 自定义更新脚本

编辑 `/root/Plant-DTP/scripts/auto-update.sh` 修改配置：

```bash
PROJECT_DIR="/root/Plant-DTP"      # 项目目录
FRONTEND_DIR="$PROJECT_DIR/frontend"
DEPLOY_DIR="/var/www/plant-dtp"     # Nginx部署目录
BACKUP_DIR="/var/www/plant-dtp/backups"
LOG_FILE="/var/log/plant-dtp-update.log"
```

### 配置邮件通知（可选）

在脚本末尾取消注释邮件通知：

```bash
# 安装 mailutils
sudo apt install mailutils

# 配置邮件
echo "Plant-DTP 更新成功" | mail -s "部署通知" admin@example.com
```

### 配置 Webhook 通知（可选）

在 `main()` 函数末尾添加：

```bash
# 发送钉钉通知
curl -X POST "https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"msgtype":"text","text":{"content":"Plant-DTP 部署成功"}}'
```

---

## 🐛 故障排查

### 更新失败

```bash
# 查看详细日志
cat /var/log/plant-dtp-update.log

# 手动测试构建
cd /root/Plant-DTP/frontend
npm run build
```

### 恢复备份

```bash
# 查看可用备份
ls -la /var/www/plant-dtp/backups/

# 恢复指定备份
cp -r /var/www/plant-dtp/backups/backup_20260126_133000/* /var/www/plant-dtp/
```

### Cron 任务不执行

```bash
# 检查 cron 服务状态
systemctl status cron

# 查看 cron 日志
grep CRON /var/log/syslog
```

---

## 📊 监控建议

### 创建监控脚本

```bash
#!/bin/bash
# /root/Plant-DTP/scripts/check-update.sh

# 检查最后更新时间
LAST_UPDATE=$(stat -c %Y /var/www/plant-dtp/index.html)
CURRENT=$(date +%s)
DIFF=$((CURRENT - LAST_UPDATE))
HOURS=$((DIFF / 3600))

if [ $HOURS -gt 48 ]; then
    echo "警告: 超过 $HOURS 小时未更新"
    # 发送通知
fi
```

---

## 🔐 安全建议

1. **限制脚本权限**
   ```bash
   chmod 700 /root/Plant-DTP/scripts/*.sh
   ```

2. **使用 SSH 密钥**
   ```bash
   # 配置 Git 使用 SSH 密钥
   ssh-keygen -t rsa -b 4096 -C "plant-dtp-auto-update"
   ```

3. **定期检查日志**
   ```bash
   tail -100 /var/log/plant-dtp-update.log
   ```

---

## 📞 支持

遇到问题？
- 查看日志: `tail -f /var/log/plant-dtp-update.log`
- 手动测试: `/root/Plant-DTP/scripts/auto-update.sh --force`
- 检查构建: `cd /root/Plant-DTP/frontend && npm run build`

---

**更新频率建议**：
- 开发环境：每小时
- 测试环境：每天 2 次
- 生产环境：每天 1 次（凌晨）
