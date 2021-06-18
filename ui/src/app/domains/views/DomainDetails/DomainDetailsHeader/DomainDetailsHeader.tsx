import { useEffect, useState } from "react";

import { Button } from "@canonical/react-components";
import pluralize from "pluralize";
import { useDispatch, useSelector } from "react-redux";

import AddRecordDomainForm from "./AddRecordDomainForm";
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
  const domainsLoaded = useSelector(domainSelectors.loaded);
  const hostsCount = domain?.hosts ?? 0;
  const recordsCount = domain?.resource_count ?? 0;

  const [formOpen, setFormOpen] = useState<"delete" | "add-record" | null>(
    null
  );

  const closeForm = () => {
    setFormOpen(null);
  };

  useEffect(() => {
    dispatch(domainActions.fetch());
  }, [dispatch]);

  let buttons: JSX.Element[] | null = [
    <Button
      appearance="negative"
      data-test="delete-domain"
      key="delete-domain"
      onClick={() => setFormOpen("delete")}
    >
      Delete domain
    </Button>,
    <Button
      appearance="neutral"
      data-test="add-record"
      key="add-record"
      onClick={() => setFormOpen("add-record")}
    >
      Add record
    </Button>,
  ];

  let formWrapper: JSX.Element | null = null;

  if (formOpen === "delete") {
    buttons = null;
    formWrapper = <DeleteDomainForm closeForm={closeForm} id={id} />;
  } else if (formOpen === "add-record") {
    buttons = null;
    formWrapper = <AddRecordDomainForm closeForm={closeForm} id={id} />;
  }
  return (
    <SectionHeader
      buttons={buttons}
      loading={!domainsLoaded}
      subtitle={`${pluralizeString("host", hostsCount, "")}${
        hostsCount > 1 ? "; " : ""
      }${pluralizeString(
        "resource record",
        recordsCount,
        "No resource records"
      )}`}
      title={domain?.name}
      formWrapper={formWrapper}
    />
  );
};

export default DomainDetailsHeader;
