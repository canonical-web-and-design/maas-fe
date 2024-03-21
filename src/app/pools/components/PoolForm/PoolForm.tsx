import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";

import FormikField from "@/app/base/components/FormikField";
import FormikForm from "@/app/base/components/FormikForm";
import { useAddMessage } from "@/app/base/hooks";
import urls from "@/app/base/urls";
import { resourcePoolActions } from "@/app/store/resourcepool";
import poolSelectors from "@/app/store/resourcepool/selectors";
import type { ResourcePool } from "@/app/store/resourcepool/types";

type Props = {
  pool?: ResourcePool | null;
  onClose?: () => void;
};

type PoolFormValues = {
  description: ResourcePool["description"];
  name: ResourcePool["name"];
};

export enum Labels {
  AddPoolTitle = "Add pool",
  EditPoolTitle = "Edit pool",
  SubmitLabel = "Save pool",
  PoolName = "Name (required)",
  PoolDescription = "Description",
}

const PoolSchema = Yup.object().shape({
  name: Yup.string().required("name is required"),
  description: Yup.string(),
});

export const PoolForm = ({ pool, onClose, ...props }: Props): JSX.Element => {
  const dispatch = useDispatch();
  const saved = useSelector(poolSelectors.saved);
  const saving = useSelector(poolSelectors.saving);
  const errors = useSelector(poolSelectors.errors);
  const [savingPool, setSaving] = useState<ResourcePool["name"] | null>();

  useAddMessage(
    saved,
    resourcePoolActions.cleanup,
    `${savingPool} ${pool ? "updated" : "added"} successfully.`,
    () => setSaving(null)
  );

  let initialValues: PoolFormValues;
  let title: string;
  if (pool) {
    title = Labels.EditPoolTitle;
    initialValues = {
      name: pool.name,
      description: pool.description,
    };
  } else {
    title = Labels.AddPoolTitle;
    initialValues = {
      name: "",
      description: "",
    };
  }

  return (
    <FormikForm
      aria-label={title}
      cleanup={resourcePoolActions.cleanup}
      errors={errors}
      initialValues={initialValues}
      onCancel={onClose}
      onSaveAnalytics={{
        action: "Saved",
        category: "Resource pool",
        label: "Add pool form",
      }}
      onSubmit={(values) => {
        dispatch(resourcePoolActions.cleanup());
        if (pool) {
          dispatch(
            resourcePoolActions.update({
              ...values,
              id: pool.id,
            })
          );
        } else {
          dispatch(resourcePoolActions.create(values));
        }
        setSaving(values.name);
      }}
      saved={saved}
      savedRedirect={urls.pools.index}
      saving={saving}
      submitLabel={Labels.SubmitLabel}
      validationSchema={PoolSchema}
      {...props}
    >
      <FormikField label={Labels.PoolName} name="name" type="text" />
      <FormikField
        label={Labels.PoolDescription}
        name="description"
        type="text"
      />
    </FormikForm>
  );
};

export default PoolForm;
