---
title: 利用Roswell轻松搭建Common Lisp开发环境
date: 2025-07-30 08:26:17
tags:
  - Common Lisp
  - Roswell
  - SBCL
  - Quicklisp
  - Emacs
  - SLY
  - REPL/读取-求值-打印循环
---

[Common Lisp](https://common-lisp.net/) 是一门历史悠久却依然活跃的通用编程语言，以其强大的元编程能力和交互式开发体验著称。
作为Lisp家族中最成熟的标准实现，它提供了无与伦比的灵活性和表达能力。  
搭建一个Common Lisp开发环境并不难，若用上了[Roswell](https://roswell.github.io/)则更加简单。

## 编译安装Roswell
Roswell是一个Common Lisp开发环境搭建工具，可安装、启动、管理Common Lisp的[实现](https://common-lisp.net/implementations)，以及一些周边功能。如果类比的话，有些像是Common Lisp版的Conda。  
某些Linux发行版的软件仓库中具有`roswell`包，可直接进行安装；Roswell也为Debian系发行版打了`.deb`包，也可直接进行安装。另外，Mac OS、FreeBSD、Windows也都有相应安装方法。  
但如openSUSE等发行版，既然Roswell没有进行打包，那么如果要用上最新版的话，[编译安装](https://github.com/roswell/roswell/wiki/Installation#building-from-the-source-code)就是个不错的选项了。

<!-- more -->

首先，安装编译所需的工具链与依赖项。  
需要的工具链在openSUSE可以这样安装：
```bash
sudo zypper in -t pattern devel_basis
```
Roswell依赖于[`libcurl`](https://curl.se/libcurl/)，在openSUSE中这样安装：
```bash
sudo zypper in libcurl-devel
```

克隆仓库的`release`分支：
```bash
git clone -b release https://github.com/roswell/roswell.git
```

**（此节内容需注意时效性！）处理编译错误**  
参考这个GitHub Issue：[roswell issue #604](https://github.com/roswell/roswell/issues/604#issuecomment-3130222012)（此链接指向笔者发送的Issue评论）  
在2025年7月，使用最新的`GCC 15.1.1`编译源代码是过不去的，报错如下：
```
gcc -DHAVE_CONFIG_H -I. -I..      -MT cmd-run.o -MD -MP -MF .deps/cmd-run.Tpo -c -o cmd-run.o cmd-run.c
cmd-run.c: In function ‘register_cmd_run’:
cmd-run.c:256:3: error: too many arguments to function ‘register_runtime_options’; expected 0, have 1
  256 |   register_runtime_options(&run);
      |   ^~~~~~~~~~~~~~~~~~~~~~~~ ~~~~
In file included from cmd-run.c:2:
cmd-run.h:27:13: note: declared here
   27 | extern LVal register_runtime_options();
      |             ^~~~~~~~~~~~~~~~~~~~~~~~
make[2]: *** [Makefile:517: cmd-run.o] Error 1
```
提示函数调用与声明的参数数量不符。阅读源代码找到函数定义，在[`src/register-commands.c L63`](https://github.com/roswell/roswell/blob/48eaa5be10b208d225ab940fffff404439627e4a/src/register-commands.c#L63)，发现此函数的定义中有一个`struct proc_opt*`类型的参数`cmd`，在[`src/cmd-run.c L256`](https://github.com/roswell/roswell/blob/48eaa5be10b208d225ab940fffff404439627e4a/src/cmd-run.c#L256)的调用处也传入了此类型的参数`&run`，但在[`src/cmd-run.h L27`](https://github.com/roswell/roswell/blob/48eaa5be10b208d225ab940fffff404439627e4a/src/cmd-run.h#L27)的声明中并无此参数，由此导致问题。  
修复也不难，既然定义和调用都是正确的，只要在声明处补一个参数进去即可：
```diff
- extern LVal register_runtime_options();
+ extern struct proc_opt* register_runtime_options(struct proc_opt* cmd);
```
**注意**：此节基于 **2025年7月** 的 Roswell `release`分支（commit 48eaa5b）。若阅读本文时 Roswell 版本已更新，请先尝试直接编译，无需此补丁。

进入源代码目录，配置并编译：
```bash
cd roswell
autoupdate
sh bootstrap
./configure
make -j$(nproc)
sudo make install
```

若要安装到`/usr/local`以外的目录，在`./configure`这一步指定安装目录前缀，如安装到用户目录：
```bash
./configure --prefix=$HOME/.local
make
make install # no sudo needed
```
需要注意`~/.local/bin`在不在`$PATH`环境变量中，若不在则应添加进去。

验证安装：
```bash
ros version
```

## 初始化Roswell，安装SBCL和Quicklisp
首次启动Roswell，运行以下这条命令将自动安装[SBCL](https://www.sbcl.org/)（Steel Bank Common Lisp）与[Quicklisp](https://www.quicklisp.org/)：
```bash
ros setup
```
其中SBCL是Common Lisp的一款高性能编译器；Quicklisp则是Common Lisp的包管理器，如果类比的话，有些像是Common Lisp版的Pip。

由于使用Roswell管理Lisp实现，不应直接启动SBCL程序，而是使用`ros`命令：
```bash
ros -Q run
```
出现的星号（`*`）即为REPL的提示符，可以开始敲Common Lisp代码了！

如果希望使用[CCL](https://ccl.clozure.com/)，可手动安装并设为默认实现：
```bash
ros install ccl-bin
ros use ccl-bin
```

## Emacs中的Common Lisp IDE——SLY
如果直接运行`ros -Q run`，出现的REPL虽然能够运行，但既没有括号匹配，也没有自动缩进，写起代码来很是痛苦。
好在可以非常方便地在Emacs中，利用[SLY](https://joaotavora.github.io/sly/)（Sylvester the Cat's Common Lisp IDE for Emacs）建立功能强大的集成开发环境。

### 安装与启用

安装[Emacs](https://www.gnu.org/software/emacs/)：
```bash
sudo zypper in emacs emacs-x11
```
在openSUSE安装的Emacs中，`~/.emacs`将加载`~/.gnu-emacs`与`~/.gnu-emacs-custom`，而在`~/.gnu-emacs`中包含了启用[MELPA](https://melpa.org/#/)的语句，无需另行添加：
```lisp
;; MELPA
(require 'package)
(add-to-list 'package-archives
             '("melpa" . "https://melpa.org/packages/"))
```
（对于其他操作系统或自行编译的 Emacs，配置文件通常是 `~/.emacs.d/init.el` 或 `~/.emacs`）

现在启动Emacs，并用MELPA安装SLY：
```
M-x package-install RET
sly RET
```
不要忘记指定使用Roswell启动SBCL：
```bash
echo '(setq inferior-lisp-program "ros -Q run")' >> ~/.gnu-emacs-custom
```

### 交互与编辑

启动Emacs，键入`M-x sly RET`即可进入REPL。SLY将打印字符画与欢迎信息，如：
```
;
;     |,\__/|
;     |  o o|
;     (   T )    Hacks and glory await!
;    .^`--^'^.
;    `.  ;  .'
;    | | | | |
;   ((_((|))_))
;              hjw
;
; Dedicated output stream setup (port 34613)
; Redirecting all output to this MREPL
; SLY NIL (#<MREPL mrepl-1-1>)
CL-USER> 
```
在此编写Common Lisp代码，SBCL将自动进行编译，运行并打印出返回值。

不过，更加常见且高效的做法是，开启两个窗格，一面编辑代码，一面测试运行。如：

> 键入`C-x C-f`，打开`.lisp`文件；  
> 键入`C-x 3`，垂直（左右）分隔窗格；  
> 键入`M-x sly`，打开SLY REPL；  
> 键入`C-x o`，切换到另一个窗格；  
> 在文件窗格中编辑代码，按`C-M-i`补全；  
> 键入`C-M-x`，求值光标所在的顶层表达式；  
> 键入`C-c C-k`，编译并加载当前源代码文件；  
> 在REPL中输入测试代码并实时运行，按`TAB`补全；  
> 键入`M-p`或`M-n`，回溯REPL的历史输入；  
> 键入`C-r`，前向搜索REPL的历史输入；  
> 键入`C-c C-b`，打断当前Lisp子进程；  
> 键入`M-x sly-restart-inferior-lisp`，重启Lisp子进程；  
> 键入`C-c M-o`，清空REPL界面中所有输出与结果；  
> ……  
> 在文件窗格键入`C-x C-s`保存代码；  
> 在REPL窗格键入`(quit)`退出进程；  
> 键入`C-x C-c`退出Emacs。

另外，如需将选区代码缩进对齐，可以使用Emacs自带的Lisp缩进工具  
`M-x indent-region`或`C-M-\`；  
如需为源代码编辑自动启用行号显示，可在配置文件中加入这样一行：  
`(add-hook 'prog-mode-hook #'display-line-numbers-mode)`。

若要学习更多SLY的命令或快捷键，可参考[SLY的文档](https://joaotavora.github.io/sly/)；  
学习更多Emacs的命令或快捷键，可参考[Emacs的文档](https://www.gnu.org/software/emacs/manual/html_node/emacs/index.html)。

### ……或者如果你想用VS Code？
参考：VS Code插件[Alive](https://marketplace.visualstudio.com/items?itemName=rheller.alive)

## 更进一步
使用[ASDF](https://asdf.common-lisp.dev/)构建工具，可解决代码构建与跨平台兼容两大问题——不过这已经超出了本文范围，故暂不做介绍。

*Let the hacking commence!*
