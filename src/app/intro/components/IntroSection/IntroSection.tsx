import type { ReactNode } from "react";
import { useEffect } from "react";

import { Notification, Spinner } from "@canonical/react-components";
import { useNavigate } from "react-router-dom-v5-compat";

import MainContentSection from "app/base/components/MainContentSection";
import type { Props as SectionProps } from "app/base/components/MainContentSection/MainContentSection";
import { useWindowTitle } from "app/base/hooks";
import type { APIError } from "app/base/types";
import { useExitURL } from "app/intro/hooks";
import { formatErrors } from "app/utils";

type Props = {
  children: ReactNode;
  complete?: boolean;
  errors?: APIError;
  loading?: boolean;
  shouldExitIntro?: boolean;
  titleLink?: ReactNode;
  windowTitle?: string;
} & SectionProps;

const IntroSection = ({
  children,
  complete,
  errors,
  loading,
  shouldExitIntro,
  titleLink,
  windowTitle,
  ...props
}: Props): JSX.Element => {
  const navigate = useNavigate();
  const errorMessage = formatErrors(errors);
  const exitURL = useExitURL();

  useWindowTitle(windowTitle ? `Welcome - ${windowTitle}` : "Welcome");

  useEffect(() => {
    if (shouldExitIntro) {
      navigate(exitURL, { replace: true });
    }
  }, [navigate, exitURL, shouldExitIntro]);

  return (
    <MainContentSection {...props}>
      {errorMessage && (
        <Notification severity="negative" title="Error:">
          {errorMessage}
        </Notification>
      )}
      {loading ? <Spinner text="Loading..." /> : children}
    </MainContentSection>
  );
};

export default IntroSection;
