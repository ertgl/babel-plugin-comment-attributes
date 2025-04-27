import {
  createContext,
  runInNewContext,
} from "node:vm";

import {
  type BabelFileResult,
  type Node,
  type NodePath,
  type PluginPass,
} from "@babel/core";

import type { Context } from "./context";

import { isMetaOperator } from "./meta-operator";

export function evalMetaSource(
  programPath: NodePath,
  programState: PluginPass,
  nodePath: NodePath,
  nodeState: unknown,
  context: Context,
  transpiled: BabelFileResult,
  loc?: Exclude<Node["leadingComments"], null | undefined>[number]["loc"] | null,
): unknown
{
  if (!transpiled.code)
  {
    return null;
  }

  const vmContext = createContext(context);

  const result = runInNewContext(
    transpiled.code,
    vmContext,
    {
      columnOffset: loc?.start.column,
      filename: transpiled.ast?.loc?.filename,
      lineOffset: loc?.start.line,
    },
  ) as unknown;

  if (isMetaOperator(result))
  {
    return result(
      programPath,
      programState,
      nodePath,
      nodeState,
      context,
    );
  }

  return result;
}
