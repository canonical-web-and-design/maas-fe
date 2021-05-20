import { ContextualMenu } from "@canonical/react-components";
import { Link } from "react-router-dom";

import machineURLs from "app/machines/urls";

type Props = {
  disabled?: boolean;
};

export const AddHardwareMenu = ({ disabled = false }: Props): JSX.Element => {
  return (
    <ContextualMenu
      data-test="add-hardware-dropdown"
      hasToggleIcon
      links={[
        {
          children: "Machine",
          element: Link,
          to: machineURLs.machines.add,
        },
        {
          children: "Chassis",
          element: Link,
          to: machineURLs.machines.chassis.add,
        },
      ]}
      position="right"
      toggleAppearance="neutral"
      toggleDisabled={disabled}
      toggleLabel="Add hardware"
    />
  );
};

export default AddHardwareMenu;
