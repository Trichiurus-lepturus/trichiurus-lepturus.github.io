---
title: “命令未找到”？openSUSE cnf，助您快速定位缺失命令
subtitle: 蜥蜴的神秘妙妙工具
date: 2025-04-25 14:23:30
tags:
  - CLI/命令行
  - openSUSE
---

## 传统方法
当终端返回 `Command 'xxx' not found` 时，您是否仍需重复这个流程：  
手动搜索 → 定位包名 → 安装软件包？

## [cnf](https://github.com/openSUSE/cnf)
- 基于 Rust 开发，依赖极少
- 使用 `libsolv`，100% 兼容仓库
- 支持主流 Shell（bash / zsh）

### 安装
```bash
sudo zypper in cnf
```

<!-- more -->

安装 `cnf` 时会自动安装与已安装的shell（bash或zsh）匹配的集成包（`cnf-bash`或`cnf-zsh`）。如果未自动安装，也可以手动安装对应的包。

### 使用
直接使用：打出`cnf`命令，后跟提示“未找到”的命令即可：
```bash
cnf <command>
```

与shell集成：

- Bash 用户 → 需要`cnf-bash` → 编辑`/etc/bash.bashrc.local`或`~/.bashrc`
```bash
source /etc/command_not_found_bash
export COMMAND_NOT_FOUND_BIN=/usr/bin/cnf
```

- Zsh 用户 → 需要`cnf-zsh` → 编辑`/etc/zsh.zshrc.local`或`~/.zshrc`
```bash
source /etc/command_not_found_zsh
export COMMAND_NOT_FOUND_BIN=/usr/bin/cnf
```

重启终端生效。

使用例（集成后效果）：
```
% docker

The program 'docker' can be found in following packages:
  * docker [ path: /usr/bin/docker, repository: repo-oss ]
  * docker-stable [ path: /usr/bin/docker, repository: repo-oss ]
  * podman-docker [ path: /usr/bin/docker, repository: repo-oss ]

Try installing with:
    sudo zypper install <selected_package>

% reboot
Absolute path to 'reboot' is '/usr/sbin/reboot', so running it may require superuser privileges (eg. root).
```
