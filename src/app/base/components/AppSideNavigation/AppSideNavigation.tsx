import { useEffect, useMemo } from "react";

import { Navigation, NavigationBar } from "@canonical/maas-react-components";
import {
  AppNavigation,
  AppNavigationBar,
  Panel,
} from "@canonical/react-components";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, useMatch } from "react-router-dom";
import { useStorageState } from "react-storage-hooks";

import AppSideNavItems from "./AppSideNavItems";
import NavigationBanner from "./NavigationBanner";
import { navGroups } from "./constants";

import {
  useFetchActions,
  useCompletedIntro,
  useCompletedUserIntro,
  useGoogleAnalytics,
} from "@/app/base/hooks";
import { useGlobalKeyShortcut } from "@/app/base/hooks/base";
import { useThemeContext } from "@/app/base/theme-context";
import urls from "@/app/base/urls";
import authSelectors from "@/app/store/auth/selectors";
import configSelectors from "@/app/store/config/selectors";
import { controllerActions } from "@/app/store/controller";
import controllerSelectors from "@/app/store/controller/selectors";
import { podActions } from "@/app/store/pod";
import podSelectors from "@/app/store/pod/selectors";
import type { RootState } from "@/app/store/root/types";
import { statusActions } from "@/app/store/status";

export type SideNavigationProps = {
  authUser: ReturnType<typeof authSelectors.get>;
  filteredGroups: typeof navGroups;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  logout: () => void;
  path: string;
  showLinks: boolean;
  theme: string;
  vaultIncomplete: boolean;
};

export const AppSideNavigation = ({
  authUser,
  filteredGroups,
  isAdmin,
  isAuthenticated,
  isCollapsed,
  setIsCollapsed,
  logout,
  path,
  showLinks,
  theme,
  vaultIncomplete,
}: SideNavigationProps) => (
  <>
    <AppNavigationBar className={`is-maas-${theme}`}>
      <Panel
        dark
        logo={<NavigationBanner />}
        toggle={{
          label: "Menu",
          onClick: () => setIsCollapsed(!isCollapsed),
        }}
      />
    </AppNavigationBar>
    <AppNavigation className={`is-maas-${theme}`} collapsed={isCollapsed}>
      <Panel
        controls={
          <>
            <NavigationBar.MenuButton
              onClick={() => {
                setIsCollapsed(!isCollapsed);
              }}
            >
              Close menu
            </NavigationBar.MenuButton>
            <Navigation.CollapseToggle
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
          </>
        }
        controlsClassName="u-no-margin--top"
        dark
        logo={<NavigationBanner />}
        stickyHeader
      >
        <AppSideNavItems
          authUser={authUser}
          groups={filteredGroups}
          isAdmin={isAdmin}
          isAuthenticated={isAuthenticated}
          logout={logout}
          path={path}
          setIsCollapsed={setIsCollapsed}
          showLinks={showLinks}
          vaultIncomplete={vaultIncomplete}
        />
      </Panel>
    </AppNavigation>
  </>
);

const AppSideNavigationContainer = (): JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const configLoaded = useSelector(configSelectors.loaded);
  const authUser = useSelector(authSelectors.get);
  const isAdmin = useSelector(authSelectors.isAdmin);
  const path = location.pathname;
  const completedIntro = useCompletedIntro();
  const completedUserIntro = useCompletedUserIntro();
  const isAuthenticated = !!authUser;
  const introMatch = useMatch({ path: urls.intro.index, end: false });
  const isAtIntro = !!introMatch;
  const showLinks = isAuthenticated && completedIntro && completedUserIntro;
  useGoogleAnalytics();

  const logout = () => {
    localStorage.removeItem("maas-config");
    dispatch(statusActions.logout());
  };

  // Redirect to the intro pages if not completed.
  useEffect(() => {
    // Check that we're not already at the intro to allow navigation through the
    // intro pages. This is necessary beacuse this useEffect runs every time
    // there is a navigation change as the `navigate` function is regenerated
    // for every route change, see:
    // https://github.com/remix-run/react-router/issues/7634
    if (!isAtIntro && configLoaded) {
      if (!completedIntro) {
        navigate({ pathname: urls.intro.index }, { replace: true });
      } else if (isAuthenticated && !completedUserIntro) {
        navigate({ pathname: urls.intro.user }, { replace: true });
      }
    }
  }, [
    completedIntro,
    completedUserIntro,
    configLoaded,
    isAtIntro,
    isAuthenticated,
    navigate,
  ]);

  useFetchActions([controllerActions.fetch]);

  useFetchActions([podActions.fetch]);

  const virshKvms = useSelector(podSelectors.virsh);
  const kvmsLoaded = useSelector(podSelectors.loaded);
  const hideVirsh = kvmsLoaded && virshKvms.length < 1;

  const { unconfiguredControllers, configuredControllers } = useSelector(
    (state: RootState) =>
      controllerSelectors.getVaultConfiguredControllers(state)
  );

  const vaultIncomplete =
    unconfiguredControllers.length >= 1 && configuredControllers.length >= 1;
  const [isCollapsed, setIsCollapsed] = useStorageState<boolean>(
    localStorage,
    "appSideNavIsCollapsed",
    true
  );
  useGlobalKeyShortcut("[", () => {
    setIsCollapsed(!isCollapsed);
  });

  const { theme } = useThemeContext();

  const filteredGroups = useMemo(() => {
    if (hideVirsh) {
      const kvmGroupIndex = navGroups.findIndex(
        (group) => group.groupTitle === "KVM"
      );

      const virshItemIndex = navGroups[kvmGroupIndex].navLinks.findIndex(
        (navLink) => navLink.label === "Virsh"
      );

      if (virshItemIndex > -1) {
        navGroups[kvmGroupIndex].navLinks.splice(virshItemIndex, 1);
      }
    }

    return navGroups;
  }, [hideVirsh]);

  return (
    <AppSideNavigation
      authUser={authUser}
      filteredGroups={filteredGroups}
      isAdmin={isAdmin}
      isAuthenticated={isAuthenticated}
      isCollapsed={isCollapsed}
      logout={logout}
      path={path}
      setIsCollapsed={setIsCollapsed}
      showLinks={showLinks}
      theme={theme}
      vaultIncomplete={vaultIncomplete}
    />
  );
};

export default AppSideNavigationContainer;
