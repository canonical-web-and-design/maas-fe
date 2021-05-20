import { Spinner, Strip } from "@canonical/react-components";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { Link } from "react-router-dom";

import AvailableStorageTable from "./AvailableStorageTable";
import CacheSetsTable from "./CacheSetsTable";
import ChangeStorageLayout from "./ChangeStorageLayout";
import DatastoresTable from "./DatastoresTable";
import FilesystemsTable from "./FilesystemsTable";
import UsedStorageTable from "./UsedStorageTable";

import { useSendAnalytics, useWindowTitle } from "app/base/hooks";
import type { RouteParams } from "app/base/types";
import settingsURLs from "app/settings/urls";
import machineSelectors from "app/store/machine/selectors";
import { StorageLayout } from "app/store/machine/types";
import {
  isCacheSet,
  isMachineDetails,
  useCanEditStorage,
} from "app/store/machine/utils";
import type { RootState } from "app/store/root/types";

const MachineStorage = (): JSX.Element => {
  const params = useParams<RouteParams>();
  const { id } = params;
  const sendAnalytics = useSendAnalytics();
  const machine = useSelector((state: RootState) =>
    machineSelectors.getById(state, id)
  );
  const canEditStorage = useCanEditStorage(machine);

  useWindowTitle(`${`${machine?.fqdn} ` || "Machine"} storage`);

  if (isMachineDetails(machine)) {
    const showDatastores =
      machine.detected_storage_layout === StorageLayout.VMFS6;
    const showCacheSets = machine.disks.some((disk) => isCacheSet(disk));

    return (
      <>
        {canEditStorage && <ChangeStorageLayout systemId={id} />}
        <Strip shallow>
          {showDatastores ? (
            <>
              <h4>Datastores</h4>
              <DatastoresTable canEditStorage={canEditStorage} systemId={id} />
            </>
          ) : (
            <>
              <h4>Filesystems</h4>
              <FilesystemsTable canEditStorage={canEditStorage} systemId={id} />
            </>
          )}
        </Strip>
        {showCacheSets && (
          <Strip shallow>
            <h4>Available cache sets</h4>
            <CacheSetsTable canEditStorage={canEditStorage} systemId={id} />
          </Strip>
        )}
        <Strip shallow>
          <h4>Available disks and partitions</h4>
          <AvailableStorageTable
            canEditStorage={canEditStorage}
            systemId={id}
          />
        </Strip>
        <Strip shallow>
          <h4>Used disks and partitions</h4>
          <UsedStorageTable systemId={id} />
        </Strip>
        <Strip shallow>
          <p>
            Learn more about deploying{" "}
            <a
              className="p-link--external"
              data-test="docs-footer-link"
              href="https://maas.io/docs/images"
              onClick={() =>
                sendAnalytics(
                  "Machine storage",
                  "Click link to MAAS docs",
                  "Windows"
                )
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              Windows
            </a>
          </p>
          <p>
            Change the default layout in{" "}
            <Link to={settingsURLs.storage}>Settings &rsaquo; Storage</Link>
          </p>
        </Strip>
      </>
    );
  }
  return <Spinner text="Loading..." />;
};

export default MachineStorage;
