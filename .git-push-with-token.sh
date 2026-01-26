#!/bin/bash

# 使用 GitHub Personal Access Token 推送代码
# 使用方法: ./git-push-with-token.sh <your_token>

if [ -z "$1" ]; then
    echo "用法: $0 <your_github_token>"
    echo ""
    echo "获取 Token:"
    echo "1. 访问: https://github.com/settings/tokens"
    echo "2. 点击 'Generate new token' -> 'Generate new token (classic)'"
    echo "3. 勾选 'repo' 权限"
    echo "4. 点击 'Generate token'"
    echo "5. 复制 token（只显示一次）"
    echo ""
    exit 1
fi

TOKEN=$1
REPO="https://${TOKEN}@github.com/ppw2004/Plant-DTP.git"

echo "推送到 GitHub..."
git push "$REPO" main

echo "完成！"
