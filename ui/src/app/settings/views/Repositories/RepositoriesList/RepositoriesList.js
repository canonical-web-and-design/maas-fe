import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import { actions as repositoryActions } from "app/store/packagerepository";
import repositorySelectors from "app/store/packagerepository/selectors";
import { getRepoDisplayName } from "app/store/packagerepository/utils";
import { useAddMessage } from "app/base/hooks";
import { useWindowTitle } from "app/base/hooks";
import SettingsTable from "app/settings/components/SettingsTable";
import TableActions from "app/base/components/TableActions";
import TableDeleteConfirm from "app/base/components/TableDeleteConfirm";
import settingsURLs from "app/settings/urls";

const generateRepositoryRows = (
  dispatch,
  expandedId,
  repositories,
  setDeletedRepo,
  setExpandedId,
  saved,
  saving
) =>
  repositories.map((repo) => {
    const name = getRepoDisplayName(repo);
    const type = repo.url.startsWith("ppa:") ? "ppa" : "repository";

    const expanded = expandedId === repo.id;
    return {
      className: expanded ? "p-table__row is-active" : null,
      columns: [
        {
          content: name,
          role: "rowheader",
        },
        { content: repo.url },
        {
          content: repo.enabled ? "Yes" : "No",
        },
        {
          content: (
            <TableActions
              deleteDisabled={repo.default}
              deleteTooltip={repo.default && "Default repos cannot be deleted."}
              editPath={settingsURLs.repositories.edit({ id: repo.id, type })}
              onDelete={() => setExpandedId(repo.id)}
            />
          ),
          className: "u-align--right",
        },
      ],
      expanded: expanded,
      expandedContent: expanded && (
        <TableDeleteConfirm
          deleted={saved}
          deleting={saving}
          modelName={repo.name}
          modelType="repository"
          onClose={setExpandedId}
          onConfirm={() => {
            dispatch(repositoryActions.delete(repo.id));
            setDeletedRepo(repo.name);
          }}
        />
      ),
      key: repo.id,
      sortData: {
        name: repo.name,
        url: repo.url,
        enabled: repo.enabled,
      },
    };
  });

export const Repositories = () => {
  const [expandedId, setExpandedId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [deletedRepo, setDeletedRepo] = useState();
  const loaded = useSelector(repositorySelectors.loaded);
  const loading = useSelector(repositorySelectors.loading);
  const saved = useSelector(repositorySelectors.saved);
  const saving = useSelector(repositorySelectors.saving);
  const repositories = useSelector((state) =>
    repositorySelectors.search(state, searchText)
  );
  const dispatch = useDispatch();

  useWindowTitle("Package repos");

  useAddMessage(
    saved,
    repositoryActions.cleanup,
    `${deletedRepo} removed successfully.`,
    () => setDeletedRepo(null)
  );

  // Fetch repositories on load
  useEffect(() => {
    dispatch(repositoryActions.fetch());
  }, [dispatch]);

  // Clean up saved and error states on unmount.
  useEffect(() => {
    dispatch(repositoryActions.cleanup());
  }, [dispatch]);

  return (
    <SettingsTable
      buttons={[
        {
          label: "Add PPA",
          url: settingsURLs.repositories.add({ type: "ppa" }),
        },
        {
          label: "Add repository",
          url: settingsURLs.repositories.add({ type: "repository" }),
        },
      ]}
      defaultSort="id"
      headers={[
        { content: "Name", sortKey: "name" },
        { content: "URL", sortKey: "url" },
        { content: "Enabled", sortKey: "enabled" },
        { content: "Actions", className: "u-align--right" },
      ]}
      loaded={loaded}
      loading={loading}
      rows={generateRepositoryRows(
        dispatch,
        expandedId,
        repositories,
        setDeletedRepo,
        setExpandedId,
        saved,
        saving
      )}
      searchOnChange={setSearchText}
      searchPlaceholder="Search package repositories"
      searchText={searchText}
      tableClassName="repo-list"
    />
  );
};

export default Repositories;
