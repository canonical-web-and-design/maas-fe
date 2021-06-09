import { Spinner } from "@canonical/react-components";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import * as Yup from "yup";

import { actions as repositoryActions } from "app/store/packagerepository";
import { actions as generalActions } from "app/store/general";
import { getRepoDisplayName } from "app/store/packagerepository/utils";
import { RepositoryShape } from "app/settings/proptypes";
import { useAddMessage } from "app/base/hooks";
import { useWindowTitle } from "app/base/hooks";
import FormCard from "app/base/components/FormCard";
import FormikForm from "app/base/components/FormikForm";
import settingsURLs from "app/settings/urls";
import {
  componentsToDisable as componentsToDisableSelectors,
  knownArchitectures as knownArchitecturesSelectors,
  pocketsToDisable as pocketsToDisableSelectors,
} from "app/store/general/selectors";
import RepositoryFormFields from "../RepositoryFormFields";
import repositorySelectors from "app/store/packagerepository/selectors";

const RepositorySchema = Yup.object().shape({
  arches: Yup.array(),
  components: Yup.string(),
  default: Yup.boolean().required(),
  disable_sources: Yup.boolean().required(),
  disabled_components: Yup.array(),
  disabled_pockets: Yup.array(),
  distributions: Yup.string(),
  enabled: Yup.boolean().required(),
  key: Yup.string(),
  name: Yup.string().required("Name field required."),
  url: Yup.string().required("URL field required."),
});

export const RepositoryForm = ({ type, repository }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [savedRepo, setSavedRepo] = useState();
  const componentsToDisableLoaded = useSelector(
    componentsToDisableSelectors.loaded
  );
  const knownArchitecturesLoaded = useSelector(
    knownArchitecturesSelectors.loaded
  );
  const pocketsToDisableLoaded = useSelector(pocketsToDisableSelectors.loaded);
  const repositoriesLoaded = useSelector(repositorySelectors.loaded);
  const repositoriesSaved = useSelector(repositorySelectors.saved);
  const repositoriesSaving = useSelector(repositorySelectors.saving);
  const errors = useSelector(repositorySelectors.errors);
  const allLoaded =
    componentsToDisableLoaded &&
    knownArchitecturesLoaded &&
    pocketsToDisableLoaded &&
    repositoriesLoaded;

  useAddMessage(
    repositoriesSaved,
    repositoryActions.cleanup,
    `${savedRepo} ${repository ? "updated" : "added"} successfully.`,
    () => setSavedRepo(null)
  );

  // Fetch data if not all loaded.
  useEffect(() => {
    if (!allLoaded) {
      dispatch(generalActions.fetchComponentsToDisable());
      dispatch(generalActions.fetchKnownArchitectures());
      dispatch(generalActions.fetchPocketsToDisable());
      dispatch(repositoryActions.fetch());
    }
  }, [dispatch, allLoaded]);

  const typeString = type === "ppa" ? "PPA" : "repository";
  let initialValues;
  let title;
  if (repository) {
    title = `Edit ${typeString}`;
    initialValues = {
      arches: repository.arches,
      components: repository.components.join(", "),
      default: repository.default,
      disable_sources: repository.disable_sources,
      disabled_components: repository.disabled_components,
      disabled_pockets: repository.disabled_pockets,
      distributions: repository.distributions.join(", "),
      enabled: repository.enabled,
      key: repository.key,
      name: getRepoDisplayName(repository),
      url: repository.url,
    };
  } else {
    title = `Add ${typeString}`;
    initialValues = {
      arches: ["i386", "amd64"],
      components: "",
      default: false,
      disable_sources: false,
      disabled_components: [],
      disabled_pockets: [],
      distributions: "",
      enabled: true,
      key: "",
      name: "",
      url: type === "ppa" ? "ppa:" : "",
    };
  }

  useWindowTitle(title);

  return (
    <>
      {!allLoaded ? (
        <Spinner text="Loading..." />
      ) : (
        <FormCard title={title}>
          <FormikForm
            cleanup={repositoryActions.cleanup}
            errors={errors}
            initialValues={initialValues}
            onCancel={() =>
              history.push({ pathname: settingsURLs.repositories.index })
            }
            onSaveAnalytics={{
              action: "Saved",
              category: "Package repos settings",
              label: `${title} form`,
            }}
            onSubmit={(values) => {
              const params = {
                arches: values.arches,
                default: values.default,
                disable_sources: values.disable_sources,
                key: values.key,
              };

              if (values.default) {
                params.disabled_components = values.disabled_components;
                params.disabled_pockets = values.disabled_pockets;
                params.url = values.url;
              } else {
                params.components = values.components
                  .split(" ,")
                  .filter(Boolean);
                params.distributions = values.distributions
                  .split(" ,")
                  .filter(Boolean);
                params.enabled = values.enabled;
                params.name = values.name;
                params.url = values.url;
              }

              dispatch(repositoryActions.cleanup());
              if (repository) {
                params.id = repository.id;
                dispatch(repositoryActions.update(params));
              } else {
                dispatch(repositoryActions.create(params));
              }
              setSavedRepo(values.name);
            }}
            saving={repositoriesSaving}
            saved={repositoriesSaved}
            savedRedirect={settingsURLs.repositories.index}
            submitLabel={`Save ${typeString}`}
            validationSchema={RepositorySchema}
          >
            <RepositoryFormFields type={type} />
          </FormikForm>
        </FormCard>
      )}
    </>
  );
};

RepositoryForm.propTypes = {
  type: PropTypes.oneOf(["ppa", "repository"]).isRequired,
  repository: RepositoryShape,
};

export default RepositoryForm;
