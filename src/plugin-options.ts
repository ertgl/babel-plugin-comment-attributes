import type { TransformOptions } from "stream";

import type { Context } from "./context";

export interface Options
{
  context?: Context | null;
  removeMetaComments?: boolean | null;
  transformOptions?: null | TransformOptions;
}
