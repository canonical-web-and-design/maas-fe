import { useEffect } from "react";

import { Spinner } from "@canonical/react-components";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import type { RootState } from "app/store/root/types";
import { actions as subnetActions } from "app/store/subnet";
import subnetSelectors from "app/store/subnet/selectors";
import type { Subnet, SubnetMeta } from "app/store/subnet/types";
import { getSubnetDisplay } from "app/store/subnet/utils";
import subnetsURLs from "app/subnets/urls";

type Props = {
  id?: Subnet[SubnetMeta.PK] | null;
};

const SubnetLink = ({ id }: Props): JSX.Element => {
  const dispatch = useDispatch();
  const subnet = useSelector((state: RootState) =>
    subnetSelectors.getById(state, id)
  );
  const subnetsLoading = useSelector(subnetSelectors.loading);
  const subnetDisplay = getSubnetDisplay(subnet);

  useEffect(() => {
    dispatch(subnetActions.fetch());
  }, [dispatch]);

  if (subnetsLoading) {
    return <Spinner aria-label="Loading subnets" />;
  }
  if (!subnet) {
    return <>{subnetDisplay}</>;
  }
  return (
    <Link to={subnetsURLs.subnet.index({ id: subnet.id })}>
      {subnetDisplay}
    </Link>
  );
};

export default SubnetLink;
