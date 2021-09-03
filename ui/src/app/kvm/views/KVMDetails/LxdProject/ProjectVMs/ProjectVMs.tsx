import { useEffect, useState } from "react";

import { Strip } from "@canonical/react-components";
import { useDispatch } from "react-redux";

import VMsActionBar from "./VMsActionBar";
import VMsTable from "./VMsTable";

import type { KVMSetHeaderContent, SetSearchFilter } from "app/kvm/types";
import { actions as machineActions } from "app/store/machine";
import type { Pod } from "app/store/pod/types";

type Props = {
  id: Pod["id"];
  searchFilter: string;
  setSearchFilter: SetSearchFilter;
  setHeaderContent: KVMSetHeaderContent;
};

export const VMS_PER_PAGE = 10;

const ProjectVMs = ({
  id,
  searchFilter,
  setSearchFilter,
  setHeaderContent,
}: Props): JSX.Element => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(machineActions.fetch());

    return () => {
      // Clear machine selected state when unmounting.
      dispatch(machineActions.setSelected([]));
    };
  }, [dispatch]);

  return (
    <Strip shallow>
      <VMsActionBar
        currentPage={currentPage}
        id={id}
        searchFilter={searchFilter}
        setCurrentPage={setCurrentPage}
        setSearchFilter={setSearchFilter}
        setHeaderContent={setHeaderContent}
      />
      <Strip shallow>
        <VMsTable
          currentPage={currentPage}
          id={id}
          searchFilter={searchFilter}
        />
      </Strip>
    </Strip>
  );
};

export default ProjectVMs;
