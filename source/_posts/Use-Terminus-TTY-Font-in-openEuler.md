---
title: 在openEuler中使用Termius TTY终端字体，改善视觉效果
date: 2024-05-22 19:10:43
tags:
  - Font/字体
  - TTY
  - openEuler/欧拉系统
---

## 概述
学校的操作系统实验课要求使用openEuler系统。这个发行版基于CentOS，并使用`dnf`作为包管理器。软件源中的包不算多，但对于实验课而言将将够用。  
安装Server版本的操作系统默认不带图形界面，只有CLI。在高分屏中，默认终端字体会显得很小，伤眼睛，于是想到更换字体，改善一下工作环境。

## 准备
参考[ArchWiki](https://wiki.archlinuxcn.org/wiki/Linux_%E6%8E%A7%E5%88%B6%E5%8F%B0#%E5%AD%97%E4%BD%93)，得知要获得较大的字体可安装`kbd`包和`terminus-font`包。

另外特别注意到，openEuler的`kbd`目录与Arch是不同的。Arch的在`/usr/share/kbd`（参考ArchWiki），而openEuler的在`/usr/lib/kbd`（可以使用`whereis kbd`命令查看）。

<!-- more -->

使用`dnf`安装软件包：
```bash
sudo dnf install kbd -y
sudo dnf search terminus # "No matches found"
```

（仅仅是皮一下）
```
- Hey DNF! ... Give me the package.
- If you want it... then you'll have to build it.
```

用`dnf`搜索，发现并没有有关"terminus"的软件包。不过，搜索网络，在[Terminus Font Home Page](https://terminus-font.sourceforge.net/)找到了手动安装的方法。

## 构建

在Terminus Font Home Page的"Download"部分找到对应"Unix/Linux source"的链接，下载并解压：
```bash
wget http://sourceforge.net/projects/terminus-font/files/terminus-font-xxx/terminus-font-yyy.tar.gz/download # xxx was 4.49 and yyy was 4.49.1 when writing this article
tar -zxvf terminus-font-yyy.tar.gz
cd terminus-font-yyy
```

参考README（在压缩包中的根目录下），用你喜欢的工具阅读（比如`less`），找到"1.1. Build requirements"部分，检查依赖项：
```bash
make --version
python3 --version
```
如果缺依赖，可使用`dnf`进行安装：
```bash
sudo dnf install make
sudo dnf install python3
```

继续阅读README，找到"2. Linux console"部分，记得将`psfdir`设置为`/usr/lib/kbd/consolefonts`。
```bash
./configure --psfdir=/usr/lib/kbd/consolefonts
make -j7 psf
make install-psf # this command needs root privileges
```

## 使用

临时设置字体：
```bash
setfont xxx # no need for the filename extension
```

持久设置字体：
```text
# /etc/vconsole.conf
...
FONT=xxx
...
```

关于字体名的含义：参考README的"2.4. Legend"部分，"ter-"后面的第一个字母代表字符集，数字代表字号，最后一个字母代表字重。

"Time to finish this Console. Once and for all!"（指设置字体） （够了没？（拍））
