---
title: 多功能解压工具unar和lsar简介
subtitle: 解压zip文件出现乱码问题的一种解决方案
date: 2024-05-22 01:30:01
tags:
  - Extract/解压
  - CLI/命令行
  - Mojibake/乱码
  - Code Page/代码页
---

## 问题
前两天深为.zip压缩包乱码问题所困。

众所周知，Windows系统由于其复杂而沉重的历史包袱，直到现在也还在使用[代码页](https://learn.microsoft.com/zh-cn/windows/win32/intl/code-pages)提供多语言字符集支持。其中简中的GBK在Code page 936，而GB18030在Code page 54936。  
于是，如果在Windows中打.zip压缩包时不指定使用UTF-8编码，得到的压缩包中文件名便是GBK的。在Windows中压缩解压当然没有问题，但是……  

<!-- more -->

当这个压缩包传到一个使用KDE桌面环境的Linux系统中，使用[Ark](https://apps.kde.org/ark/)打开它，一阵乱码便会扑面而来，令人头皮发麻。作为双系统用户当然可以切到Windows解压了再传回来，可平时干活都是在Linux，把系统切来切去真的很不方便。

## 弯路
此时搜索网络，大面积的答案都是说“用`unzip -O`选项指定编码”。不过这个`-O`选项其实是打补丁获得的，在写作本文时Tumbleweed官方仓库中的`unzip`不包含`-O`选项，也没有添加这个选项的补丁软件包。另一种方案是先解压而后用`convmv`一个一个改（用shell脚本一个一个改也是一个一个改）文件名和目录名……不够优雅。

## 解决
偶然间在openSUSE中文论坛的[一篇帖子](https://forum.suse.org.cn/t/topic/16477/5)，了解到了[`unar`](https://theunarchiver.com/command-line)解压工具，可解压[多种格式的压缩文件](https://theunarchiver.com/#:~:text=Supported%20archive%20formats)。此外，最重要的（也是本文最关心的）功能，它能自动识别文件名的编码并解压；如果自动识别失效，还可以用`-e`参数指定编码。详细的用法可以使用`man unar`查看；另有`lsar`工具，可不解压查看压缩包的内容。

在openSUSE Tumbleweed中可以使用`sudo zypper in unar`安装`unar`和`lsar`。笔者使用自动检测功能解压了几个GBK编码的压缩包及几个Shift-JIS编码的压缩包，乱码问题解决得相当好。
