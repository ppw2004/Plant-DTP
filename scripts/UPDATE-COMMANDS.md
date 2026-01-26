# Plant-DTP 更新命令快速参考

## 🚀 常用命令

### 手动更新
```bash
# 智能更新（检查代码变更）
/root/Plant-DTP/scripts/auto-update.sh

# 强制更新（不检查，直接部署）
/root/Plant-DTP/scripts/auto-update.sh --force
```

### 查看日志
```bash
# 实时查看更新日志
tail -f /var/log/plant-dtp-update.log

# 查看最近更新记录
tail -50 /var/log/plant-dtp-update.log

# 搜索错误
grep ERROR /var/log/plant-dtp-update.log
```

### 定时任务管理
```bash
# 查看所有定时任务
crontab -l

# 编辑定时任务
crontab -e

# 删除更新定时任务
crontab -l | grep -v "auto-update.sh" | crontab -

# 重新配置定时任务
/root/Plant-DTP/scripts/setup-auto-update.sh
```

### 备份管理
```bash
# 查看可用备份
ls -lah /var/www/plant-dtp/backups/

# 恢复最新备份
cp -r /var/www/plant-dtp/backups/backup_$(ls -t /var/www/plant-dtp/backups/ | head -1)/* /var/www/plant-dtp/

# 清理所有备份
rm -rf /var/www/plant-dtp/backups/*
```

### 验证部署
```bash
# 快速验证
/root/Plant-DTP/scripts/quick-verify.sh

# 完整验证
/root/Plant-DTP/scripts/verify-deployment.sh

# 测试前端
curl -I http://82.156.213.38/

# 测试API
curl http://82.156.213.38/api/v1/rooms
```

## ⏰ 当前配置

- **更新频率**: 每天凌晨 2:00
- **日志位置**: /var/log/plant-dtp-update.log
- **备份位置**: /var/www/plant-dtp/backups/
- **备份保留**: 7天

## 🔄 更新流程

1. 检查代码更新 → 2. Git pull → 3. 安装依赖（如需要） → 4. 构建 → 5. 部署 → 6. 验证 → 7. 清理备份

## 🛠️ 故障排查

### 构建失败
```bash
cd /root/Plant-DTP/frontend
npm run build
# 查看错误信息
```

### 权限问题
```bash
sudo chown -R www-data:www-data /var/www/plant-dtp
sudo chmod -R 755 /var/www/plant-dtp
```

### Nginx 重启
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 📱 更新频率建议

| 环境 | 频率 | Cron 表达式 |
|------|------|-------------|
| 开发 | 每小时 | `0 * * * *` |
| 测试 | 每天2次 | `0 9,18 * * *` |
| 生产 | 每天1次 | `0 2 * * *` |
| 稳定 | 每周1次 | `0 3 * * 0` |

---

详细文档: /root/Plant-DTP/scripts/AUTO-UPDATE.md
