import { useCallback } from "react";

import { Row, Col } from "@canonical/react-components";
import { useDispatch, useSelector } from "react-redux";

import FormikField from "app/base/components/FormikField";
import FormikForm from "app/base/components/FormikForm";
import { actions as zoneActions } from "app/store/zone";
import zoneSelectors from "app/store/zone/selectors";

type Props = {
  closeForm: () => void;
};

export type CreateZoneValues = {
  description: string;
  name: string;
};

const ZonesListForm = ({ closeForm }: Props): JSX.Element => {
  const dispatch = useDispatch();
  const errors = useSelector(zoneSelectors.errors);
  const saved = useSelector(zoneSelectors.saved);
  const saving = useSelector(zoneSelectors.saving);
  const cleanup = useCallback(() => zoneActions.cleanup(), []);

  return (
    <FormikForm<CreateZoneValues>
      buttonsAlign="right"
      buttonsBordered={false}
      cleanup={cleanup}
      errors={errors}
      initialValues={{
        description: "",
        name: "",
      }}
      onCancel={closeForm}
      onSuccess={closeForm}
      onSubmit={(values) => {
        dispatch(
          zoneActions.create({
            description: values.description,
            name: values.name,
          })
        );
      }}
      resetOnSave={true}
      saved={saved}
      saving={saving}
      submitLabel="Add AZ"
    >
      <Row>
        <Col size="6">
          <FormikField
            label="Name"
            placeholder="Name"
            type="text"
            name="name"
            required
          />
          <FormikField label="Description" type="text" name="description" />
        </Col>
      </Row>
    </FormikForm>
  );
};

export default ZonesListForm;
