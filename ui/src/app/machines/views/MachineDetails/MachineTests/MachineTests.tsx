import { useEffect } from "react";

import { Spinner } from "@canonical/react-components";
import { usePrevious } from "@canonical/react-components/dist/hooks";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";

import MachineTestsTable from "./MachineTestsTable";

import { HardwareType } from "app/base/enum";
import { useWindowTitle } from "app/base/hooks";
import type { RouteParams } from "app/base/types";
import machineSelectors from "app/store/machine/selectors";
import type { RootState } from "app/store/root/types";
import { actions as scriptResultActions } from "app/store/scriptresult";
import scriptResultSelectors from "app/store/scriptresult/selectors";
import type { ScriptResult } from "app/store/scriptresult/types";

/**
 * Group items by key
 * @param results a node results list
 * @param key
 */
const groupByKey = <I,>(items: I[], key: keyof I): { [x: string]: I[] } =>
  items.reduce((obj, item) => {
    obj[item[key]] = obj[item[key]] || [];
    obj[item[key]].push(item);
    return obj;
  }, Object.create(null));

const MachineTests = (): JSX.Element => {
  const dispatch = useDispatch();
  const params = useParams<RouteParams>();
  const { id } = params;

  const machine = useSelector((state: RootState) =>
    machineSelectors.getById(state, id)
  );
  const previousTestingStatus = usePrevious(
    machine?.testing_status.status,
    true
  );
  useWindowTitle(`${machine?.fqdn || "Machine"} tests`);

  const scriptResults = useSelector((state: RootState) =>
    scriptResultSelectors.getByMachineId(state, id)
  );

  const hardwareResults = useSelector((state: RootState) =>
    scriptResultSelectors.getHardwareTestingByMachineId(state, id)
  );

  const storageResults = useSelector((state: RootState) =>
    scriptResultSelectors.getStorageTestingByMachineId(state, id)
  );

  const otherResults = useSelector((state: RootState) =>
    scriptResultSelectors.getOtherTestingByMachineId(state, id)
  );

  const loading = useSelector(scriptResultSelectors.loading);

  useEffect(() => {
    if (
      !loading &&
      (!scriptResults?.length ||
        // Refetch the script results when the testing status changes, otherwise
        // the new script results won't be associated with the machine.
        previousTestingStatus !== machine?.testing_status.status)
    ) {
      dispatch(scriptResultActions.getByMachineId(id));
    }
  }, [dispatch, previousTestingStatus, scriptResults, loading, machine, id]);

  if (scriptResults?.length) {
    return (
      <div>
        {hardwareResults?.length && hardwareResults.length > 0
          ? Object.entries(groupByKey(hardwareResults, "hardware_type")).map(
              ([hardware_type, scriptResults]: [string, ScriptResult[]]) => {
                let title: string | null = null;
                if (scriptResults[0].hardware_type === HardwareType.Network) {
                  const { mac_address, name } =
                    scriptResults[0]?.parameters?.interface?.value || {};
                  if (name && mac_address) {
                    title = `${name} (${mac_address})`;
                  } else {
                    title = name || null;
                  }
                }
                return (
                  <div key={hardware_type}>
                    <h4 data-test="hardware-heading">
                      {HardwareType[parseInt(hardware_type, 0)]}
                    </h4>
                    {title && (
                      <h5 data-test="hardware-device-heading">{title}</h5>
                    )}
                    <MachineTestsTable
                      machineId={id}
                      scriptResults={scriptResults}
                    />
                  </div>
                );
              }
            )
          : null}
        {storageResults?.length && storageResults.length > 0 ? (
          <>
            <h4 data-test="hardware-heading">Storage</h4>
            {Object.entries(
              groupByKey(storageResults, "physical_blockdevice")
            ).map(
              ([physical_blockdevice, scriptResults]: [
                string,
                ScriptResult[]
              ]) => {
                const { model, name, serial } =
                  scriptResults[0]?.parameters?.storage?.value || {};
                let title = name ? `/dev/${name}` : null;
                if (name && (model || serial)) {
                  const additional = [`model: ${model}`, `serial: ${serial}`]
                    .filter(Boolean)
                    .join(", ");
                  title = `${title} (${additional})`;
                }
                return (
                  <div key={physical_blockdevice}>
                    {title && <h5 data-test="storage-heading">{title}</h5>}
                    <MachineTestsTable
                      machineId={id}
                      scriptResults={scriptResults}
                    />
                  </div>
                );
              }
            )}
          </>
        ) : null}
        {otherResults?.length && otherResults.length > 0 ? (
          <>
            <h4 data-test="hardware-heading">Other Results</h4>
            {Object.entries(groupByKey(otherResults, "hardware_type")).map(
              ([hardware_type, scriptResults]: [string, ScriptResult[]]) => {
                return (
                  <div key={hardware_type}>
                    <MachineTestsTable
                      machineId={id}
                      scriptResults={scriptResults}
                    />
                  </div>
                );
              }
            )}
          </>
        ) : null}
      </div>
    );
  }
  return <Spinner text="Loading..." />;
};

export default MachineTests;
