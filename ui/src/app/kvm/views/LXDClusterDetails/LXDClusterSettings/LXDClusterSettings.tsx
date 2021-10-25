import { Strip } from "@canonical/react-components";

import type { VMCluster } from "app/store/vmcluster/types";

type Props = {
  clusterId: VMCluster["id"];
};

const LXDClusterSettings = ({ clusterId }: Props): JSX.Element => {
  return (
    <Strip className="u-no-padding--top" shallow>
      <h4>LXD cluster {clusterId} settings</h4>
    </Strip>
  );
};

export default LXDClusterSettings;
