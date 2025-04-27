import { strictEqual } from "node:assert";
import { dirname } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { transformSync } from "@babel/core";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Available after build.
import {
  default as commentAttributesPlugin,
  defineMetaOperator,
} from "babel-plugin-comment-attributes";

/**
 * @import {
 *   type Context as BabelCommentAttributesPluginContext,
 *   type Options as BabelCommentAttributesPluginOptions,
 * } from "../src/index.js";
 */

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

/**
 * @param {string} code
 * @param {BabelCommentAttributesPluginContext} context
 * @param {BabelCommentAttributesPluginOptions | null} [options]
 * @returns {string}
 */
function transpileCode(
  code,
  context,
  options,
)
{
  options ??= {};

  /**
   * @type {BabelCommentAttributesPluginOptions}
   */
  const commentAttributesPluginOptions = {
    ...options,
    context,
  };

  const result = transformSync(
    code,
    {
      babelrc: false,
      babelrcRoots: false,
      browserslistConfigFile: false,
      configFile: false,
      cwd: __dirname,
      filename: __filename,
      plugins: [
        [
          commentAttributesPlugin,
          commentAttributesPluginOptions,
        ],
      ],
      root: __dirname,
      sourceType: "unambiguous",
    },
  );

  return result?.code ?? "";
}

void test(
  "falsy values results with no-op",
  (t) =>
  {
    const metaSource = `null`;
    const metaComment = `#[${metaSource}]`;
    const rawSource = `process.exit(0);`;

    const source = `
      // ${metaComment}
      ${rawSource}
    `;

    const expected = rawSource;

    const transpiled = transpileCode(
      source,
      {},
    );

    strictEqual(transpiled, expected);
  },
);

void test(
  "cfg returns null for falsy values",
  (t) =>
  {
    const metaSource = `cfg(esm) ?? __NODE_PATH__.remove()`;
    const metaComment = `#[${metaSource}]`;

    const rawSource = `const require = createRequire(import.meta.url);`;

    const source = `
    // ${metaComment}
    ${rawSource}
    `;

    const expected = ``;

    const transpiled = transpileCode(
      source,
      {
        esm: false,
      },
    );

    strictEqual(transpiled, expected);
  },
);

void test(
  "cfg returns value's itself for truthy values",
  (t) =>
  {
    const metaSource = `cfg(esm) ?? __NODE_PATH__.remove()`;
    const metaComment = `#[${metaSource}]`;

    const rawSource = `const require = createRequire(import.meta.url);`;

    const source = `
    // ${metaComment}
    ${rawSource}
    `;

    const expected = rawSource;

    const transpiled = transpileCode(
      source,
      {
        esm: true,
      },
    );

    strictEqual(transpiled, expected);
  },
);

void test(
  "define and use a meta-operator",
  (t) =>
  {
    const metaSource = `cfg(esm) ?? remove()`;
    const metaComment = `#[${metaSource}]`;

    const rawSource = `const require = createRequire(import.meta.url);`;

    const source = `
    // ${metaComment}
    ${rawSource}
    `;

    const expected = ``;

    const transpiled = transpileCode(
      source,
      {
        esm: false,
        remove: () =>
        {
          return defineMetaOperator({
            name: "remove",
            operate: (
              programPath,
              programState,
              nodePath,
              nodeState,
              context,
            ) =>
            {
              nodePath.remove();
            },
          });
        },
      },
    );

    strictEqual(transpiled, expected);
  },
);
