import { useCallback } from "react";

import { useDispatch, useSelector } from "react-redux";

import ActionForm from "app/base/components/ActionForm";
import type { ClearSelectedAction, EmptyObject } from "app/base/types";
import { actions as podActions } from "app/store/pod";
import podSelectors from "app/store/pod/selectors";

type Props = {
  clearSelectedAction: ClearSelectedAction;
};

const RefreshForm = ({ clearSelectedAction }: Props): JSX.Element | null => {
  const dispatch = useDispatch();
  const activePod = useSelector(podSelectors.active);
  const errors = useSelector(podSelectors.errors);
  const refreshing = useSelector(podSelectors.refreshing);
  const cleanup = useCallback(() => podActions.cleanup(), []);

  if (activePod) {
    return (
      <ActionForm<EmptyObject>
        actionName="refresh"
        cleanup={cleanup}
        clearSelectedAction={clearSelectedAction}
        errors={errors}
        initialValues={{}}
        modelName="KVM"
        onSaveAnalytics={{
          action: "Submit",
          category: "KVM details action form",
          label: "Refresh",
        }}
        onSubmit={() => {
          dispatch(podActions.refresh(activePod.id));
        }}
        processingCount={refreshing.length}
        selectedCount={refreshing.length}
      >
        <p>
          Refreshing KVMs will cause MAAS to recalculate usage metrics, update
          information about storage pools, and commission any machines present
          in the KVMs that are not yet known to MAAS.
        </p>
      </ActionForm>
    );
  }
  return null;
};

export default RefreshForm;
