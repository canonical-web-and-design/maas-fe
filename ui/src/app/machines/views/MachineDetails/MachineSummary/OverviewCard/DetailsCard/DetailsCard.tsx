import { useEffect } from "react";

import { extractPowerType } from "@maas-ui/maas-ui-shared";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { useSendAnalytics } from "app/base/hooks";
import kvmURLs from "app/kvm/urls";
import { actions as generalActions } from "app/store/general";
import { powerTypes as powerTypesSelectors } from "app/store/general/selectors";
import type { MachineDetails } from "app/store/machine/types";
import { useCanEdit } from "app/store/machine/utils";

type Props = {
  machine: MachineDetails;
};

const DetailsCard = ({ machine }: Props): JSX.Element => {
  const dispatch = useDispatch();
  const sendAnalytics = useSendAnalytics();
  const canEdit = useCanEdit(machine, true);
  const powerTypes = useSelector(powerTypesSelectors.get);

  const configTabUrl = `/machine/${machine.system_id}/configuration`;

  const powerTypeDescription = powerTypes.find(
    (powerType) => powerType.name === machine.power_type
  )?.description;
  const powerTypeDisplay = extractPowerType(
    powerTypeDescription || "",
    machine.power_type
  );

  useEffect(() => {
    dispatch(generalActions.fetchPowerTypes());
  }, [dispatch]);

  return (
    <div className="overview-card__details">
      <div>
        <div className="u-text--muted">Owner</div>
        <span title={machine.owner || "-"} data-test="owner">
          {machine.owner || "-"}
        </span>
      </div>
      <div>
        <div className="u-text--muted">Domain</div>
        <span title={machine.domain?.name} data-test="domain">
          {machine.domain?.name}
        </span>
      </div>
      {machine.pod ? (
        <div>
          <div className="u-text--muted">Host</div>
          <span data-test="host">
            <Link to={kvmURLs.details({ id: machine.pod.id })}>
              {machine.pod.name} ›
            </Link>
          </span>
        </div>
      ) : null}

      <div data-test="zone">
        <div>
          {canEdit ? (
            <Link
              onClick={() =>
                sendAnalytics(
                  "Machine details",
                  "Zone configuration link",
                  "Machine summary tab"
                )
              }
              to={configTabUrl}
            >
              Zone ›
            </Link>
          ) : (
            <span className="u-text--muted">Zone</span>
          )}
        </div>
        <span title={machine.zone.name}>{machine.zone.name}</span>
      </div>

      <div data-test="resource-pool">
        <div>
          {canEdit ? (
            <Link
              onClick={() =>
                sendAnalytics(
                  "Machine details",
                  "Resource pool configuration link",
                  "Machine summary tab"
                )
              }
              to={configTabUrl}
            >
              Resource pool ›
            </Link>
          ) : (
            <span className="u-text--muted">Resource pool</span>
          )}
        </div>
        <span title={machine.pool.name}>{machine.pool.name}</span>
      </div>

      <div>
        <div>
          {canEdit ? (
            <Link
              onClick={() =>
                sendAnalytics(
                  "Machine details",
                  "Power type configuration link",
                  "Machine summary tab"
                )
              }
              to={configTabUrl}
            >
              Power type ›
            </Link>
          ) : (
            <span className="u-text--muted">Power type</span>
          )}
        </div>
        <span title={machine.power_type} data-test="power-type">
          {powerTypeDisplay ? powerTypeDisplay : machine.power_type}
        </span>
      </div>
      <div className="u-text-overflow">
        <div>
          {canEdit ? (
            <Link
              onClick={() =>
                sendAnalytics(
                  "Machine details",
                  "Tags configuration link",
                  "Machine summary tab"
                )
              }
              to={configTabUrl}
            >
              Tags ›
            </Link>
          ) : (
            <span className="u-text--muted">Tags</span>
          )}
        </div>
        <span data-test="tags">
          {machine.tags.length > 0 ? (
            <span title={machine.tags.join(", ")}>
              {machine.tags.join(", ")}
            </span>
          ) : (
            <em>No tags</em>
          )}
        </span>
      </div>
    </div>
  );
};

export default DetailsCard;
