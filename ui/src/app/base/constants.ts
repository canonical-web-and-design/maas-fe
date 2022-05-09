/**
 * Common column sizes used in <Col> components
 */
export const COL_SIZES = {
  CARD_TITLE: 2,
  SIDEBAR: 3,
  TABLE_CONFIRM_BUTTONS: 4,
  TOTAL: 12,
} as const;

export const COLOURS = {
  CAUTION: "#F99B11",
  LIGHT: "#F7F7F7",
  LINK: "#0066CC",
  LINK_FADED: "#D3E4ED",
  NEGATIVE: "#C7162B",
  POSITIVE: "#0E8420",
  POSITIVE_FADED: "#B7CCB9",
  POSITIVE_MID: "#4DAB4D",
} as const;

// usePortal was originally design to work with click events, so to open the
// portal programmatically we need to fake the event. This workaround can be
// removed when this issue is resolved:
// https://github.com/alex-cory/react-useportal/issues/36
export const NULL_EVENT = { currentTarget: { contains: (): boolean => false } };
