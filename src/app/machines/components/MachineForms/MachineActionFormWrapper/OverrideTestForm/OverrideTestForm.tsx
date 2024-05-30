import { Col, Row } from "@canonical/react-components";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import * as Yup from "yup";

import ActionForm from "@/app/base/components/ActionForm";
import FormikField from "@/app/base/components/FormikField";
import { useSendAnalytics } from "@/app/base/hooks";
import urls from "@/app/base/urls";
import type { MachineActionFormProps } from "@/app/machines/types";
import { machineActions } from "@/app/store/machine";
import type { MachineEventErrors } from "@/app/store/machine/types";
import { useSelectedMachinesActionsDispatch } from "@/app/store/machine/utils/hooks";
import { NodeActions } from "@/app/store/types/node";

type Props = MachineActionFormProps;

export type OverrideTestFormValues = {
  suppressResults: boolean;
};

const OverrideTestFormSchema = Yup.object().shape({
  suppressResults: Yup.boolean(),
});

export const OverrideTestForm = ({
  clearSidePanelContent,
  errors,
  processingCount,
  searchFilter,
  selectedCount,
  selectedMachines,
  viewingDetails,
}: Props): JSX.Element => {
  const sendAnalytics = useSendAnalytics();
  const isSingleMachine = selectedCount === 1;
  const dispatch = useDispatch();
  const { dispatch: dispatchForSelectedMachines, ...actionProps } =
    useSelectedMachinesActionsDispatch({ selectedMachines, searchFilter });
  const machineID = isSingleMachine
    ? selectedMachines &&
      "items" in selectedMachines &&
      selectedMachines?.items?.[0]
    : null;

  return (
    <ActionForm<OverrideTestFormValues, MachineEventErrors>
      actionName={NodeActions.OVERRIDE_FAILED_TESTING}
      allowUnchanged
      cleanup={machineActions.cleanup}
      errors={errors}
      initialValues={{
        suppressResults: false,
      }}
      modelName="machine"
      onCancel={clearSidePanelContent}
      onSaveAnalytics={{
        action: "Submit",
        category: `Machine ${viewingDetails ? "details" : "list"} action form`,
        label: "Override failed tests",
      }}
      onSubmit={(values) => {
        dispatch(machineActions.cleanup());
        const { suppressResults } = values;
        dispatchForSelectedMachines(machineActions.overrideFailedTesting, {
          suppress_failed_script_results: suppressResults,
        });
      }}
      onSuccess={clearSidePanelContent}
      processingCount={processingCount}
      selectedCount={selectedCount}
      validationSchema={OverrideTestFormSchema}
      {...actionProps}
    >
      <Row>
        <Col size={12}>
          <>
            <p className="u-sv1">
              Overriding will allow the machines to be deployed, marked with a
              warning.
            </p>
            <FormikField
              label={
                <span>
                  Suppress test-failure icons in the machines list. Results
                  remain visible in
                  <br />
                  {machineID ? (
                    <Link
                      to={urls.machines.machine.index({
                        id: machineID,
                      })}
                    >
                      Machine - Hardware tests
                    </Link>
                  ) : (
                    "Machine - Hardware tests"
                  )}
                  .
                </span>
              }
              name="suppressResults"
              onChangeCapture={(e: React.ChangeEvent<HTMLInputElement>) => {
                sendAnalytics(
                  `Machine ${viewingDetails ? "details" : "list"} action form`,
                  "Suppress failed tests",
                  e.target.checked ? "Check" : "Uncheck"
                );
              }}
              type="checkbox"
            />
          </>
        </Col>
      </Row>
    </ActionForm>
  );
};

export default OverrideTestForm;
