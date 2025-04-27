import type { TransformOptions } from "@babel/core";

export function resolveMetaTransformOptions(
  transformOptions?: null | TransformOptions,
): TransformOptions
{
  transformOptions ??= {};

  const babelrc = transformOptions.babelrc ?? false;
  const babelrcRoots = transformOptions.babelrcRoots ?? false;

  const browserslistConfigFile = (
    transformOptions.browserslistConfigFile
    ?? false
  );

  const sourceMaps = transformOptions.sourceMaps ?? "inline";

  const targets = transformOptions.targets ?? {
    // eslint-disable-next-line @cspell/spellchecker
    esmodules: false,
    node: "current",
  };

  return {
    ...transformOptions,
    babelrc,
    babelrcRoots,
    browserslistConfigFile,
    sourceMaps,
    targets,
  };
}
