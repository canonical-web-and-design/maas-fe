import * as React from "react";
import ReactDOM from "react-dom";
import singleSpaReact from "single-spa-react";

import packageJson from "../package.json";
import rootComponent from "./index";

const reactLifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent,
  errorBoundary(err, info, props) {
    return (
      <div>
        <p>Unable to load MAAS.</p>
        <p>
          Please refresh your browser, and if the issue persists submit an issue
          at: <span>{packageJson.bugs}</span> with the following details:
        </p>
        <p>{err}</p>
        <p>{info}</p>
      </div>
    );
  },
});

export const { bootstrap } = reactLifecycles;
export const mount = (props) => {
  const { pathname, search, hash } = window.location;
  const location = pathname + search + hash;
  // The app should never reach this entrypoint without the basename and react
  // path set, but to prevent possible future problems this sets the path if
  // there isn't one already.
  const baseURL = `${process.env.REACT_APP_BASENAME}${process.env.REACT_APP_REACT_BASENAME}`;
  let currentURL = location.startsWith(baseURL) ? location : baseURL;
  // When the app is mounted there needs to be a history change so that
  // react-router updates with the new url. This is re-queried when navigating
  // between the new/legacy clients.
  window.history.replaceState(null, null, currentURL);
  return reactLifecycles.mount(props);
};
export const { unmount } = reactLifecycles;
