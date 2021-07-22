import type { ReactNode } from "react";

import {
  ActionButton,
  Button,
  Col,
  Notification,
  Row,
} from "@canonical/react-components";
import type { Props as ButtonProps } from "@canonical/react-components/dist/components/Button";

import { COL_SIZES } from "app/base/constants";
import { useCycled } from "app/base/hooks";
import type { APIError } from "app/base/types";
import { formatErrors } from "app/utils";

export type Props = {
  confirmAppearance?: ButtonProps["appearance"];
  confirmLabel: string;
  errors?: APIError;
  errorKey?: string;
  finished?: boolean;
  inProgress?: boolean;
  message: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  onSuccess?: () => void;
  sidebar?: boolean;
};

const TableConfirm = ({
  confirmAppearance = "positive",
  confirmLabel,
  errors,
  errorKey,
  finished = false,
  inProgress = false,
  message,
  onClose,
  onConfirm,
  onSuccess,
  sidebar = true,
}: Props): JSX.Element => {
  useCycled(finished, () => {
    onSuccess && onSuccess();
    onClose();
  });
  const errorMessage = formatErrors(errors, errorKey);

  const { TABLE_CONFIRM_BUTTONS, SIDEBAR, TOTAL } = COL_SIZES;
  return (
    <Row>
      {errorMessage && (
        <Notification type="negative" status="Error:">
          {errorMessage}
        </Notification>
      )}
      <Col
        size={
          sidebar
            ? TOTAL - SIDEBAR - TABLE_CONFIRM_BUTTONS
            : TOTAL - TABLE_CONFIRM_BUTTONS
        }
      >
        <p className="u-no-margin--bottom u-no-max-width">{message}</p>
      </Col>
      <Col size={TABLE_CONFIRM_BUTTONS} className="u-align--right">
        <Button
          className="u-no-margin--bottom"
          data-test="action-cancel"
          onClick={onClose}
        >
          Cancel
        </Button>
        <ActionButton
          appearance={confirmAppearance}
          className="u-no-margin--bottom"
          data-test="action-confirm"
          loading={inProgress}
          onClick={onConfirm}
          success={finished}
          type="button"
        >
          {confirmLabel}
        </ActionButton>
      </Col>
    </Row>
  );
};

export default TableConfirm;
