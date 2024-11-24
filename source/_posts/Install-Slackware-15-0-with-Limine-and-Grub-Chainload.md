---
title: 安装Slackware 15.0，使用btrfs文件系统，使用Limine和Grub建立多系统引导
date: 2024-11-22 15:16:17
tags:
  - Slackware
  - Limine Bootloader
  - Grub
  - UEFI
  - KDE
  - KDE Plasma
  - btrfs

---

这是一个现存最古老的、几乎由一人维护的、“最类似UNIX”的、简单稳定的、“万年不变”的Linux发行版。  
[Slackware](http://www.slackware.com/)只是不为大众所知，
如果看看[ChangeLog](http://www.slackware.com/changelog/)就能发现Slackware还在活跃更新。  
本文将介绍在硬盘中已有其他操作系统且使用UEFI引导的情况下，
笔者[安装Slackware](https://docs.slackware.com/slackware:install)的过程，以供参考。

<!-- more -->

## 事先的工作
以下是笔者在安装Slackware之前已经完成的工作，如果需要和笔者一样的配置可以选择执行，否则有些步骤将缺乏前提条件从而无法完成。
- 划分出了一片连续的空闲分区
- 已将硬件时钟设置为UTC/GMT
- 启用了Limine Bootloader

## 下载镜像、校验文件、写入U盘
最新稳定版[镜像](https://mirrors.slackware.com/slackware/slackware-iso/)可以在`mirrors.slackware.com`获取。  
下载对应CPU架构的镜像，带64的是x86_64的，不带64的是x86(32bit)的。
另外[arm32、aarch64](https://arm.slackware.com/releases/)
甚至[loongarch64](https://github.com/slackwarecn/slackware-loongarch64/releases)的镜像也可以在网上找到。  
本文以x86_64为例，下载安装最新的RELEASE（15.0）。

下载后校验文件完整性与签名，而后写入U盘：
```bash
wget https://mirrors.slackware.com/slackware/slackware-iso/slackware64-15.0-iso/slackware64-15.0-install-dvd.iso
wget https://mirrors.slackware.com/slackware/slackware-iso/slackware64-15.0-iso/slackware64-15.0-install-dvd.iso.asc
wget https://mirrors.slackware.com/slackware/slackware-iso/slackware64-15.0-iso/slackware64-15.0-install-dvd.iso.md5
# checksum output should contain "OK"
md5sum -c slackware64-15.0-install-dvd.iso.md5
wget http://www.slackware.com/gpg-key
gpg --import gpg-key
# verify output should contain "Good signature"
gpg --verify slackware64-15.0-install-dvd.iso.asc slackware64-15.0-install-dvd.iso
dd -if=slackware64-15.0-install-dvd.iso -of=/dev/<usb_drive>
```

## 登录安装系统、选择键盘布局
从U盘启动安装系统，进入`grub`，选择`huge kernel`（可能出现两个，两者均可）；  
进入键盘布局选择界面，根据提示选择键盘布局，如果是US布局键盘直接`回车`；  
进入登录界面，以`root`用户登录，无需密码，进入安装系统的shell。

## 格式化分区、创建btrfs子卷
Slackware的安装程序`setup`是基于TUI的，不过在这之前需要手动创建目标分区，在`GPT`格式的硬盘上可以使用`cgdisk`工具创建分区。
创建分区之前，如果不确定硬盘中已有哪些分区，可以用`lsblk`工具查看。此处以NVMe硬盘为例（其中目标硬盘为`nvmeXnY`）：
```bash
lsblk
cgdisk /dev/nvmeXnY
```
在`cgdisk`中，上下方向键可选择分区，左右方向键可选择操作，选择一块空闲分区并根据提示建立分区即可，也可进行一些编辑，
在选择`Write`之前并不会对硬盘做实际的修改。特别注意，只有分区类型为`EFI System Partition`、
`Linux swap`和`Linux filesystem`的才能**被安装程序识别**，所以标记分区类型时需根据实际情况在其中选择。  
完成分区建立，退出`cgdisk`，将分区格式化为`btrfs`文件系统，挂载到`/mnt`目录，创建一些子卷（其中目标分区为`nvmeXnYpZ`）：
```bash
mkfs.btrfs /dev/nvmeXnYpZ
mount -t btrfs /dev/nvmeXnYpZ /mnt
btrfs subvolume # this shows usage
btrfs subvolume create /mnt/@
btrfs subvolume set-default /mnt/@
btrfs subvolume create /mnt/@home
btrfs subvolume create /mnt/@root
btrfs subvolume create /mnt/@opt
btrfs subvolume create /mnt/@var
mkdir -p /mnt/usr
btrfs subvolume create /mnt/usr/@local
```
其中，`@`子卷对应根目录，在此基础上可以启用快照回滚功能，其他子卷与`@`处于同一层级，对`@`进行快照或回滚并不会影响其他子卷，保证其数据稳定。  
除了这种平行结构，还可以在`@`子卷下嵌套创建子卷，如`@/home`、`@/usr/local`等，在快照回滚上作用类似，此处不再赘述。  
为了让安装程序用上这些子卷，需要将其正确挂载到`/mnt`目录下
（此处启用了[透明压缩](https://wiki.archlinux.org/title/Btrfs#Compression)功能，算法zstd，默认等级3）：
```bash
umount /mnt
mount -o compress=zstd,subvol=@ /dev/nvmeXnYpZ /mnt
mkdir -p /mnt/home
mkdir -p /mnt/root
mkdir -p /mnt/opt
mkdir -p /mnt/var
mkdir -p /mnt/usr/local
mount -o compress=zstd,subvol=@home /dev/nvmeXnYpZ /mnt/home
mount -o compress=zstd,subvol=@root /dev/nvmeXnYpZ /mnt/root
mount -o compress=zstd,subvol=@opt /dev/nvmeXnYpZ /mnt/opt
mount -o compress=zstd,subvol=@var /dev/nvmeXnYpZ /mnt/var
mount -o compress=zstd,subvol=usr/@local /dev/nvmeXnYpZ /mnt/usr/local
```
此时即可进入安装程序`setup`，注意不要再格式化这个分区。

## setup
Slackware的安装程序`setup`自带的解释十分详细，根据实际情况审慎选择即可。首先建议参考`HELP`，可以阅读安装指南，虽然稍显老旧但亦无妨；
另外在其中找到TUI的基本操作方法，现罗列如下：
- PGDN: 向下翻页
- PGUP：向上翻页
- 方向键下：向下一行
- 方向键上：向上一行
- 方向键左：向左滚动
- 方向键右：向右滚动
- '0'：移至行首
- HOME：移至开头
- END：移至末尾
- '/'：向前搜索
- '?'：向后搜索
- 'n'：向前重复上次搜索

另外，如果要在安装过程中使用shell，可以切换到其他的tty，安装系统一共有4个tty，其中`tty1`通常用于运行`setup`程序，
`tty4`用于查看内核输出，`tty2`和`tty3`则可以自由使用。按`alt`+`F<x>`即可切换到对应的`tty<x>`。

下面依次进行`ADDSWAP`、`TARGET`、`SOURCE`、`SELECT`、`INSTALL`、`CONFIGURE`每个步骤，注意**仔细阅读每个页面上的提示信息**。
每个步骤结束，`setup`会自动询问是否进行下一步骤，可以无需回到菜单界面。  
在有选项的界面，`空格`和`回车`均为确定，`Tab`可以更改光标所在对象，

### ADDSWAP
从`Linux swap`类型的分区中选择并启用；笔者没有分配swap分区，故跳过这一步。

### TARGET
选择一个`Linux filesystem`分区，指定目标系统的根目录`/`。接着会询问是否将其格式化，由于已完成格式化，**选择`No`**。
注意安装程序并不会将btrfs子卷有关信息写入目标系统的`/etc/fstab`文件，所以退出`setup`程序后需要手动修改之。
接下来安装程序找到`EFI`分区并询问是否要将其格式化，由于硬盘中已经安装了其他操作系统，EFI分区中存在其启动所需的引导信息，**选择`No`**。  
安装程序会检测到硬盘中其他操作系统的分区，询问是否添加到fstab中以实现自动挂载，根据需求选择即可（笔者选择了No，在需要时手动挂载）。

### SOURCE
由于安装系统镜像已经写入U盘，选择“USB stick”。（若于虚拟机中安装，iso文件加载于光驱，则需选择“CD or DVD”。）

### SELECT
选择需要安装的软件包组，可以取消掉一些不想安装的软件，如在`KDE`和`XFCE`中做选择（GNOME只有社区打包），取消Games的安装等等。
特别强调，Slackware的包管理机制并不强制软件包依赖关系，所以如果不熟悉取消的软件包，不能确定取消后造成的影响，
建议全部安装，否则若依赖缺失造成问题，后果自负。  
接下来需要选择安装过程中的显示方式，如果执行完全安装，个人建议选择`terse`，安装的软件包与`full`相同，
只是因为一个软件包的简要信息打印一行比起每个软件包的详细信息快速闪动更合笔者个人口味罢了。  
软件包安装过程将耗时约十几分钟，待其完成则可进入下一步。

### CONFIGURE
这一步做一些安装后的配置，使目标操作系统适于使用。  
首先是引导方式，跳过“USB flash boot”“LILO”及“ELILO”，待退出安装程序后手动安装`grub`；  
配置鼠标设备，选择对应的鼠标类型即可，笔者使用USB鼠标故选择`usb`；  
询问是否开机启用[GPM](https://wiki.gentoo.org/wiki/GPM)（General Purpose Mouse），笔者选择`Yes`；  
询问是否配置网络，建议选择`Yes`，输入主机名与域名（如无域名可设置为“localdomain”），询问是否需要VLAN ID，一般选择`No`；
选择网络配置类型，根据需要进行选择，笔者选择`NetworkManager`，将配置工作交给工具；询问是否确定，如确定则选择`Yes`；  
选择启动时加载的服务，根据需要进行选择，笔者使用了默认设置，如有需要则日后再修改；  
选择tty要使用的字体，如果对当前的字体不满意，比如在高分辨率屏幕上字体显得太小等，建议选择`Yes`，试到满意的字体为止，
之后在安装系统中，以及安装的目标系统每次启动时，均会为tty自动加载该字体；  
询问硬件时钟是否是UTC，此处涉及多系统时间同步问题，Windows默认硬件时钟设置为本地时间，而Linux与BSD默认硬件时钟设置为UTC，
根据所在时区自动计算当地时间；依照硬件时钟的实际情况进行选择即可；
选择时区，如果处于东八区，可以选择“Asia/Shanghai”，“上海时间”和北京时间是一致的；  
选择文本编辑器，系统将会创建`ex`或`vi`符号链接指向所选择的文本编辑器，笔者只略会`vim`，故选择之；
需要进行文本编辑但不会vim的话，可以用`nano`，系统自带；  
选择X Window System的默认窗口管理器，根据喜好进行选择，笔者是KDE用户；  
**设置root密码**，在Slackware中可能经常用到`root`用户以进行维护等，强烈建议设置一个密码，最好是强密码；
与其他*NIX系统的习惯一致，输入密码时不会有任何反馈，只需记得是什么密码，输入完毕后回车即可；
`bash`快捷键是可用的，如果输错了可以按`ctrl+U`删除光标前的内容，重新输入。

至此，所有在`setup`中要做的工作均已完毕，但此时还不能重启，因为没有正确的引导与fstab，目标系统将无法正确启动。

## 建立系统引导、编写`fstab`文件
退出`setup`时选择`Shell`以进行接下来的工作。目标系统现挂载于`/mnt`目录下，可以使用`chroot`进入。  
进入后，编写[`fstab`](https://wiki.archlinux.org/title/Fstab)，安装[`grub`](https://wiki.archlinux.org/title/GRUB)，建立一套引导机制。
首先进入`chroot`环境并使用bash（使用其他shell也可以，只要系统自带）：
```bash
chroot /mnt /bin/bash
source /etc/profile
```
编写`/etc/fstab`文件，每列以空格隔开，从左到右分别为`fs_spec`、`fs_file`、`fs_vfstype`、`fs_mntops`、`fs_freq`、`fs_passno`。
可以先查看manual，再查看分区情况，而后编写：
```bash
man fstab
lsblk -o NAME,TYPE,SIZE,FSTYPE,MOUNTPOINTS,UUID
vim /etc/fstab
```
使用`grub-install`安装`grub`并使用`grub-mkconfig`生成配置。  
首先保证目标EFI分区已经正确挂载于`/boot/efi`目录，`grub-install`将会在`/boot/efi/EFI`下创建目录，
此目录与设置的`bootloader-id`同名，其中包含一个.efi类型文件即`grub`的可执行文件。  
安装后需要生成配置文件，写入`/boot/grub/grub.cfg`：
```bash
grub-install --help
ls /boot/efi/EFI
grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=<desired_id>
ls /boot/efi/EFI/<desired_id>
grub-mkconfig --help
grub-mkconfig --output=/boot/grub/grub.cfg
```
这个`grub`将用于启动Slackware的内核，而多系统引导笔者使用[`Limine`](https://github.com/limine-bootloader/limine)，
用`efi_chainload`功能选择进入的操作系统。所以需要将Slackware的有关内容写入`limine.conf`，并使用`efibootmgr`将Limine置于首位。
```bash
vim <conf_path>/limine.conf
efibootmgr --help
efibootmgr
efibootmgr -o XXXX,...
```

## 添加普通用户、加入`sudoers`文件
在Slackware可以使用[`adduser`](https://www.slackbook.org/html/essential-sysadmin.html)脚本添加用户，根据提示操作即可，
记得为其添加密码；如果此用户需要一些系统管理员权限，或为个人使用方便起见，建议在Additional UNIX groups这一步骤添加`wheel`用户组。  
使用[`visudo`](https://www.sudo.ws/docs/man/visudo.man/)编辑`sudoers`文件，操作逻辑与`vi`相同，
笔者选择了取消注释`# %wheel ALL=(ALL:ALL) ALL`一行，赋予所有`wheel`用户组成员使用`sudo`的权限。  
值得注意的是，`sudo`环境中一些环境变量会被重设，在`visudo`找到“env_reset”和“env_keep”有关内容并根据提示进行编辑即可；
另外可以为`sudo`环境设置专用的`PATH`环境变量，找到“secure_path”有关内容并根据提示进行编辑即可。

## 重启后进入图形用户界面
Slackware通常有两套内核配置，`huge`和`generic`，其中`huge`会在启动时加载大量模块，而`generic`则允许启动后再加载必要的模块，
因此通常选择启动`generic`内核。但是`generic`内核要用到`initrd`即initial RAM disk，可以先启动`huge`内核，
再使用`geninitrd`脚本自动生成`initrd`，**有了`initrd`后再从`generic`内核启动**，从而提高启动的效率。  
另一个方法是使用`mkinitrd`，需要先使用`mkinitrd_command_generator.sh`生成命令，而后执行以生成`initrd`。
使用`mkinitrd`的好处在于可以编辑命令参数选项，定制需要加载的内核模块等，这就有了更大的自由度。

Slackware默认使用X，也支持Wayland。如果使用X，重启后输入用户名密码登录，执行`startx`命令即可进入所选择的图形用户界面环境。
如需重新选择，可以使用`xwmconfig`工具进行配置，改变`startx`所启动的对象。  
如果需要启用图形化的登录界面，只需修改`/etc/inittab`文件，将`id:3:initdefault:`中的“3”改为“4”，重启生效。

*至此，Slackware的安装及最基本的配置已经完成，至于Slackware独特的包管理系统，将于另一篇博客文章中介绍。*
