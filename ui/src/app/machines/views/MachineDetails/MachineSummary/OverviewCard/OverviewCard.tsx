import { Card, Spinner } from "@canonical/react-components";
import { useSelector } from "react-redux";

import CpuCard from "./CpuCard";
import DetailsCard from "./DetailsCard";
import MemoryCard from "./MemoryCard";
import StatusCard from "./StatusCard";
import StorageCard from "./StorageCard";

import type { MachineSetSelectedAction } from "app/machines/views/types";
import machineSelectors from "app/store/machine/selectors";
import type { Machine } from "app/store/machine/types";
import { isMachineDetails } from "app/store/machine/utils";
import type { RootState } from "app/store/root/types";

type Props = {
  id: Machine["system_id"];
  setSelectedAction: MachineSetSelectedAction;
};

const OverviewCard = ({ id, setSelectedAction }: Props): JSX.Element => {
  const machine = useSelector((state: RootState) =>
    machineSelectors.getById(state, id)
  );

  let content: JSX.Element;

  // Confirm that the full machine details have been fetched. This also allows
  // TypeScript know we're using the right union type (otherwise it will
  // complain that metadata doesn't exist on the base machine type).
  if (!isMachineDetails(machine)) {
    content = (
      <div className="overview-card__placeholder">
        <Spinner />
      </div>
    );
  } else {
    content = (
      <div className="overview-card">
        <StatusCard machine={machine} />
        <CpuCard machine={machine} setSelectedAction={setSelectedAction} />
        <MemoryCard machine={machine} setSelectedAction={setSelectedAction} />
        <StorageCard machine={machine} setSelectedAction={setSelectedAction} />
        <DetailsCard machine={machine} />
      </div>
    );
  }

  return <Card className="machine-summary__overview-card">{content}</Card>;
};

export default OverviewCard;
