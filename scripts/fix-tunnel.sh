#!/bin/bash
# SSH隧道修复和配置脚本
# 在服务器上运行此脚本

set -e

echo "==================================="
echo "SSH隧道修复脚本"
echo "==================================="

# 1. 检查SSH服务状态
echo "1️⃣ 检查SSH服务状态..."
systemctl status sshd | head -5

# 2. 备份SSH配置
echo ""
echo "2️⃣ 备份SSH配置..."
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ 配置已备份"

# 3. 检查并修复SSH配置
echo ""
echo "3️⃣ 检查SSH配置..."

# 检查是否有AllowUsers限制
if grep -q "^AllowUsers" /etc/ssh/sshd_config; then
    echo "⚠️  发现AllowUsers限制，建议注释掉"
    echo "当前配置:"
    grep "^AllowUsers" /etc/ssh/sshd_config
fi

# 检查MaxStartups
if grep -q "^MaxStartups" /etc/ssh/sshd_config; then
    echo "✅ MaxStartups已配置"
else
    echo "⚠️  建议添加MaxStartups配置"
fi

# 4. 显示SSH日志中的错误
echo ""
echo "4️⃣ 显示最近的SSH错误..."
tail -50 /var/log/auth.log | grep -i "error\|fail" | tail -10

# 5. 检查防火墙
echo ""
echo "5️⃣ 检查防火墙规则..."
if command -v ufw &> /dev/null; then
    ufw status | grep 22 || echo "未找到UFW规则"
fi

if command -v iptables &> /dev/null; then
    iptables -L INPUT -n | grep 22 || echo "未找到iptables规则"
fi

# 6. 检查监听端口
echo ""
echo "6️⃣ 检查SSH监听状态..."
netstat -tuln | grep :22 || echo "SSH未监听22端口"

# 7. 显示推荐的修复命令
echo ""
echo "==================================="
echo "推荐的修复步骤："
echo "==================================="
echo ""
echo "1. 编辑SSH配置："
echo "   nano /etc/ssh/sshd_config"
echo ""
echo "2. 确保以下配置："
echo "   Port 22"
echo "   PermitRootLogin yes"
echo "   PasswordAuthentication yes"
echo "   PubkeyAuthentication yes"
echo "   MaxStartups 100:30:200"
echo ""
echo "3. 移除或注释掉："
echo "   # AllowUsers ..."
echo "   # DenyUsers ..."
echo ""
echo "4. 重启SSH服务："
echo "   systemctl restart sshd"
echo ""
echo "5. 测试配置："
echo "   sshd -t"
echo ""
echo "6. 从本地测试连接："
echo "   ssh root@82.156.213.38"
echo ""

# 8. 提供一键修复选项
read -p "是否自动修复常见问题？(y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "正在自动修复..."

    # 备份
    cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

    # 添加MaxStartups如果不存在
    if ! grep -q "^MaxStartups" /etc/ssh/sshd_config; then
        echo "MaxStartups 100:30:200" >> /etc/ssh/sshd_config
        echo "✅ 已添加MaxStartups配置"
    fi

    # 确保PermitRootLogin
    if ! grep -q "^PermitRootLogin" /etc/ssh/sshd_config; then
        sed -i '/^#PermitRootLogin/s/^#//' /etc/ssh/sshd_config 2>/dev/null || echo "PermitRootLogin yes" >> /etc/ssh/sshd_config
        echo "✅ 已配置PermitRootLogin"
    fi

    # 测试配置
    if sshd -t; then
        echo "✅ SSH配置测试通过"
        systemctl restart sshd
        echo "✅ SSH服务已重启"
    else
        echo "❌ SSH配置测试失败，请手动检查"
        echo "恢复备份..."
        cp /etc/ssh/sshd_config.backup /etc/ssh/sshd_config
    fi
fi

echo ""
echo "==================================="
echo "修复完成！"
echo "==================================="
