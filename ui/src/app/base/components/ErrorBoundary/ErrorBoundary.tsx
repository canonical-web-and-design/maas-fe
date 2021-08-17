import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";

import * as Sentry from "@sentry/browser";
import { connect } from "react-redux";

import configSelectors from "app/store/config/selectors";
import { version as versionSelectors } from "app/store/general/selectors";
import type { RootState } from "app/store/root/types";

type Props = {
  analyticsEnabled?: boolean | null;
  children?: ReactNode;
  maasVersion?: string;
};

type State = {
  eventId: string | null;
  hasError: boolean;
};

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, eventId: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { analyticsEnabled, maasVersion } = this.props;

    if (analyticsEnabled) {
      Sentry.withScope((scope) => {
        scope.setExtras({ ...errorInfo, maasVersion });
        scope.setTag("maas.version", maasVersion);
        const eventId = Sentry.captureException(error);
        this.setState({ eventId });
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-notification--negative">
          <p className="p-notification__response u-no-max-width">
            <span className="p-notification__status">Error:</span> An unexpected
            error has occurred, please try refreshing your browser window.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
const mapStateToProps = (state: RootState) => ({
  analyticsEnabled: configSelectors.analyticsEnabled(state),
  maasVersion: versionSelectors.get(state),
});

export default connect(mapStateToProps)(ErrorBoundary);
