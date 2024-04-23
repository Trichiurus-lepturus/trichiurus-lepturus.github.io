---
title: 将Docker文件装进移动固态硬盘
date: 2024-04-22 19:39:29
tags:
  - Docker
---

*选固态硬盘是因为固态硬盘相对比较快，其实机械硬盘也可以的。后文中称“移动硬盘”*

## 操作系统
openSUSE Tumbleweed x86_84

## 原理
《软 链 接》  
没错，原理就是软链接。用软链接让本地硬盘中的文件夹指向移动硬盘中的文件夹即可。  
软链接相对于修改Docker的配置文件以及修改Docker的systemd服务配置文件来说更为优雅（其实就是个人选择），
如果需要在另一个安装了Docker的环境中使用移动硬盘里的文件，先备份本地数据再创建软链接即可。  
我自己换发行版的时候重装了系统，靠着软链接，所有配置好的Docker开发环境都很好地“迁移”到了新系统上。

## 目的
把Docker镜像和容器都放在移动硬盘中，节省本机的空间

## 前置条件
1. 安装Docker（Docker Engine）
```bash
sudo zypper ref
sudo zypper in docker
sudo zypper in docker-compose # if compose needed
```
安装后步骤：参考[官方文档](https://docs.docker.com/engine/install/linux-postinstall/)
```bash
# Manage Docker as a non-root user
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker # or re-login or reboot
docker run hello-world # verify
```
2. 在移动硬盘中创建一个分区并格式化
可使用YaST Partitioner或者KDE Partition Manager等工具，或可使用命令行。
使用命令行一定要小心，**Think before you type!**  
使用Linux常见的文件系统就可以了，我选择的是ext4

## 移动文件
默认安装的话，Docker的本地文件根目录为`/var/lib/docker`，
可以使用命令`docker info | grep -i Docker\ Root\ Dir`来进行查看。
如果不是默认路径，则**将下面的所有`/var/lib/docker`换成对应的路径即可**。
挂载移动硬盘并创建文件夹：
```bash
sudo systemctl stop docker
sudo systemctl stop containerd
lsblk # check the file name of the portable SSD
sudo mount /dev/<file_name> <mount_point>
cd <mount_point>
mkdir <parent_dir>
sudo rsync -raAXPh --remove-source-files /var/lib/docker <mount_point>/<parent_dir>
sudo ln -s <mount_point>/<parent_dir>/docker /var/lib/docker
```

## 启动服务
```bash
sudo systemctl disable docker # since it's necessary to start the services manually...
sudo systemctl disable containerd # when the portable SSD is inserted, so disable them first
sudo systemctl start docker
```
此时Docker应当能够正常使用了。  
之后每次启动后，都需要插入移动硬盘并挂载，然后`systemctl start docker`。

这显然是极为麻烦的，所以我写了一个脚本：
```bash
TARGET_UUID="<partition_uuid>" # change to your own uuid
MOUNT_POINT="<mount_point>" # change to your own mount point
if lsblk -no UUID | grep -q $TARGET_UUID; then
  echo "Target disk found"
  if [ ! -d $MOUNT_POINT ]; then
    echo "Mount point not found, creating"
    sudo mkdir -p $MOUNT_POINT
  fi
  if lsblk -no UUID,MOUNTPOINT | grep $TARGET_UUID | grep -q $MOUNT_POINT; then
    echo "Mounted"
  else
    echo "Disk not mounted, mounting"
    sudo mount --uuid $TARGET_UUID $MOUNT_POINT
  fi
  docker_status=$(systemctl is-active docker)
  if [ $docker_status != "active" ]; then
    if [ $docker_status = "inactive" ]; then
      echo "Service docker inactive, activating"
      sudo systemctl start docker
    else
      echo "Restarting service docker"
      sudo systemctl restart docker
    fi
  fi
else
  echo "Error: target disk not found!"
fi
systemctl status docker
```
不知道分区的UUID可以使用`lsblk -o NAME,UUID`进行查看

将脚本赋予执行权限。之后每次需要用Docker前，都先插入移动硬盘，然后运行这个脚本。

\*献给所有本机硬盘空间不太够的Docker重度用户
