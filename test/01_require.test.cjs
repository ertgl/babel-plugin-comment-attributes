const { strictEqual } = require("node:assert");
const { test } = require("node:test");

void test(
  "require the plugin",
  (t) =>
  {
    const {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - Available after build.
      plugin,
    } = require("babel-plugin-comment-attributes");

    strictEqual(typeof plugin, "function");
  },
);
