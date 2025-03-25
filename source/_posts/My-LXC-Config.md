---
title: 从零开始：使用LXC构建开发容器，配置NAT、DNS与SSH（以openSUSE Tumbleweed为例）
date: 2025-02-17 06:34:44
tags:
  - LXC (Linux Containers)
  - NAT/网络地址转换
  - Firewall/防火墙
  - DNS/域名系统
  - SSH
  - openSUSE
---

最近将用于构建开发环境的工具从[Docker](https://docs.docker.com/engine/)迁移到了[LXC](https://linuxcontainers.org/)。由于LXC的配置相对复杂、自由度高，在此仅列出笔者的实践以供参考。本文将在openSUSE Tumbleweed中安装并配置LXC容器，实现NAT、DNS、SSH等功能。

*如果没有特别说明，本文中所有命令均以`root`身份运行*

## 安装LXC

使用`zypper`安装[`LXC`](https://build.opensuse.org/package/show/Virtualization:containers/lxc)及相关组件：

<!-- more -->

```bash
zypper -v cc
zypper -v ref
zypper -v in lxc
lxc-checkconfig
```

如果lxc-checkconfig输出了lxc的版本及支持情况，则证明lxc已经安装好了。

## 配置UID、GID映射

参考[Tutorial](https://linuxcontainers.org/lxc/getting-started/)，创建非特权容器需要做UID、GID映射，从而使得容器内无法获得主机的root权限：
```bash
cp /etc/lxc/default.conf /etc/lxc/default.conf.original # backup the original file
cp /etc/lxc/default.conf /etc/lxc/unprivileged.conf
echo "root:100000:65536" >> /etc/subgid
echo "root:100000:65536" >> /etc/subuid
echo "lxc.idmap = u 0 100000 65536" >> /etc/lxc/unprivileged.conf
echo "lxc.idmap = g 0 100000 65536" >> /etc/lxc/unprivileged.conf
```

## 配置NAT

### 编辑lxc-net配置文件

参考[ArchWiki](https://wiki.archlinux.org/title/Linux_Containers#Using_a_NAT_bridge)，
首先新建`/etc/default/lxc-net`文件并写入以下内容（可以自由选择在保留IP地址区段内的ip_prefix；笔者选择了172.27.0）：
```plain
# Leave USE_LXC_BRIDGE as "true" if you want to use lxcbr0 for your
# containers.  Set to "false" if you'll use virbr0 or another existing
# bridge, or mavlan to your host's NIC.
USE_LXC_BRIDGE="true"

# If you change the LXC_BRIDGE to something other than lxcbr0, then
# you will also need to update your /etc/lxc/default.conf as well as the
# configuration (/var/lib/lxc/<container>/config) for any containers
# already created using the default config to reflect the new bridge
# name.
# If you have the dnsmasq daemon installed, you'll also have to update
# /etc/dnsmasq.d/lxc and restart the system wide dnsmasq daemon.
LXC_BRIDGE="lxcbr0"
LXC_ADDR="<ip_prefix>.1"
LXC_NETMASK="255.255.255.0"
LXC_NETWORK="<ip_prefix>.0/24"
#LXC_DHCP_RANGE="<ip_prefix>.2,<ip_prefix>.254"
#LXC_DHCP_MAX="253"
# Uncomment the next line if you'd like to use a conf-file for the lxcbr0
# dnsmasq.  For instance, you can use 'dhcp-host=mail1,10.0.3.100' to have
# container 'mail1' always get ip address 10.0.3.100.
#LXC_DHCP_CONFILE=/etc/lxc/dnsmasq.conf

# Uncomment the next line if you want lxcbr0's dnsmasq to resolve the .lxc
# domain.  You can then add "server=/lxc/10.0.3.1' (or your actual $LXC_ADDR)
# to your system dnsmasq configuration file (normally /etc/dnsmasq.conf,
# or /etc/NetworkManager/dnsmasq.d/lxc.conf on systems that use NetworkManager).
# Once these changes are made, restart the lxc-net and network-manager services.
# 'container1.lxc' will then resolve on your host.
#LXC_DOMAIN="lxc"
```

### 配置firewalld

选择使用IP地址伪装（masquerade）实现NAT。考虑与`firewalld`兼容，这里没有直接用`iptables`，
而是使用[direct](https://firewalld.org/documentation/man-pages/firewalld.direct.html)模式描述规则。  
其中`ip_prefix`需与`/etc/default/lxc-net`中的保持一致：
```bash
systemctl status firewalld # enabled; active (running)
firewall-cmd --permanent --zone=trusted --add-interface=lxcbr0
firewall-cmd --direct --permanent --add-rule ipv4 nat POSTROUTING 0 -s <ip_prefix>.0/24 ! -o lxcbr0 -j MASQUERADE
```

### 配置ip_forward

接下来在宿主机中启用端口转发：
```bash
echo "net.ipv4.ip_forward = 1" >> /etc/sysctl.d/99-ip_forward.conf
echo "net.ipv6.conf.all.forwarding = 1" >> /etc/sysctl.d/99-ip_forward.conf
echo "net.ipv6.conf.all.disable_ipv6 = 0" >> /etc/sysctl.d/99-ip_forward.conf
sysctl --system # apply sysctl conf
```

### 启用lxc-net.service

最后启动systemd服务，并令其开机自启：
```bash
systemctl status lxc-net
systemctl start lxc-net
systemctl enable lxc-net # lxc-net auto start
```

## 配置DNS（宿主机部分）

利用`dnsmasq`，令`lxcbr0`为容器提供DNS解析服务：
```bash
systemctl status dnsmasq
echo "port=5353" >> /etc/dnsmasq.d/lxc.conf
echo "bind-interfaces" >> /etc/dnsmasq.d/lxc.conf
echo "interface=lxcbr0" >> /etc/dnsmasq.d/lxc.conf
systemctl start dnsmasq
systemctl enable dnsmasq
```

## 编辑容器配置文件；创建并进入容器

参考[Manpage](https://linuxcontainers.org/lxc/manpages//man5/lxc.container.conf.5.html)，
可先将配置文件拷贝一份出来，作为创建容器时使用配置文件：
```bash
cp /etc/lxc/unprivileged.conf /etc/lxc/<conf_name>.conf
```

为容器分配的ipv4地址必须是空闲的，其中`ip_prefix`需与`lxcbr0`中的保持一致；  
若需要ipv6地址也可以进行分配，对应的配置项分别为`lxc.net.0.ipv6.address`与`lxc.net.0.ipv6.gateway`；  
此处将`apparmor.profile`设置为`unconfined`是出于实践需要，且作为一个开发环境无须启用之；  
将与网络代理有关的环境变量设为全部不走代理，是因为LXC默认从宿主机继承所有环境变量，但容器通过网桥上网无需经过代理。

向`<conf_name>.conf`中**追加写入**以下内容：
```plain
lxc.net.0.ipv4.address = <ip_prefix>.<ip_suffix>/24
lxc.net.0.ipv4.gateway = <ip_prefix>.1
lxc.apparmor.profile = unconfined
lxc.environment = NO_PROXY=localhost,127.0.0.1,::1,0.0.0.0,*
lxc.environment = no_proxy=localhost,127.0.0.1,::1,0.0.0.0,*
lxc.environment = SOCKS_PROXY=
lxc.environment = ftp_proxy=
lxc.environment = gopher_proxy=
lxc.environment = http_proxy=
lxc.environment = https_proxy=
lxc.environment = socks_proxy=
```

创建并进入容器，其中`--template download`意为从[LXC Images](https://images.linuxcontainers.org/)这个列表中获取镜像，依次输入发行版、版本号、CPU架构即可：
```bash
lxc-create --name <container_name> --config /etc/lxc/<conf_name>.conf --template download
lxc-start --name <container_name>
lxc-attach --name <container_name>
```

容器创建完成后，其配置文件在宿主机中仍可以进行读写，修改的部分在容器重启后生效，路径为：**`/var/lib/lxc/<container_name>/config`**

所有的LXC命令都是以“lxc-”开头的，而形如“lxc 空格 子命令”的格式为LXD独有，并不在本文讨论范围内。
命令用法可以参考[Manpages](https://linuxcontainers.org/lxc/manpages/)。

## 配置DNS（容器内部分）

首先要注意`/etc/resolv.conf`是否是一个符号链接，根据具体情况不同，有不同的配置方法。
以openSUSE为例，可先关闭[`netconfig`](https://manpages.opensuse.org/Tumbleweed/sysconfig-netconfig/netconfig.8.en.html)，
而后手动写入`/etc/resolv.conf`文件。
```bash
# in container
sed -i 's/^NETCONFIG_DNS_POLICY="auto"/NETCONFIG_DNS_POLICY=""/' /etc/sysconfig/network/config
echo "nameserver <ip_prefix>.1" > /etc/resolv.conf
```

## 配置SSH

### 安装openssh-server

以openSUSE Leap为例，下载并安装有关组件，而后修改配置文件：
```bash
# in container
zypper up # maybe configure zypper mirrors first
zypper in nano openssh-server # install vim if preferred
```

### 编辑sshd_config配置文件

在`/etc/ssh/sshd_config`中，将对应配置项修改为以下内容：
```plain
Port <preferred_port>
PermitRootLogin yes
PubkeyAuthentication yes
PasswordAuthentication yes
AllowTcpForwarding yes
```

### 设置容器登录密码

要使用密码登录容器，[可用`passwd`命令](https://www.geeksforgeeks.org/passwd-command-in-linux-with-examples/)设置一个密码：
```bash
# in container
passwd
```

### 利用hook令sshd自启

容器并不通过如`multi-user.target`这样的systemd服务目标来启动，
所以`sshd`自启动需要用到LXC提供的钩子[`lxc.hook.start`](https://linuxcontainers.org/lxc/manpages/man5/lxc.container.conf.5.html#:~:text=A%20hook%20to%20be%20run%20in%20the%20container's%20namespace%20immediately%20before%20executing%20the%20container's%20init.%20This%20requires%20the%20program%20to%20be%20available%20in%20the%20container.)。
仿照`sshd.service`，在**容器内部**创建一个脚本，以启动`sshd`：
```bash
# in container
nano <sshd_script_path>
```

脚本内容如下：
```bash
#!/bin/bash
source /etc/sysconfig/ssh
/usr/sbin/sshd-gen-keys-start
/usr/sbin/sshd -t $SSHD_OPTS
nohup /usr/sbin/sshd -D $SSHD_OPTS > /var/log/sshd.log 2>&1 &
```

不要忘了为这个脚本添加执行权限：
```bash
# in container
chmod +x <sshd_script_path>
```

在宿主机的容器配置文件（`/var/lib/lxc/<container_name>/config`）中加入以下内容：
```plain
lxc.hook.start = <sshd_script_path>
```

## 在宿主机关机时自动停止所有LXC容器

有LXC容器运行时直接关机将导致关机速度缓慢，且可能导致容器处于不正确的状态。
为解决此问题，可以注册一个systemd服务，运行脚本来停止所有运行中容器。  
先在宿主机中创建一个脚本，以关闭所有运行中的LXC容器：
```bash
nano <stop_script_path>
```

脚本内容如下：
```bash
#!/bin/bash

# Get a list of all running LXC containers
running_containers=$(lxc-ls --running)

if [[ -z "$running_containers" ]]; then
    echo "No running LXC containers found."
    exit 0
fi

# Stop each running container
for container in $running_containers; do
    echo "Stopping container: $container"
    lxc-stop -n "$container"
done

echo "All running LXC containers have been stopped."
```

再在`/etc/systemd/system/`下创建`.service`文件：
```plain
[Unit]
Description=Stop all LXC containers
DefaultDependencies=no
Before=shutdown.target reboot.target halt.target poweroff.target

[Service]
Type=oneshot
ExecStart=<stop_script_path>

[Install]
WantedBy=shutdown.target
```

## 结语

**至此，这样的LXC容器配置已经能够满足作为独立开发环境的需求，可以用IDE的remote功能访问容器内环境了；
本文即是在容器中配置Node.js环境并完成编写的。**  
就笔者的个人使用体验而言，LXC比Docker配置更灵活，性能也更优，是值得考虑的选择。
