import {
  Button,
  Card,
  Code,
  Col,
  Notification,
  Row,
  Strip,
} from "@canonical/react-components";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { useEffect } from "react";

import { actions as statusActions } from "app/store/status";
import statusSelectors from "app/store/status/selectors";
import { useWindowTitle } from "app/base/hooks";
import FormikField from "app/base/components/FormikField";
import FormikForm from "app/base/components/FormikForm";

const LoginSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

export const Login = () => {
  const dispatch = useDispatch();
  const authenticated = useSelector(statusSelectors.authenticated);
  const authenticating = useSelector(statusSelectors.authenticating);
  const externalAuthURL = useSelector(statusSelectors.externalAuthURL);
  const externalLoginURL = useSelector(statusSelectors.externalLoginURL);
  const noUsers = useSelector(statusSelectors.noUsers);
  const error = useSelector(statusSelectors.authenticationError);

  useWindowTitle("Login");

  useEffect(() => {
    if (externalAuthURL) {
      dispatch(statusActions.externalLogin());
    }
  }, [dispatch, externalAuthURL]);

  return (
    <Strip>
      <Row>
        <Col size={6} emptyLarge={4}>
          {externalAuthURL && error && (
            <Notification severity="negative" title="Error:">
              {error}
            </Notification>
          )}
          {noUsers && !externalAuthURL ? (
            <Card
              data-test="no-users-warning"
              title="No admin user has been created yet"
            >
              <p>Use the following command to create one:</p>
              <Code copyable>sudo maas createadmin</Code>
              <Button
                className="u-no-margin--bottom"
                onClick={() => dispatch(statusActions.checkAuthenticated())}
              >
                Retry
              </Button>
            </Card>
          ) : (
            <Card title="Login">
              {externalAuthURL ? (
                <Button
                  appearance="positive"
                  className="login__external"
                  element="a"
                  href={externalLoginURL}
                  rel="noopener noreferrer"
                  target="_blank"
                  title={`Login through ${externalAuthURL}`}
                >
                  Go to login page
                </Button>
              ) : (
                <FormikForm
                  errors={error}
                  initialValues={{
                    password: "",
                    username: "",
                  }}
                  onSubmit={(values) => {
                    dispatch(statusActions.login(values));
                  }}
                  saving={authenticating}
                  saved={authenticated}
                  submitLabel="Login"
                  validationSchema={LoginSchema}
                >
                  <FormikField
                    name="username"
                    label="Username"
                    required={true}
                    takeFocus
                    type="text"
                  />
                  <FormikField
                    name="password"
                    label="Password"
                    required={true}
                    type="password"
                  />
                </FormikForm>
              )}
            </Card>
          )}
        </Col>
      </Row>
    </Strip>
  );
};

export default Login;
