import { Formik } from "formik";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";

import actions from "app/settings/actions";
import config from "app/settings/selectors/config";
import { formikFormDisabled } from "app/settings/utils";
import { useSettingsSave } from "app/base/hooks";
import ActionButton from "app/base/components/ActionButton";
import Form from "app/base/components/Form";
import KernelParametersFormFields from "app/settings/containers/Configuration/KernelParametersFormFields";

const KernelParametersSchema = Yup.object().shape({
  kernel_opts: Yup.string()
});

const KernelParametersForm = () => {
  const dispatch = useDispatch();
  const updateConfig = actions.config.update;

  const kernelParams = useSelector(config.kernelParams);

  const saving = useSelector(config.saving);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  useSettingsSave(saving, setLoading, setSuccess);

  return (
    <Formik
      initialValues={{
        kernel_opts: kernelParams
      }}
      onSubmit={(values, { resetForm }) => {
        dispatch(updateConfig(values));
        resetForm(values);
      }}
      validationSchema={KernelParametersSchema}
      render={formikProps => (
        <Form onSubmit={formikProps.handleSubmit}>
          <KernelParametersFormFields formikProps={formikProps} />
          <ActionButton
            appearance="positive"
            className="u-no-margin--bottom"
            type="submit"
            disabled={formikFormDisabled(formikProps)}
            loading={loading}
            success={success}
            width="60px"
          >
            Save
          </ActionButton>
        </Form>
      )}
    />
  );
};

export default KernelParametersForm;
