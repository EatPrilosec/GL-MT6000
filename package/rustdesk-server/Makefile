include $(TOPDIR)/rules.mk

PKG_NAME:=rustdesk-server
PKG_VERSION:=1.1.16
PKG_RELEASE:=1

PKG_SOURCE_PROTO:=git
PKG_SOURCE_URL:=https://github.com/rustdesk/rustdesk-server.git
PKG_SOURCE_VERSION:=$(PKG_VERSION)
PKG_MIRROR_HASH:=aa2427442ae3b78a52bd1d00203aaa2a1ffca082c48b171aa0cb81fcea363f1d

PKG_MAINTAINER:=Guilherme Cardoso <luminoso@gmail.com>
PKG_LICENSE:=AGPL-3.0-only
PKG_LICENSE_FILES:=LICENSE

PKG_BUILD_DEPENDS:=rust/host openssl
PKG_BUILD_PARALLEL:=1

include $(INCLUDE_DIR)/package.mk
include $(wildcard $(TOPDIR)/feeds/packages/lang/rust/rust-package.mk ../../lang/rust/rust-package.mk)

CARGO_PKG_VARS+= \
	OPENSSL_NO_VENDOR=1 \
	OPENSSL_INCLUDE_DIR=$(STAGING_DIR)/usr/include \
	OPENSSL_LIB_DIR=$(STAGING_DIR)/usr/lib \
	PKG_CONFIG_ALLOW_CROSS=1 \
	SODIUM_USE_PKG_CONFIG=1

define Package/rustdesk-server/Default
  SECTION:=net
  CATEGORY:=Network
  URL:=https://github.com/rustdesk/rustdesk-server
  DEPENDS:=$(RUST_ARCH_DEPENDS) @(aarch64||arm||i386||x86_64) +libsodium
endef

define Package/rustdesk-server
  $(call Package/rustdesk-server/Default)
  TITLE:=RustDesk self-hosted ID and relay server
endef

define Package/rustdesk-server/description
  ID server (hbbs) and relay server (hbbr) for self-hosted RustDesk remote desktop.
endef

define Package/rustdesk-utils
  $(call Package/rustdesk-server/Default)
  TITLE:=RustDesk server command line utility
endef

define Package/rustdesk-utils/description
  Command line tool of the RustDesk server, used to generate and validate
  server key pairs and to convert configuration strings.
endef

define Package/rustdesk-server/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(PKG_INSTALL_DIR)/bin/hbbs $(1)/usr/bin/hbbs
	$(INSTALL_BIN) $(PKG_INSTALL_DIR)/bin/hbbr $(1)/usr/bin/hbbr
endef

define Package/rustdesk-utils/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(PKG_INSTALL_DIR)/bin/rustdesk-utils $(1)/usr/bin/rustdesk-utils
endef

$(eval $(call BuildPackage,rustdesk-server))
$(eval $(call BuildPackage,rustdesk-utils))
