import { Col, Row, Textarea } from "@canonical/react-components";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import * as Yup from "yup";

import FormCard from "app/base/components/FormCard";
import FormikField from "app/base/components/FormikField";
import FormikForm from "app/base/components/FormikForm";
import { useAddMessage, useWindowTitle } from "app/base/hooks";
import prefsURLs from "app/preferences/urls";
import { actions as sslkeyActions } from "app/store/sslkey";
import sslkeySelectors from "app/store/sslkey/selectors";

const SSLKeySchema = Yup.object().shape({
  key: Yup.string().required("SSL key is required"),
});

export const AddSSLKey = (): JSX.Element => {
  const dispatch = useDispatch();
  const history = useHistory();
  const saving = useSelector(sslkeySelectors.saving);
  const saved = useSelector(sslkeySelectors.saved);
  const errors = useSelector(sslkeySelectors.errors);

  useWindowTitle("Add SSL key");

  useAddMessage(saved, sslkeyActions.cleanup, "SSL key successfully added.");

  return (
    <FormCard title="Add SSL key">
      <FormikForm
        cleanup={sslkeyActions.cleanup}
        errors={errors}
        initialValues={{ key: "" }}
        onCancel={() => history.push({ pathname: prefsURLs.sslKeys.index })}
        onSaveAnalytics={{
          action: "Saved",
          category: "SSL keys preferences",
          label: "Add SSL key form",
        }}
        onSubmit={(values) => {
          dispatch(sslkeyActions.create(values));
        }}
        saving={saving}
        saved={saved}
        savedRedirect={prefsURLs.sslKeys.index}
        submitLabel="Save SSL key"
        validationSchema={SSLKeySchema}
      >
        <Row>
          <Col size="5">
            <FormikField
              className="ssl-key-form-fields__key"
              component={Textarea}
              name="key"
              label="SSL key"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </Col>
          <Col size="3">
            <p className="form-card__help">
              You will be able to access Windows winrm service with a registered
              key.
            </p>
          </Col>
        </Row>
      </FormikForm>
    </FormCard>
  );
};

export default AddSSLKey;
