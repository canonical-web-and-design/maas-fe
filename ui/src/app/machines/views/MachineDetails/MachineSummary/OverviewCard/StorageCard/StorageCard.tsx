import pluralize from "pluralize";

import TestResults from "../../TestResults";

import { HardwareType } from "app/base/enum";
import type { MachineSetSelectedAction } from "app/machines/views/types";
import type { MachineDetails } from "app/store/machine/types";

type Props = {
  machine: MachineDetails;
  setSelectedAction: MachineSetSelectedAction;
};

const StorageCard = ({ machine, setSelectedAction }: Props): JSX.Element => (
  <>
    <div className="overview-card__storage">
      <strong className="p-muted-heading">Storage</strong>
      <h4>
        <span>{machine.storage ? `${machine.storage} GB` : "Unknown"}</span>
        {machine.storage && machine.physical_disk_count ? (
          <small className="u-text--muted">
            &nbsp;over {pluralize("disk", machine.physical_disk_count, true)}
          </small>
        ) : null}
      </h4>
    </div>

    <TestResults
      machine={machine}
      hardwareType={HardwareType.Storage}
      setSelectedAction={setSelectedAction}
    />
  </>
);

export default StorageCard;
