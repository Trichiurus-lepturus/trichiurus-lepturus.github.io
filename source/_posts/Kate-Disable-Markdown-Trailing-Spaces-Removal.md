---
title: 不让Kate在保存Markdown文件时移除行末空格
date: 2024-04-28 07:14:58
tags:
  - Kate
  - Markdown
  - KDE Plasma
---

## 概述
Kate版本：kate 24.02.2

[Kate](https://kate-editor.org/zh-cn/)是KDE下的一款文本编辑器，做些轻量级的文本编辑非常好用  
VSCode相对于Kate还是太重了（

今天在使用Kate编辑Markdown文件时发现保存时会自动移除行末空格  
行末两个空格是Markdown常用的段落内换行标志，当然我们希望Kate把它保留下来……

## 解决
搜索，在[kate-editor.org](https://kate-editor.org/2012/10/27/remove-trailing-spaces/)找到了解决方案  
不过现在Remove trailing spaces选项并不会直接显示在设置界面上  
它在：Settings - Configure Kate - Open/Save - Modes & Filetypes  
Filetype选Markup/Markdown，在Variables中找到remove-trailing-spaces并设置为none

现在Variables那项应该类似长这个样子↓  
Variables: `kate: remove-trailing-spaces none;`  
重启Kate生效，现在就用Kate写个Markdown试试吧(✿╹◡╹)
