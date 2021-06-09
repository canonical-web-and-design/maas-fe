import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";

import { actions as configActions } from "app/store/config";
import configSelectors from "app/store/config/selectors";
import FormikField from "app/base/components/FormikField";
import FormikForm from "app/base/components/FormikForm";

const ThirdPartyDriversSchema = Yup.object().shape({
  enable_third_party_drivers: Yup.boolean(),
});

const ThirdPartyDriversForm = () => {
  const dispatch = useDispatch();
  const updateConfig = configActions.update;

  const saved = useSelector(configSelectors.saved);
  const saving = useSelector(configSelectors.saving);

  const thirdPartyDriversEnabled = useSelector(
    configSelectors.thirdPartyDriversEnabled
  );

  return (
    <FormikForm
      buttonsAlign="left"
      buttonsBordered={false}
      initialValues={{
        enable_third_party_drivers: thirdPartyDriversEnabled,
      }}
      onSaveAnalytics={{
        action: "Saved",
        category: "Images settings",
        label: "Ubuntu form",
      }}
      onSubmit={(values, { resetForm }) => {
        dispatch(updateConfig(values));
        resetForm({ values });
      }}
      saving={saving}
      saved={saved}
      validationSchema={ThirdPartyDriversSchema}
    >
      <FormikField
        label="Enable the installation of proprietary drivers (i.e. HPVSA)"
        type="checkbox"
        name="enable_third_party_drivers"
      />
    </FormikForm>
  );
};

export default ThirdPartyDriversForm;
