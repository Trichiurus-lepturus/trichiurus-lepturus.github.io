---
title: 从TTY到KDE Plasma——联网、换源、安装与启动
subtitle: 以openSUSE Leap为例
date: 2024-04-19 00:43:23
tags:
  - KDE Plasma
  - openSUSE
  - TTY
---

## 声明
*笔者的机器没有NVIDIA显卡，所以将不包含任何有关显卡驱动安装的操作*  
openSUSE自带的显卡驱动于笔者已经足够好用

## 操作系统
openSUSE Leap 15.5, 安装时System Role选择**Server**

## 联网（以无线网络为例）
使用nmcli连接到wifi网络：
```bash
systemctl status NetworkManager # check if NetworkManager is active
nmcli radio wifi on
nmcli device wifi
nmcli device wifi connect <SSID or BSSID> [password <password>]
nmcli connection show # show the connections
```

<!-- more -->

使用nmcli改用国内114DNS：
```bash
sudo nmcli connection modify <connection> ipv4.dns "114.114.114.114,114.114.115.115"
sudo nmcli connection up <connection> # reconnect to take effect
sudo systemctl restart NetworkManager # restart service if necessary
```

确认网络连接情况，能够联网能够解析域名
```bash
ping www.baidu.com
```

## 换用国内镜像源
使用清华大学tuna软件源
```bash
sudo zypper mr -da # disable official repos
echo $releasever # should be 15.5
sudo zypper ar -cfg https://mirrors.tuna.tsinghua.edu.cn/opensuse/distribution/leap/$releasever/repo/oss/ mirror-oss
sudo zypper ar -cfg https://mirrors.tuna.tsinghua.edu.cn/opensuse/distribution/leap/$releasever/repo/non-oss/ mirror-non-oss
sudo zypper ar -cfg https://mirrors.tuna.tsinghua.edu.cn/opensuse/update/leap/$releasever/oss/ mirror-update
sudo zypper ar -cfg https://mirrors.tuna.tsinghua.edu.cn/opensuse/update/leap/$releasever/non-oss/ mirror-update-non-oss
sudo zypper ar -cfg https://mirrors.tuna.tsinghua.edu.cn/opensuse/update/leap/$releasever/sle/ mirror-sle-update
sudo zypper ar -cfg https://mirrors.tuna.tsinghua.edu.cn/opensuse/update/leap/$releasever/backports/ mirror-backports-update
sudo zypper ar -cfgp 90 https://mirrors.tuna.tsinghua.edu.cn/packman/suse/openSUSE_Leap_$releasever/ mirror-packman
```

## 安装KDE Plasma
更新软件仓库及软件包
```bash
sudo zypper --gpg-auto-import-keys ref
sudo zypper up
```

安装KDE Plasma桌面环境软件包
```bash
sudo zypper in -t pattern kde kde_plasma # this takes a while
```

## 设置自启
将显示服务器设置为sddm；设置启动自动进入KDE Plasma
```bash
sudo update-alternatives --config default-displaymanager
# if sddm has the highest priority, just choose the auto mode;
# otherwise choose sddm manually.
sudo systemctl enable sddm
sudo systemctl set-default graphical.target 
sudo reboot
```

*至此完成安装。*

## 补充：应对PackageKit卡住zypper的问题
\*KDE Plasma桌面应用中有一个东西叫做PackageKit，经常自己检查更新，此时运行zypper会提示被PackageKit屏蔽。
笔者的选择是移除PackageKit并不让它再被安装上笔者的操作系统：
```bash
sudo zypper rm PackageKit
sudo zypper al PackageKit
```
