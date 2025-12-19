import type {
  NodePath,
  PluginPass,
} from "@babel/core";

import type { Context } from "./context";
import type { MetaOperatorMetadata } from "./meta-operator-metadata";
import { SYMBOL_META_OPERATOR } from "./meta-operator-symbol";

export interface MetaOperator extends MetaOperatorFunction
{
  readonly [SYMBOL_META_OPERATOR]: MetaOperatorMetadata;
}

export type MetaOperatorFunction = {
  [SYMBOL_META_OPERATOR]?: MetaOperatorMetadata | null;
  (
    programPath: NodePath,
    programState: PluginPass,
    nodePath: NodePath,
    nodeState: unknown,
    context: Context,
  ): unknown;
};

export function isMetaOperator(
  value: unknown,
): value is MetaOperator
{
  return (
    typeof value === "function"
    && SYMBOL_META_OPERATOR in value
    && (value as MetaOperatorFunction)[SYMBOL_META_OPERATOR] != null
  );
}
