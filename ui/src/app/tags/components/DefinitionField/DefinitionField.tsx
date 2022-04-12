import { useEffect, useRef } from "react";

import { CodeSnippet, Textarea } from "@canonical/react-components";
import type { FormikErrors } from "formik";
import { useFormikContext } from "formik";
import { useSelector } from "react-redux";

import FormikField from "app/base/components/FormikField";
import { useSendAnalytics } from "app/base/hooks";
import { useId } from "app/base/hooks/base";
import type { RootState } from "app/store/root/types";
import tagSelectors from "app/store/tag/selectors";
import type {
  CreateParams,
  Tag,
  TagMeta,
  UpdateParams,
} from "app/store/tag/types";

export const INVALID_XPATH_ERROR = "Invalid xpath expression";

export enum Label {
  Comment = "Comment",
  Definition = "Definition (automatic tag)",
  KernelOptions = "Kernel options",
  Name = "Tag name",
}

type Props = {
  id?: Tag[TagMeta.PK];
};

const getDefinitionError = (
  errors: FormikErrors<CreateParams>,
  definitionErrorId: string
) => {
  if (errors.definition?.includes(INVALID_XPATH_ERROR)) {
    return (
      <span id={definitionErrorId}>
        The definition is an invalid XPath expression. See our{" "}
        <a
          href="https://maas.io/docs/how-to-work-with-tags#heading--xpath-expressions"
          rel="noreferrer"
          target="_blank"
        >
          XPath expressions documentation
        </a>{" "}
        for more examples.
      </span>
    );
  }
  return errors.definition;
};

export const DefinitionField = ({ id }: Props): JSX.Element => {
  const { errors, values } = useFormikContext<CreateParams | UpdateParams>();
  const tag = useSelector((state: RootState) =>
    tagSelectors.getById(state, id)
  );
  const definitionErrorId = useId();
  const definitionAnalyticsSent = useRef(false);
  const sendAnalytics = useSendAnalytics();
  const definitionError = getDefinitionError(errors, definitionErrorId);
  const hasChangedDefinition =
    !!tag?.definition && values.definition !== tag?.definition;

  useEffect(() => {
    if (definitionError && !definitionAnalyticsSent.current) {
      sendAnalytics("XPath tagging", "Invalid XPath", "Save");
      definitionAnalyticsSent.current = true;
    }
  }, [definitionError, sendAnalytics]);
  return (
    <>
      <FormikField
        aria-errormessage={!!definitionError ? definitionErrorId : undefined}
        aria-invalid={!!definitionError}
        className="p-text--code"
        error={definitionError}
        label={Label.Definition}
        name="definition"
        caution={
          hasChangedDefinition
            ? "This tag will be unassigned from previous machines that no longer match this definition."
            : null
        }
        component={Textarea}
        placeholder={`//node[@class="system"]/vendor = "QEMU" and
//node[@class="processor"]/vendor[starts-with(.,"Advanced Micro Devices")] and not
//node[@id="firmware"]/capabilities/capability/@id = "uefi"`}
        rows={3}
      />
      <p className="p-form-help-text u-sv1">
        Add an XPath expression as a definition. MAAS will auto-assign this tag
        to all current and future machines that match this definition.{" "}
        <a
          href="https://maas.io/docs/how-to-work-with-tags#heading--xpath-expressions"
          rel="noreferrer"
          target="_blank"
        >
          Learn how to use XPath expressions
        </a>
        .
      </p>
      <p className="p-form-help-text u-sv1">
        This will tag legacy KVM vms running on AMD-based Hosts:
      </p>
      <CodeSnippet
        blocks={[
          {
            code: `//node[@class="system"]/vendor = "QEMU" and
//node[@class="processor"]/vendor[starts-with(.,"Advanced Micro Devices")] and not
//node[@id="firmware"]/capabilities/capability/@id = "uefi"`,
          },
        ]}
      />
    </>
  );
};

export default DefinitionField;
