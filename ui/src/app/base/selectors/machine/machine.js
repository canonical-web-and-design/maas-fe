import { createSelector } from "reselect";

import filterNodes from "app/machines/filter-nodes";

const machine = {};

/**
 * Returns all machines.
 * @param {Object} state - The redux state.
 * @returns {Array} A list of all machines.
 */
machine.all = state => state.machine.items;

/**
 * Whether machines are loading.
 * @param {Object} state - The redux state.
 * @returns {Boolean} Machines loading state.
 */
machine.loading = state => state.machine.loading;

/**
 * Whether machines have been loaded.
 * @param {Object} state - The redux state.
 * @returns {Boolean} Machines loaded state.
 */
machine.loaded = state => state.machine.loaded;

/**
 * Get the machine saving state.
 * @param {Object} state - The redux state.
 * @returns {Boolean} Whether machines are being saved.
 */
machine.saving = state => state.machine.saving;

/**
 * Get the machine saved state.
 * @param {Object} state - The redux state.
 * @returns {Boolean} Whether machines have been saved.
 */
machine.saved = state => state.machine.saved;

/**
 * Returns machine errors.
 * @param {Object} state - The redux state.
 * @returns {Object} Machine errors state.
 */
machine.errors = state => state.machine.errors;

/**
 * Returns a machine for the given id.
 * @param {Object} state - The redux state.
 * @returns {Array} A machine.
 */
machine.getBySystemId = (state, id) =>
  state.machine.items.find(machine => machine.system_id === id);

/**
 * Returns machine errors.
 * @param {Object} state - The redux state.
 * @returns {Object} Errors for machines.
 */
machine.errors = state => state.machine.errors;

/**
 * Gets the search terms.
 * @param {Object} state - The redux state.
 * @param {Array} terms - The search terms.
 * @returns {Array} The search terms.
 */
machine._getTerms = (state, terms) => terms;

/**
 * Get machines that match terms.
 * @param {Object} state - The redux state.
 * @param {String} terms - The terms to match against.
 * @returns {Array} A filtered list of machines.
 */
machine.search = createSelector(
  [machine.all, machine._getTerms],
  (items, terms) => {
    if (!terms) {
      return items;
    }
    return filterNodes(items, terms);
  }
);

export default machine;
