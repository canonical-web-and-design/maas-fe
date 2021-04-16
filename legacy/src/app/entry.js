/* Copyright 2015-2018 Canonical Ltd.  This software is licensed under the
 * GNU Affero General Public License version 3 (see the file LICENSE).
 *
 * MAAS Module
 *
 * Initializes the MAAS module with its required dependencies and sets up
 * the interpolator to use '{$' and '$}' instead of '{{' and '}}' as this
 * conflicts with Django templates.
 */

// Load the SCSS.
import "../scss/build.scss";

import * as angular from "angular";
import uiRouter from "@uirouter/angularjs";
import ngCookies from "angular-cookies";
import ngRoute from "angular-route";
import ngSanitize from "angular-sanitize";
require("ng-tags-input");
require("angular-vs-repeat");
import singleSpaAngularJS from "single-spa-angularjs";
import * as Sentry from "@sentry/browser";
import * as Integrations from "@sentry/integrations";

import { navigateToNew, navigateToLegacy } from "@maas-ui/maas-ui-shared";
import configureRoutes from "./routes";
import setupWebsocket from "./bootstrap";

// filters
import {
  filterByUnusedForInterface,
  removeInterfaceParents,
  removeDefaultVLANIfVLAN,
  filterLinkModes,
  filterEditInterface,
  filterSelectedInterfaces,
  filterVLANNotOnFabric,
} from "./controllers/node_details_networking"; // TODO: fix export/namespace
// prettier-ignore
import {
  removeAvailableByNew,
  datastoresOnly
} from "./controllers/node_details_storage"; // TODO: fix export/namespace
// prettier-ignore
import {
  filterSource
} from "./controllers/subnet_details"; // TODO: fix export/namespace
// prettier-ignore
import {
  ignoreSelf,
  removeNoDHCP
} from "./controllers/vlan_details"; // TODO: fix export/namespace
import filterByFabric from "./filters/by_fabric";
import { filterBySpace, filterByNullSpace } from "./filters/by_space";
import { filterBySubnet, filterBySubnetOrVlan } from "./filters/by_subnet";
import { filterByVLAN, filterControllersByVLAN } from "./filters/by_vlan";
import { formatBytes, convertGigabyteToBytes } from "./filters/format_bytes";
import { sendAnalyticsEvent } from "./filters/send_analytics_event";
import formatStorageType from "./filters/format_storage_type";
import nodesFilter from "./filters/nodes";
import orderByDate from "./filters/order_by_date";
import range from "./filters/range";
import removeDefaultVLAN from "./filters/remove_default_vlan";

// services
import BrowserService from "./services/browser";
// prettier-ignore
// TODO: move to services
import {
  ControllerImageStatusService
} from "./directives/controller_image_status";
import ConverterService from "./services/converter";
import ErrorService from "./services/error";
import JSONService from "./services/json";
import LogService from "./services/log";
import Manager from "./services/manager";
import ManagerHelperService from "./services/managerhelper";
// TODO: move to factories
import PollingManager from "./services/pollingmanager";
// TODO: fix name
import RegionConnection from "./services/region";
import SearchService from "./services/search";
import ValidationService from "./services/validation";

// factories
import BootResourcesManager from "./factories/bootresources";
import ConfigsManager from "./factories/configs";
import ControllersManager from "./factories/controllers";
import DevicesManager from "./factories/devices";
import DHCPSnippetsManager from "./factories/dhcpsnippets";
import DiscoveriesManager from "./factories/discoveries";
import DomainsManager from "./factories/domains";
import EventsManagerFactory from "./factories/events";
import FabricsManager from "./factories/fabrics";
import GeneralManager from "./factories/general";
import IPRangesManager from "./factories/ipranges";
import MachinesManager from "./factories/machines";
import NodeResultsManagerFactory from "./factories/node_results";
import NodesManager from "./factories/nodes"; // TODO: move to services
import NotificationsManager from "./factories/notifications";
import PackageRepositoriesManager from "./factories/packagerepositories";
import PodsManager from "./factories/pods"; // TODO: move to services
import ResourcePoolsManager from "./factories/resourcepools";
import ScriptsManager from "./factories/scripts";
import ServicesManager from "./factories/services";
import SpacesManager from "./factories/spaces";
import SSHKeysManager from "./factories/sshkeys";
import StaticRoutesManager from "./factories/staticroutes";
import SubnetsManager from "./factories/subnets";
import TagsManager from "./factories/tags";
import UsersManager from "./factories/users";
import VLANsManager from "./factories/vlans";
import ZonesManager from "./factories/zones";

// controllers
import MasterController from "./controllers/master";
import AddDeviceController from "./controllers/add_device";
import AddDomainController from "./controllers/add_domain";
import DashboardController from "./controllers/dashboard";
import DomainDetailsController from "./controllers/domain_details";
import DomainsListController from "./controllers/domains_list";
import FabricDetailsController from "./controllers/fabric_details";
import ImagesController from "./controllers/images";
import IntroUserController from "./controllers/intro_user";
import IntroController from "./controllers/intro";
import NetworksListController from "./controllers/networks_list";
// prettier-ignore
import {
  NodeNetworkingController
} from "./controllers/node_details_networking";
import { NodeStorageController } from "./controllers/node_details_storage";
import {
  NodeFilesystemsController,
  NodeAddSpecialFilesystemController,
} from "./controllers/node_details_storage_filesystems";
import NodeDetailsController from "./controllers/node_details";
import NodeEventsController from "./controllers/node_events";
import NodeResultController from "./controllers/node_result";
import NodeResultsController from "./controllers/node_results";
import NodesListController from "./controllers/nodes_list";
import SpaceDetailsController from "./controllers/space_details";
import { SubnetDetailsController } from "./controllers/subnet_details";
import { VLANDetailsController } from "./controllers/vlan_details";
import ZoneDetailsController from "./controllers/zone_details";
import ZonesListController from "./controllers/zones_list";

// directives
// prettier-ignore
import loading from "./directives/loading";
import storageDisksPartitions from "./directives/nodedetails/storage_disks_partitions";
import storageFilesystems from "./directives/nodedetails/storage_filesystems";
import storageDatastores from "./directives/nodedetails/storage_datastores";
import nodeDetailsSummary from "./directives/nodedetails/summary";
import maasDhcpSnippetsTable from "./directives/dhcp_snippets_table";
import nodesListFilter from "./directives/nodelist/nodes_list_filter";
import { maasActionButton } from "./directives/action_button";
import { maasBootImages, maasBootImagesStatus } from "./directives/boot_images";
import { maasCta } from "./directives/call_to_action";
import maasCardLoader from "./directives/card_loader";
import maasCodeLines from "./directives/code_lines";
import contenteditable from "./directives/contenteditable";
// prettier-ignore
import {
  maasControllerImageStatus
} from "./directives/controller_image_status";
import { maasControllerStatus } from "./directives/controller_status";
import { maasDblClickOverlay } from "./directives/dbl_click_overlay";
import maasDefaultOsSelect from "./directives/default_os_select";
import maasEnterBlur from "./directives/enter_blur";
import maasEnter from "./directives/enter";
import { maasErrorOverlay } from "./directives/error_overlay";
import maasErrorToggle from "./directives/error_toggle";
import maasIpRanges from "./directives/ipranges";
import {
  maasObjForm,
  maasObjFieldGroup,
  maasObjField,
  maasObjSave,
  maasObjErrors,
  maasObjSaving,
  maasObjShowSaving,
  maasObjHideSaving,
} from "./directives/maas_obj_form";
import macAddress from "./directives/mac_address";
import maasNavigationDropdown from "./directives/navigation_dropdown";
import maasNavigationMobile from "./directives/navigation_mobile";
import { maasNotifications } from "./directives/notifications";
import ngPlaceholder from "./directives/placeholder";
import {
  maasPowerInput,
  maasPowerParameters,
} from "./directives/power_parameters";
import maasReleaseName from "./directives/release_name";
import maasScriptResultsList from "./directives/script_results_list";
import { maasScriptRunTime } from "./directives/script_runtime";
import { maasScriptSelect } from "./directives/script_select";
import { maasScriptStatus } from "./directives/script_status";
import maasSshKeys from "./directives/ssh_keys";
import toggleCtrl from "./directives/toggle_control";
import ngType from "./directives/type";
import maasVersionReloader from "./directives/version_reloader";
import windowWidth from "./directives/window_width";

/* @ngInject */
function configureMaas(
  $interpolateProvider,
  $stateProvider,
  $httpProvider,
  $locationProvider,
  $compileProvider,
  tagsInputConfigProvider,
  $urlRouterProvider
) {
  // Disable debugInfo unless in a Jest context.
  // Re-enable debugInfo in development by running
  // angular.reloadWithDebugInfo(); in the console.
  // See: https://docs.angularjs.org/guide/production#disabling-debug-data
  $compileProvider.debugInfoEnabled(!!window.DEBUG);

  $interpolateProvider.startSymbol("{$");
  $interpolateProvider.endSymbol("$}");

  tagsInputConfigProvider.setDefaults("autoComplete", {
    minLength: 0,
    loadOnFocus: true,
    loadOnEmpty: true,
  });

  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false,
  });

  // Set the $httpProvider to send the csrftoken in the header of any
  // http request.
  $httpProvider.defaults.xsrfCookieName = "csrftoken";
  $httpProvider.defaults.xsrfHeaderName = "X-CSRFToken";

  // Batch http responses into digest cycles
  $httpProvider.useApplyAsync(true);

  configureRoutes($stateProvider, $urlRouterProvider);
}

// Force users to #/intro when it has not been completed.
/* @ngInject */
function introRedirect($rootScope, $window) {
  $rootScope.$on("$routeChangeStart", function (event, next, current) {
    if ($window.CONFIG && !$window.CONFIG.completed_intro) {
      if (next.controller !== "IntroController") {
        navigateToLegacy("/intro");
      }
    } else if ($window.CONFIG && !$window.CONFIG.current_user.completed_intro) {
      if (next.controller !== "IntroUserController") {
        navigateToLegacy("/intro/user");
      }
    }
  });
}

/* @ngInject */
function dashboardRedirect($rootScope, $window) {
  $rootScope.$on("$routeChangeStart", function (event, next, current) {
    // Only superusers currently have access to the dashboard
    if ($window.CONFIG && !$window.CONFIG.current_user.is_superuser) {
      if (next.controller == "DashboardController") {
        navigateToNew("/machines");
      }
    }
  });
}

/* @ngInject */
// Removes hide class from RSD link which is hidden
// so it doesn't flash up in the nav before angular is ready
function unhideRSDLinks() {
  let rsdLinks = document.querySelectorAll(".js-rsd-link");
  rsdLinks.forEach((link) => link.classList.remove("u-hide"));
}

Sentry.init({
  beforeSend(event) {
    if (process.env.NODE_ENV === "production") {
      return event;
    }
    return null;
  },
  dsn: process.env.SENTRY_DSN,
  integrations: [new Integrations.Angular()],
});

/* @ngInject */
const configureSentry = ($window) => {
  Sentry.setExtra("maasVersion", $window.CONFIG.version);
  Sentry.setTag("maas.version", $window.CONFIG.version);
};

const maasModule = "MAAS";
const MAAS = angular.module(maasModule, [
  ngRoute,
  ngCookies,
  ngSanitize,
  uiRouter,
  "ngTagsInput",
  "vs-repeat",
  "ngSentry",
]);

MAAS.config(configureMaas)
  .run(configureSentry)
  .run(dashboardRedirect)
  .run(introRedirect)
  .run(unhideRSDLinks)
  // Registration
  // filters
  .filter("filterByUnusedForInterface", filterByUnusedForInterface)
  .filter("removeInterfaceParents", removeInterfaceParents)
  .filter("removeDefaultVLANIfVLAN", removeDefaultVLANIfVLAN)
  .filter("filterLinkModes", filterLinkModes)
  .filter("removeAvailableByNew", removeAvailableByNew)
  .filter("datastoresOnly", datastoresOnly)
  .filter("filterSource", filterSource)
  .filter("ignoreSelf", ignoreSelf)
  .filter("removeNoDHCP", removeNoDHCP)
  .filter("filterByFabric", filterByFabric)
  .filter("filterBySpace", filterBySpace)
  .filter("filterByNullSpace", filterByNullSpace)
  .filter("filterBySubnet", filterBySubnet)
  .filter("filterBySubnetOrVlan", filterBySubnetOrVlan)
  .filter("filterByVLAN", filterByVLAN)
  .filter("filterControllersByVLAN", filterControllersByVLAN)
  .filter("formatBytes", formatBytes)
  .filter("sendAnalyticsEvent", sendAnalyticsEvent)
  .filter("convertGigabyteToBytes", convertGigabyteToBytes)
  .filter("formatStorageType", formatStorageType)
  .filter("nodesFilter", nodesFilter)
  .filter("orderByDate", orderByDate)
  .filter("range", range)
  .filter("removeDefaultVLAN", removeDefaultVLAN)
  .filter("filterEditInterface", filterEditInterface)
  .filter("filterSelectedInterfaces", filterSelectedInterfaces)
  .filter("filterVLANNotOnFabric", filterVLANNotOnFabric)
  // factories
  .factory("PollingManager", PollingManager)
  .factory("BootResourcesManager", BootResourcesManager)
  .factory("ConfigsManager", ConfigsManager)
  .factory("ControllersManager", ControllersManager)
  .factory("DevicesManager", DevicesManager)
  .factory("DHCPSnippetsManager", DHCPSnippetsManager)
  .factory("DiscoveriesManager", DiscoveriesManager)
  .factory("DomainsManager", DomainsManager)
  .factory("EventsManagerFactory", EventsManagerFactory)
  .factory("FabricsManager", FabricsManager)
  .factory("GeneralManager", GeneralManager)
  .factory("IPRangesManager", IPRangesManager)
  .factory("MachinesManager", MachinesManager)
  .factory("NodeResultsManagerFactory", NodeResultsManagerFactory)
  .factory("NotificationsManager", NotificationsManager)
  .factory("PackageRepositoriesManager", PackageRepositoriesManager)
  .factory("ResourcePoolsManager", ResourcePoolsManager)
  .factory("ScriptsManager", ScriptsManager)
  .factory("ServicesManager", ServicesManager)
  .factory("SpacesManager", SpacesManager)
  .factory("SSHKeysManager", SSHKeysManager)
  .factory("StaticRoutesManager", StaticRoutesManager)
  .factory("SubnetsManager", SubnetsManager)
  .factory("TagsManager", TagsManager)
  .factory("UsersManager", UsersManager)
  .factory("VLANsManager", VLANsManager)
  .factory("ZonesManager", ZonesManager)
  // services
  .service("BrowserService", BrowserService)
  .service("ControllerImageStatusService", ControllerImageStatusService)
  .service("ConverterService", ConverterService)
  .service("ErrorService", ErrorService)
  .service("JSONService", JSONService)
  .service("LogService", LogService)
  .service("Manager", Manager)
  .service("ManagerHelperService", ManagerHelperService)
  .service("NodesManager", NodesManager)
  .service("PodsManager", PodsManager)
  .service("RegionConnection", RegionConnection)
  .service("SearchService", SearchService)
  .service("ValidationService", ValidationService)
  // controllers
  .controller("MasterController", MasterController)
  .controller("AddDeviceController", AddDeviceController)
  .controller("AddDomainController", AddDomainController)
  .controller("DashboardController", DashboardController)
  .controller("DomainDetailsController", DomainDetailsController)
  .controller("DomainsListController", DomainsListController)
  .controller("FabricDetailsController", FabricDetailsController)
  .controller("ImagesController", ImagesController)
  .controller("IntroUserController", IntroUserController)
  .controller("IntroController", IntroController)
  .controller("NetworksListController", NetworksListController)
  .controller("NodeNetworkingController", NodeNetworkingController)
  .controller("NodeFilesystemsController", NodeFilesystemsController)
  .controller(
    "NodeAddSpecialFilesystemController",
    NodeAddSpecialFilesystemController
  )
  .controller("NodeStorageController", NodeStorageController)
  .controller("NodeDetailsController", NodeDetailsController)
  .controller("NodeEventsController", NodeEventsController)
  .controller("NodeResultController", NodeResultController)
  .controller("NodeResultsController", NodeResultsController)
  .controller("NodesListController", NodesListController)
  .controller("SpaceDetailsController", SpaceDetailsController)
  .controller("SubnetDetailsController", SubnetDetailsController)
  .controller("VLANDetailsController", VLANDetailsController)
  .controller("ZoneDetailsController", ZoneDetailsController)
  .controller("ZonesListController", ZonesListController)
  // directives
  .directive("ngLoading", loading)
  .directive("storageDisksPartitions", storageDisksPartitions)
  .directive("storageFilesystems", storageFilesystems)
  .directive("storageDatastores", storageDatastores)
  .directive("nodesListFilter", nodesListFilter)
  .directive("maasActionButton", maasActionButton)
  .directive("maasBootImagesStatus", maasBootImagesStatus)
  .directive("maasBootImages", maasBootImages)
  .directive("maasCta", maasCta)
  .directive("maasCardLoader", maasCardLoader)
  .directive("maasCodeLines", maasCodeLines)
  .directive("contenteditable", contenteditable)
  .directive("maasControllerImageStatus", maasControllerImageStatus)
  .directive("maasControllerStatus", maasControllerStatus)
  .directive("maasDblClickOverlay", maasDblClickOverlay)
  .directive("maasDefaultOsSelect", maasDefaultOsSelect)
  .directive("maasEnterBlur", maasEnterBlur)
  .directive("maasEnter", maasEnter)
  .directive("maasErrorOverlay", maasErrorOverlay)
  .directive("maasErrorToggle", maasErrorToggle)
  .directive("maasIpRanges", maasIpRanges)
  .directive("maasObjForm", maasObjForm)
  .directive("maasObjFieldGroup", maasObjFieldGroup)
  .directive("maasObjField", maasObjField)
  .directive("maasObjSave", maasObjSave)
  .directive("maasObjErrors", maasObjErrors)
  .directive("maasObjSaving", maasObjSaving)
  .directive("maasObjShowSaving", maasObjShowSaving)
  .directive("maasObjHideSaving", maasObjHideSaving)
  .directive("macAddress", macAddress)
  .directive("maasDhcpSnippetsTable", maasDhcpSnippetsTable)
  .directive("maasNavigationDropdown", maasNavigationDropdown)
  .directive("maasNavigationMobile", maasNavigationMobile)
  .directive("maasNotifications", maasNotifications)
  .directive("ngPlaceholder", ngPlaceholder)
  .directive("maasPowerInput", maasPowerInput)
  .directive("maasPowerParameters", maasPowerParameters)
  .directive("maasReleaseName", maasReleaseName)
  .directive("nodeDetailsSummary", nodeDetailsSummary)
  .directive("maasScriptResultsList", maasScriptResultsList)
  .directive("maasScriptRunTime", maasScriptRunTime)
  .directive("maasScriptSelect", maasScriptSelect)
  .directive("maasScriptStatus", maasScriptStatus)
  .directive("maasSshKeys", maasSshKeys)
  .directive("toggleCtrl", toggleCtrl)
  .directive("ngType", ngType)
  .directive("maasVersionReloader", maasVersionReloader)
  .directive("windowWidth", windowWidth);

const lifecycles = singleSpaAngularJS({
  angular,
  mainAngularModule: maasModule,
  uiRouter: true,
  preserveGlobal: false,
});

export const bootstrap = [setupWebsocket, lifecycles.bootstrap];
export const mount = (opts, mountedInstances, props) => {
  // If the config doesn't exist it probably means the application was
  // bootstrapped when logged out.
  if (!window.CONFIG) {
    // Bootstrap the application before mounting it.
    return setupWebsocket().then(() => {
      lifecycles.mount(opts, mountedInstances, props);
    });
  } else {
    // The application has already been bootstrapped so mount it.
    return lifecycles.mount(opts, mountedInstances, props);
  }
};
export const unmount = lifecycles.unmount;
