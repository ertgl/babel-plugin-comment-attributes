import type {
  PluginPass,
  Visitor,
} from "@babel/core";

import { createContext } from "./context";
import { cfg } from "./meta-lib";
import { extractMetaSource } from "./meta-source";
import { transpileMetaSource } from "./meta-transpiler";
import { evalMetaSource } from "./meta-vm";
import type { VisitorOptions } from "./visitor-options";

export function createVisitor(
  options?: null | VisitorOptions,
): Visitor<PluginPass>
{
  options ??= {};

  const context = createContext(options.context);

  const cwd = options.cwd ?? undefined;

  const shouldRemoveMetaComments = (
    options.removeMetaComments
    ?? true
  );

  const transformOptions = (
    options.transformOptions
    ?? {}
  );

  return {
    Program(
      programPath,
      programState,
    )
    {
      programPath.traverse({
        enter(path)
        {
          // @ts-expect-error - Missing types.
          if (path.removed)
          {
            return;
          }

          // @ts-expect-error - Missing types.
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (path.node.leadingComments == null)
          {
            return;
          }

          const commentIndexesToKeep: Set<number> = new Set();
          const commentIndexesToRemove: Set<number> = new Set();

          // @ts-expect-error - Missing types.
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          const leadingComments = path.node.leadingComments;

          for (
            let commentIdx = 0;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            commentIdx < leadingComments.length;
            commentIdx++
          )
          {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const comment = leadingComments[commentIdx];

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (comment.ignore)
            {
              continue;
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
            const source = extractMetaSource(comment.value);

            if (!source)
            {
              continue;
            }

            const transpiled = transpileMetaSource(
              source,
              {
                ...transformOptions,
                cwd,
                filename: programState.filename,
              },
            );

            if (!transpiled)
            {
              continue;
            }

            evalMetaSource(
              programPath,
              programState,
              path,
              // @ts-expect-error - Missing types.
              path.state,
              {
                cfg,
                ...context,
                __COMMENT__: comment,
                __COMMENT_IDX__: commentIdx,
                __KEEP_COMMENT_BY_IDX__: commentIndexesToKeep.add.bind(
                  commentIndexesToKeep,
                ),
                __META_AST__: transpiled.ast,
                __META_BABEL_FILE__: transpiled,
                __META_SOURCE__: source,
                // @ts-expect-error - Missing types.
                __NODE__: path.node,
                __NODE_PATH__: path,
                // @ts-expect-error - Missing types.
                __NODE_STATE__: path.state,
                __PROGRAM_NODE__: programPath.node,
                __PROGRAM_NODE_PATH__: programPath,
                __PROGRAM_STATE__: programState,
                __REMOVE_COMMENT_BY_IDX__: commentIndexesToRemove.add.bind(
                  commentIndexesToRemove,
                ),
              },
              transpiled,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
              comment.loc,
            );

            // @ts-expect-error - Missing types.
            if (path.removed)
            {
              for (const comment of leadingComments)
              {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                comment.ignore = true;
              }

              return;
            }

            if (
              shouldRemoveMetaComments
              && !commentIndexesToKeep.has(commentIdx)
            )
            {
              commentIndexesToRemove.add(commentIdx);
            }
          }

          for (const commentIdx of commentIndexesToRemove)
          {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            leadingComments[commentIdx].ignore = true;
          }
        },
      });
    },
  };
}
