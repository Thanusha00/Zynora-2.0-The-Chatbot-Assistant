const injectionPatterns = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /ignore\s+(your\s+)?knowledge\s+base/i,
  /use\s+your\s+own\s+knowledge/i,
  /search\s+the\s+internet/i,
  /browse\s+the\s+web/i,
  /forget\s+the\s+rag/i,
  /bypass\s+(the\s+)?knowledge\s+base/i
];

function isPromptInjection(text) {
  return injectionPatterns.some((pattern) => pattern.test(text));
}

function sanitizeMessage(text) {
  return String(text || "").trim().slice(0, 2000);
}

module.exports = { isPromptInjection, sanitizeMessage };
