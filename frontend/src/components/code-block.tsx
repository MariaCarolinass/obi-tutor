export function CodeBlock({ code }: { code: string }) {
  return (
    <div className="code-block">
      <div className="code-label">
        <span className="code-dots">
          <i />
          <i />
          <i />
        </span>
        <span>Python</span>
      </div>
      <pre>
        <code>
          {code.split("\n").map((line, index) => (
            <div className="code-line" key={index}>
              <span className="line-number">{index + 1}</span>
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
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
