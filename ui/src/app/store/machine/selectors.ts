import { createSelector, Selector } from "@reduxjs/toolkit";

import { ACTIONS } from "app/base/reducers/machine/machine";
import filterNodes from "app/machines/filter-nodes";
import scriptresults from "app/store/scriptresults/selectors";
import type {
  Machine,
  MachineStatus,
  MachineStatuses,
} from "app/store/machine/types";
import type { RootState } from "app/store/root/types";
import type { ScriptResults } from "app/store/scriptresults/types";
import type { TSFixMe } from "app/base/types";

/**
 * Returns all machines.
 * @param {RootState} state - The redux state.
 * @returns {Machine[]} A list of all machines.
 */
const all = (state: RootState): Machine[] => state.machine.items;

/**
 * Whether machines are loading.
 * @param {RootState} state - The redux state.
 * @returns {MachineState["loading"]} Machines loading state.
 */
const loading = (state: RootState): boolean => state.machine.loading;

/**
 * Whether machines have been loaded.
 * @param {RootState} state - The redux state.
 * @returns {MachineState["loaded"]} Machines loaded state.
 */
const loaded = (state: RootState): boolean => state.machine.loaded;

/**
 * Get the machine saving state.
 * @param {RootState} state - The redux state.
 * @returns {MachineState["saving"]} Whether machines are being saved.
 */
const saving = (state: RootState): boolean => state.machine.saving;

/**
 * Get the machine saved state.
 * @param {RootState} state - The redux state.
 * @returns {MachineState["saved"]} Whether machines have been saved.
 */
const saved = (state: RootState): boolean => state.machine.saved;

/**
 * Returns machine errors.
 * @param {RootState} state - The redux state.
 * @returns {MachineState["errors"]} Machine errors state.
 */
const errors = (state: RootState): TSFixMe => state.machine.errors;

/**
 * Returns selected machine system_ids.
 * @param {RootState} state - The redux state.
 * @returns {Machine["system_id"][]} Selected machine system_ids.
 */
const selectedIDs = (state: RootState): Machine["system_id"][] =>
  state.machine.selected;

/**
 * Returns all machine statuses.
 * @param {RootState} state - The redux state.
 * @returns {MachineStatuses} A list of all statuses.
 */
const statuses = (state: RootState): MachineStatuses => state.machine.statuses;

const statusKeys = <T>(statuses: T): (keyof T)[] =>
  Object.keys(statuses) as (keyof T)[];

/**
 * Returns IDs of machines that are currently being processed.
 * @param {RootState} state - The redux state.
 * @returns {Machine["system_id"][]} List of machines being processed.
 */
const processing = (state: RootState): Machine["system_id"][] =>
  Object.keys(state.machine.statuses).filter((machineID) =>
    statusKeys(state.machine.statuses[machineID]).some(
      (status) => state.machine.statuses[machineID][status] === true
    )
  );

/**
 * Returns IDs of machines that are both selected and currently being processed.
 * @param {RootState} state - The redux state.
 * @returns {Machine["system_id"][]} List of selected machines being processed.
 */
const selectedProcessing = createSelector(
  [selectedIDs, processing],
  (selectedIDs, processing) =>
    processing.filter((id) => selectedIDs.includes(id))
);

const statusSelectors: { [x: string]: Selector<RootState, Machine[]> } = {};

// Create a selector for each machine status.
ACTIONS.forEach(({ status }) => {
  statusSelectors[status] = createSelector(
    [all, statuses],
    (machines, statuses) =>
      machines.filter(
        ({ system_id }) => statuses[system_id][status as keyof MachineStatus]
      )
  );
});

// Create a selector for selected machines in each machine status.
ACTIONS.forEach(({ status }) => {
  statusSelectors[`${status}Selected`] = createSelector(
    [statusSelectors[status], selectedIDs],
    (machines: Machine[], selectedIDs) =>
      machines.filter(({ system_id }) => selectedIDs.includes(system_id))
  );
});

/**
 * Returns a machine for the given id.
 * @param {RootState} state - The redux state.
 * @returns {Machine} A machine.
 */
const getBySystemId = createSelector(
  [all, (_state: RootState, id: Machine["system_id"]) => id],
  (machines, id) => machines.find(({ system_id }) => system_id === id)
);

/**
 * Get machines that match terms.
 * @param {RootState} state - The redux state.
 * @param {String} terms - The terms to match against.
 * @returns {Machine[]} A filtered list of machines.
 */
const search = createSelector(
  [
    all,
    (_state: RootState, terms: string, selectedIDs: Machine["system_id"]) => ({
      terms,
      selectedIDs,
    }),
  ],
  (items, { terms, selectedIDs }) => {
    if (!terms) {
      return items;
    }
    return filterNodes(items, terms, selectedIDs);
  }
);

/**
 * Returns selected machines.
 * @param {RootState} state - The redux state.
 * @returns {Machine[]} Selected machines.
 */
const selected = createSelector([all, selectedIDs], (machines, selectedIDs) =>
  selectedIDs.map((id) => machines.find((machine) => id === machine.system_id))
);

/**
 * Returns failed script results for selected machines.
 * @param {RootState} state - The redux state.
 * @returns {ScriptResults} Script results by selected machine key.
 */
const failedScriptResults = createSelector(
  [scriptresults.all, selectedIDs],
  (scriptresults, selectedIDs) =>
    Object.keys(scriptresults)
      .filter((key) => selectedIDs.includes(key))
      .reduce<ScriptResults>((obj, key) => {
        obj[key] = scriptresults[key];
        return obj;
      }, {})
);

const machine = {
  aborting: statusSelectors["aborting"],
  abortingSelected: statusSelectors["abortingSelected"],
  acquiring: statusSelectors["acquiring"],
  acquiringSelected: statusSelectors["acquiringSelected"],
  all,
  checkingPower: statusSelectors["checkingPower"],
  checkingPowerSelected: statusSelectors["checkingPowerSelected"],
  commissioning: statusSelectors["commissioning"],
  commissioningSelected: statusSelectors["commissioningSelected"],
  deleting: statusSelectors["deleting"],
  deletingSelected: statusSelectors["deletingSelected"],
  deploying: statusSelectors["deploying"],
  deployingSelected: statusSelectors["deployingSelected"],
  enteringRescueMode: statusSelectors["enteringRescueMode"],
  enteringRescueModeSelected: statusSelectors["enteringRescueModeSelected"],
  errors,
  exitingRescueMode: statusSelectors["exitingRescueMode"],
  exitingRescueModeSelected: statusSelectors["exitingRescueModeSelected"],
  failedScriptResults,
  getBySystemId,
  loaded,
  loading,
  locking: statusSelectors["locking"],
  lockingSelected: statusSelectors["lockingSelected"],
  markingBroken: statusSelectors["markingBroken"],
  markingBrokenSelected: statusSelectors["markingBrokenSelected"],
  markingFixed: statusSelectors["markingFixed"],
  markingFixedSelected: statusSelectors["markingFixedSelected"],
  overridingFailedTesting: statusSelectors["overridingFailedTesting"],
  overridingFailedTestingSelected:
    statusSelectors["overridingFailedTestingSelected"],
  processing,
  releasing: statusSelectors["releasing"],
  releasingSelected: statusSelectors["releasingSelected"],
  saved,
  saving,
  search,
  selected,
  selectedIDs,
  selectedProcessing,
  settingPool: statusSelectors["settingPool"],
  settingPoolSelected: statusSelectors["settingPoolSelected"],
  settingZone: statusSelectors["settingZone"],
  settingZoneSelected: statusSelectors["settingZoneSelected"],
  statuses,
  tagging: statusSelectors["tagging"],
  taggingSelected: statusSelectors["taggingSelected"],
  testing: statusSelectors["testing"],
  testingSelected: statusSelectors["testingSelected"],
  turningOff: statusSelectors["turningOff"],
  turningOffSelected: statusSelectors["turningOffSelected"],
  turningOn: statusSelectors["turningOn"],
  turningOnSelected: statusSelectors["turningOnSelected"],
  unlocking: statusSelectors["unlocking"],
  unlockingSelected: statusSelectors["unlockingSelected"],
};

export default machine;
