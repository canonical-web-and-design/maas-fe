import { useEffect, useState } from "react";

import { Button } from "@canonical/react-components";
import pluralize from "pluralize";
import { useDispatch, useSelector } from "react-redux";

import AddRecordForm from "./AddRecordForm";
import DeleteDomainForm from "./DeleteDomainForm";

import SectionHeader from "app/base/components/SectionHeader";
import { actions as domainActions } from "app/store/domain";
import domainSelectors from "app/store/domain/selectors";
import type { Domain } from "app/store/domain/types";
import type { RootState } from "app/store/root/types";

const pluralizeString = (
  prefix: string,
  count: number,
  emptyMessage: string
) => {
  if (count < 1) {
    return emptyMessage;
  }
  return `${pluralize(prefix, count, true)}`;
};

type Props = {
  id: Domain["id"];
};

const DomainDetailsHeader = ({ id }: Props): JSX.Element | null => {
  const domain = useSelector((state: RootState) =>
    domainSelectors.getById(state, id)
  );
  const dispatch = useDispatch();
  const [formOpen, setFormOpen] = useState<"delete" | "add-record" | null>(
    null
  );

  useEffect(() => {
    dispatch(domainActions.get(id));
  }, [dispatch, id]);

  const isDefaultDomain = id === 0;
  const hostsCount = domain?.hosts ?? 0;
  const recordsCount = domain?.resource_count ?? 0;

  const closeForm = () => {
    setFormOpen(null);
  };

  const buttons = [
    <Button
      appearance="neutral"
      data-test="add-record"
      key="add-record"
      onClick={() => setFormOpen("add-record")}
    >
      Add record
    </Button>,
  ];
  if (!isDefaultDomain) {
    buttons.unshift(
      <Button
        appearance="negative"
        data-test="delete-domain"
        key="delete-domain"
        onClick={() => setFormOpen("delete")}
      >
        Delete domain
      </Button>
    );
  }

  return (
    <SectionHeader
      buttons={formOpen === null ? buttons : null}
      loading={!domain}
      subtitle={`${pluralizeString("host", hostsCount, "")}${
        hostsCount > 1 ? "; " : ""
      }${pluralizeString(
        "resource record",
        recordsCount,
        "No resource records"
      )}`}
      title={domain?.name}
      formWrapper={
        formOpen === null ? null : (
          <>
            {formOpen === "delete" && (
              <DeleteDomainForm closeForm={closeForm} id={id} />
            )}
            {formOpen === "add-record" && (
              <AddRecordForm closeForm={closeForm} id={id} />
            )}
          </>
        )
      }
    />
  );
};

export default DomainDetailsHeader;
