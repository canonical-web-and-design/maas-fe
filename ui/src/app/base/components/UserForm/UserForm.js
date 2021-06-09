import { Button } from "@canonical/react-components";
import PropTypes from "prop-types";
import { useState } from "react";
import { useSelector } from "react-redux";
import * as Yup from "yup";

import authSelectors from "app/store/auth/selectors";
import statusSelectors from "app/store/status/selectors";
import userSelectors from "app/store/user/selectors";
import { UserShape } from "app/base/proptypes";
import FormikForm from "app/base/components/FormikForm";
import FormikField from "app/base/components/FormikField";

const schemaFields = {
  email: Yup.string()
    .email("Must be a valid email address")
    .required("Email is required"),
  fullName: Yup.string(),
  is_superuser: Yup.boolean(),
  password: Yup.string(),
  passwordConfirm: Yup.string().oneOf(
    [Yup.ref("password")],
    "Passwords must be the same"
  ),
  username: Yup.string()
    .max(150, "Username must be 150 characters or less")
    .matches(
      /^[a-zA-Z 0-9@.+-_]*$/,
      "Usernames must contain letters, digits and @/./+/-/_ only"
    )
    .required("Username is required"),
};

const UserSchema = Yup.object().shape({
  ...schemaFields,
  password: schemaFields.password.required("Password is required"),
  passwordConfirm: schemaFields.passwordConfirm.required(
    "Password is required"
  ),
});

const CurrentPasswordUserSchema = Yup.object().shape({
  ...schemaFields,
  old_password: Yup.string().required("Your current password is required"),
  password: schemaFields.password.required("A new password is required"),
  passwordConfirm: schemaFields.passwordConfirm.required(
    "Confirm your new password"
  ),
});

const NoPasswordUserSchema = Yup.object().shape(schemaFields);

export const UserForm = ({
  buttonsAlign,
  buttonsBordered,
  cleanup,
  includeCurrentPassword,
  includeUserType,
  onCancel,
  onSave,
  onSaveAnalytics,
  onUpdateFields,
  savedRedirect,
  submitLabel,
  user,
}) => {
  const editing = !!user;
  const [passwordVisible, showPassword] = useState(!editing);
  const saving = useSelector(userSelectors.saving);
  const saved = useSelector(userSelectors.saved);
  const userErrors = useSelector(userSelectors.errors);
  const authErrors = useSelector(authSelectors.errors);
  const externalAuthURL = useSelector(statusSelectors.externalAuthURL);
  const formDisabled = !!externalAuthURL;
  let errors = userErrors;
  if (includeCurrentPassword) {
    errors = {
      ...authErrors,
      ...userErrors,
    };
  }
  let initialValues = {
    isSuperuser: user ? user.is_superuser : false,
    email: user ? user.email : "",
    // first_name is not exposed by the websocket, so only last_name is used.
    // https://bugs.launchpad.net/maas/+bug/1853579
    fullName: user ? user.last_name : "",
    password: "",
    passwordConfirm: "",
    username: user ? user.username : "",
  };
  if (includeCurrentPassword) {
    initialValues.old_password = "";
  }
  let fullSchema = includeCurrentPassword
    ? CurrentPasswordUserSchema
    : UserSchema;
  return (
    <FormikForm
      buttonsAlign={buttonsAlign}
      buttonsBordered={buttonsBordered}
      cleanup={cleanup}
      errors={errors}
      initialValues={initialValues}
      onCancel={onCancel}
      onSaveAnalytics={onSaveAnalytics}
      onSubmit={(values, { resetForm }) => {
        const params = {
          email: values.email,
          is_superuser: values.isSuperuser,
          last_name: values.fullName,
          username: values.username,
        };
        if (values.password) {
          params.password1 = values.password;
          params.password2 = values.passwordConfirm;
        }
        if (editing) {
          params.id = user.id;
        }
        onSave(params, values, editing);
        resetForm({ values });
      }}
      saving={saving}
      saved={saved}
      submitLabel={submitLabel}
      onValuesChanged={(values) => {
        onUpdateFields && onUpdateFields(values);
      }}
      savedRedirect={savedRedirect}
      validationSchema={
        editing && !passwordVisible ? NoPasswordUserSchema : fullSchema
      }
    >
      <FormikField
        autoComplete="username"
        disabled={formDisabled}
        name="username"
        help="Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only."
        label="Username"
        required={true}
        type="text"
      />
      <FormikField
        disabled={formDisabled}
        name="fullName"
        label="Full name (optional)"
        type="text"
      />
      <FormikField
        disabled={formDisabled}
        name="email"
        label="Email address"
        required={true}
        type="email"
      />
      {includeUserType && (
        <FormikField
          disabled={formDisabled}
          name="isSuperuser"
          label="MAAS administrator"
          type="checkbox"
        />
      )}
      {editing && !passwordVisible && (
        <div className="u-sv2">
          <Button
            appearance="link"
            onClick={() => showPassword(!passwordVisible)}
          >
            Change password&hellip;
          </Button>
        </div>
      )}
      {passwordVisible && (
        <>
          {includeCurrentPassword && (
            <FormikField
              autoComplete="current-password"
              disabled={formDisabled}
              name="old_password"
              label="Current password"
              required={true}
              type="password"
            />
          )}
          <FormikField
            autoComplete="new-password"
            disabled={formDisabled}
            name="password"
            label={includeCurrentPassword ? "New password" : "Password"}
            required={true}
            type="password"
          />
          <FormikField
            autoComplete="new-password"
            disabled={formDisabled}
            name="passwordConfirm"
            help="Enter the same password as before, for verification"
            label={
              includeCurrentPassword
                ? "New password (again)"
                : "Password (again)"
            }
            required={true}
            type="password"
          />
        </>
      )}
    </FormikForm>
  );
};

UserForm.propTypes = {
  buttons: PropTypes.func,
  cleanup: PropTypes.func,
  includeCurrentPassword: PropTypes.bool,
  includeUserType: PropTypes.bool,
  onCancel: PropTypes.func,
  onSave: PropTypes.func.isRequired,
  onSaveAnalytics: PropTypes.shape({
    category: PropTypes.string,
    action: PropTypes.string,
    label: PropTypes.string,
  }),
  onUpdateFields: PropTypes.func,
  savedRedirect: PropTypes.string,
  submitLabel: PropTypes.string,
  user: UserShape,
};

export default UserForm;
