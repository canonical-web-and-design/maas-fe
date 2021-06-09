import { Spinner } from "@canonical/react-components";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import * as Yup from "yup";

import { actions as generalActions } from "app/store/general";
import { osInfo as osInfoSelectors } from "app/store/general/selectors";
import { actions as licenseKeysActions } from "app/store/licensekeys";
import licenseKeysSelectors from "app/store/licensekeys/selectors";
import { useAddMessage } from "app/base/hooks";
import { useWindowTitle } from "app/base/hooks";
import FormCard from "app/base/components/FormCard";
import FormikForm from "app/base/components/FormikForm";
import settingsURLs from "app/settings/urls";
import LicenseKeyFormFields from "../LicenseKeyFormFields";

const LicenseKeySchema = Yup.object().shape({
  osystem: Yup.string().required("Operating system is required"),
  distro_series: Yup.string().required("Release is required"),
  license_key: Yup.string().required("A license key is required"),
});

export const LicenseKeyForm = ({ licenseKey }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [savingLicenseKey, setSaving] = useState();
  const saving = useSelector(licenseKeysSelectors.saving);
  const saved = useSelector(licenseKeysSelectors.saved);
  const errors = useSelector(licenseKeysSelectors.errors);
  const osInfoLoaded = useSelector(osInfoSelectors.loaded);
  const licenseKeysLoaded = useSelector(licenseKeysSelectors.loaded);
  const releases = useSelector(osInfoSelectors.getLicensedOsReleases);
  const osystems = useSelector(osInfoSelectors.getLicensedOsystems);
  const isLoaded = licenseKeysLoaded && osInfoLoaded;

  const title = licenseKey ? "Update license key" : "Add license key";

  useWindowTitle(title);

  const editing = !!licenseKey;

  useAddMessage(
    saved,
    licenseKeysActions.cleanup,
    `${savingLicenseKey} ${editing ? "updated" : "added"} successfully.`,
    () => setSaving(null)
  );

  useEffect(() => {
    if (!osInfoLoaded) {
      dispatch(generalActions.fetchOsInfo());
    }
    if (!licenseKeysLoaded) {
      dispatch(licenseKeysActions.fetch());
    }
  }, [dispatch, osInfoLoaded, licenseKeysLoaded]);

  return (
    <FormCard title={title}>
      {!isLoaded ? (
        <Spinner text="loading..." />
      ) : osystems.length > 0 ? (
        <FormikForm
          cleanup={licenseKeysActions.cleanup}
          errors={errors}
          initialValues={{
            osystem: licenseKey ? licenseKey.osystem : osystems[0][0],
            distro_series: licenseKey
              ? licenseKey.distro_series
              : releases[osystems[0][0]][0].value,
            license_key: licenseKey ? licenseKey.license_key : "",
          }}
          onCancel={() =>
            history.push({ pathname: settingsURLs.licenseKeys.index })
          }
          onSaveAnalytics={{
            action: "Saved",
            category: "License keys settings",
            label: `${title} form`,
          }}
          onSubmit={(values) => {
            const params = {
              osystem: values.osystem,
              distro_series: values.distro_series,
              license_key: values.license_key,
            };
            if (editing) {
              dispatch(licenseKeysActions.update(params));
            } else {
              dispatch(licenseKeysActions.create(params));
            }
            setSaving(`${params.osystem} (${params.distro_series})`);
          }}
          saving={saving}
          saved={saved}
          savedRedirect={settingsURLs.licenseKeys.index}
          submitLabel={editing ? "Update license key" : "Add license key"}
          validationSchema={LicenseKeySchema}
        >
          <LicenseKeyFormFields
            editing={editing}
            osystems={osystems}
            releases={releases}
          />
        </FormikForm>
      ) : (
        <span>No available licensed operating systems.</span>
      )}
    </FormCard>
  );
};

export default LicenseKeyForm;
