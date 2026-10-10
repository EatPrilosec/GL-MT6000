# GL-MT6000 custom OpenWrt firmware builder

This repository automates the process of building OpenWrt custom firmware images for **MY** Flint 2 (GL-MT6000) router, based on **MY PREFERENCES** and [pesa1234](https://github.com/pesa1234)'s work.

You should **not use** the firmwares released in this repository unless you have the same preferences/needs.
Instead, **make a fork and adapt to your needs**.

Read [this topic](https://forum.openwrt.org/t/mt6000-custom-build-with-luci-and-some-optimization-kernel-6-12-x/185241) in OpenWrt's forum to learn the details about pesa1234's customizations.

Compared to his custom firmware, this firmware adds:
- **Docker Suite**: Docker CE, dockerd, docker-compose, and LuCI Dockerman (`luci-app-dockerman`).
- **USB Storage & Filesystems**: USB 3.0 / UAS drivers (`kmod-usb-storage`, `kmod-usb-storage-uas`), Btrfs (`kmod-fs-btrfs`, `btrfs-progs`), ext4 (`e2fsprogs`), FAT/FAT32 (`dosfstools`), exFAT, NTFS.
- **File Sharing & Web Management**: Windows Network Shares Samba 4 (`samba4-server`, `luci-app-samba4`), Web File Explorer (`luci-app-filebrowser`), DLNA Media Server (`luci-app-minidlna`), and HDD spindown (`luci-app-hd-idle`).
- **Mesh & Remote VPNs**: Tailscale (`tailscale`, `luci-app-tailscale-community`), ZeroTier (`zerotier`), RustDesk self-hosted remote desktop (`rustdesk-server`, `luci-app-rustdesk-server`), WireGuard (`luci-proto-wireguard`), Policy Based Routing (`luci-app-pbr`), and optional NordVPN Lite installer (`nordvpnlite-install`).
- **Security & Adblocking**: banIP nftables threat blocker (`banip`, `luci-app-banip`), AdGuard Home DNS sinkhole (`adguardhome`, `luci-app-adguardhome`), AdBlock Fast (`adblock-fast`, `luci-app-adblock-fast`), Two-Factor Authentication (`luci-plugin-2fa`), and Pi-hole available via Docker.
- **Encrypted DNS (DoH / DoT)**: HTTPS DNS Proxy for IPv4/IPv6 (`https-dns-proxy`, `luci-app-https-dns-proxy`) and SmartDNS multi-upstream resolver (`smartdns`, `luci-app-smartdns`).
- **Traffic & Multi-WAN Management**: SQM QoS with CAKE (`sqm-scripts`, `luci-app-sqm`), Multi-WAN failover & load balancing (`mwan3`, `luci-app-mwan3`), and CAKE QoS schedulers (`kmod-sched-cake`, `tc-tiny`).
- **Networking & Administration**: Dynamic DNS (`ddns-scripts`, `luci-app-ddns`), Speed Test (`luci-app-librespeed`), Wi-Fi Association Log (`luci-app-wifihistory`), UPnP (`miniupnpd-nftables`, `luci-app-upnp`), mDNS discovery (`avahi-dbus-daemon`), Web Terminal (`luci-app-ttyd`), Bandwidth Monitoring (`luci-app-nlbwmon`), Extended System Statistics (`luci-app-statistics` with full collectd plugins suite: `cpufreq`, `disk`, `dns`, `df`, `dhcpleases`, `ethstat`, `ntpd`, `processes`, `protocols`, `sensors`, `sqm`, `swap`, `thermal`, `threshold`, `uptime`, `vmem`), Wake-on-LAN (`luci-app-wol`).
- **Hardware Monitoring & Dashboard**: Modern dashboard (`luci-mod-dashboard`) and status overview with live multi-sensor hardware temperature monitoring (CPU SoC, MT7915 Wi-Fi 2.4G/5G, and RTL8221B WAN/LAN 2.5G PHYs).
- **Themes**: Proton2025 (`luci-theme-proton2025`, default theme on first boot via UCI default), Material (`luci-theme-material`), OpenWrt (`luci-theme-openwrt`), and OpenWrt 2020 (`luci-theme-openwrt-2020`).
- **Wireless & Roaming**: Preconfigured US regulatory defaults with 160MHz 5GHz (`HE160`), implicit TX beamforming (`itxbfen`), WPA2/WPA3 Personal (`sae-mixed`), radios disabled by default on fresh flash for setup safety, usteer AP roaming assist & band steering (`usteer`, `luci-app-usteer`), full `wpad-openssl` (802.11k/v/r), and WiFi UCODE scripts (faster boot).
- **System Enhancements & Utilities**: GNU Bash (`bash`), GNU Nano (`nano-full` with syntax highlighting for UCI/scripts, UTF-8, and nanorc), GNU `coreutils-whoami`, persistent terminal command history, kernel swap support enabled, and Custom Attended Sysupgrade.
- **Security & Hardening**: Hardened SSH configuration with strong algorithms ([`ssh_hardening.conf`](files/etc/ssh/sshd_config.d/ssh_hardening.conf)).

And removals:
- **REMOVED:** `odhcp6c`/`odhcpd` (unified under `dnsmasq-full`), `luci-theme-argon` (broken upstream dependencies), and unnecessary kernel debug symbols.

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
