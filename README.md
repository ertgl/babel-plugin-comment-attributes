# babel-plugin-comment-attributes

[Babel](https://babeljs.io/) plugin to support free-form metadata in comment
attributes. Inspired by [Rust](https://www.rust-lang.org/) language.

## Overview

`babel-plugin-comment-attributes` is a Babel plugin that introduces
compile-time preprocessing capabilities to the JavaScript language family.

This can be useful for various purposes, including:

- **Conditional compilation**: Include or exclude code elements based on
  specific conditions.
- **Code generation**: Generate code based on attributes specified in comments,
  similar to macros in functional programming languages.
- **Metadata annotation**: Attach metadata to code elements for documentation,
  analysis, optimization, or other purposes.

**Note**: Depending on the use case, using a preprocessor or a loosely coupled
macro system in a regular imperative programming language may be considered an
anti-pattern. The necessary solution must be carefully determined in accordance
with the purpose.

## Installation

The package is available on npm and can be installed using any compatible
package manager.

```sh
npm install --save-dev babel-plugin-comment-attributes
```

## Usage

For the plugin to work, it must be added to the Babel configuration. See the
following code snippet as a reference.

```js
/**
 * @import {
 *   type Options as CommentAttributesOptions,
 * } from "babel-plugin-comment-attributes";
 */

/**
 * @type {CommentAttributesOptions}
 */
const commentAttributesOptions = {
  context: {
    // The key-value pairs in the context object are used as global variables
    // in the meta-sources. The values can be any valid JavaScript expression,
    // including functions, objects, and primitive values.
    esm: true,
  },
};

module.exports = {
  plugins: [
    [
      require.resolve("babel-plugin-comment-attributes"),
      commentAttributesOptions,
    ],
  ],
};
```

## Example

The following example demonstrates how to use the plugin to conditionally
compile code based on the presence of a directive in a comment.

```txt
// #[cfg(esm) ?? __NODE_PATH__.remove()]
const __filename = new URL(import.meta.url).pathname;
```

Let's break down this example. The JavaScript code extracted from the comment
is the following:

```ts
cfg(esm) ?? __NODE_PATH__.remove()
```

Which is equivalent to the following JavaScript code:

```ts
(esm ? esm : null) ?? __NODE_PATH__.remove()
```

The special variable `__NODE_PATH__` is a Babel object that contains the
AST node of the code element following the comment currently being processed.
The `remove()` method removes the node from the AST. Which means that the code
element will be removed from the output if the `esm` variable is falsy. `esm`
variable here comes from the context object, as it is set to `true` in the
Babel configuration (see the previous section). Because the value of `esm` is
truthy, the code element will be present in the output.

More information about the syntax and semantics of the comment attributes can be
found in the [Syntax and Semantics](#syntax-and-semantics) section.

## Syntax and Semantics

The whole logic is quite simple. The plugin parses specially formatted comments
(`meta-comments`), extracts the directives (`meta-source`), then compiles the
meta-source using Babel, and evaluates the transpiled code with
[Node.js VM](https://nodejs.org/api/vm.html).

### Meta-comments

Meta-comments are comments that contain directives. They are written in a
special format that allows the plugin to recognize them. The format is as
follows:

- Starts with `#[` prefix.
- Continues with a meta-source that can be parsed by Babel (JavaScript by
  default).
- Ends with `]` suffix.

### Meta-source

Meta-source is the code that is extracted from the meta-comment. It can be any
valid code. The plugin will parse the meta-source and evaluate it at compile
time.

### Meta-operator

Meta-operators are special JavaScript functions. They are used in meta-sources
without being called directly. After evaluating the meta-source, processor
checks if the result is a meta-operator. If it is, the processor calls the
operator with the following arguments:

- `__PROGRAM_PATH__`: The path object for the AST node of the program currently
  being processed.
- `__PROGRAM_STATE__`: The state object for the AST node of the program
  currently being processed.
- `__NODE_PATH__`: The path object for the AST node of the code element
  following the meta-comment currently being processed.
- `__NOTE_STATE__`: The state object for the AST node of the code element
  following the meta-comment currently being processed.
- Context: The context object passed to the plugin. It also contains the
  special variables at this stage.

To be able to use a meta-operator, it must be provided in the context object.
The function `defineMetaOperator` can be used to define a meta-operator with
the guide of the type definitions.

For demonstration purposes, the following code defines a meta-operator that
removes the node from the AST:

```ts
import { defineMetaOperator } from "babel-plugin-comment-attributes";

export const OPERATOR_REMOVE = defineMetaOperator({
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

const remove = () => OPERATOR_REMOVE;
```

After that, usage of this meta-operator in a meta-source would look like this:

```ts
// #[cfg(esm) ?? remove()]
const require = createRequire(new URL(import.meta.url).pathname);
```

### Context

The context object stores the global variables to be available in meta-sources.
It can be extended with any key-value pairs using the `context` option in the
plugin options. The special variables (except `cfg`) in the context object
cannot be overridden.

### Special Variables

The plugin provides a set of special variables that can be used in
meta-sources. These variables are available in the context of
meta-sources and they can be used to access/set information about the code
being processed, and/or to control the behavior of the processor.

The following table lists the special variables provided by the plugin:

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>cfg</code></td>
      <td>
        Function that accepts a single argument. Returns <code>null</code> if
        the argument is falsy, otherwise returns the argument itself. It can be
        overridden by providing a custom implementation in the
        <code>context</code> object.
      </td>
    </tr>
    <tr>
      <td><code>__COMMENT__</code></td>
      <td>
        Code element of the leading meta-comment currently being processed.
      </td>
    </tr>
    <tr>
      <td><code>__COMMENT_IDX__</code></td>
      <td>
        Index of the leading meta-comment currently being processed.
      </td>
    </tr>
    <tr>
      <td><code>__KEEP_COMMENT_BY_IDX__</code></td>
      <td>
        Function that accepts a comment index as an argument. Marks the comment
        at the specified index to be kept in the output.
      </td>
    </tr>
    <tr>
      <td><code>__META_AST__</code></td>
      <td>
        The AST of the meta-source currently being processed.
      </td>
    </tr>
    <tr>
      <td><code>__META_BABEL_FILE__</code></td>
      <td>
        The Babel file object of the meta-source currently being processed.
      </td>
    </tr>
    <tr>
      <td><code>__META_SOURCE__</code></td>
      <td>
        The meta-source currently being processed.
      </td>
    </tr>
    <tr>
      <td><code>__NODE__</code></td>
      <td>
        The AST node of the code element following the leading meta-comment
        currently being processed.
      </td>
    </tr>
    <tr>
      <td><code>__NODE_PATH__</code></td>
      <td>
        The path object for the AST node of the code element following the
        leading meta-comment currently being processed.
      </td>
    </tr>
    <tr>
      <td><code>__NODE_STATE__</code></td>
      <td>
        The state object for the AST node of the code element following the
        leading meta-comment currently being processed.
      </td>
    </tr>
    <tr>
      <td><code>__PROGRAM_NODE__</code></td>
      <td>
        The AST node of the program currently being processed.
      </td>
    </tr>
    <tr>
      <td><code>__PROGRAM_NODE_PATH__</code></td>
      <td>
        The path object for the AST node of the program currently being
        processed.
      </td>
    </tr>
    <tr>
      <td><code>__PROGRAM_STATE__</code></td>
      <td>
        The state object for the AST node of the program currently being
        processed.
      </td>
    </tr>
    <tr>
      <td><code>__REMOVE_COMMENT_BY_IDX__</code></td>
      <td>
        Function that accepts a comment index as an argument. Marks the
        comment at the specified index to be removed from the output.
        Meta-comments are removed from the output by default, unless overridden
        by the <code>removeMetaComments</code> option.
      </td>
    </tr>
  </tbody>
</table>

## References

- [Attributes - The Rust Reference](https://doc.rust-lang.org/reference/attributes.html)
- [Conditional compilation - Wikipedia](https://en.wikipedia.org/wiki/Conditional_compilation)
- [Macro (computer science) - Wikipedia](https://en.wikipedia.org/wiki/Macro_(computer_science))

## License

This project is licensed under the
[MIT License](https://opensource.org/license/mit).
See the [LICENSE](LICENSE) file for more information.
