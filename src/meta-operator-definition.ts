import {
  type MetaOperator,
  type MetaOperatorFunction,
} from "./meta-operator";
import { SYMBOL_META_OPERATOR } from "./meta-operator-symbol";

export type MetaOperatorDefinition = {
  name?: null | string;
  operate: MetaOperatorFunction;
};

export function defineMetaOperator(
  definition: MetaOperatorDefinition,
): MetaOperator
{
  const {
    name,
    operate,
  } = definition;

  operate[SYMBOL_META_OPERATOR] = {
    name: name ?? "",
  };

  return operate as MetaOperator;
}
