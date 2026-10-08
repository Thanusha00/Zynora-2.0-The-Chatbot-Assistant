const injectionPatterns = [
  /ignore\s+(all\s+)?previous\s+instructions/i,

  /ignore\s+(your\s+)?knowledge\s+base/i,

  /use\s+your\s+own\s+knowledge/i,

  /search\s+the\s+internet/i,

  /search\s+google/i,

  /google\s+search/i,

  /browse\s+the\s+web/i,

  /browse\s+internet/i,

  /forget\s+the\s+rag/i,

  /bypass\s+(the\s+)?knowledge\s+base/i,

  /bypass\s+(the\s+)?rag/i,

  /reveal\s+(your\s+)?system\s+prompt/i,

  /show\s+(me\s+)?(your\s+)?system\s+prompt/i,

  /reveal\s+hidden\s+instructions/i,

  /show\s+hidden\s+instructions/i,

  /ignore\s+rag\s+restrictions/i,

  /ignore\s+the\s+rag\s+restriction/i,

  /use\s+external\s+knowledge/i,

  /answer\s+from\s+external\s+knowledge/i,

  /another\s+user.*conversation/i,

  /another\s+user.*chat/i,

  /show\s+another\s+user/i,

  /access\s+another\s+user/i,

  /bypass\s+restrictions/i,

  /bypass\s+security/i
];

function isPromptInjection(text) {
  const input = String(text || "");

  return injectionPatterns.some(
    (pattern) => pattern.test(input)
  );
}

function sanitizeMessage(text) {
  return String(text || "")
    .trim()
    .slice(0, 2000);
}

module.exports = {
  isPromptInjection,
  sanitizeMessage
};