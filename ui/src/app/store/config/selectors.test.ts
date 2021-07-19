import config from "./selectors";

import {
  config as configFactory,
  configState as configStateFactory,
  rootState as rootStateFactory,
} from "testing/factories";

describe("config selectors", () => {
  describe("all", () => {
    it("returns list of all MAAS configs", () => {
      const allConfigs = [configFactory(), configFactory()];
      const state = rootStateFactory({
        config: configStateFactory({
          items: allConfigs,
        }),
      });
      expect(config.all(state)).toStrictEqual(allConfigs);
    });
  });

  describe("errors", () => {
    it("returns config errors", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          errors: "It's all broken",
        }),
      });
      expect(config.errors(state)).toStrictEqual("It's all broken");
    });
  });

  describe("loading", () => {
    it("returns config loading state", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          loading: false,
        }),
      });
      expect(config.loading(state)).toStrictEqual(false);
    });
  });

  describe("loaded", () => {
    it("returns config loaded state", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          loaded: true,
        }),
      });
      expect(config.loaded(state)).toStrictEqual(true);
    });
  });

  describe("saved", () => {
    it("returns config saved state", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          saved: true,
        }),
      });
      expect(config.saved(state)).toStrictEqual(true);
    });
  });

  describe("defaultStorageLayout", () => {
    it("returns MAAS config for default storage layout", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          items: [
            configFactory({ name: "default_storage_layout", value: "bcache" }),
          ],
        }),
      });
      expect(config.defaultStorageLayout(state)).toBe("bcache");
    });
  });

  describe("storageLayoutOptions", () => {
    it("returns array of storage layout options, formatted as objects", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          items: [
            configFactory({
              name: "default_storage_layout",
              value: "bcache",
              choices: [
                ["bcache", "Bcache layout"],
                ["blank", "No storage (blank) layout"],
              ],
            }),
          ],
        }),
      });
      expect(config.storageLayoutOptions(state)).toStrictEqual([
        {
          value: "bcache",
          label: "Bcache layout",
        },
        {
          value: "blank",
          label: "No storage (blank) layout",
        },
      ]);
    });
  });

  describe("enableDiskErasing", () => {
    it("returns MAAS config for enabling disk erase on release", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          items: [
            configFactory({
              name: "enable_disk_erasing_on_release",
              value: "foo",
            }),
          ],
        }),
      });
      expect(config.enableDiskErasing(state)).toBe("foo");
    });
  });

  describe("diskEraseWithSecure", () => {
    it("returns MAAS config for enabling disk erase with secure erase", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          items: [
            configFactory({
              name: "disk_erase_with_secure_erase",
              value: "bar",
            }),
          ],
        }),
      });
      expect(config.diskEraseWithSecure(state)).toBe("bar");
    });
  });

  describe("diskEraseWithQuick", () => {
    it("returns MAAS config for enabling disk erase with quick erase", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          items: [
            configFactory({
              name: "disk_erase_with_quick_erase",
              value: "baz",
            }),
          ],
        }),
      });
      expect(config.diskEraseWithQuick(state)).toBe("baz");
    });
  });

  describe("httpProxy", () => {
    it("returns MAAS config for http proxy", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          items: [configFactory({ name: "http_proxy", value: "foo" })],
        }),
      });
      expect(config.httpProxy(state)).toBe("foo");
    });
  });

  describe("enableHttpProxy", () => {
    it("returns MAAS config for enabling httpProxy", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          items: [configFactory({ name: "enable_http_proxy", value: "bar" })],
        }),
      });
      expect(config.enableHttpProxy(state)).toBe("bar");
    });
  });

  describe("usePeerProxy", () => {
    it("returns MAAS config for enabling peer proxy", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          items: [configFactory({ name: "use_peer_proxy", value: "baz" })],
        }),
      });
      expect(config.usePeerProxy(state)).toBe("baz");
    });
  });

  describe("proxyType", () => {
    it("returns 'noProxy' if enable_http_proxy is false", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          items: [configFactory({ name: "enable_http_proxy", value: false })],
        }),
      });
      expect(config.proxyType(state)).toBe("noProxy");
    });

    it("returns 'builtInProxy' if enable_http_proxy is true and http_proxy is empty", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          items: [
            configFactory({ name: "enable_http_proxy", value: true }),
            configFactory({ name: "http_proxy", value: "" }),
          ],
        }),
      });
      expect(config.proxyType(state)).toBe("builtInProxy");
    });

    it("returns 'externalProxy' if enable_http_proxy is true and http_proxy is not empty", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          items: [
            configFactory({ name: "enable_http_proxy", value: true }),
            configFactory({ name: "http_proxy", value: "http://www.url.com" }),
          ],
        }),
      });
      expect(config.proxyType(state)).toBe("externalProxy");
    });

    it("returns 'peerProxy' if enable_http_proxy is true, http_proxy is not empty and use_peer_proxy is true", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          items: [
            configFactory({ name: "enable_http_proxy", value: true }),
            configFactory({ name: "http_proxy", value: "http://www.url.com" }),
            configFactory({ name: "use_peer_proxy", value: true }),
          ],
        }),
      });
      expect(config.proxyType(state)).toBe("peerProxy");
    });
  });

  describe("maasName", () => {
    it("returns MAAS config for maas name", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          items: [configFactory({ name: "maas_name", value: "bionic-maas" })],
        }),
      });
      expect(config.maasName(state)).toBe("bionic-maas");
    });
  });

  describe("analyticsEnabled", () => {
    it("returns MAAS config for enable analytics", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          items: [configFactory({ name: "enable_analytics", value: true })],
        }),
      });
      expect(config.analyticsEnabled(state)).toBe(true);
    });
  });

  describe("commissioningDistroSeries", () => {
    it("returns MAAS config for default distro series", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          items: [
            configFactory({
              name: "commissioning_distro_series",
              value: "bionic",
            }),
          ],
        }),
      });
      expect(config.commissioningDistroSeries(state)).toBe("bionic");
    });
  });

  describe("distroSeriesOptions", () => {
    it("returns array of distro series options, formatted as objects", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          items: [
            configFactory({
              name: "commissioning_distro_series",
              value: "bionic",
              choices: [["bionic", "Ubuntu 18.04 LTS 'Bionic-Beaver'"]],
            }),
          ],
        }),
      });
      expect(config.distroSeriesOptions(state)).toStrictEqual([
        {
          value: "bionic",
          label: "Ubuntu 18.04 LTS 'Bionic-Beaver'",
        },
      ]);
    });
  });

  describe("defaultMinKernelVersion", () => {
    it("returns MAAS config for default kernel version", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          items: [configFactory({ name: "default_min_hwe_kernel", value: "" })],
        }),
      });
      expect(config.defaultMinKernelVersion(state)).toBe("");
    });
  });

  describe("kernelParams", () => {
    it("returns MAAS config for kernel parameters", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          items: [configFactory({ name: "kernel_opts", value: "foo" })],
        }),
      });
      expect(config.kernelParams(state)).toBe("foo");
    });
  });

  describe("windowsKmsHost", () => {
    it("returns Windows KMS host", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          items: [
            configFactory({ name: "windows_kms_host", value: "127.0.0.1" }),
          ],
        }),
      });
      expect(config.windowsKmsHost(state)).toBe("127.0.0.1");
    });
  });

  describe("vCenterServer", () => {
    it("returns vCenter server", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          items: [
            configFactory({ name: "vcenter_server", value: "my server" }),
          ],
        }),
      });
      expect(config.vCenterServer(state)).toBe("my server");
    });
  });

  describe("vCenterUsername", () => {
    it("returns vCenter username", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          items: [configFactory({ name: "vcenter_username", value: "admin" })],
        }),
      });
      expect(config.vCenterUsername(state)).toBe("admin");
    });
  });

  describe("vCenterPassword", () => {
    it("returns vCenter password", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          items: [configFactory({ name: "vcenter_password", value: "passwd" })],
        }),
      });
      expect(config.vCenterPassword(state)).toBe("passwd");
    });
  });

  describe("vCenterDatacenter", () => {
    it("returns vCenter datacenter", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          items: [
            configFactory({
              name: "vcenter_datacenter",
              value: "my datacenter",
            }),
          ],
        }),
      });
      expect(config.vCenterDatacenter(state)).toBe("my datacenter");
    });
  });

  describe("thirdPartyDriversEnabled", () => {
    it("returns value of enable_third_party_drivers", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          items: [
            configFactory({ name: "enable_third_party_drivers", value: true }),
          ],
        }),
      });
      expect(config.thirdPartyDriversEnabled(state)).toBe(true);
    });
  });

  describe("defaultOSystem", () => {
    it("returns MAAS config for default OS", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          items: [configFactory({ name: "default_osystem", value: "bionic" })],
        }),
      });
      expect(config.defaultOSystem(state)).toBe("bionic");
    });
  });

  describe("defaultOSystemOptions", () => {
    it("returns array of default OS options, formatted as objects", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          items: [
            configFactory({
              name: "default_osystem",
              value: "ubuntu",
              choices: [
                ["centos", "CentOS"],
                ["ubuntu", "Ubuntu"],
              ],
            }),
          ],
        }),
      });
      expect(config.defaultOSystemOptions(state)).toStrictEqual([
        {
          value: "centos",
          label: "CentOS",
        },
        {
          value: "ubuntu",
          label: "Ubuntu",
        },
      ]);
    });
  });

  describe("defaultDistroSeries", () => {
    it("returns MAAS config for default distro series", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          items: [
            configFactory({ name: "default_distro_series", value: "bionic" }),
          ],
        }),
      });
      expect(config.defaultDistroSeries(state)).toBe("bionic");
    });
  });

  describe("completedIntro", () => {
    it("returns MAAS config for completed intro", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          items: [configFactory({ name: "completed_intro", value: true })],
        }),
      });
      expect(config.completedIntro(state)).toBe(true);
    });
  });

  describe("releaseNotifications", () => {
    it("returns MAAS config for completed intro", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          items: [
            configFactory({ name: "release_notifications", value: true }),
          ],
        }),
      });
      expect(config.releaseNotifications(state)).toBe(true);
    });
  });

  describe("bootImagesAutoImport", () => {
    it("returns MAAS config for boot images auto import", () => {
      const state = rootStateFactory({
        config: configStateFactory({
          items: [
            configFactory({ name: "boot_images_auto_import", value: true }),
          ],
        }),
      });
      expect(config.bootImagesAutoImport(state)).toBe(true);
    });
  });
});
