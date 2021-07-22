import { useEffect, useState } from "react";

import {
  ActionButton,
  Button,
  Card,
  Icon,
  Notification,
  Spinner,
} from "@canonical/react-components";
import { useDispatch, useSelector } from "react-redux";
import { Redirect } from "react-router";

import SSHKeyForm from "app/base/components/SSHKeyForm";
import SSHKeyList from "app/base/components/SSHKeyList";
import Section from "app/base/components/Section";
import TableConfirm from "app/base/components/TableConfirm";
import { useCycled, useWindowTitle } from "app/base/hooks";
import dashboardURLs from "app/dashboard/urls";
import machineURLs from "app/machines/urls";
import authSelectors from "app/store/auth/selectors";
import { actions as sshkeyActions } from "app/store/sshkey";
import sshkeySelectors from "app/store/sshkey/selectors";
import { actions as userActions } from "app/store/user";
import userSelectors from "app/store/user/selectors";
import { formatErrors } from "app/utils";

const UserIntro = (): JSX.Element => {
  const dispatch = useDispatch();
  const [showSkip, setShowSkip] = useState(false);
  const authLoading = useSelector(authSelectors.loading);
  const authUser = useSelector(authSelectors.get);
  const sshkeys = useSelector(sshkeySelectors.all);
  const sshkeyLoading = useSelector(sshkeySelectors.loading);
  const markingIntroComplete = useSelector(userSelectors.markingIntroComplete);
  const [markedIntroComplete] = useCycled(!markingIntroComplete);
  const errors = useSelector(userSelectors.markingIntroCompleteErrors);
  const hasSSHKeys = sshkeys.length > 0;
  const errorMessage = formatErrors(errors);

  useWindowTitle("Welcome - User");

  useEffect(() => {
    dispatch(sshkeyActions.fetch());
  }, [dispatch]);

  if (authLoading || sshkeyLoading) {
    return <Spinner />;
  }

  if (authUser?.completed_intro || markedIntroComplete) {
    return (
      <Redirect
        to={
          authUser?.is_superuser
            ? dashboardURLs.index
            : machineURLs.machines.index
        }
      />
    );
  }

  return (
    <Section>
      {errorMessage && (
        <Notification type="negative" status="Error:">
          {errorMessage}
        </Notification>
      )}
      <Card
        data-test="sshkey-card"
        highlighted
        title={
          <span className="p-heading--4">
            <Icon name={hasSSHKeys ? "success" : "success-grey"} />
            &ensp;SSH keys for {authUser?.username}
          </span>
        }
      >
        <p>
          Add multiple keys from Launchpad and Github or enter them manually.
        </p>
        <h4>Keys</h4>
        {hasSSHKeys ? <SSHKeyList sidebar={false} /> : null}
        <SSHKeyForm
          onSaveAnalytics={{
            action: "Import",
            category: "User intro",
            label: "Import SSH key form",
          }}
          resetOnSave
        />
      </Card>
      <div className="u-align--right">
        <Button
          appearance="neutral"
          data-test="skip-button"
          onClick={() => {
            setShowSkip(true);
          }}
        >
          Skip user setup
        </Button>
        <ActionButton
          appearance="positive"
          data-test="continue-button"
          disabled={!hasSSHKeys}
          loading={markingIntroComplete && !showSkip}
          onClick={() => {
            dispatch(userActions.markIntroComplete());
          }}
          success={markedIntroComplete}
        >
          Finish setup
        </ActionButton>
      </div>
      {showSkip && (
        <Card data-test="skip-setup" highlighted>
          <TableConfirm
            confirmLabel="Skip user setup"
            errors={errors}
            finished={markedIntroComplete}
            inProgress={markingIntroComplete && showSkip}
            message={
              <>
                <Icon className="is-inline" name="warning" />
                Are you sure you want to skip your user setup? You will still be
                able to manage your SSH keys in your user preferences.
              </>
            }
            onClose={() => setShowSkip(false)}
            onConfirm={() => {
              dispatch(userActions.markIntroComplete());
            }}
            sidebar={false}
          />
        </Card>
      )}
    </Section>
  );
};

export default UserIntro;
