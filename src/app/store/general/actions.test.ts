import { actions as general } from "./slice";

describe("general actions", () => {
  it("should handle fetching architectures", () => {
    expect(general.fetchArchitectures()).toEqual({
      type: "general/fetchArchitectures",
      meta: {
        cache: true,
        model: "general",
        method: "architectures",
      },
      payload: null,
    });
  });

  it("should handle fetching bond options", () => {
    expect(general.fetchBondOptions()).toEqual({
      type: "general/fetchBondOptions",
      meta: {
        cache: true,
        model: "general",
        method: "bond_options",
      },
      payload: null,
    });
  });

  it("should handle fetching boot architectures", () => {
    expect(general.fetchKnownBootArchitectures()).toEqual({
      type: "general/fetchKnownBootArchitectures",
      meta: {
        cache: true,
        model: "general",
        method: "known_boot_architectures",
      },
      payload: null,
    });
  });

  it("should handle fetching components to disable", () => {
    expect(general.fetchComponentsToDisable()).toEqual({
      type: "general/fetchComponentsToDisable",
      meta: {
        cache: true,
        model: "general",
        method: "components_to_disable",
      },
      payload: null,
    });
  });

  it("should handle fetching default min hwe kernel", () => {
    expect(general.fetchDefaultMinHweKernel()).toEqual({
      type: "general/fetchDefaultMinHweKernel",
      meta: {
        cache: true,
        model: "general",
        method: "default_min_hwe_kernel",
      },
      payload: null,
    });
  });

  it("should handle fetching hwe kernels", () => {
    expect(general.fetchHweKernels()).toEqual({
      type: "general/fetchHweKernels",
      meta: {
        cache: true,
        model: "general",
        method: "hwe_kernels",
      },
      payload: null,
    });
  });

  it("should handle fetching known architectures", () => {
    expect(general.fetchKnownArchitectures()).toEqual({
      type: "general/fetchKnownArchitectures",
      meta: {
        cache: true,
        model: "general",
        method: "known_architectures",
      },
      payload: null,
    });
  });

  it("should handle fetching machine actions", () => {
    expect(general.fetchMachineActions()).toEqual({
      type: "general/fetchMachineActions",
      meta: {
        cache: true,
        model: "general",
        method: "machine_actions",
      },
      payload: null,
    });
  });

  it("should handle fetching osinfo", () => {
    expect(general.fetchOsInfo()).toEqual({
      type: "general/fetchOsInfo",
      meta: {
        cache: true,
        model: "general",
        method: "osinfo",
      },
      payload: null,
    });
  });

  it("should handle fetching pockets to disable", () => {
    expect(general.fetchPocketsToDisable()).toEqual({
      type: "general/fetchPocketsToDisable",
      meta: {
        cache: true,
        model: "general",
        method: "pockets_to_disable",
      },
      payload: null,
    });
  });

  it("should handle fetching power types", () => {
    expect(general.fetchPowerTypes()).toEqual({
      type: "general/fetchPowerTypes",
      meta: {
        cache: true,
        model: "general",
        method: "power_types",
      },
      payload: null,
    });
  });

  it("should handle fetching TLS certificate", () => {
    expect(general.fetchTlsCertificate()).toEqual({
      type: "general/fetchTlsCertificate",
      meta: {
        cache: true,
        model: "general",
        method: "tls_certificate",
      },
      payload: null,
    });
  });

  it("should handle fetching Vault enabled status", () => {
    expect(general.fetchVaultEnabled()).toEqual({
      type: "general/fetchVaultEnabled",
      meta: {
        cache: true,
        model: "general",
        method: "vault_enabled",
      },
      payload: null,
    });
  });

  it("should handle fetching version", () => {
    expect(general.fetchVersion()).toEqual({
      type: "general/fetchVersion",
      meta: {
        cache: true,
        model: "general",
        method: "version",
      },
      payload: null,
    });
  });

  it("should handle generating a certificate", () => {
    expect(general.generateCertificate({ object_name: "name" })).toEqual({
      type: "general/generateCertificate",
      meta: {
        model: "general",
        method: "generate_client_certificate",
      },
      payload: {
        params: {
          object_name: "name",
        },
      },
    });
  });
});
