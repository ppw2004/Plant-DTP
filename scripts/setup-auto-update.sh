#!/bin/bash

# ========================================
# Plant-DTP 自动更新配置脚本
# ========================================
# 用途：设置定时任务，定期自动更新部署
# ========================================

UPDATE_SCRIPT="/root/Plant-DTP/scripts/auto-update.sh"
LOG_FILE="/var/log/plant-dtp-update.log"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================="
echo "Plant-DTP 自动更新配置向导"
echo "=========================================="
echo ""

# 创建日志文件
sudo touch "$LOG_FILE"
sudo chmod 666 "$LOG_FILE"

echo "请选择更新频率："
echo "1) 每小时更新一次"
echo "2) 每天凌晨 2 点更新"
echo "3) 每天上午 9 点和下午 6 点更新"
echo "4) 每周日凌晨 3 点更新"
echo "5) 自定义"
echo ""
read -p "请输入选项 (1-5): " choice

case $choice in
    1)
        CRON_EXPR="0 * * * *"
        DESC="每小时"
        ;;
    2)
        CRON_EXPR="0 2 * * *"
        DESC="每天凌晨2点"
        ;;
    3)
        CRON_EXPR="0 9,18 * * *"
        DESC="每天9点和18点"
        ;;
    4)
        CRON_EXPR="0 3 * * 0"
        DESC="每周日凌晨3点"
        ;;
    5)
        echo ""
        echo "请输入 cron 表达式 (格式: 分 时 日 月 周)"
        echo "示例: 0 2 * * * (每天凌晨2点)"
        read -p "Cron表达式: " CRON_EXPR
        DESC="自定义"
        ;;
    *)
        echo "无效选项"
        exit 1
        ;;
esac

echo ""
echo -e "${YELLOW}配置信息:${NC}"
echo "更新频率: $DESC"
echo "Cron表达式: $CRON_EXPR"
echo "脚本路径: $UPDATE_SCRIPT"
echo ""

# 确认
read -p "确认添加定时任务? (y/n): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "已取消"
    exit 0
fi

# 添加 cron 任务
echo ""
echo "添加定时任务..."

# 先删除旧的定时任务
(crontab -l 2>/dev/null | grep -v "$UPDATE_SCRIPT") | crontab -

# 添加新的定时任务
(crontab -l 2>/dev/null; echo "$CRON_EXPR $UPDATE_SCRIPT --frontend >> $LOG_FILE 2>&1") | crontab -

echo -e "${GREEN}✅ 定时任务添加成功！${NC}"
echo ""
echo "=========================================="
echo "当前定时任务列表:"
echo "=========================================="
crontab -l | grep -v "^#" | grep -v "^$"
echo ""
echo "=========================================="
echo "查看日志: tail -f $LOG_FILE"
echo "=========================================="
echo ""
echo "手动测试更新: $UPDATE_SCRIPT --force"
echo ""
