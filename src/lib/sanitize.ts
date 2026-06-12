export function sanitizeText(input: string, maxLength = 400): string {
  let text = input.trim().slice(0, maxLength);

  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, "");

  // Neutralize dangerous protocol URLs (javascript:, data: in href context, vbscript:)
  text = text.replace(/[\w-]+\s*:/gi, (match) => {
    const protocol = match.toLowerCase().replace(/\s/g, "");
    const dangerous = ["javascript:", "vbscript:", "data:", "file:"];
    return dangerous.includes(protocol) ? "blocked:" : match;
  });

  // Neutralize remaining on* event handler attributes (e.g., onerror, onload, onfocus)
  text = text.replace(/\bon\w+\s*=/gi, "blocked=");

  // Remove HTML entities that might decode to dangerous characters
  text = text.replace(/&#\d+;/g, "");
  text = text.replace(/&#x[\da-f]+;/gi, "");

  return text;
}
