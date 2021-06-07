import pluralize from "pluralize";

import TestResults from "../../TestResults";

import { HardwareType } from "app/base/enum";
import type { MachineSetSelectedAction } from "app/machines/views/types";
import type { MachineDetails } from "app/store/machine/types";

type Props = {
  machine: MachineDetails;
  setSelectedAction: MachineSetSelectedAction;
};

// Get the subtext for the CPU card. Only nodes commissioned after
// MAAS 2.4 will have the CPU speed.
const getCPUSubtext = (machine: MachineDetails) => {
  let text = "Unknown";

  if (machine.cpu_count) {
    text = pluralize("core", machine.cpu_count, true);
  }
  if (machine.cpu_speed) {
    const speedText =
      machine.cpu_speed > 1000
        ? `${machine.cpu_speed / 1000} GHz`
        : `${machine.cpu_speed} MHz`;
    text += `, ${speedText}`;
  }
  return text;
};

const CpuCard = ({ machine, setSelectedAction }: Props): JSX.Element => (
  <>
    <div className="overview-card__cpu">
      <div className="u-flex--between">
        <strong className="p-muted-heading">CPU</strong>
        <span>{machine.architecture}</span>
      </div>
      <h4 className="u-no-margin--bottom" data-test="cpu-subtext">
        {getCPUSubtext(machine)}
      </h4>
      <p className="p-text--muted">
        {machine.metadata.cpu_model || "Unknown model"}
      </p>
    </div>

    <TestResults
      machine={machine}
      hardwareType={HardwareType.CPU}
      setSelectedAction={setSelectedAction}
    />
  </>
);

export default CpuCard;
