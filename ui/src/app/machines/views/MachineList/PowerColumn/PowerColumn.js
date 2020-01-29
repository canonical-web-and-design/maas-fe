import React from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";

import { machine as machineSelectors } from "app/base/selectors";
import DoubleRow from "app/base/components/DoubleRow";

const PowerColumn = ({ onToggleMenu, systemId }) => {
  const machine = useSelector(state =>
    machineSelectors.getBySystemId(state, systemId)
  );

  const iconClass = classNames({
    "p-icon--power-on": machine.power_state === "on",
    "p-icon--power-off": machine.power_state === "off",
    "p-icon--power-error": machine.power_state === "error",
    "p-icon--power-unknown": machine.power_state === "unknown"
  });

  return (
    <DoubleRow
      icon={<i title={machine.power_state} className={iconClass}></i>}
      iconSpace={true}
      onToggleMenu={onToggleMenu}
      primary={<span data-test="power_state">{machine.power_state}</span>}
      primaryClassName="u-upper-case--first"
      secondary={
        <span title={machine.power_type} data-test="power_type">
          {machine.power_type}
        </span>
      }
      secondaryClassName="u-upper-case--first"
    />
  );
};

PowerColumn.propTypes = {
  onToggleMenu: PropTypes.func,
  systemId: PropTypes.string.isRequired
};

export default PowerColumn;
