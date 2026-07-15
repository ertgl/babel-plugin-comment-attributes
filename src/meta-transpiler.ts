import {
  type FileResult,
  type InputOptions,
  parseSync,
  transformFromAstSync,
} from "@babel/core";

import { resolveMetaTransformOptions } from "./meta-transform-options";

export function transpileMetaSource(
  source: string,
  transformOptions?: InputOptions | null,
): FileResult | null
{
  transformOptions = resolveMetaTransformOptions(transformOptions);

  const ast = parseSync(
    source,
    transformOptions,
  );

  if (ast == null)
  {
    return null;
  }

  const transpiled = transformFromAstSync(
    ast.program,
    source,
    transformOptions,
  );

  return transpiled;
}
