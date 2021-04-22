import DoughnutChart from "app/base/components/DoughnutChart";
import { COLOURS } from "app/base/constants";
import { memoryWithUnit } from "app/kvm/utils";
import type { Pod, PodMemoryResource } from "app/store/pod/types";
import { resourceWithOverCommit } from "app/store/pod/utils";

type Props = {
  memory: PodMemoryResource;
  overCommit: Pod["memory_over_commit_ratio"];
};

const OverallRam = ({ memory, overCommit }: Props): JSX.Element => {
  const general = resourceWithOverCommit(memory.general, overCommit);
  const hugepages = memory.hugepages;
  const projectMemory = general.allocated_tracked + hugepages.allocated_tracked;
  const otherMemory = general.allocated_other + hugepages.allocated_other;
  const freeMemory = general.free + hugepages.free;
  const totalMemory = projectMemory + otherMemory + freeMemory;
  const overCommitted = general.free < 0 || hugepages.free < 0;

  return (
    <div className="overall-ram">
      <div className="overall-ram__chart-container">
        <h4 className="p-heading--small">RAM</h4>
        <DoughnutChart
          className="overall-ram__chart"
          label={memoryWithUnit(totalMemory)}
          segmentHoverWidth={18}
          segmentWidth={15}
          segments={
            overCommitted
              ? [
                  {
                    color: COLOURS.CAUTION,
                    value: 1,
                  },
                ]
              : [
                  {
                    color: COLOURS.POSITIVE,
                    tooltip: `Project ${memoryWithUnit(projectMemory)}`,
                    value: projectMemory,
                  },
                  {
                    color: COLOURS.LINK,
                    tooltip: `Others ${memoryWithUnit(otherMemory)}`,
                    value: otherMemory,
                  },
                  {
                    color: COLOURS.LINK_FADED,
                    tooltip: `Free ${memoryWithUnit(freeMemory)}`,
                    value: freeMemory,
                  },
                ]
          }
          size={96}
        />
      </div>
      <table className="overall-ram__table">
        <thead>
          <tr>
            <th></th>
            <th className="u-align--right u-text--light">
              <span className="u-nudge-left">Allocated</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Project</td>
            <td className="u-align--right">
              {memoryWithUnit(projectMemory)}
              <span className="u-nudge-right--small">
                <i className="p-circle--positive"></i>
              </span>
            </td>
          </tr>
          <tr>
            <td>Others</td>
            <td className="u-align--right">
              {memoryWithUnit(otherMemory)}
              <span className="u-nudge-right--small">
                <i className="p-circle--link"></i>
              </span>
            </td>
          </tr>
          <tr>
            <td>Free</td>
            <td className="u-align--right">
              {memoryWithUnit(freeMemory)}
              <span className="u-nudge-right--small">
                <i className="p-circle--link-faded"></i>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default OverallRam;
