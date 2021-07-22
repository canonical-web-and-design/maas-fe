import type { ReactNode } from "react";
import { useEffect } from "react";

import { Spinner, Notification } from "@canonical/react-components";
import { usePrevious } from "@canonical/react-components/dist/hooks";
import {
  Footer,
  generateLegacyURL,
  Header,
  navigateToLegacy,
} from "@maas-ui/maas-ui-shared";
import * as Sentry from "@sentry/browser";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory, useLocation } from "react-router-dom";

import "../scss/index.scss";

import Routes from "app/Routes";
import Login from "app/base/components/Login";
import Section from "app/base/components/Section";
import StatusBar from "app/base/components/StatusBar";
import FileContext, { fileContextStore } from "app/base/file-context";
import introURLs from "app/intro/urls";
import { actions as authActions } from "app/store/auth";
import authSelectors from "app/store/auth/selectors";
import { actions as configActions } from "app/store/config";
import configSelectors from "app/store/config/selectors";
import { actions as generalActions } from "app/store/general";
import { version as versionSelectors } from "app/store/general/selectors";
import { actions as statusActions } from "app/store/status";
import status from "app/store/status/selectors";
import { getCookie } from "app/utils";

declare global {
  interface Window {
    legacyWS: WebSocket;
  }
}

type LinkType = {
  label: ReactNode;
  url: string;
};

export const App = (): JSX.Element => {
  const history = useHistory();
  const location = useLocation();
  const authUser = useSelector(authSelectors.get);
  const authenticated = useSelector(status.authenticated);
  const authenticating = useSelector(status.authenticating);
  const connected = useSelector(status.connected);
  const connecting = useSelector(status.connecting);
  const connectionError = useSelector(status.error);
  const analyticsEnabled = useSelector(configSelectors.analyticsEnabled);
  const configLoaded = useSelector(configSelectors.loaded);
  const authLoading = useSelector(authSelectors.loading);
  const version = useSelector(versionSelectors.get);
  const uuid = useSelector(configSelectors.uuid);
  const completedIntro = useSelector(configSelectors.completedIntro);
  const dispatch = useDispatch();
  const debug = process.env.NODE_ENV === "development";
  const previousAuthenticated = usePrevious(authenticated, false);
  // the skipintro cookie is set by Cypress to make integration testing easier
  const skipIntro = getCookie("skipintro");
  const skipSetupIntro = getCookie("skipsetupintro");

  useEffect(() => {
    dispatch(statusActions.checkAuthenticated());
  }, [dispatch]);

  useEffect(() => {
    // When a user logs out the redux store is reset so the authentication
    // info needs to be fetched again to know if external auth is being used.
    if (previousAuthenticated && !authenticated) {
      dispatch(statusActions.checkAuthenticated());
    }
  }, [authenticated, dispatch, previousAuthenticated]);

  useEffect(() => {
    if (authenticated) {
      // Connect the websocket before anything else in the app can be done.
      dispatch(statusActions.websocketConnect());
    }
  }, [dispatch, authenticated]);

  useEffect(() => {
    if (connected) {
      dispatch(authActions.fetch());
      dispatch(generalActions.fetchVersion());
      // Fetch the config at the top so we can access the MAAS name for the
      // window title.
      dispatch(configActions.fetch());
    }
  }, [dispatch, connected]);

  // Redirect to the MAAS or user intro if not completed and not already on
  // an intro page.
  useEffect(() => {
    if (
      !skipIntro &&
      configLoaded &&
      !location.pathname.startsWith(introURLs.index)
    ) {
      if (configLoaded && !completedIntro && !skipSetupIntro) {
        history.push({ pathname: introURLs.index });
      } else if (authUser && !authUser.completed_intro) {
        history.push({ pathname: introURLs.user });
      }
    }
  }, [
    authUser,
    completedIntro,
    configLoaded,
    history,
    location,
    skipIntro,
    skipSetupIntro,
  ]);

  let content: JSX.Element;
  if (authLoading || connecting || authenticating) {
    content = (
      <Section
        header={
          <>
            <span className="p-heading--four"></span>
            <Spinner text="Loading..." />
          </>
        }
      />
    );
  } else if (!authenticated && !connectionError) {
    content = <Login />;
  } else if (connectionError || !connected) {
    content = (
      <Section header="Failed to connect.">
        <Notification type="negative" status="Error:">
          The server connection failed
          {connectionError ? ` with the error "${connectionError}"` : ""}.
        </Notification>
      </Section>
    );
  } else if (connected) {
    content = (
      <FileContext.Provider value={fileContextStore}>
        <Routes />
      </FileContext.Provider>
    );
  }

  if (analyticsEnabled && process.env.REACT_APP_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
    });
  }

  return (
    <div id="maas-ui">
      <Header
        appendNewBase={false}
        authUser={authUser}
        completedIntro={
          (completedIntro && authUser && authUser.completed_intro) ||
          !!skipIntro
        }
        debug={debug}
        enableAnalytics={analyticsEnabled as boolean}
        generateLegacyLink={(
          link: LinkType,
          linkClass: string,
          _appendNewBase: boolean
        ) => (
          <a
            className={linkClass}
            href={generateLegacyURL(link.url)}
            onClick={(evt) => {
              navigateToLegacy(link.url, evt);
            }}
          >
            {link.label}
          </a>
        )}
        generateNewLink={(
          link: LinkType,
          linkClass: string,
          _appendNewBase: boolean
        ) => (
          <Link className={linkClass} to={link.url}>
            {link.label}
          </Link>
        )}
        location={location}
        logout={() => {
          dispatch(statusActions.websocketDisconnect());
          dispatch(statusActions.logout());
          if (window.legacyWS) {
            window.legacyWS.close();
          }
        }}
        urlChange={history.listen}
        uuid={uuid as string}
        version={version}
      />
      {content}
      {version && (
        <Footer
          debug={debug}
          enableAnalytics={analyticsEnabled as boolean}
          version={version}
        />
      )}
      <StatusBar />
    </div>
  );
};

export default App;
