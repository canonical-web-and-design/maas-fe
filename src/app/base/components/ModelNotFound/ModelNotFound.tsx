import { Link } from "react-router-dom-v5-compat";

import MainContentSection from "app/base/components/MainContentSection";
import SectionHeader from "app/base/components/SectionHeader";
import { capitaliseFirst, isId } from "app/utils";

type Props = {
  id?: number | string | null;
  inSection?: boolean;
  linkText?: string;
  linkURL: string;
  modelName: string;
};

export enum TestIds {
  NotFound = "not-found",
}

const ModelNotFound = ({
  id,
  inSection = true,
  linkText,
  linkURL,
  modelName,
}: Props): JSX.Element => {
  const message = isId(id)
    ? `Unable to find a ${modelName} with id "${id}".`
    : `Unable to find this ${modelName}.`;
  const title = `${capitaliseFirst(modelName)} not found`;
  const content = (
    <p>
      {message} <Link to={linkURL}>{linkText || `View all ${modelName}s`}</Link>
      .
    </p>
  );
  return inSection ? (
    <MainContentSection
      data-testid={TestIds.NotFound}
      header={<SectionHeader title={title} />}
    >
      {content}
    </MainContentSection>
  ) : (
    <>
      <h4>{title}</h4>
      {content}
    </>
  );
};

export default ModelNotFound;
