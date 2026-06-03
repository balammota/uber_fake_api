import Prism from "prismjs";
import "prismjs/components/prism-json";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-bash";

Prism.languages.kv = {
  key: {
    pattern: /^[\w_]+(?=\s*:)/m,
    alias: "property",
  },
  value: {
    pattern: /(?<=:\s*).+$/m,
    alias: "string",
  },
  comment: {
    pattern: /\(.*\)$/m,
    alias: "comment",
  },
};

Prism.languages.http = {
  "status-line": {
    pattern: /^HTTP\/[\d.]+ \d+ [\w ]+$/m,
    alias: "important",
  },
  header: {
    pattern: /^[\w-]+:\s*.+$/m,
    inside: {
      "header-name": {
        pattern: /^[\w-]+/,
        alias: "property",
      },
      "header-value": {
        pattern: /(?<=:\s*).+$/,
        alias: "string",
      },
    },
  },
  json: {
    pattern: /(\{)[\s\S]*(\})/,
    lookbehind: true,
    inside: Prism.languages.json,
  },
};

export function highlightCode(code, language) {
  const grammar = Prism.languages[language];
  if (!grammar) {
    return Prism.util.encode(code);
  }
  return Prism.highlight(code.trimEnd(), grammar, language);
}
