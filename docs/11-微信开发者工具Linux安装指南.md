# 微信开发者工具 Linux 安装指南

## 📋 目录

1. [安装方案对比](#一安装方案对比)
2. [方案一：Linux 移植版（推荐）](#二方案一linux-移植版推荐)
3. [方案二：Deepin Wine 方案](#三方案二deepin-wine-方案)
4. [方案三：Snap 包方案](#四方案三snap-包方案)
5. [方案四：Arch Linux AUR](#五方案四arch-linux-aur)
6. [使用教程](#六使用教程)
7. [常见问题](#七常见问题)
8. [性能优化](#八性能优化)

---

## 一、安装方案对比

### 方案对比表

| 方案 | 难度 | 兼容性 | 性能 | 推荐度 | 适用系统 |
|------|------|--------|------|--------|---------|
| **Linux 移植版** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 全部 |
| **Deepin Wine** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | Debian/Ubuntu |
| **Snap 包** | ⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 全部 |
| **AUR (Arch)** | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Arch/Manjaro |

### 推荐方案选择

```
Ubuntu/Debian 用户  →  使用 DEB 包（方案一）
Fedora/RHEL 用户   →  使用 RPM 包（方案一）
Arch Linux 用户    →  使用 AUR（方案四）
其他发行版         →  使用 AppImage（方案一）
Deepin/UOS 用户    →  使用应用商店或 DEB 包
```

---

## 二、方案一：Linux 移植版（推荐）

### 2.1 项目介绍

**GitHub 项目：** [msojocs/wechat-web-devtools-linux](https://github.com/msojocs/wechat-web-devtools-linux)

**特点：**
- ✅ 原生 Linux 支持
- ✅ 持续更新维护
- ✅ 完整功能支持
- ✅ 多架构支持（x86、ARM、龙芯）
- ✅ 多种安装格式（DEB、RPM、AppImage）

**系统要求：**
- Linux 64位系统
- 内存：至少 4GB
- 磁盘空间：至少 500MB
- 图形界面：GNOME、KDE、XFCE 等

---

### 2.2 Ubuntu/Debian 安装（DEB 包）

#### 步骤 1：下载安装包

访问 [Releases 页面](https://github.com/msojocs/wechat-web-devtools-linux/releases)

**或使用命令行下载：**

```bash
# 查看最新版本
curl -s https://api.github.com/repos/msojocs/wechat-web-devtools-linux/releases/latest | grep "tag_name"

# 下载最新 DEB 包（示例版本号，请替换为实际版本）
wget https://github.com/msojocs/wechat-web-devtools-linux/releases/download/v1.06.2312300-1.0/linux-wechat-devtools_1.06.2312300-1.0_amd64.deb

# ARM 架构（树莓派等）
wget https://github.com/msojocs/wechat-web-devtools-linux/releases/download/v1.06.2312300-1.0/linux-wechat-devtools_1.06.2312300-1.0_arm64.deb
```

#### 步骤 2：安装依赖

```bash
# 更新软件源
sudo apt update

# 安装依赖
sudo apt install -y \
    libgtk-3-0 \
    libnotify4 \
    libnss3 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    libatspi2.0-0 \
    libuuid1 \
    libappindicator3-1 \
    libsecret-1-0
```

#### 步骤 3：安装 DEB 包

```bash
# 安装
sudo dpkg -i linux-wechat-devtools_*.deb

# 修复依赖问题
sudo apt --fix-broken-install -y

# 再次安装
sudo dpkg -i linux-wechat-devtools_*.deb
```

#### 步骤 4：启动应用

```bash
# 命令行启动
wechat-devtools

# 或从应用程序菜单启动
# 开发 → wechat-devtools
```

---

### 2.3 Fedora/RHEL/CentOS 安装（RPM 包）

#### 步骤 1：下载 RPM 包

```bash
# 下载最新 RPM 包
wget https://github.com/msojocs/wechat-web-devtools-linux/releases/download/v1.06.2312300-1.0/linux-wechat-devtools-1.06.2312300-1.0.x86_64.rpm

# ARM 架构
wget https://github.com/msojocs/wechat-web-devtools-linux/releases/download/v1.06.2312300-1.0/linux-wechat-devtools-1.06.2312300-1.0.aarch64.rpm
```

#### 步骤 2：安装

```bash
# 安装 RPM 包
sudo dnf install -y linux-wechat-devtools-*.rpm

# 或使用 yum
sudo yum install -y linux-wechat-devtools-*.rpm

# 或使用 zypper (openSUSE)
sudo zypper install -y linux-wechat-devtools-*.rpm
```

#### 步骤 3：启动

```bash
# 命令行启动
wechat-devtools
```

---

### 2.4 通用安装（AppImage）

#### 步骤 1：下载 AppImage

```bash
# 下载 AppImage（无需安装，便携式）
wget https://github.com/msojocs/wechat-web-devtools-linux/releases/download/v1.06.2312300-1.0/wechat-devtools-x86_64.AppImage

# ARM 版本
wget https://github.com/msojocs/wechat-web-devtools-linux/releases/download/v1.06.2312300-1.0/wechat-devtools-aarch64.AppImage
```

#### 步骤 2：赋予执行权限

```bash
chmod +x wechat-devtools-*.AppImage
```

#### 步骤 3：运行

```bash
# 直接运行
./wechat-devtools-*.AppImage

# 或创建桌面快捷方式
sudo cp wechat-devtools-*.AppImage /opt/wechat-devtools.AppImage
```

#### 创建桌面快捷方式

```bash
# 创建桌面文件
cat > ~/.local/share/applications/wechat-devtools.desktop <<EOF
[Desktop Entry]
Name=WeChat DevTools
Comment=WeChat Developer Tools for Linux
Exec=/home/$(whoami)/wechat-devtools-x86_64.AppImage
Icon=wechat-devtools
Type=Application
Categories=Development;IDE;
EOF

# 更新桌面数据库
update-desktop-database ~/.local/share/applications/
```

---

### 2.5 验证安装

```bash
# 检查版本
wechat-devtools --version

# 查看帮助
wechat-devtools --help

# 检查安装路径
which wechat-devtools
```

---

## 三、方案二：Deepin Wine 方案

### 3.1 适用场景

- Deepin Linux 用户
- 需要 Windows 原版功能
- 其他方案失败时备选

### 3.2 安装 Deepin Wine

#### Ubuntu/Debian 系统

```bash
# 添加 Deepin Wine 源
sudo git clone https://github.com/zq1997/deepin-wine.git
cd deepin-wine

# 安装
sudo ./install.sh

# 或手动添加源
sudo add-apt-repository ppa:zhangsongcui3371/deepin-wine
sudo apt update
sudo apt install deepin-wine
```

#### 下载 Windows 版微信开发者工具

```bash
# 创建目录
mkdir -p ~/Downloads/wechat-devtools
cd ~/Downloads/wechat-devtools

# 下载 Windows 版本
wget https://dldir1.qq.com/WechatWebDev/1.06.2312060/32/wechat_devtools_1.06.2312060_32.exe

# 或从官网下载最新版本
# https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
```

#### 使用 Wine 安装

```bash
# 使用 Wine 运行安装程序
deepin-wine wechat_devtools_*.exe

# 按照安装向导完成安装
```

#### 启动应用

```bash
# 从桌面启动或命令行
deepin-wine ~/.deepinwine/Program\ Files/Tencent/webdevtools/wechatdevtools.exe
```

### 3.3 优缺点

**优点：**
- ✅ 原版 Windows 功能
- ✅ 完整兼容性

**缺点：**
- ❌ 性能较差
- ❌ 依赖 Wine 环境
- ❌ 可能存在兼容性问题
- ❌ 启动速度慢

---

## 四、方案三：Snap 包方案

### 4.1 安装 Snapd

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y snapd

# Fedora
sudo dnf install -y snapd
sudo ln -s /var/lib/snapd/snap /snap

# Arch Linux
sudo pacman -S snapd
sudo systemctl enable --now snapd.socket

# 其他发行版
# 参考：https://snapcraft.io/docs/installing-snapd
```

### 4.2 安装微信开发者工具

```bash
# 安装
sudo snap install wechat-devtools

# 查看信息
snap info wechat-devtools

# 启动
wechat-devtools
```

### 4.3 Snap 命令

```bash
# 更新
sudo snap refresh wechat-devtools

# 卸载
sudo snap remove wechat-devtools

# 查看日志
snap logs wechat-devtools
```

---

## 五、方案四：Arch Linux AUR

### 5.1 使用 yay（推荐）

```bash
# 安装 yay（如果没有）
sudo pacman -S --needed base-devel git
git clone https://aur.archlinux.org/yay.git
cd yay
makepkg -si

# 使用 yay 安装
yay -S wechat-devtools-git
```

### 5.2 使用 paru

```bash
# 安装 paru
sudo pacman -S --needed base-devel rust
cargo install paru

# 使用 paru 安装
paru -S wechat-devtools-git
```

### 5.3 手动安装（从 AUR）

```bash
# 克隆 AUR 仓库
git clone https://aur.archlinux.org/wechat-devtools-git.git
cd wechat-devtools-git

# 编译安装
makepkg -si

# 启动
wechat-devtools
```

### 5.4 Arch 相关命令

```bash
# 更新
yay -S wechat-devtools-git

# 卸载
yay -R wechat-devtools-git

# 查看依赖
pactree wechat-devtools-git
```

---

## 六、使用教程

### 6.1 首次启动

#### 1. 扫码登录

```
启动应用 → 微信扫码登录 → 选择项目类型
```

#### 2. 导入项目

```
方式一：新建项目
- 选择项目目录
- 填写 AppID（测试号可留空）
- 项目名称
- 开发模式

方式二：导入项目
- 选择项目目录
- 直接导入
```

### 6.2 配置开发环境

#### 设置项目路径

```bash
# Taro 项目编译后的 dist 目录
项目路径: /path/to/plant-dtp-miniprogram/dist

# 或创建符号链接
ln -s /path/to/plant-dtp-miniprogram/dist ~/plant-dtp-miniprogram
```

#### 关闭域名校验

```
微信开发者工具 → 详情 → 本地设置
☑ 不校验合法域名、web-view、TLS版本及HTTPS证书
```

#### 配置本地服务器

```bash
# 后端地址
http://localhost:3000/api

# 或使用内网穿透
https://abc123.natappfree.cc/api
```

### 6.3 开发工作流

```
┌─────────────────────────────────────┐
│  开发流程                            │
├─────────────────────────────────────┤
│ 1. VSCode 编写代码                   │
│    ↓ Ctrl+S 保存                     │
│ 2. Taro 自动编译到 dist/             │
│    ↓ 自动检测文件变化                │
│ 3. 微信开发者工具预览                │
│    ↓ 查看效果                        │
│ 4. 调试/修改                         │
│    ↓ 循环                            │
└─────────────────────────────────────┘
```

---

## 七、常见问题

### 7.1 安装问题

**Q1: DEB 包安装失败？**

```bash
# 解决依赖问题
sudo apt --fix-broken-install
sudo dpkg -i linux-wechat-devtools_*.deb

# 或使用 gdebi
sudo apt install gdebi
sudo gdebi linux-wechat-devtools_*.deb
```

**Q2: AppImage 无法运行？**

```bash
# 检查执行权限
ls -l wechat-devtools-*.AppImage

# 添加执行权限
chmod +x wechat-devtools-*.AppImage

# 如果仍无法运行，安装 FUSE
sudo apt install libfuse2

# 对于 Ubuntu 21.10+
sudo apt install libfuse3
```

**Q3: Snap 安装后找不到命令？**

```bash
# 确保 snapd 正常运行
sudo systemctl status snapd

# 重新登录或重启
# 或添加 snap 路径到 PATH
export PATH=$PATH:/snap/bin
```

**Q4: Arch Linux 编译失败？**

```bash
# 更新系统
sudo pacman -Syu

# 清理缓存
yay -Scc

# 重新安装
yay -S wechat-devtools-git
```

---

### 7.2 运行问题

**Q1: 启动闪退？**

```bash
# 查看日志
wechat-devtools --verbose

# 或查看系统日志
journalctl -xe | grep wechat

# 清除配置
rm -rf ~/.config/wechat-devtools
rm -rf ~/.local/share/wechat-devtools
```

**Q2: 无法扫码登录？**

```bash
# 检查网络连接
ping api.weixin.qq.com

# 检查防火墙
sudo ufw status

# 临时关闭防火墙测试
sudo ufw disable
```

**Q3: 模拟器显示异常？**

```bash
# 更新显卡驱动
# Ubuntu
sudo ubuntu-drivers autoinstall

# NVIDIA 驱动
sudo apt install nvidia-driver-535

# 重启
reboot
```

**Q4: 项目无法导入？**

```bash
# 检查目录权限
ls -la /path/to/project

# 修改权限
chmod -R 755 /path/to/project

# 检查项目配置
cat project.config.json
```

---

### 7.3 性能问题

**Q1: 应用启动慢？**

```bash
# 禁用自动更新
# 设置 → 通用 → 关闭自动检查更新

# 清理缓存
rm -rf ~/.cache/wechat-devtools
```

**Q2: 内存占用高？**

```bash
# 监控内存使用
htop

# 限制内存（可选）
# 编辑启动脚本
```

**Q3: CPU 占用高？**

```bash
# 检查进程
top -p $(pidof wechat-devtools)

# 关闭不必要的功能
# 设置 → 通用 → 关闭上传分析
```

---

## 八、性能优化

### 8.1 系统优化

#### 增加 Swap 空间

```bash
# 检查当前 swap
free -h

# 创建 swap 文件（4GB）
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 永久生效
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

#### 优化文件系统

```bash
# 使用 ext4 （如使用 btrfs/xfs 可能影响性能）
sudo tune2fs -o journal_data_writeback /dev/sdaX
```

### 8.2 应用优化

#### 关闭不必要的功能

```
设置 → 通用：
☐ 自动检查更新
☐ 上传使用统计
☐ 启用硬件加速（如卡顿）
☐ 启用多线程渲染（如卡顿）
```

#### 清理缓存

```bash
# 清理缓存目录
rm -rf ~/.cache/wechat-devtools/*
rm -rf ~/.config/wechat-devtools/Cache/*

# 清理日志
find ~/.local/share/wechat-devtools/logs/ -name "*.log" -delete
```

#### 调整内存限制

```bash
# 编辑启动参数
# /usr/share/applications/wechat-devtools.desktop
Exec=wechat-devtools --disable-gpu --max-old-space-size=4096
```

### 8.3 网络优化

#### 配置代理（如需要）

```bash
# 设置环境变量
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890

# 启动应用
wechat-devtools
```

#### 配置 hosts 加速

```bash
# 编辑 hosts
sudo nano /etc/hosts

# 添加
203.205.147.89 mp.weixin.qq.com
203.205.147.89 developers.weixin.qq.com
```

---

## 九、卸载

### 9.1 DEB 包卸载

```bash
# 卸载
sudo dpkg -r linux-wechat-devtools

# 或
sudo apt remove linux-wechat-devtools

# 清理配置
rm -rf ~/.config/wechat-devtools
rm -rf ~/.local/share/wechat-devtools
rm -rf ~/.cache/wechat-devtools
```

### 9.2 RPM 包卸载

```bash
# 卸载
sudo dnf remove linux-wechat-devtools

# 或
sudo yum remove linux-wechat-devtools

# 清理配置
rm -rf ~/.config/wechat-devtools
rm -rf ~/.local/share/wechat-devtools
```

### 9.3 AppImage 卸载

```bash
# 删除 AppImage 文件
rm -f ~/wechat-devtools-*.AppImage
rm -f /opt/wechat-devtools.AppImage

# 删除桌面快捷方式
rm -f ~/.local/share/applications/wechat-devtools.desktop

# 清理配置
rm -rf ~/.config/wechat-devtools
```

### 9.4 Snap 包卸载

```bash
# 卸载
sudo snap remove wechat-devtools

# 清理配置
rm -rf ~/snap/wechat-devtools
```

### 9.5 AUR 卸载（Arch）

```bash
# 卸载
yay -R wechat-devtools-git

# 清理配置
rm -rf ~/.config/wechat-devtools
rm -rf ~/.local/share/wechat-devtools

# 清理缓存
yay -Scc
```

---

## 十、总结

### 10.1 方案推荐

| 系统 | 推荐方案 | 安装命令 |
|------|---------|---------|
| **Ubuntu/Debian** | DEB 包 | `sudo dpkg -i linux-wechat-devtools_*.deb` |
| **Fedora/RHEL** | RPM 包 | `sudo dnf install linux-wechat-devtools-*.rpm` |
| **Arch Linux** | AUR | `yay -S wechat-devtools-git` |
| **其他发行版** | AppImage | `chmod +x wechat-devtools-*.AppImage && ./wechat-devtools-*.AppImage` |

### 10.2 快速安装命令

```bash
# Ubuntu/Debian - 一键安装
wget https://github.com/msojocs/wechat-web-devtools-linux/releases/download/v1.06.2312300-1.0/linux-wechat-devtools_1.06.2312300-1.0_amd64.deb
sudo apt install -y ./linux-wechat-devtools_*.deb

# Arch Linux - 一键安装
yay -S wechat-devtools-git

# 通用 - AppImage
wget https://github.com/msojocs/wechat-web-devtools-linux/releases/download/v1.06.2312300-1.0/wechat-devtools-x86_64.AppImage
chmod +x wechat-devtools-*.AppImage
./wechat-devtools-*.AppImage
```

### 10.3 关键要点

1. **优先使用官方移植版**（方案一）
   - 性能最好
   - 兼容性最佳
   - 持续更新

2. **Arch Linux 用户使用 AUR**
   - 安装最简单
   - 自动更新
   - 社区支持好

3. **备用方案**
   - Snap 包（跨发行版）
   - AppImage（便携式）
   - Deepin Wine（最后选择）

4. **完全免费**
   - 所有方案都是免费的
   - 无需购买许可证

---

## 十一、参考资源

### 官方资源

- [GitHub 项目主页](https://github.com/msojocs/wechat-web-devtools-linux)
- [Releases 下载页](https://github.com/msojocs/wechat-web-devtools-linux/releases)
- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

### 安装教程

- [微信开发者工具 Linux 版安装与使用指南](https://blog.csdn.net/gitblog_01193/article/details/141047288)
- [Ubuntu安装微信开发者工具Deepin-wine平台](https://www.cnblogs.com/jiqing9006/p/14490088.html)
- [深度linux系统安装微信开发工具](https://blog.csdn.net/weixin_42508313/article/details/116790866)

### 社区资源

- [Deepin Wine GitHub](https://github.com/zq1997/deepin-wine)
- [AUR 包页面](https://aur.archlinux.org/packages/wechat-devtools-git)
- [Snap 包页面](https://snapcraft.io/wechat-devtools)

---

**文档版本：** v1.0
**更新日期：** 2025-01-25
**维护者：** Plant-DTP Team

**Sources:**
- [wechat-web-devtools-linux GitHub Project](https://github.com/msojocs/wechat-web-devtools-linux)
- [微信开发者工具Linux版安装与使用指南](https://blog.csdn.net/gitblog_01193/article/details/141047288)
- [Ubuntu安装微信开发者工具Deepin-wine平台](https://www.cnblogs.com/jiqing9006/p/14490088.html)
- [深度linux系统安装微信开发工具](https://blog.csdn.net/weixin_42508313/article/details/116790866)
- [Deepin Wine 项目](https://github.com/zq1997/deepin-wine)
