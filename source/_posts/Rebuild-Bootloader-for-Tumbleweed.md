---
title: 简记为Linux重建grub启动引导的步骤
date: 2025-03-03 07:54:48
tags:
  - Bootstrap / 启动引导
  - Grub
  - UEFI
---

## 简介

本文记录了在系统文件完好，但因分区表改变导致丢失grub引导的情况下，重建引导的方法。

## 前提

确保目标系统采用UEFI模式进行引导，并且ESP（EFI系统分区）挂载于`/boot/efi`。此外，系统使用btrfs作为根文件系统，其根子卷标识符为`@`。

## 步骤

1. 启动进入Live系统环境，并以`root`用户进入终端会话；

2. 使用`lsblk`命令找到系统的根分区并挂载btrfs根子卷：
```bash
lsblk # find the system partition nvmeXnYpZ
mount -o subvol=@ /dev/nvmeXnYpZ /mnt
```

3. 挂载必要的系统环境组件：
```bash
mount -t proc /proc /mnt/proc
mount -t sysfs /sys /mnt/sys
mount --bind /dev /mnt/dev
mount --bind /dev/pts /mnt/dev/pts
mount -t efivarfs efivarfs /mnt/sys/firmware/efi/efivars
```

4. 使用`chroot`进入新挂载的系统环境：
```bash
chroot /mnt
```

5. 在chroot环境中，首先找到EFI系统分区（`ESP`），然后挂载它：
```bash
# inside chroot
lsblk # find the ESP partition nvmeXnYpZ
mount -t vfat /dev/nvmeXnYpZ /boot/efi
```

6. 将grub2安装到ESP，生成新的配置文件：
```bash
grub2-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=<bootloader_id>
# grub2 will be installed to /boot/efi/EFI/<bootloader_id>/grubx64.efi
grub2-mkconfig -o /boot/grub2/grub.cfg
```
其中需将&lt;bootloader_id&gt;替换为实际使用的引导加载程序ID，如`openSUSE` `Arch` `Fedora` `Debian`等。

7. （可选）由于grub2默认会将自己放在启动顺序的第一个，如需调整可以使用`efibootmgr`工具：
```bash
efibootmgr # list all entries
efibootmgr -o XXXX,YYYY,ZZZZ,...
```
其中XXXX,YYYY,ZZZZ为启动项的编号，优先级高者写在前，优先级低者写在后。

8. 重启计算机，并在启动菜单中选择启动项&lt;bootloader_id&gt;。如果重建引导成功，则应当可以正常登录进入系统。
