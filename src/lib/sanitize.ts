export function sanitizeText(input: string, maxLength = 400): string {
  let text = input.trim().slice(0, maxLength);

  // Remove HTML tags including malformed ones
  text = text.replace(/<[^>]*>/g, "");

  // Strip null bytes and zero-width characters (used for XSS filter bypass)
  text = text.replace(/\0/g, "");
  text = text.replace(/[\u200B-\u200D\uFEFF]/g, "");

  // Strip inline style attributes (can hide CSS-based exfiltration)
  text = text.replace(/\bstyle\s*=\s*["'][^"']*["']/gi, "");

  // Neutralize dangerous protocol URLs (javascript:, data:, vbscript:, file:)
  text = text.replace(/[\w-]+\s*:/gi, (match) => {
    const protocol = match.toLowerCase().replace(/\s/g, "");
    const dangerous = ["javascript:", "vbscript:", "data:", "file:"];
    return dangerous.includes(protocol) ? "blocked:" : match;
  });

  // Neutralize event handler attributes (e.g., onerror, onload, OneRror)
  text = text.replace(/\bon\w+\s*=/gi, "blocked=");

  // Remove HTML entities (numeric & hex) that could decode to dangerous chars
  // Handles with and without trailing semicolon
  text = text.replace(/&#\d+;?/g, "");
  text = text.replace(/&#x[\da-f]+;?/gi, "");

  // Strip HTML entity references for angle brackets
  text = text.replace(/&lt;/gi, "");
  text = text.replace(/&gt;/gi, "");

  return text;
}
