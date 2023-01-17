import { ControllerHeaderViews } from "./constants";
import type { ControllerSidePanelContent } from "./types";

import { getNodeActionTitle } from "app/store/utils";

/**
 * Get title depending on header content.
 * @param defaultTitle - Title to show if no header content open.
 * @param sidePanelContent - The name of the header content to check.
 * @returns Header title string.
 */
export const getHeaderTitle = (
  defaultTitle: string,
  sidePanelContent: ControllerSidePanelContent | null
): string => {
  if (sidePanelContent) {
    const [, name] = sidePanelContent.view;
    switch (name) {
      case ControllerHeaderViews.ADD_CONTROLLER[1]:
        return "Add controller";
      default:
        return getNodeActionTitle(name);
    }
  }
  return defaultTitle;
};
