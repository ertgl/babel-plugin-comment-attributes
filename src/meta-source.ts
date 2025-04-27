export function extractMetaSource(
  comment: string,
): string
{
  comment = comment.trim();

  if (!comment)
  {
    return "";
  }

  if (!comment.startsWith("#["))
  {
    return "";
  }

  if (!comment.endsWith("]"))
  {
    return "";
  }

  return comment.slice(2, -1);
}
