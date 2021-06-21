import { define, extend, random } from "cooky-cutter";

import { model } from "./model";

import type {
  Domain,
  DomainDetails,
  DomainResource,
} from "app/store/domain/types";
import { RecordType } from "app/store/domain/types";
import type { Model } from "app/store/types/model";

export const domain = extend<Model, Domain>(model, {
  created: "Wed, 08 Jul. 2020 05:35:4",
  updated: "Wed, 08 Jul. 2020 05:35:4",
  name: "test name",
  authoritative: false,
  ttl: null,
  hosts: random,
  resource_count: random,
  displayname: "test display",
  is_default: false,
});

export const domainDetails = extend<Domain, DomainDetails>(domain, {
  rrsets: () => [],
});

export const domainResource = define<DomainResource>({
  dnsdata_id: null,
  dnsresource_id: null,
  name: "test-resource",
  node_type: null,
  rrdata: "test-data",
  rrtype: RecordType.TXT,
  system_id: null,
  ttl: null,
  user_id: null,
});
