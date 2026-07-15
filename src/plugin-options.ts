import type { InputOptions } from "@babel/core";

import type { Context } from "./context";

export interface Options
{
  context?: Context | null;
  removeMetaComments?: boolean | null;
  transformOptions?: InputOptions | null;
}
