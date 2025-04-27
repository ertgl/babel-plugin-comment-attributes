export type Context = Record<string, unknown>;

export function createContext(
  globals?: Context | null,
): Context
{
  return {
    ...globals,
  };
}
