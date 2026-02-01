---
title: 纯国产计算机 Debian 12 安装与配置指南
subtitle: 每个步骤都写出来的超详细操作手册
date: 2026-01-27 16:40:21
tags:
  - Debian
  - Bootstrap / 启动引导
  - Firewall / 防火墙
  - Grub
  - KDE
  - KDE Plasma
  - UEFI
  - Hygon / 海光
  - Glenfly / 格兰菲
  - Motorcomm / 裕太
---

本指南旨在为搭载**海光**（Hygon）处理器、**格兰菲**（Glenfly）显卡及**裕太**（Motorcomm）网卡的纯国产计算机，提供一套从底层驱动到桌面环境的“手把手”式全流程安装与配置方案。

完成后，您将得到一套显示正常、网络可用、接近于 Windows 习惯的 Debian 12 KDE Plasma (X11) 桌面系统。本文特意选择了成熟的 X11 图形渲染后端，以期在最大程度上解决软硬件不兼容带来的黑屏、闪烁等问题。

为了追求部署成功率及系统稳定性，本方案在一定程度上牺牲了开放度。如果您有系统定制意愿及相应技术水平，自然可以不完全遵守指南中的操作；不过有关**引导修复**与**驱动安装**的部分，很有可能对您有所帮助。

## 00 硬件信息

CPU: Hygon C86-3G 8C16T amd64  
GPU: Glenfly Arise1020  
RAM: Zentel DDR4 3200MHz 16GiB  
网卡: Motorcomm YT6801 Gigabit  
声卡: Glenfly Arise1020 （集成于显卡）  
存储: Longsys Lexar NM610 PRO 512GiB  

BIOS: ByoCore V2.0 W0JKT1BA

**本指南针对上述特定硬件组合，写于 2026 年 1 月 26 日，请注意硬件差异及时效性**

## 01 下载映像文件

<https://get.debian.org/images/archive/>

找到 12.x 中最新的（不带 live） → amd64 → iso-dvd → 下载 .iso 文件

SHAxxxSUMS\[.sign\] 是校验和及签名，注重安全性可进行验证

## 02 烧录映像至安装 U 盘

准备一个**空** U 盘，至少 8GiB，用于烧录映像

本环节将使目标 U 盘原有数据全部清除，请预先备份所有数据

**Windows**

下载 [Rufus](https://rufus.ie/zh/#download)，选择适用于 x64 的标准版

设备选择目标 U 盘，引导类型选择刚刚下载好的 Debian 12 映像，分区类型选择 GPT，目标系统类型选择 UEFI，其他选项保持默认即可

再次核对“设备”是否确实选中了目标 U 盘，如果没有问题则点击开始；期间如果弹出与“ISOHybrid”有关的对话框，建议选择“以 DD 镜像模式写入”，以获得最佳兼容性

**Linux**

```bash
# 首先查看 U 盘设备名
lsblk
# 如果 U 盘已挂载，现在卸载
sudo umount 【代表目标 U 盘的块设备文件】
# 用 dd 命令烧录启动盘，特别警告：执行命令前，务必仔细确认 of= 参数指向目标 U 盘设备！
sudo dd if=【.iso 映像文件】 of=【目标 U 盘】 bs=4M status=progress conv=fsync && sync
```
请耐心等待命令提示符返回，确保所有数据都已写入

## 03 重启，从 U 盘引导

重启计算机，待出现厂商 Logo 时，快速而连续地点按 `F12` 键直到进入启动菜单，选择 USB HDD，选择“Graphical install”（图形化安装）

## 04 选择语言和键盘布局

Select a language: 选择 Chinese (Simplified) → Continue

请选择您的位置：选择“中国” → 继续

配置键盘：选择“美式英语”（列表第一个）→ 继续

## 05 配置网络

探测网络硬件：因为 Linux 内核默认不包含 YT6801 的驱动，所以选择“无以太网卡” → 继续

未探测到网络接口：点击继续

主机名：输入主机名，建议仅使用小写英文字母、数字和横杠（“-”），作为本机在网络中的名称 → 继续

## 06 设置用户和密码

Root 密码：输入两次完全相同的 root 密码，将 root 密码清晰地记在纸上 → 继续

新用户的全名：输入用于**显示**的普通用户名 → 继续

账户的用户名：输入用于**登录**的普通用户名 → 继续

普通用户密码：输入两次完全相同的普通用户密码，将用于登录的普通用户名及密码清晰地记在纸上 → 继续

## 07 手动分区

分区方法：选择“手动” → 继续

将目标盘上的分区设置修改为：

1 容量：512MiB  
用于：EFI 系统分区  
可启动标志：开

2 容量：120GiB（根据需求调整，建议至少 60 GiB）  
用于：Ext4 日志文件系统  
挂载点：/  
挂载选项：defaults  
标签：ROOT  
保留块：5%  
典型用途：标准  
可启动标志：关

3 容量：max（剩余所有空间）  
用于：Ext4 日志文件系统  
挂载点：/home  
挂载选项：defaults  
标签：HOME  
保留块：1%  
典型用途：标准  
可启动标志：关

如果要删除分区：选中该分区 → 继续 → 删除此分区 → 继续

如果要新建分区：选中空闲空间 → 继续 → 创建新分区 → 继续 → 输入分区容量 → 继续 → 主分区 → 继续 → *开始/结束（取决于欲创建分区的位置） → 继续* → 选中欲修改的分区设置 → 继续 → 修改该分区设置 → 继续 → 修改分区其他设置/分区设定结束 → 继续

完成后再次仔细核对，如果分区设置全部正确，选择“完成分区操作并将修改写入磁盘” → 继续

对于 16GiB 内存，不创建交换分区（Swap）通常可行，所以：  
尚未选择任何分区用作交换空间，是否想返回分区菜单：**否** → 继续

将改动写入磁盘吗：是 → 继续

## 08 安装软件

等待基本系统安装完成

配置软件包管理器，使用网络镜像站点吗：否 → 继续

参加软件包流行度调查吗：否 → 继续

软件选择：**仅**勾选 “Debian 桌面环境”“KDE Plasma”“标准系统工具” → 继续

耐心等待软件安装完成，期间如果熄屏，可以移动一下鼠标

系统时钟是否为 UTC：是 → 继续

## 09 解决 BIOS 无法识别 grub 引导文件的问题

本机使用的 ByoCore BIOS 无法识别 `/EFI/debian/grubx64.efi`，故须将其拷贝至标准路径

此环节涉及修改引导文件，请严格按照步骤执行

请选择 \<继续\> 以重新启动：**不要选择“继续”**，而是选择**“返回”**

选择“运行 shell” → 继续

读完提示信息 → 继续

常用 shell 快捷键：  
`Tab`：自动补全  
`Alt+B`：光标往回一个词  
`Alt+F`：光标往前一个词  
`Ctrl+A`：跳转到行首  
`Ctrl+E`：跳转到行末  
`Ctrl+U`：删除到行首  
`Ctrl+K`：删除到行末  
`Alt+Backspace`：往回删除一个词  
`↑` / `↓`：翻找历史记录  
`Ctrl+R`：往回搜索历史  
`Ctrl+C`：中断（SIGTERM）  
`Ctrl+D`：Delete 或 退出

进入目标系统：
```bash
mount --bind /dev /target/dev
mount --bind /proc /target/proc
mount --bind /sys /target/sys
# 可选：
# mount --bind /run /target/run
# mount -t tmpfs tmpfs /target/tmp
# mount --bind /sys/firmware/efi/efivars /target/sys/firmware/efi/efivars
chroot /target /bin/bash
```

拷贝 EFI 引导文件到标准路径：
```bash
grub-install --target=x86_64-efi --removable
update-grub
ls -lah /boot/efi/EFI/BOOT/BOOTX64.EFI # 确认标准路径引导文件存在
```

`Ctrl+D` `Ctrl+D` 退出

系统时钟是否为 UTC：是 → 继续

请选择 \<继续\> 以重新启动：继续

## 10 令普通用户获取 sudo 权限

进入 GNU GRUB，选择“Debian GNU/Linux”，等待几秒自动选择或按回车键选择启动

等待片刻，直到见到 `[  OK  ] Started sddm.service`...，代表系统启动完成，由于目前尚未安装显卡驱动，系统卡在字符界面属于正常现象

按 `Ctrl+Alt+F2` 离开 tty1 进入 tty2，输入 `root` 回车，输入 `【root 密码】` 回车，输入密码时不会显示任何形如“\*\*\*”的内容，正确输入后回车即可

查看或编辑 sudo 配置文件：
```bash
EDITOR=nano visudo
```
可见：
```plain
# Allow members of group sudo to execute any command
%sudo ALL=(ALL:ALL) ALL
```
意为“在 sudo 用户组内的用户具有 sudo 权限”

如果希望同一用户输入密码使用过 sudo 后一段时间内在所有 shell 会话中均无需再次输入密码，在 `sudoers` 文件 `Defaults env_reset` 后另起两行，写入
```plain
Defaults timestamp_type=global
Defaults timestamp_timeout=【无需再次输入密码的时间间隔（分钟）】
```
仔细检查拼写、语法是否正确，`Ctrl+O` 保存，`Ctrl+X` 退出

默认情况下，普通用户并不在 sudo 用户组内，若要令其获取 sudo 权限，可将其加入此用户组：
```bash
usermod -aG sudo 【账户】
```
加入用户组之后，重新登录该账户以使之生效

`Ctrl+D` 注销（登出 root 用户）

## 11 首次进入桌面环境及习惯优化

以普通用户身份登录，输入【账户】回车，输入【密码】回车，运行 `startx` 进入桌面环境

启用云拼音：根据需要选择即可

将 Dolphin 文件管理器的 选中/打开 行为改成和 Windows 一样：  
系统设置 → 工作区 → 工作区行为 → 常规行为 → 单击文件、文件夹时 → 选中 → 应用

设置 `Ctrl+Alt+T` 为终端快捷键：  
系统设置 → 工作区 → 快捷键 → 快捷键 → 添加应用程序 → Konsole 命令行终端 → 确定 → 观察到右侧窗格出现“Konsole 命令行终端：Ctrl+Alt+T”

## 12 添加并激活 apt 镜像软件源

使用 USB 数据线连接电脑和手机，在手机上开启 USB 网络共享

打开浏览器，访问[中科大 Debian 镜像源使用帮助](https://mirrors.ustc.edu.cn/help/debian.html)，下翻至“参考配置内容”，选择“Debian 12”，选择 “`sources.list` 格式”，点击文本框右上角复制，页面右下角出现“已复制”即成功复制

`Ctrl+Alt+T` 打开终端，使用 `nano` 编辑 `apt` 软件源列表：
```bash
sudo nano /etc/apt/sources.list
```

Konsole 常用快捷键：  
`Ctrl+Shift+C`：复制选区内容  
`Ctrl+Shift+V`：粘贴至光标处

在 `deb cdrom`...行前添加“#”注释符，禁用系统安装时用过的源；另起一行，`Ctrl+Shift+V` 在终端粘贴刚刚复制的内容，`Ctrl+O` 保存，`Ctrl+X` 退出

更新软件包索引：
```bash
sudo apt update
```

常用 `apt` 子命令：
`update`：更新可用软件包索引  
`search`：搜索软件包描述  
`show`：显示软件包细节  
`install`：安装软件包  
`reinstall`：重装软件包  
`remove`：移除软件包  
`upgrade`：通过安装或升级软件包来更新系统  
`autoremove`：**有风险自动删除系统关键组件，必须谨慎使用**  
`moo`：本 APT 具有超级牛力

## 13 下载安装显卡及网卡 non-free 驱动

本计算机的硬件中，除了显卡及网卡，其余关键设备均有对应的 Linux 内核自带驱动

提示 `unar` 未找到命令：`sudo apt install unar`

### 格兰菲 Arise1020 显卡驱动

访问[格兰菲智能科技股份有限公司官网](https://www.glenfly.com/)，在上方导航栏找到“产品中心” → 图形图像产品驱动下载 → 产品型号“Arise1020” → 操作系统“方德”或“KOS”或“UOS” → 架构“X86” → 立即下载

下载完成后在文件夹中显示，`Alt+Shift+F4` 在此位置打开终端：
```bash
# 解压归档文件
unar ./【版本号】-x64.zip
# 进入对应目录
cd x64
# 安装驱动软件，依赖项将由 apt 自动处理
sudo apt install ./gf-arise-linux-graphics-driver-glvnd-dri_【版本号】_amd64.deb
```
出现“install arise... finished”说明安装成功

### 裕太 YT6801 网卡驱动

访问[裕太微电子股份有限公司官网](https://www.motor-comm.com/)，在上方导航栏找到“下载中心” → 网卡芯片 → YT6801x → Driver → Linux Driver → 下载

下载完成后在文件夹中显示，`Alt+Shift+F4` 在此位置打开终端：
```bash
# 安装依赖项，不过在上一步安装显卡驱动时，依赖项很有可能已经由 apt 自动处理好了
# sudo apt install dkms build-essential linux-headers-$(uname -r)
# 解压归档文件
unar ./yt6801-linux-driver-【版本号】.zip
# 进入对应目录
cd yt6801-linux-driver-【版本号】
# yt_nic_install.sh 写得有问题，一没有用 sudo 权限安装，二没有做持久化配置
# 故改用更优的 DKMS 方式安装，首先须解压源码并置于 DKMS 要求的标准路径下
unar ./yt6801-【版本号】.tar.gz
sudo cp -r ./yt6801-【版本号】 /usr/src/
# 添加到 DKMS 管理列表
# 提示 Deprecated feature: REMAKE_INITRD 是由于 Debian 12 的 dkms 版本较新，
# 默认包含了自动重新生成 `initramfs` 功能，此警告对驱动安装无影响
sudo dkms add -m yt6801 -v 【版本号】
# 构建驱动
sudo dkms build -m yt6801 -v 【版本号】
# 安装驱动
sudo dkms install -m yt6801 -v 【版本号】
# 验证状态
sudo dkms status | grep yt6801
# sudo dkms status 命令输出中应当还有之前安装的显卡驱动“arise”
```
出现“yt6801...: installed”说明安装成功

执行 `sudo reboot` 重启激活驱动，应当能够成功进入 SDDM 登录界面，并且能够自动连接有线网络

由于 Debian 12 下，X11 比 Wayland 稳定，建议登录之前在界面左下角“桌面会话”选择“Plasma (X11)”

## 14 可选配置

### 防火墙

Debian 默认不附带除了`iptables`以外的防火墙管理工具。[UFW](https://help.ubuntu.com/community/UFW) 操作简单，防护有效，建议选择安装：
```bash
sudo apt install ufw
# 禁止所有入站请求
sudo ufw default deny incoming
# 允许所有出站请求
sudo ufw default allow outgoing
# 激活防火墙
sudo ufw enable
# 查看当前状态
sudo ufw status verbose
```
当需要允许某些外部网络连接时，请务必记得开放对应端口

如果希望直接使用 iptables，建议安装 [iptables-persistent](https://sources.debian.org/src/iptables-persistent/) 以实现规则持久化：
```bash
sudo apt install iptables-persistent
# 每次修改 iptables 规则后，都需要运行以下命令来将规则同步到配置文件中
sudo netfilter-persistent save
```

UFW 和 iptables-persistent 选其一即可。`firewalld`也是可行选项之一，在此不再赘述

### 其他可选配置

取消自动睡眠功能：  
系统设置 → 硬件 → 电源管理 → 节能 → 挂起会话 → 取消勾选 → 应用

卸载 Discover 软件管理中心：
```bash
sudo apt remove --purge *discover*
```

隐藏 SDDM 的 Wayland 会话选项：
```bash
echo "NoDisplay=true" | sudo tee -a /usr/share/wayland-sessions/plasmawayland.desktop
```

交换 Ctrl 和 Caps Lock（大写锁定）：  
系统设置 → 硬件 → 输入设备 → 键盘 → 高级 → 配置键盘选项 → Ctrl 的位置 → 交换 Ctrl 和 Caps Lock → 应用

Flatpak（[中科大 Flathub 缓存使用帮助](https://mirrors.ustc.edu.cn/help/flathub.html)）：
```bash
sudo apt install flatpak
sudo flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
sudo flatpak remote-modify flathub --url=https://mirrors.ustc.edu.cn/flathub
flatpak remotes --show-details
```

## 15 常用自由软件

**多媒体**

[FFmpeg](https://ffmpeg.org/)（[src](https://git.ffmpeg.org/ffmpeg-web)）：多媒体处理核心工具  
`sudo apt install ffmpeg`

[mpv](https://mpv.io/)（[src](https://github.com/mpv-player/mpv)）：极简高性能视频播放器  
`sudo apt install mpv`

[Strawberry](https://www.strawberrymusicplayer.org/)（[src](https://github.com/strawberrymusicplayer/strawberry)）：高保真音乐播放+音乐库管理器  
`sudo apt install strawberry`

[OBS Studio](https://obsproject.com/)（[src](https://github.com/obsproject/obs-studio)）：流行的专业直播与录屏软件  
`sudo apt install obs-studio`

**网络与下载**

[Chromium](https://www.chromium.org/)（[src](https://chromium.googlesource.com/chromium/src/)）：Chrome 的开源原型  
`sudo apt install chromium`

[aria2](https://aria2.github.io/)（[src](https://github.com/aria2/aria2)）：轻量多协议多连接下载器  
`sudo apt install aria2`

[Motrix](https://motrix.app/)（[src](https://github.com/agalwood/Motrix)）：基于 aria2 的图形化下载工具  
下载`.deb`包安装：<https://motrix.app/download>

[qBittorrent](https://www.qbittorrent.org/)（[src](https://github.com/qbittorrent/qBittorrent)）：不“吸血”的 BitTorrent 客户端，支持远程控制  
`sudo apt install qbittorrent`

[FileZilla](https://filezilla-project.org/)（[src](https://svn.filezilla-project.org/filezilla/FileZilla3/)）：图形化 FTP/SFTP 客户端，支持多种编码  
`sudo apt install filezilla`

**图表与生产力**

[draw.io](https://www.drawio.com/)（[src](https://github.com/jgraph/drawio)）：强大的图表绘制工具  
桌面版：<https://get.diagrams.net/>  
网页版：<https://app.diagrams.net/>  

[GIMP](https://www.gimp.org/)（[src](https://gitlab.gnome.org/GNOME/gimp)）：全能图像处理与创作软件  
`sudo apt install gimp`

[Krita](https://krita.org/zh-cn/)（[src](https://invent.kde.org/graphics/krita)）：专业数字绘画软件，功能相当齐全  
`sudo apt install krita krita-l10n`

[Audacity](https://www.audacityteam.org/)（[src](https://github.com/audacity/audacity)）：易用的音频处理工具  
`sudo apt install audacity`

[Kdenlive](https://kdenlive.org/)（[src](https://invent.kde.org/multimedia/kdenlive)）：非线性视频剪辑软件  
`sudo apt install kdenlive`

**开发**

[VSCodium](https://vscodium.com/)（[src](https://github.com/VSCodium/vscodium)）：真正的自由软件，免遥测，不受 M$ 的任何限制  
下载`.deb`包安装：<https://github.com/VSCodium/vscodium/releases>  
或者利用 Flatpak：`flatpak install flathub com.vscodium.codium`

**系统清理**

[BleachBit](https://www.bleachbit.org/)（[src](https://github.com/bleachbit/bleachbit)）：深度清理残留文件，释放磁盘空间  
`sudo apt install bleachbit`
