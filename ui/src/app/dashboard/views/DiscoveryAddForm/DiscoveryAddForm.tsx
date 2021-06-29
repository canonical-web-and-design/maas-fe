import { useEffect, useState } from "react";

import { notificationTypes, Spinner } from "@canonical/react-components";
import { navigateToLegacy } from "@maas-ui/maas-ui-shared";
import { useDispatch, useSelector } from "react-redux";
import type { Dispatch } from "redux";
import * as Yup from "yup";

import DiscoveryAddFormFields from "./DiscoveryAddFormFields";
import { DeviceType } from "./types";
import type { DiscoveryAddValues } from "./types";

import FormikForm from "app/base/components/FormikForm";
import baseURLs from "app/base/urls";
import { actions as deviceActions } from "app/store/device";
import deviceSelectors from "app/store/device/selectors";
import type { CreateInterfaceParams } from "app/store/device/types";
import { DeviceIpAssignment, DeviceMeta } from "app/store/device/types";
import { actions as discoveryActions } from "app/store/discovery";
import type { Discovery } from "app/store/discovery/types";
import { actions as domainActions } from "app/store/domain";
import domainSelectors from "app/store/domain/selectors";
import { actions as machineActions } from "app/store/machine";
import machineSelectors from "app/store/machine/selectors";
import { actions as messageActions } from "app/store/message";
import type { RootState } from "app/store/root/types";
import { actions as subnetActions } from "app/store/subnet";
import subnetSelectors from "app/store/subnet/selectors";
import { actions as vlanActions } from "app/store/vlan";
import vlanSelectors from "app/store/vlan/selectors";
import { preparePayload } from "app/utils";

type Props = {
  discovery: Discovery;
  onClose: () => void;
};

const formSubmit = (
  dispatch: Dispatch,
  discovery: Discovery,
  values: DiscoveryAddValues
) => {
  // Clear the errors from the previous submission.
  dispatch(discoveryActions.cleanup());
  if (values.type === DeviceType.DEVICE) {
    if (!discovery.ip || !discovery.mac_address || !discovery.subnet) {
      return;
    }
    dispatch(
      deviceActions.create({
        domain: { name: values.domain },
        extra_macs: [],
        hostname: values.hostname,
        interfaces: [
          {
            ip_address: discovery.ip,
            ip_assignment: values.ip_assignment,
            mac: discovery.mac_address,
            subnet: discovery.subnet,
          },
        ],
        parent: values.parent || "",
        primary_mac: discovery.mac_address,
      })
    );
  } else {
    dispatch(
      deviceActions.createInterface(
        preparePayload(
          {
            [DeviceMeta.PK]: values.system_id,
            ip_address: discovery.ip,
            ip_assignment: values.ip_assignment,
            mac_address: discovery.mac_address,
            name: values.hostname,
            subnet: discovery.subnet,
            vlan: discovery.vlan,
          },
          [],
          [],
          true
        ) as CreateInterfaceParams
      )
    );
  }
};

const setRedirectURL = (
  values: DiscoveryAddValues,
  setRedirect: (redirect: string | null) => void
) => {
  setRedirect(
    values.parent ? baseURLs.device({ id: values.parent }) : baseURLs.devices
  );
};

const DiscoveryAddSchema = Yup.object().shape({
  [DeviceMeta.PK]: Yup.string().when("type", {
    is: DeviceType.INTERFACE,
    then: Yup.string().required(
      "A device is required when adding an interface."
    ),
  }),
  domain: Yup.string(),
  hostname: Yup.string(),
  ip_assignment: Yup.string(),
  parent: Yup.string(),
  type: Yup.string(),
});

const DiscoveryAddForm = ({ discovery, onClose }: Props): JSX.Element => {
  const dispatch = useDispatch();
  const [redirect, setRedirect] = useState<string | null>(null);
  const devicesLoaded = useSelector(deviceSelectors.loaded);
  const defaultDomain = useSelector(domainSelectors.getDefault);
  let hostname = discovery.hostname;
  let domainName: string | null = null;
  if (hostname?.includes(".")) {
    [hostname, domainName] = hostname.split(".");
  }
  const domainByName = useSelector((state: RootState) =>
    domainSelectors.getByName(state, domainName)
  );
  const domainsLoaded = useSelector(domainSelectors.loaded);
  let errors = useSelector(deviceSelectors.errors);
  const machinesLoaded = useSelector(machineSelectors.loaded);
  const saved = useSelector(deviceSelectors.saved);
  const saving = useSelector(deviceSelectors.saving);
  const subnetsLoaded = useSelector(subnetSelectors.loaded);
  const vlansLoaded = useSelector(vlanSelectors.loaded);

  useEffect(() => {
    dispatch(deviceActions.fetch());
    dispatch(domainActions.fetch());
    dispatch(machineActions.fetch());
    dispatch(subnetActions.fetch());
    dispatch(vlanActions.fetch());
  }, [dispatch]);

  if (
    !devicesLoaded ||
    !domainsLoaded ||
    !machinesLoaded ||
    !subnetsLoaded ||
    !vlansLoaded
  ) {
    return <Spinner />;
  }

  // When creating an interface the error will get returned for "name" but this
  // form uses "hostname" for the field name.
  if (errors && typeof errors === "object" && "name" in errors) {
    errors = { ...errors, hostname: errors["name"] };
    delete errors["name"];
  }

  return (
    <FormikForm<DiscoveryAddValues>
      initialValues={{
        [DeviceMeta.PK]: "",
        domain: (domainByName || defaultDomain)?.name || "",
        hostname: hostname || "",
        ip_assignment: DeviceIpAssignment.DYNAMIC,
        parent: "",
        type: DeviceType.DEVICE,
      }}
      allowUnchanged
      className="u-width--full"
      cleanup={discoveryActions.cleanup}
      errors={errors}
      onSaveAnalytics={{
        action: "Add discovery",
        category: "Dashboard",
        label: "Add discovery form",
      }}
      onCancel={onClose}
      onSubmit={(values) => {
        // The normal submit button should not redirect anywhere.
        setRedirect(null);
        formSubmit(dispatch, discovery, values);
      }}
      onSuccess={(values) => {
        // Refetch the discoveries so that this discovery will get removed
        // from the list.
        dispatch(discoveryActions.fetch());
        if (redirect) {
          navigateToLegacy(redirect);
        } else {
          onClose();
          let device: string;
          if (values.hostname) {
            device = values.hostname;
          } else if (values.type === DeviceType.INTERFACE) {
            device = `An ${values.type}`;
          } else {
            device = `A ${values.type}`;
          }
          dispatch(
            messageActions.add(
              `${device} has been added.`,
              notificationTypes.POSITIVE
            )
          );
        }
      }}
      saved={saved}
      saving={saving}
      secondarySubmit={(values) => {
        // The secondary submit should redirect to the device/devices.
        setRedirectURL(values, setRedirect);
        formSubmit(dispatch, discovery, values);
      }}
      secondarySubmitLabel={(values) =>
        values.parent
          ? "Save and go to machine details"
          : "Save and go to device listing"
      }
      submitLabel="Save"
      validationSchema={DiscoveryAddSchema}
    >
      <DiscoveryAddFormFields discovery={discovery} />
    </FormikForm>
  );
};

export default DiscoveryAddForm;
