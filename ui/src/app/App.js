import { Link, useHistory, useLocation } from "react-router-dom";
import { Spinner, Notification } from "@canonical/react-components";
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect } from "react";
import * as Sentry from "@sentry/browser";

import "../scss/index.scss";

import {
  auth as authActions,
  general as generalActions,
} from "app/base/actions";
import { getCookie } from "app/utils";
import { general as generalSelectors } from "app/base/selectors";
import { auth as authSelectors } from "app/base/selectors";
import { config as configActions } from "app/settings/actions";
import { config as configSelectors } from "app/settings/selectors";
import { Footer, Header } from "@maas-ui/maas-ui-shared";
import { status } from "app/base/selectors";
import { status as statusActions } from "app/base/actions";
import { websocket } from "./base/actions";
import Login from "app/base/components/Login";
import Routes from "app/Routes";
import Section from "app/base/components/Section";

export const App = () => {
  const history = useHistory();
  const location = useLocation();
  const authUser = useSelector(authSelectors.get);
  const authenticated = useSelector(status.authenticated);
  const authenticating = useSelector(status.authenticating);
  const connected = useSelector(status.connected);
  const connecting = useSelector(status.connecting);
  const connectionError = useSelector(status.error);
  const analyticsEnabled = useSelector(configSelectors.analyticsEnabled);
  const authLoading = useSelector(authSelectors.loading);
  const navigationOptions = useSelector(generalSelectors.navigationOptions.get);
  const version = useSelector(generalSelectors.version.get);
  const maasName = useSelector(configSelectors.maasName);
  const uuid = useSelector(configSelectors.uuid);
  const completedIntro = useSelector(configSelectors.completedIntro);
  const dispatch = useDispatch();
  const basename = process.env.REACT_APP_BASENAME;
  const debug = process.env.NODE_ENV === "development";

  useEffect(() => {
    // window.history.pushState events from *outside* of react
    // are not observeable by react-router, which watches the history
    // object for changes. To compensate for this, we manually push a route
    // to history when SingleSPA mounts the react app, otherwise react just
    // renders the last view when the app was unmounted.
    if (history) {
      window.addEventListener("popstate", (evt) => {
        if (evt.singleSpa) {
          const reactRoute =
            window.location.pathname.split("/")[2] ===
            process.env.REACT_APP_REACT_BASENAME.substr(1);
          if (reactRoute) {
            // Get path without basename, react basename
            const newRoute = window.location.pathname.split("/").slice(3);
            // get subPath e.g. 'settings' in '/MAAS/r/settings/configuration'
            const newSubpath = newRoute[0];
            const lastSubpath = history.location.pathname.split("/")[1];
            if (newSubpath !== lastSubpath) {
              history.replace(`/${newRoute}`);
            }
          }
        }
      });
    }
  }, [history]);

  useEffect(() => {
    dispatch(statusActions.checkAuthenticated());
  }, [dispatch]);

  useEffect(() => {
    if (authenticated) {
      // Connect the websocket before anything else in the app can be done.
      dispatch(websocket.connect());
    }
  }, [dispatch, authenticated]);

  useEffect(() => {
    if (connected) {
      dispatch(authActions.fetch());
      dispatch(generalActions.fetchVersion());
      dispatch(generalActions.fetchNavigationOptions());
      // Fetch the config at the top so we can access the MAAS name for the
      // window title.
      dispatch(configActions.fetch());
    }
  }, [dispatch, connected]);

  // the skipintro cookie is set by Cypress to make integration testing easier
  const skipIntro = getCookie("skipintro");
  if (!skipIntro) {
    // Explicitly check that completedIntro is false so that it doesn't redirect
    // if the config isn't defined yet.
    if (completedIntro === false) {
      window.history.pushState(
        null,
        null,
        `${basename}${process.env.REACT_APP_ANGULAR_BASENAME}/intro`
      );
    } else if (authUser && !authUser.completed_intro) {
      window.history.pushState(
        null,
        null,
        `${basename}${process.env.REACT_APP_ANGULAR_BASENAME}/intro/user`
      );
    }
  }

  let content;
  if (authLoading || connecting || authenticating) {
    content = (
      <Section
        title={
          <>
            <span className="p-heading--four"></span>
            <Spinner
              className="u-no-padding u-no-margin"
              inline
              text="Loading..."
            />
          </>
        }
      />
    );
  } else if (!authenticated && !connectionError) {
    content = <Login />;
  } else if (connectionError || !connected) {
    content = (
      <Section title="Failed to connect.">
        <Notification type="negative" status="Error:">
          The server connection failed
          {connectionError ? ` with the error "${connectionError}"` : ""}.
        </Notification>
      </Section>
    );
  } else if (connected) {
    content = <Routes />;
  }

  if (analyticsEnabled && process.env.REACT_APP_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
    });
  }

  return (
    <div id="maas-ui">
      <Header
        authUser={authUser}
        basename={process.env.REACT_APP_BASENAME}
        completedIntro={completedIntro && authUser && authUser.completed_intro}
        debug={debug}
        enableAnalytics={analyticsEnabled}
        generateLocalLink={(url, label, linkClass) => (
          <Link className={linkClass} to={url}>
            {label}
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
        showRSD={navigationOptions.rsd}
        urlChange={history.listen}
        uuid={uuid}
        version={version}
      />
      {content}
      {maasName && version && <Footer maasName={maasName} version={version} />}
    </div>
  );
};

export default App;
