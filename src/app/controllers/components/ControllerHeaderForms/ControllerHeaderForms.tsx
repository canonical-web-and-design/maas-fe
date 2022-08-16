import { useCallback } from "react";

import type { ValueOf } from "@canonical/react-components";

import AddController from "./AddController";
import ControllerActionFormWrapper from "./ControllerActionFormWrapper";

import type { ControllerActionHeaderViews } from "app/controllers/constants";
import { ControllerHeaderViews } from "app/controllers/constants";
import type {
  ControllerHeaderContent,
  ControllerSetHeaderContent,
} from "app/controllers/types";
import type { Controller } from "app/store/controller/types";

type Props = {
  controllers: Controller[];
  headerContent: ControllerHeaderContent;
  setHeaderContent: ControllerSetHeaderContent;
  viewingDetails?: boolean;
};

const ControllerHeaderForms = ({
  controllers,
  headerContent,
  setHeaderContent,
  viewingDetails = false,
}: Props): JSX.Element | null => {
  const clearHeaderContent = useCallback(
    () => setHeaderContent(null),
    [setHeaderContent]
  );

  switch (headerContent.view) {
    case ControllerHeaderViews.ADD_CONTROLLER:
      return <AddController clearHeaderContent={clearHeaderContent} />;
    default:
      // We need to explicitly cast headerContent.view here - TypeScript doesn't
      // seem to be able to infer remaining object tuple values as with string
      // values.
      // https://github.com/canonical/maas-ui/issues/3040
      const { view } = headerContent as {
        view: ValueOf<typeof ControllerActionHeaderViews>;
      };
      const [, action] = view;
      return (
        <ControllerActionFormWrapper
          action={action}
          clearHeaderContent={clearHeaderContent}
          controllers={controllers}
          viewingDetails={viewingDetails}
        />
      );
  }
};

export default ControllerHeaderForms;
