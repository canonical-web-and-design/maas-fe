import type { Controller } from "app/store/controller/types";
import { argPath } from "app/utils";

const urls = {
  controllers: {
    index: "/controllers",
  },
  controller: {
    index: argPath<{ id: Controller["system_id"] }>("/controller/:id"),
  },
};

export default urls;
