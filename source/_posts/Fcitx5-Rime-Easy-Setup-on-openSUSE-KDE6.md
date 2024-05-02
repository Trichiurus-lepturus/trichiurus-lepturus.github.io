---
title: 在KDE6中轻松安装并配置fcitx5-rime输入法
date: 2024-05-01 09:26:19
tags:
  - openSUSE Tumbleweed
  - KDE Plasma
  - Wayland
  - Fcitx5
  - Rime
---

## 系统环境
openSUSE Tumbleweed \+ KDE Plasma 6 \+ Wayland

## 安装fcitx5-rime并启用
我的操作系统是英文操作系统（为了在tty中不用配置中文补丁也能够正常显示终端输出信息）。  
中文的openSUSE预装了`ibus`和`fcitx`两种输入框架,请只保留一个或都删掉并安装`fcitx5`  
以英文系统安装`fcitx5-rime`为例：
```bash
sudo zypper ref
sudo zypper in fcitx5 fcitx5-rime
```
注意到，[fcitx wiki](https://fcitx-im.org/wiki/Using_Fcitx_5_on_Wayland#KDE_Plasma)中提到在KDE下不要设置`QT_IM_MODULE`与`GTK_IM_MODULE`两个环境变量，
而安装fcitx5和rime时一起安装的[systemd-inputmethod-generator](https://github.com/openSUSE-zh/systemd-inputmethod-generator)这个包会生成上述两个环境变量。

可在`/etc/profile.d`下新建脚本文件，写入取消设置两个环境变量的脚本：
```bash
# /etc/profile.d/inputmethod-generator.sh
export QT_IM_MODULE=
export GTK_IM_MODULE=
```
如果这两个环境变量非空，启动fcitx5后会收到警告，说建议取消掉它们；为空则不会收到此警告。

安装完成后建议进行**重启**使配置生效；  
接着，在System Settings - Input & Output - Keyboard - Virtual Keyboard中选择Fcitx5并Apply；  
打开`fcitx5-configtool`，在右侧可用输入法找到`Rime`并添加到左侧当前输入法；  
Fcitx5默认切换输入法快捷键为`Ctrl+Space`。

## “東風破”plum配置管理工具
可以使用[plum](https://github.com/rime/plum)便捷地管理配置文件。
使用`git clone`下载plum:
```bash
git clone --depth 1 https://github.com/rime/plum.git
cd plum
```

## 使用plum安装“雾凇拼音”配置
[雾凇拼音](https://dvel.me/posts/rime-ice/)是一套Rime配置，其仓库在[此](https://github.com/iDvel/rime-ice)
> “功能齐全，词库体验良好，长期更新修订”  
> ——来自https://dvel.me/posts/rime-ice

由于plum默认ibus框架，本文使用fcitx5框架，使用时要注意指定环境变量`rime_frontend=fcitx5-rime`  
以安装完整配置以及启用小鹤双拼（非小鹤音形，小鹤音形我没学）为例：
```bash
# in plum dir
rime_frontend=fcitx5-rime ./rime-install iDvel/rime-ice:others/recipes/full
rime_frontend=fcitx5-rime ./rime-install iDvel/rime-ice:others/recipes/config:schema=flypy
```
重新部署rime以使配置生效：右击输入法状态栏（一般在系统托盘），在二级菜单中找到Deploy，点击之。  
默认Rime的菜单键为F4，在“方案选单”中可以选择输入方案、切换中英、简繁等。

如需要外挂其他方案可搜索，并使用plum进行下载。

## 进一步的配置
### Fcitx5
有些选项需要在`fcitx5-configtool`中配置

如更改快捷键：`fcitx5-configtool` - Global Options - Hotkey；  
竖排候选：`fcitx5-configtool` - Addons - Classic User Interface - Vertical Candidate List

### Rime
参考[Rime 定製指南](https://github.com/rime/home/wiki/CustomizationGuide)，使用`patch`功能进行自定义。  
使用此功能已经超出了本文讨论的范围（因为直接修改Rime配置文件不符合本文“轻松”的概念），
但能够定制出符合更加个性化需求的配置，让输入法更称手好用。  
……事实上配置起来也并不难，只要先学习[yaml](https://yaml.org/spec/1.2.2/)的语法，再参考着“定製指南”中的说明和例子去写就好了  
Fcitx5-rime的配置文件夹在`~/.local/share/fcitx5/rime`

*\*愿“聪明的输入法懂你心意”*
