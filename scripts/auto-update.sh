#!/bin/bash

# ========================================
# Plant-DTP 自动更新部署脚本
# ========================================
# 用途：自动拉取最新代码并部署
# 使用：./auto-update.sh [选项]
# 选项：
#   --frontend    仅更新前端
#   --full        完整更新（前端+配置）
#   --force       强制更新（不检查代码变更）
# ========================================

set -e  # 遇到错误立即退出

# 配置
PROJECT_DIR="/root/Plant-DTP"
FRONTEND_DIR="$PROJECT_DIR/frontend"
DEPLOY_DIR="/var/www/plant-dtp"
BACKUP_DIR="/var/www/plant-dtp/backups"
LOG_FILE="/var/log/plant-dtp-update.log"
UPDATE_MODE=${1:---frontend}  # 默认只更新前端

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARN:${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO:${NC} $1" | tee -a "$LOG_FILE"
}

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# ========================================
# 1. 检查代码更新
# ========================================
check_updates() {
    log "=========================================="
    log "开始检查代码更新..."
    log "=========================================="

    cd "$PROJECT_DIR"

    # 获取当前分支
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    info "当前分支: $CURRENT_BRANCH"

    # 拉取最新代码
    log "拉取最新代码..."
    git fetch origin

    # 检查是否有更新
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/$CURRENT_BRANCH)

    if [ "$LOCAL" = "$REMOTE" ] && [ "$UPDATE_MODE" != "--force" ]; then
        info "代码已是最新版本，无需更新"
        return 1
    fi

    if [ "$LOCAL" != "$REMOTE" ]; then
        log "发现新版本，准备更新..."
        git log --oneline HEAD..origin/$CURRENT_BRANCH | head -5 | tee -a "$LOG_FILE"
    fi

    return 0
}

# ========================================
# 2. 拉取代码
# ========================================
pull_code() {
    log "=========================================="
    log "拉取最新代码..."
    log "=========================================="

    cd "$PROJECT_DIR"

    # 备份当前版本
    BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
    info "备份当前版本到: $BACKUP_DIR/$BACKUP_NAME"
    mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
    cp -r "$FRONTEND_DIR/dist" "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null || true

    # 拉取代码
    log "执行 git pull..."
    git pull origin $(git rev-parse --abbrev-ref HEAD) | tee -a "$LOG_FILE"

    log "代码拉取完成"
}

# ========================================
# 3. 更新前端
# ========================================
update_frontend() {
    log "=========================================="
    log "开始更新前端..."
    log "=========================================="

    cd "$FRONTEND_DIR"

    # 检查 package.json 是否有变化
    if git diff HEAD@{1} HEAD -- package.json | grep -q .; then
        log "package.json 有变化，重新安装依赖..."
        npm install | tee -a "$LOG_FILE"
    else
        info "package.json 无变化，跳过依赖安装"
    fi

    # 清理旧构建
    log "清理旧构建文件..."
    rm -rf dist/

    # 构建前端
    log "开始构建前端..."
    if npm run build 2>&1 | tee -a "$LOG_FILE"; then
        log "前端构建成功 ✅"
    else
        error "前端构建失败 ❌"
        # 恢复备份
        if [ -d "$BACKUP_DIR/$BACKUP_NAME/dist" ]; then
            warn "恢复备份..."
            cp -r "$BACKUP_DIR/$BACKUP_NAME/dist" "$FRONTEND_DIR/"
        fi
        exit 1
    fi

    # 验证构建文件
    if [ ! -f "$FRONTEND_DIR/dist/index.html" ]; then
        error "构建失败：index.html 不存在"
        exit 1
    fi

    log "前端文件准备完成"
}

# ========================================
# 4. 部署到生产环境
# ========================================
deploy_to_production() {
    log "=========================================="
    log "部署到生产环境..."
    log "=========================================="

    # 同步文件到部署目录
    log "同步文件到 $DEPLOY_DIR..."
    rsync -avz --delete \
        --exclude='.DS_Store' \
        --exclude='.git' \
        "$FRONTEND_DIR/dist/" \
        "$DEPLOY_DIR/" | tee -a "$LOG_FILE"

    # 设置权限
    log "设置文件权限..."
    chown -R www-data:www-data "$DEPLOY_DIR"
    chmod -R 755 "$DEPLOY_DIR"

    log "文件部署完成 ✅"
}

# ========================================
# 5. 验证部署
# ========================================
verify_deployment() {
    log "=========================================="
    log "验证部署..."
    log "=========================================="

    # 检查文件
    if [ ! -f "$DEPLOY_DIR/index.html" ]; then
        error "部署失败：index.html 不存在"
        exit 1
    fi

    # 测试前端访问
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 http://localhost/)
    if [ "$HTTP_CODE" != "200" ]; then
        error "前端访问失败 (HTTP $HTTP_CODE)"
        exit 1
    fi

    # 测试 API 代理
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 http://localhost/api/v1/rooms)
    if [ "$HTTP_CODE" != "200" ] && [ "$HTTP_CODE" != "404" ]; then
        warn "API 代理可能有问题 (HTTP $HTTP_CODE)"
    else
        log "API 代理正常 ✅"
    fi

    log "部署验证成功 ✅"
}

# ========================================
# 6. 清理旧备份
# ========================================
cleanup_old_backups() {
    log "清理超过 7 天的旧备份..."
    find "$BACKUP_DIR" -type d -name "backup_*" -mtime +7 -exec rm -rf {} \; 2>/dev/null || true
    log "备份清理完成"
}

# ========================================
# 主流程
# ========================================
main() {
    log "=========================================="
    log "Plant-DTP 自动更新开始"
    log "模式: $UPDATE_MODE"
    log "=========================================="

    # 检查更新
    if ! check_updates; then
        if [ "$UPDATE_MODE" != "--force" ]; then
            log "无需更新，退出"
            exit 0
        fi
    fi

    # 拉取代码
    pull_code

    # 更新前端
    if [ "$UPDATE_MODE" = "--frontend" ] || [ "$UPDATE_MODE" = "--full" ] || [ "$UPDATE_MODE" = "--force" ]; then
        update_frontend
        deploy_to_production
        verify_deployment
    fi

    # 清理旧备份
    cleanup_old_backups

    log "=========================================="
    log "✅ 自动更新完成！"
    log "=========================================="

    # 发送通知（可选）
    # echo "Plant-DTP 更新成功" | mail -s "部署通知" admin@example.com
}

# 执行主流程
main "$@"
