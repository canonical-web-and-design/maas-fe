import { useCallback } from "react";

import type { ValueOf } from "@canonical/react-components";

import AddDeviceForm from "./AddDeviceForm";
import DeviceActionFormWrapper from "./DeviceActionFormWrapper";

import type { DeviceActionHeaderViews } from "app/devices/constants";
import { DeviceHeaderViews } from "app/devices/constants";
import type {
  DeviceSidePanelContent,
  DeviceSetSidePanelContent,
} from "app/devices/types";
import type { Device } from "app/store/device/types";

type Props = {
  devices: Device[];
  sidePanelContent: DeviceSidePanelContent;
  setSidePanelContent: DeviceSetSidePanelContent;
  viewingDetails?: boolean;
};

const DeviceHeaderForms = ({
  devices,
  sidePanelContent,
  setSidePanelContent,
  viewingDetails = false,
}: Props): JSX.Element | null => {
  const clearSidePanelContent = useCallback(
    () => setSidePanelContent(null),
    [setSidePanelContent]
  );

  switch (sidePanelContent.view) {
    case DeviceHeaderViews.ADD_DEVICE:
      return <AddDeviceForm clearSidePanelContent={clearSidePanelContent} />;
    default:
      // We need to explicitly cast sidePanelContent.view here - TypeScript doesn't
      // seem to be able to infer remaining object tuple values as with string
      // values.
      // https://github.com/canonical/maas-ui/issues/3040
      const { view } = sidePanelContent as {
        view: ValueOf<typeof DeviceActionHeaderViews>;
      };
      const [, action] = view;
      return (
        <DeviceActionFormWrapper
          action={action}
          clearSidePanelContent={clearSidePanelContent}
          devices={devices}
          viewingDetails={viewingDetails}
        />
      );
  }
};

export default DeviceHeaderForms;
