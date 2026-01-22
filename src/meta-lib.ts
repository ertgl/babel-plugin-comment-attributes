export function cfg<
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  T extends 0 | "" | false | null | undefined,
>(
  value: T,
): null;
export function cfg<T>(
  value: T,
): T;
export function cfg<T>(
  value: T,
): null | T
{
  if (!value)
  {
    return null;
  }

  return value;
}
