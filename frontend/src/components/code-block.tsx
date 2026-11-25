export function CodeBlock({ code, label = "Python" }: { code: string; label?: string }) {
  return (
    <div className="code-block">
      <div className="code-label">
        <span className="code-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>{label}</span>
      </div>
      <pre>
        <code>
          {code.split("\n").map((line, index) => (
            <span className="code-line" key={index}>
              <span className="line-number" aria-hidden="true">
                {index + 1}
              </span>
              <span>
                {line
                  .split(
                    /("[^"]*"|'[^']*'|\b(?:if|else|for|in|while|True|False|print|range|int|input)\b|\b\d+\b|#.*)/g,
                  )
                  .map((token, j) => (
                    <span
                      key={j}
                      className={
                        token.startsWith("#")
                          ? "syntax-comment"
                          : /^['"]/.test(token)
                            ? "syntax-string"
                            : /^\d+$/.test(token)
                              ? "syntax-number"
                              : /^(if|else|for|in|while|True|False)$/.test(token)
                                ? "syntax-keyword"
                                : /^(print|range|int|input)$/.test(token)
                                  ? "syntax-function"
                                  : undefined
                      }
                    >
                      {token}
                    </span>
                  ))}
              </span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
