import { createSelector } from "reselect";

const config = {};

/**
 * Returns value of an object in an array, given a certain name.
 * @param {Array.<Object>} arr - Array to search for name.
 * @param {String} name - Name paramenter of the object to search for.
 * @returns {*} Value parameter of found object.
 */
const getValueFromName = (arr, name) => {
  const found = arr.find(item => item.name === name);
  if (found) {
    return found.value;
  }
  return;
};

/**
 * Returns list of all MAAS configs
 * @param {Object} state - The redux state.
 * @returns {Array} A list of all state.config.items.
 */
config.all = state => state.config.items;

/**
 * Returns true if config is loading.
 * @param {Object} state - The redux state.
 * @returns {Boolean} Config is loading.
 */
config.loading = state => state.config.loading;

/**
 * Returns true if config has been loaded.
 * @param {Object} state - The redux state.
 * @returns {Boolean} Config has loaded.
 */
config.loaded = state => state.config.loaded;

/**
 * Returns true if config is saving.
 * @param {Object} state - The redux state.
 * @returns {Boolean} Config is saving.
 */
config.saving = state => state.config.saving;

/**
 * Returns the MAAS config for default storage layout.
 * @param {Object} state - The redux state.
 * @returns {String} Default storage layout.
 */
config.defaultStorageLayout = createSelector(
  [config.all],
  configs => getValueFromName(configs, "default_storage_layout")
);

/**
 * Returns the possible storage layout options reformatted as objects.
 * @param {Object} state - The redux state.
 * @returns {Array} Storage layout options.
 */
config.storageLayoutOptions = createSelector(
  [config.all],
  configs => {
    const configObj = configs.find(
      config => config.name === "default_storage_layout"
    );
    if (configObj) {
      return configObj.choices.map(choice => ({
        value: choice[0],
        label: choice[1]
      }));
    }
    return;
  }
);

/**
 * Returns the MAAS config for enabling disk erase on release.
 * @param {Object} state - The redux state.
 * @returns {Boolean} Enable disk erasing on release.
 */
config.enableDiskErasing = createSelector(
  [config.all],
  configs => getValueFromName(configs, "enable_disk_erasing_on_release")
);

/**
 * Returns the MAAS config for enabling disk erase with secure erase.
 * @param {Object} state - The redux state.
 * @returns {Boolean} Enable disk erasing with secure erase.
 */
config.diskEraseWithSecure = createSelector(
  [config.all],
  configs => getValueFromName(configs, "disk_erase_with_secure_erase")
);

/**
 * Returns the MAAS config for enabling disk erase with quick erase.
 * @param {Object} state - The redux state.
 * @returns {Boolean} Enable disk erasing with quick erase.
 */
config.diskEraseWithQuick = createSelector(
  [config.all],
  configs => getValueFromName(configs, "disk_erase_with_quick_erase")
);

/**
 * Returns the MAAS config for http proxy url.
 * @param {Object} state - The redux state.
 * @returns {String} HTTP proxy.
 */
config.httpProxy = createSelector(
  [config.all],
  configs => getValueFromName(configs, "http_proxy")
);

/**
 * Returns the MAAS config for enabling http proxy.
 * @param {Object} state - The redux state.
 * @returns {Boolean} Enable HTTP proxy.
 */
config.enableHttpProxy = createSelector(
  [config.all],
  configs => getValueFromName(configs, "enable_http_proxy")
);

/**
 * Returns the MAAS config for using peer proxy.
 * @param {Object} state - The redux state.
 * @returns {Boolean} Use peer proxy.
 */
config.usePeerProxy = createSelector(
  [config.all],
  configs => getValueFromName(configs, "use_peer_proxy")
);

/**
 * Returns the proxy type, given other proxy config.
 * @param {Object} state - The redux state.
 * @returns {String} Proxy type.
 */
config.proxyType = createSelector(
  [config.httpProxy, config.enableHttpProxy, config.usePeerProxy],
  (httpProxy, enableHttpProxy, usePeerProxy) => {
    if (enableHttpProxy) {
      if (httpProxy) {
        if (usePeerProxy) {
          return "peerProxy";
        } else {
          return "externalProxy";
        }
      } else {
        return "builtInProxy";
      }
    }
    return "noProxy";
  }
);

/**
 * Returns the MAAS config for MAAS name.
 * @param {Object} - The redux state.
 * @returns {String} Then MAAS name.
 */
config.maasName = createSelector(
  [config.all],
  configs => getValueFromName(configs, "maas_name")
);

/**
 * Returns the MAAS config for enable analytics.
 * @param {Object} - The redux state.
 * @returns {Boolean} Enable analytics.
 */
config.analyticsEnabled = createSelector(
  [config.all],
  configs => getValueFromName(configs, "enable_analytics")
);

/**
 * Returns the MAAS config for default distro series.
 * @param {Object} state - The redux state.
 * @returns {String} Default distro series.
 */
config.defaultDistroSeries = createSelector(
  [config.all],
  configs => getValueFromName(configs, "default_distro_series")
);

/**
 * Returns the possible distro series options reformatted as objects.
 * @param {Object} state - The redux state.
 * @returns {Array} Distro series options.
 */
config.distroSeriesOptions = createSelector(
  [config.all],
  configs => {
    const configObj = configs.find(
      config => config.name === "default_distro_series"
    );
    if (configObj) {
      return configObj.choices.map(choice => ({
        value: choice[0],
        label: choice[1]
      }));
    }
    return;
  }
);

/**
 * Returns the MAAS config for default min kernel version.
 * @param {object} state - The redux state.
 * @returns {String} Default min kernal version.
 */
config.defaultMinKernelVersion = createSelector(
  [config.all],
  configs => getValueFromName(configs, "default_min_hwe_kernel")
);

/**
 * Returns the possible min kernel version options reformatted as objects.
 * @param {Object} state - The redux state.
 * @returns {Array} Min kernel version options.
 */
config.minKernelVersionOptions = createSelector(
  [config.all],
  configs => {
    const configObj = configs.find(
      config => config.name === "default_min_hwe_kernel"
    );
    if (configObj) {
      return configObj.choices.map(choice => ({
        value: choice[0],
        label: choice[1]
      }));
    }
    return;
  }
);

/**
 * Returns the MAAS config for kernel parameters.
 * @param {object} state - The redux state.
 * @returns {String} Kernel parameters.
 */
config.kernelParams = createSelector(
  [config.all],
  configs => getValueFromName(configs, "kernel_opts")
);

export default config;
