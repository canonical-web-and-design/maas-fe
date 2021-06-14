import { useCallback, useEffect } from "react";

import { Row, Col } from "@canonical/react-components";
import { useDispatch, useSelector } from "react-redux";

import FormikField from "app/base/components/FormikField";
import FormikForm from "app/base/components/FormikForm";
import type { RootState } from "app/store/root/types";
import { actions as zoneActions } from "app/store/zone";
import zoneSelectors from "app/store/zone/selectors";

type Props = {
  id: number;
  closeForm: () => void;
};

export type CreateZoneValues = {
  description: string;
  name: string;
};

const ZoneForm = ({ id, closeForm }: Props): JSX.Element => {
  const dispatch = useDispatch();
  const errors = useSelector(zoneSelectors.errors);
  const saved = useSelector(zoneSelectors.saved);
  const saving = useSelector(zoneSelectors.saving);
  const cleanup = useCallback(() => zoneActions.cleanup(), []);
  const zone = useSelector((state: RootState) =>
    zoneSelectors.getById(state, Number(id))
  );

  useEffect(() => {
    dispatch(zoneActions.fetch());
  }, [dispatch]);

  let nameValue = null;
  let descriptionValue = null;

  if (zone) {
    nameValue = zone.name;
    descriptionValue = zone.description;
  }

  return (
    <FormikForm<CreateZoneValues>
      buttonsAlign="right"
      buttonsBordered={false}
      cleanup={cleanup}
      errors={errors}
      initialValues={{
        description: descriptionValue,
        name: nameValue,
      }}
      onCancel={closeForm}
      onSuccess={closeForm}
      onSubmit={(values) => {
        dispatch(
          zoneActions.update({
            id: id,
            description: values.description,
            name: values.name,
          })
        );
      }}
      resetOnSave={true}
      saved={saved}
      saving={saving}
      submitLabel="Update AZ"
    >
      <Row>
        <Col size="6">
          <FormikField
            label="Name"
            placeholder="Name"
            type="text"
            name="name"
          />
          <FormikField label="Description" type="text" name="description" />
        </Col>
      </Row>
    </FormikForm>
  );
};

export default ZoneForm;
