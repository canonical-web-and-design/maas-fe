import React from "react";
import { useSelector } from "react-redux";

import { formatBytes } from "app/utils";
import { pod as podSelectors } from "app/base/selectors";
import type { RootState } from "app/store/root/types";
import Meter from "app/base/components/Meter";

type Props = { id: number };

const RAMColumn = ({ id }: Props): JSX.Element | null => {
  const pod = useSelector((state: RootState) =>
    podSelectors.getById(state, id)
  );

  if (pod) {
    const availableMemory = formatBytes(
      pod.total.memory * pod.memory_over_commit_ratio,
      "MiB",
      { binary: true }
    );
    const assignedMemory = formatBytes(pod.used.memory, "MiB", {
      binary: true,
      convertTo: availableMemory.unit,
    });

    return (
      <Meter
        className="u-no-margin--bottom"
        data={[
          {
            key: `${pod.name}-memory-meter`,
            value: pod.used.memory,
          },
        ]}
        label={
          <small className="u-text--light">
            {`${assignedMemory.value} of ${availableMemory.value} ${availableMemory.unit} assigned`}
          </small>
        }
        labelClassName="u-align--right"
        max={pod.total.memory * pod.memory_over_commit_ratio}
        small
      />
    );
  }
  return null;
};

export default RAMColumn;
