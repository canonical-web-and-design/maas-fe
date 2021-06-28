import { useCallback } from "react";

import {
  Link,
  Notification,
  notificationTypes,
} from "@canonical/react-components";
import { useDispatch, useSelector } from "react-redux";

import FormikForm from "app/base/components/FormikForm";
import type { EmptyObject } from "app/base/types";
import configSelectors from "app/store/config/selectors";
import { NetworkDiscovery } from "app/store/config/types";
import { actions as discoveryActions } from "app/store/discovery";
import discoverySelectors from "app/store/discovery/selectors";
import { actions as messageActions } from "app/store/message";

type Props = {
  closeForm: () => void;
};

const ClearAllForm = ({ closeForm }: Props): JSX.Element => {
  const dispatch = useDispatch();
  const errors = useSelector(discoverySelectors.errors);
  const saved = useSelector(discoverySelectors.saved);
  const saving = useSelector(discoverySelectors.saving);
  const networkDiscovery = useSelector(configSelectors.networkDiscovery);
  const cleanup = useCallback(() => discoveryActions.cleanup(), []);
  let content: JSX.Element;
  if (networkDiscovery === NetworkDiscovery.ENABLED) {
    content = (
      <>
        <p data-test="enabled-message">
          MAAS will use passive techniques (such as listening to ARP requests
          and mDNS advertisements) to observe networks attached to rack
          controllers.
          <br />
          If active subnet mapping is enabled on the configured subnets, MAAS
          will actively scan them and ensure discovery information is accurate
          and complete.
        </p>
        <p>
          Learn more about{" "}
          <Link external href="https://maas.io/docs/network-discovery">
            network discovery
          </Link>
          .
        </p>
      </>
    );
  } else {
    content = (
      <p data-test="disabled-message">
        Network discovery is disabled. The list of discovered items will not be
        repopulated.
      </p>
    );
  }
  return (
    <FormikForm<EmptyObject>
      buttonsBordered={false}
      cleanup={cleanup}
      errors={errors}
      initialValues={{}}
      onCancel={closeForm}
      onSaveAnalytics={{
        action: "Network discovery",
        category: "Clear network discoveries",
        label: "Clear network discoveries button",
      }}
      onSubmit={() => {
        dispatch(cleanup());
        dispatch(discoveryActions.clear());
      }}
      onSuccess={() => {
        dispatch(
          messageActions.add(
            "All discoveries cleared.",
            notificationTypes.INFORMATION
          )
        );
        closeForm();
      }}
      saving={saving}
      saved={saved}
      submitLabel="Clear all discoveries"
      secondarySubmitLabel="Save and add another"
    >
      <Notification type={notificationTypes.CAUTION} status="Warning:">
        Clearing all discoveries will remove all items from the list below.
      </Notification>
      {content}
    </FormikForm>
  );
};

export default ClearAllForm;
