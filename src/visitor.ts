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

  const cwd = options.cwd;

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
          if (path.removed)
          {
            return;
          }

          if (path.node.leadingComments == null)
          {
            return;
          }

          const commentIndexesToKeep: Set<number> = new Set();
          const commentIndexesToRemove: Set<number> = new Set();

          const leadingComments = path.node.leadingComments;

          for (
            let commentIdx = 0;
            commentIdx < leadingComments.length;
            commentIdx++
          )
          {
            const comment = leadingComments[commentIdx];

            if (comment.ignore)
            {
              continue;
            }

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
                __NODE__: path.node,
                __NODE_PATH__: path,
                __NODE_STATE__: path.state,
                __PROGRAM_NODE__: programPath.node,
                __PROGRAM_NODE_PATH__: programPath,
                __PROGRAM_STATE__: programState,
                __REMOVE_COMMENT_BY_IDX__: commentIndexesToRemove.add.bind(
                  commentIndexesToRemove,
                ),
              },
              transpiled,
              comment.loc,
            );

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (path.removed)
            {
              for (const comment of leadingComments)
              {
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
            leadingComments[commentIdx].ignore = true;
          }
        },
      });
    },
  };
}
