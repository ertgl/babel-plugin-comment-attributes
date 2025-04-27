import {
  type BabelFileResult,
  parseSync,
  transformFromAstSync,
  type TransformOptions,
} from "@babel/core";

import { resolveMetaTransformOptions } from "./meta-transform-options";

export function transpileMetaSource(
  source: string,
  transformOptions?: null | TransformOptions,
): BabelFileResult | null
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
