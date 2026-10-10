# GL-MT6000 custom OpenWrt firmware builder

This repository automates the process of building OpenWrt custom firmware images for **MY** Flint 2 (GL-MT6000) router, based on **MY PREFERENCES** and [pesa1234](https://github.com/pesa1234)'s work.

You should **not use** the firmwares released in this repository unless you have the same preferences/needs.
Instead, **make a fork and adapt to your needs**.

Read [this topic](https://forum.openwrt.org/t/mt6000-custom-build-with-luci-and-some-optimization-kernel-6-12-x/185241) in OpenWrt's forum to learn the details about pesa1234's customizations.

Compared to [pesa1234's base build](https://raw.githubusercontent.com/pesa1234/MT6000_cust_build/refs/heads/main/2026-08-29_r36948-611fea61ac_next-r4.9.2.rss.mtk/targets/mediatek/filogic/config.buildinfo), this firmware introduces the following additions, modifications, and removals:

### ✨ Custom Added Packages & Features
- **Containers & Virtualization**: Docker CE, dockerd, docker-compose, and LuCI Dockerman (`luci-app-dockerman`).
- **High-Speed USB Storage & Advanced Filesystems**: USB 3.0 / UAS drivers (`kmod-usb-storage`, `kmod-usb-storage-uas`), Btrfs (`kmod-fs-btrfs`, `btrfs-progs`), ext4 (`e2fsprogs`, `chattr`), FAT/FAT32 (`dosfstools`), exFAT (`exfat-fsck`), F2FS (`kmod-fs-f2fs`, `f2fsck`, `mkf2fs`), block device inspector (`lsblk`), extended attributes (`attr`), NTFS.
- **File Management & Disk Power Control**: Native LuCI File Manager (`luci-app-filemanager`), HDD auto-spindown (`luci-app-hd-idle`).
- **Mesh, Remote VPNs & Anonymity**: Tor Onion Router (`tor`, `luci-app-tor`), Persistent SSH Tunnels (`sshtunnel`, `luci-app-sshtunnel`), RustDesk self-hosted remote desktop (`rustdesk-server`, `luci-app-rustdesk-server`), and optional NordVPN Lite installer (`nordvpnlite-install`).
- **IoT & Home Automation**: Eclipse Mosquitto MQTT broker (`mosquitto-nossl`, `luci-app-mosquitto`).
- **Security & Intrusion Prevention**: banIP nftables threat blocker (`banip`, `luci-app-banip`), Fail2Ban intrusion prevention (`fail2ban`), AdGuard Home DNS sinkhole (`adguardhome`, `luci-app-adguardhome`), Two-Factor Authentication for LuCI (`luci-plugin-2fa`), and Pi-hole available via Docker.
- **Recursive & Encrypted DNS**: Unbound recursive DNS resolver (`unbound-daemon`, `luci-app-unbound`), HTTPS DNS Proxy for IPv4/IPv6 (`https-dns-proxy`, `luci-app-https-dns-proxy`), and SmartDNS multi-upstream resolver (`smartdns`, `luci-app-smartdns`).
- **Traffic Shaping & Roaming Assist**: SQM QoS with CAKE (`sqm-scripts`, `luci-app-sqm`, `kmod-sched-cake`, `tc-tiny`), usteer AP roaming assist & band steering (`usteer`, `luci-app-usteer`).
- **Hardware Monitoring & Modern Dashboard**: Modern dashboard (`luci-mod-dashboard`) with live multi-sensor hardware temperature monitoring (CPU SoC, MT7915 Wi-Fi 2.4G/5G, and RTL8221B WAN/LAN 2.5G PHYs) and temperature table on classic status page.
- **Extended System Telemetry**: LuCI Statistics (`luci-app-statistics`) with comprehensive Collectd plugins suite (`cpufreq`, `disk`, `dns`, `df`, `dhcpleases`, `ethstat`, `exec`, `mqtt`, `ntpd`, `processes`, `protocols`, `sensors`, `smart`, `sqm`, `swap`, `thermal`, `threshold`, `uptime`, `vmem`).
- **Administration & Services**: LuCI Access Control Lists (`luci-app-acl`), ACME / Let's Encrypt automated certificate management with DNS API hooks (`luci-app-acme`, `acme-acmesh`, `acme-acmesh-dnsapi`), Dynamic DNS (`luci-app-ddns`, `ddns-scripts` with all 30 provider backends including Cloudflare, Route 53, DuckDNS, DigitalOcean, Hetzner, Porkbun, Gandi, No-IP, GoDaddy, etc.), Speed Test (`luci-app-librespeed`, `librespeed-cli`), Wi-Fi Association Log (`luci-app-wifihistory`), UPnP (`miniupnpd-nftables`, `luci-app-upnp`), mDNS discovery (`avahi-dbus-daemon`), Web Terminal (`luci-app-ttyd`), Network UPS Tools (`nut`, `luci-app-nut`), Chrony NTP server/client (`chrony`, `luci-app-chrony`), uHTTPd web server manager (`luci-app-uhttpd`), and Wake-on-LAN (`luci-app-wol`).
- **Shell & System Utilities**: GNU Bash (`bash`), GNU Nano (`nano-full` with syntax highlighting for UCI/scripts, UTF-8, and nanorc), GNU Coreutils (`coreutils-whoami`, `coreutils-sha1sum`, `sha224sum`, `sha256sum`, `sha384sum`, `sha512sum`), OpenSSH client (`openssh-client`), and Custom Attended Sysupgrade.
- **Modern Themes**: Proton2025 (`luci-theme-proton2025`, default theme on first boot via UCI default), Material (`luci-theme-material`), OpenWrt (`luci-theme-openwrt`), and OpenWrt 2020 (`luci-theme-openwrt-2020`).
- **Wireless Profiles**: Preconfigured US regulatory defaults with 160MHz 5GHz (`HE160`), implicit TX beamforming (`itxbfen`), WPA2/WPA3 Personal (`sae-mixed`), radios disabled by default on fresh flash for setup safety.
- **Security & Hardening**: Hardened SSH configuration with strong algorithms ([`ssh_hardening.conf`](files/etc/ssh/sshd_config.d/ssh_hardening.conf)).

### ⚙️ Changed & Tuned from Pesa1234 Baseline
- **CPU & Compiler Optimization**: Target optimization tuned to `-mcpu=cortex-a53+crc+crypto` (enabling hardware ARMv8 CRC32 and Cryptography instructions on Filogic 880 Cortex-A53 cores) instead of generic `-mcpu=cortex-a53`. Link-Time Optimization (`LTO`), Dead Code Elimination (`GC_SECTIONS`), and LLVM build toolchain enabled.
- **Binary Hardening**: Built with full ASLR PIE (`CONFIG_PKG_ASLR_PIE_ALL=y`), Strong Stack Protector for kernel and userland (`CONFIG_PKG_CC_STACKPROTECTOR_STRONG=y`), and Fortify Source 2 (`CONFIG_PKG_FORTIFY_SOURCE_2=y`).
- **OpenSSH Suite Replaces Dropbear**: Dropbear disabled; replaced by hardened OpenSSH server (`openssh-server`), client (`openssh-client`), and SFTP server (`openssh-sftp-server`) with strong cipher configurations.
- **Unified OpenSSL 3 Stack**: mbedTLS completely eliminated; unified under OpenSSL 3 with hardware acceleration (`devcrypto`, `asm`, `TLS 1.3`), while obsolete OpenSSL 1.1 algorithms and legacy libraries are disabled (`CONFIG_OPENSSL_NO_DEPRECATED=y`).
- **Promoted from Modular (`=m`) to Built-In (`=y`)**:
  - Policy Based Routing & WireGuard: `pbr`, `luci-app-pbr`, `wireguard-tools`, `luci-proto-wireguard`, `resolveip`, `curl`, `libcurl`, `jq`.
  - Mesh VPNs: Tailscale (`tailscale`, `luci-app-tailscale-community`) and ZeroTier (`zerotier`).
  - Multi-WAN: `mwan3`, `luci-app-mwan3`.
  - Windows Shares & Media Streaming: Samba 4 (`samba4-server`, `luci-app-samba4`), miniDLNA (`minidlna`, `luci-app-minidlna`).
  - AdBlock Fast: `adblock-fast`, `luci-app-adblock-fast`, `gawk`, `coreutils`, `coreutils-sort`.
  - Bandwidth & Diagnostics: `luci-app-nlbwmon`, `attr`, `terminfo`, `libreadline`, `libncurses`.
- **DNS/DHCP Integration**: Unified under `dnsmasq-full` with DHCPv6 support enabled (`CONFIG_PACKAGE_dnsmasq_full_dhcpv6=y`).
- **Interactive Shell History**: Persistent command history enabled in BusyBox (`CONFIG_BUSYBOX_CONFIG_FEATURE_EDITING_SAVEHISTORY=y`).
- **Fast Boot Wireless UCODE**: Fast WiFi startup scripts enabled (`CONFIG_WIFI_SCRIPTS_UCODE=y`).
- **Kernel Swap Support**: Kernel swap enabled (`CONFIG_KERNEL_SWAP=y`) for optional memory expansion.

### ✂️ Explicit Removals & Disabled Components
- **Kernel Debugging Symbols Stripped**: `CONFIG_KERNEL_DEBUG_INFO`, `CONFIG_KERNEL_ELF_CORE`, `CONFIG_KERNEL_KALLSYMS`, and `CONFIG_KERNEL_MAGIC_SYSRQ` disabled for compact kernel size and fast execution.
- **Dropbear**: Disabled in favor of full OpenSSH.
- **mbedTLS & Legacy OpenSSL**: Disabled in favor of hardened OpenSSL 3.
- **`luci-theme-argon`**: Disabled due to broken upstream dependencies.
- **`luci-app-filebrowser`**: Disabled (replaced by native `luci-app-filemanager`).
- **`luci-app-natmap`**: Disabled.

Check the content of [`mt6000.config`](mt6000.config) for details.



## About Custom Attended Sysupgrade

Using Luci's menu "System" --> "Attended Sysupgrade" it is now possible to select and install custom firmware from GitHub.
  
<sub>Custom Attended Sysupgrade</sub>  
![Custom Attended Sysupgrade](attended-sysupgrade-custom.png)
  
<sub>Dropdown list</sub>  
![Dropdown list](attended-sysupgrade-releases.png)
  
<sub>Installing Custom Firmware</sub>  
![Installing Custom Firmware](attended-sysupgrade-installing.png)
  
<sub>GitHub repository</sub>  
![GitHub repository used](attended-sysupgrade-server.png)
  
Notes:
- if you fork this repository, this will be adapted to look for upgrades in your repository by default.



## About NordVPN Lite

The firmware does not include NordVPN Lite itself, only the packages it needs and an installer. Nothing is downloaded until you run, from a SSH terminal:
- `nordvpnlite-install --install` to install the latest release and enable a daily update check (at 04:38).
- `nordvpnlite-install --check` to compare the installed and latest versions.
- `nordvpnlite-install --uninstall` to remove it (the configuration and login are kept).

After installing, log in with `nordvpnlite login <token>` or in Luci's menu "Services" --> "NordVPN Lite", then start it with `/etc/init.d/nordvpnlite start`. When an update is installed, a running NordVPN Lite is restarted.

Notes:
- The binary comes from the releases of [cjom/libtelio](https://github.com/cjom/libtelio/releases), a fork of NordSecurity's libtelio that adds a tunnel health check and an option to leave dnsmasq untouched. To use another fork, change `REPOSITORY` in [`nordvpnlite-install`](files/usr/sbin/nordvpnlite-install).
- The installed files survive firmware upgrades.
- The text output of the installer will show both in terminal and system logs.



## About upgrade_custom_openwrt script

```
THIS IS NOW DEPRECATED, ALTHOUGHT THE SCRIPT IS STILL INCLUDED
```

I added a script to make upgrading OpenWRT super easy. Just run from a SSH terminal:
- `upgrade_custom_openwrt --now` to check if a newer firmware is available and upgrade if so.
- `upgrade_custom_openwrt --wait` to wait for clients activity to stop before upgrading.
- `upgrade_custom_openwrt --check` to check for new versions but not upgrade the router.

**IT IS NOT RECOMMENDED** to schedule the script to be executed automatically, although the script is very careful and checks sha256sums before trying to upgrade. Don't blame me if something goes wrong with scripts that **YOU** run in your router!

Notes:
- if you fork this repository, the script will be adapted to look for upgrades in your repository.
- The text output of upgrade_custom_openwrt script will show both in terminal and system logs.



## About SSH Hardening

To enhance the security of SSH connections, this firmware includes a hardened SSH configuration. The configuration is derived from recommendations by [SSH-Audit](https://github.com/jtesta/ssh-audit) and the [BSI](https://www.bsi.bund.de/), it specifies strong key exchange algorithms, ciphers, message authentication codes (MACs), host key algorithms, and public key algorithms. This ensures that only secure and up-to-date algorithms are used for SSH communication.



## Contributing

Contributions to this project are welcome. If you encounter any issues or have suggestions for improvements, please open an issue or submit a pull request on the GitHub repository.



## Acknowledgements

- The OpenWrt project for providing the foundation for this firmware build and support of [GL.iNet GL-MT6000](https://openwrt.org/toh/gl.inet/gl-mt6000) router.
- The community over at the [OpenWrt forum](https://forum.openwrt.org/t/mt6000-custom-build-with-luci-and-some-optimization-kernel-6-12-x/185241) for their valuable contributions and resources. 
- [pesa1234](https://github.com/pesa1234) for his [MT6000 custom builds](https://github.com/pesa1234/MT6000_cust_build).
- [Julius Bairaktaris](https://github.com/JuliusBairaktaris/Qualcommax_NSS_Builder) from whom I "borrowed" much of this project (his repository is about custom builds for Xiaomi AX3600).
