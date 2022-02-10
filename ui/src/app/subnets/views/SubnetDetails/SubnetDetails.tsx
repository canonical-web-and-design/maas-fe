import { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";

import StaticRoutes from "./StaticRoutes";
import SubnetDetailsHeader from "./SubnetDetailsHeader";
import SubnetSummary from "./SubnetSummary";
import UsedIPs from "./UsedIPs";
import Utilisation from "./Utilisation";

import ModelNotFound from "app/base/components/ModelNotFound";
import Section from "app/base/components/Section";
import SectionHeader from "app/base/components/SectionHeader";
import { useGetURLId, useWindowTitle } from "app/base/hooks";
import type { RootState } from "app/store/root/types";
import { actions as staticRouteActions } from "app/store/staticroute";
import { actions as subnetActions } from "app/store/subnet";
import subnetSelectors from "app/store/subnet/selectors";
import { SubnetMeta } from "app/store/subnet/types";
import DHCPSnippets from "app/subnets/components/DHCPSnippets";
import ReservedRanges from "app/subnets/components/ReservedRanges";
import subnetURLs from "app/subnets/urls";
import { isId } from "app/utils";

const SubnetDetails = (): JSX.Element => {
  const dispatch = useDispatch();
  const id = useGetURLId(SubnetMeta.PK);
  const subnet = useSelector((state: RootState) =>
    subnetSelectors.getById(state, id)
  );
  const subnetsLoading = useSelector(subnetSelectors.loading);
  const isValidID = isId(id);
  useWindowTitle(`${subnet?.name || "Subnet"} details`);

  useEffect(() => {
    if (isValidID) {
      dispatch(subnetActions.get(id));
      dispatch(subnetActions.setActive(id));
      dispatch(staticRouteActions.fetch());
    }

    const unsetActiveSubnetAndCleanup = () => {
      dispatch(subnetActions.setActive(null));
      dispatch(subnetActions.cleanup());
    };
    return unsetActiveSubnetAndCleanup;
  }, [dispatch, id, isValidID]);

  if (subnetsLoading) {
    return <Section header={<SectionHeader loading />} />;
  }

  if (!subnet || !isValidID) {
    return (
      <ModelNotFound
        id={id}
        linkURL={subnetURLs.indexBy({ by: "fabric" })}
        modelName="subnet"
      />
    );
  }

  return (
    <Section header={<SubnetDetailsHeader subnet={subnet} />}>
      <SubnetSummary id={id} />
      <Utilisation statistics={subnet.statistics} />
      <StaticRoutes subnetId={id} />
      <ReservedRanges subnetId={id} />
      <DHCPSnippets subnetIds={[id]} modelName={SubnetMeta.MODEL} />
      <UsedIPs subnetId={id} />
    </Section>
  );
};

export default SubnetDetails;
