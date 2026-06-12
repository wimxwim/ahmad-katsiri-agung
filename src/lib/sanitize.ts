export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

export function sanitizeText(input: string, maxLength = 400): string {
  const trimmed = input.trim().slice(0, maxLength);
  return stripHtml(trimmed);
}
