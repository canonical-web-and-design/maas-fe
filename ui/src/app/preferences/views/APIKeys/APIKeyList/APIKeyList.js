import { Notification } from "@canonical/react-components";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import { actions as tokenActions } from "app/store/token";
import tokenSelectors from "app/store/token/selectors";
import { useAddMessage } from "app/base/hooks";
import { useWindowTitle } from "app/base/hooks";
import SettingsTable from "app/settings/components/SettingsTable";
import TableActions from "app/base/components/TableActions";
import TableDeleteConfirm from "app/base/components/TableDeleteConfirm";
import prefsURLs from "app/preferences/urls";

const generateRows = (
  tokens,
  expandedId,
  setExpandedId,
  hideExpanded,
  dispatch
) =>
  tokens.map(({ consumer, id, key, secret }) => {
    const { name } = consumer;
    const expanded = expandedId === id;
    const token = `${consumer.key}:${key}:${secret}`;
    return {
      className: expanded ? "p-table__row is-active" : null,
      columns: [
        {
          content: name,
          role: "rowheader",
        },
        {
          content: token,
        },
        {
          content: (
            <TableActions
              copyValue={token}
              editPath={prefsURLs.apiKeys.edit({ id })}
              onDelete={() => setExpandedId(id)}
            />
          ),
          className: "u-align--right",
        },
      ],
      expanded: expanded,
      expandedContent: expanded && (
        <TableDeleteConfirm
          modelName={name}
          modelType="API key"
          onCancel={hideExpanded}
          onConfirm={() => {
            dispatch(tokenActions.delete(id));
            hideExpanded();
          }}
        />
      ),
      key: id,
      sortData: {
        name: name,
      },
    };
  });

const APIKeyList = () => {
  const [expandedId, setExpandedId] = useState();
  const errors = useSelector(tokenSelectors.errors);
  const loading = useSelector(tokenSelectors.loading);
  const loaded = useSelector(tokenSelectors.loaded);
  const tokens = useSelector(tokenSelectors.all);
  const saved = useSelector(tokenSelectors.saved);
  const dispatch = useDispatch();

  const hideExpanded = () => {
    setExpandedId();
  };

  useAddMessage(saved, tokenActions.cleanup, "API key deleted successfully.");

  useEffect(() => {
    dispatch(tokenActions.fetch());
  }, [dispatch]);

  useWindowTitle("API keys");

  return (
    <>
      {errors && typeof errors === "string" && (
        <Notification type="negative" status="Error:">
          {errors}
        </Notification>
      )}
      <SettingsTable
        buttons={[
          {
            label: "Generate MAAS API key",
            url: prefsURLs.apiKeys.add,
          },
        ]}
        headers={[
          {
            content: "Name",
            sortKey: "name",
          },
          {
            content: "Key",
          },
          {
            content: "Actions",
            className: "u-align--right",
          },
        ]}
        loaded={loaded}
        loading={loading}
        rows={generateRows(
          tokens,
          expandedId,
          setExpandedId,
          hideExpanded,
          dispatch
        )}
        tableClassName="apikey-list"
      />
    </>
  );
};

export default APIKeyList;
