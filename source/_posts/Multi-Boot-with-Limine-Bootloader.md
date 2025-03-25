---
title: 使用Limine Bootloader建立多系统（包括双系统）引导
date: 2024-11-06 20:24:54
tags:
  - Dual Boot/双系统
  - Multi Boot/多系统
  - Limine Bootloader
  - Bootstrap/启动引导
  - UEFI
---

## 需求
最近有时需要启动U盘中的系统，每次使用BIOS来选择启动项深感不便，故想到找一款好用的多系统引导工具。  
尝试使用rEFInd，启动时卡在Initializing，上网一搜从上到下几乎清一色HP电脑，这与笔者的机器品牌相同，猜测此问题与硬件有关，遂放弃使用rEFInd。

## Limine
注意到引导加载程序[Limine](https://limine-bootloader.org/)可以满足多系统引导需求，使用方法也较为简单清晰，故决定选择使用之。

<!-- more -->

（说实话Limine的界面比rEFInd更符合笔者个人的口味

### 安装
参考其[README](https://github.com/limine-bootloader/limine/blob/v8.x/README.md)，下载安装二进制：
```bash
git clone https://github.com/limine-bootloader/limine.git --branch=v8.x-binary --depth=1
cd limine
make install # this need root privileges
```
继续参考[USAGE](https://github.com/limine-bootloader/limine/blob/v8.x/USAGE.md)，
由于笔者使用UEFI引导模式，将`BOOT*.EFI`（\*为架构）文件拷贝至ESP（EFI System Partition）分区的`/EFI/BOOT`目录下，
再使用`efibootmgr`将`BOOT*.EFI`添加为引导项即可完成此步骤。  
那么`BOOT*.EFI`在哪里呢？注意`make install`的输出，不难发现在`/usr/local/share/limine/`。
这个路径也可以修改，`make install PREFIX=<prefix>`即可指定输出目录前缀。
```bash
cp /usr/local/share/limine/BOOT<cpu_arch>.EFI <esp_mountpoint>/EFI/BOOT/ # root privileges needed
efibootmgr --create --disk=<esp_disk> --part=<esp_part> --label="Limine" --loader='\EFI\BOOT\BOOT<cpu_arch>.efi' # backslashes!
# efibootmgr -c -d <esp_disk> -p <esp_part> -L "Limine" -l '\EFI\BOOT\BOOT<cpu_arch>.efi'
```
注意`esp_disk`需选择`/dev`中的设备，`esp_part`是从1开始的，`loader`的路径分隔符必须使用反斜杠（若去掉双引号则需转义，即使用双反斜杠）。

### 配置
参考[CONFIG](https://github.com/limine-bootloader/limine/blob/v8.x/CONFIG.md)进行配置。首先创建配置文件，根据文档，
可使用`/limine.conf`, `/limine/limine.conf`, `/boot/limine.conf`, `/boot/limine/limine.conf`或者`/EFI/BOOT/limine.conf`。  
阅读说明进行配置，可以自定义超时、背景、字体等内容，而最重要的当属启动项。以启动U盘中openSUSE Leap的EFI文件为例：
```
/Leap
    protocol: efi_chainload
    image_path: uuid(xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx):/EFI/opensuse/grubx64.efi
```
其中`/`表示新启动项的开始，“Leap”为启动项的名称，协议选择`efi_chainload`表示打开另一个EFI文件，路径使用uuid确定分区，分隔符可以使用正斜杠。
特别注意，“分区的UUID”有`UUID`（文件系统UUID）和`PARTUUID`（硬盘分区UUID）两种，其中Limine使用的是`PARTUUID`。  
更多配置项根据`CONFIG.md`编写即可。特别注意，Limine使用的路径包括分区与分区内路径两部分，应认真阅读Path一节。  
可以在[Arch Wiki](https://wiki.archlinux.org/title/Limine#Configuration)找到一个使用linux协议的例子，供参考。

### 使用
进入Limine的界面后默认会有操作提示（除非通过配置将其关闭），按提示操作即可，可以按方向上下键选择启动项。  
如果进入的启动项发生错误，会报告panic并打印stacktrace。
