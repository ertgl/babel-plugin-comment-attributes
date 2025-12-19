import {
  type BabelAPI,
  declare,
} from "@babel/helper-plugin-utils";

import type { Options } from "./plugin-options";
import { createVisitor } from "./visitor";

export const plugin = declare<Options>(
  (
    api: BabelAPI,
    options: null | Options | undefined,
    dirname: string,
  ) =>
  {
    options ??= {};

    return {
      visitor: createVisitor({
        context: options.context,
        cwd: dirname,
        removeMetaComments: options.removeMetaComments,
      }),
    };
  },
);
