import { useFormikContext } from "formik";

import type { ProxyFormValues } from "../ProxyForm/types";

import FormikField from "app/base/components/FormikField";

const ProxyFormFields = (): JSX.Element => {
  const { values } = useFormikContext<ProxyFormValues>();

  return (
    <>
      <p>
        HTTP proxy used by MAAS to download images, and by provisioned machines
        for APT and YUM packages.
      </p>
      <FormikField
        name="proxyType"
        value="noProxy"
        label="Don't use a proxy"
        type="radio"
      />
      <FormikField
        name="proxyType"
        value="builtInProxy"
        label="MAAS built-in"
        type="radio"
      />
      <FormikField
        name="proxyType"
        value="externalProxy"
        label="External"
        type="radio"
      />
      {values.proxyType === "externalProxy" && (
        <FormikField
          name="httpProxy"
          help="Enter the external proxy URL MAAS will use to download images and machines to download APT packages."
          type="text"
          required={true}
        />
      )}
      <FormikField
        name="proxyType"
        value="peerProxy"
        label="Peer"
        type="radio"
      />
      {values.proxyType === "peerProxy" && (
        <FormikField
          name="httpProxy"
          help="Enter the external proxy URL that the MAAS built-in proxy will use as an upstream cache peer. Machines will be configured to use MAAS' built-in proxy to download APT packages."
          type="text"
          required={true}
        />
      )}
    </>
  );
};

export default ProxyFormFields;
