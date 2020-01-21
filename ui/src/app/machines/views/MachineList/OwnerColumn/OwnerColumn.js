import { useSelector } from "react-redux";
import React from "react";
import PropTypes from "prop-types";

import { machine as machineSelectors } from "app/base/selectors";

const OwnerColumn = ({ systemId }) => {
  const machine = useSelector(state =>
    machineSelectors.getBySystemId(state, systemId)
  );

  const owner = machine.owner ? machine.owner : "-";
  const tags = machine.tags ? machine.tags.join(", ") : "";

  return (
    <div className="p-double-row">
      <div className="p-double-row__primary-row u-truncate">
        <span data-test="owner">{owner}</span>
      </div>
      <div className="p-double-row__secondary-row u-truncate">
        <span title={tags} data-test="tags">
          {tags}
        </span>
      </div>
    </div>
  );
};

OwnerColumn.propTypes = {
  systemId: PropTypes.string.isRequired
};

export default OwnerColumn;
