import { useCallback } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import type { SchemaOf } from "yup";
import * as Yup from "yup";

import type { AuthenticateFormValues } from "../AddLxd";

import SelectProjectFormFields from "./SelectProjectFormFields";

import FormikForm from "app/base/components/FormikForm";
import kvmURLs from "app/kvm/urls";
import { actions as podActions } from "app/store/pod";
import podSelectors from "app/store/pod/selectors";
import { PodType } from "app/store/pod/types";
import type { RootState } from "app/store/root/types";

type Props = {
  authValues: AuthenticateFormValues;
};

export type SelectProjectFormValues = {
  existingProject: string;
  newProject: string;
};

export const SelectProjectForm = ({ authValues }: Props): JSX.Element => {
  const dispatch = useDispatch();
  const history = useHistory();
  const errors = useSelector(podSelectors.errors);
  const saved = useSelector(podSelectors.saved);
  const saving = useSelector(podSelectors.saving);
  const pods = useSelector(podSelectors.all);
  const projects = useSelector((state: RootState) =>
    podSelectors.getProjectsByLxdServer(state, authValues.power_address)
  );
  const cleanup = useCallback(() => podActions.cleanup(), []);
  const newPod = pods.find((pod) => pod.name === authValues.name);

  const SelectProjectSchema: SchemaOf<SelectProjectFormValues> = Yup.object()
    .shape({
      existingProject: Yup.string(),
      newProject: Yup.string()
        .max(63, "Must be less than 63 characters")
        .matches(
          /^[a-zA-Z0-9-_]*$/,
          `Must not contain any spaces or special characters (i.e. / . ' " *)`
        )
        .test(
          "alreadyExists",
          "A project with this name already exists",
          function test() {
            const values: SelectProjectFormValues = this.parent;
            const projectExists = projects.some(
              (project) => project.name === values.newProject
            );
            if (projectExists) {
              return this.createError({
                message: "A project with this name already exists.",
                path: "newProject",
              });
            }
            return true;
          }
        ),
    })
    .defined();

  return (
    <FormikForm<SelectProjectFormValues>
      cleanup={cleanup}
      errors={errors}
      initialValues={{
        existingProject: "",
        newProject: "",
      }}
      onCancel={() => history.push({ pathname: kvmURLs.kvm })}
      onSaveAnalytics={{
        action: "Save LXD KVM",
        category: "Add KVM form",
        label: "Save KVM",
      }}
      onSubmit={(values) => {
        dispatch(cleanup());
        const params = {
          name: authValues.name,
          password: authValues.password,
          pool: Number(authValues.pool),
          power_address: authValues.power_address,
          project: values.newProject || values.existingProject,
          type: PodType.LXD,
          zone: Number(authValues.zone),
        };
        dispatch(podActions.create(params));
      }}
      saved={saved}
      savedRedirect={newPod ? kvmURLs.details({ id: newPod.id }) : kvmURLs.kvm}
      saving={saving}
      submitLabel="Next"
      validationSchema={SelectProjectSchema}
    >
      <SelectProjectFormFields authValues={authValues} />
    </FormikForm>
  );
};

export default SelectProjectForm;
