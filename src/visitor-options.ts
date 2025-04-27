import type { TransformOptions } from "@babel/core";

import type { Context } from "./context";

export type VisitorOptions = {
  context?: Context | null;
  cwd?: null | string;
  removeMetaComments?: boolean | null;
  transformOptions?: null | TransformOptions;
};
