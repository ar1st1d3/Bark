import React from "react";

interface FileLogoProps {
  filename: string;
  className?: string;
  size?: number;
}

export const FileLogo: React.FC<FileLogoProps> = ({
  filename,
  className = "w-4 h-4",
}) => {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const baseName = filename.split("/").pop()?.toLowerCase() || "";

  // 1. Dockerfile
  if (baseName.includes("dockerfile")) {
    return (
      <svg viewBox="0 0 32 32" className={className}>
        <rect width="32" height="32" rx="4" fill="#0db7ed" />
        <path
          d="M26 14.5c-.5-.4-1.6-.5-2.5-.2-.3-1.6-1.5-2.8-3-2.8h-.8c-.7-2-2.7-3.5-5-3.5-.4 0-.8 0-1.2.1v2.9h2.2v2h-4.8v-2h2.2v-2c-.4 0-.8-.1-1.2-.1-2.4 0-4.3 1.5-5 3.5H6c-1.5 0-2.7 1.2-3 2.8-.9-.3-2-.2-2.5.2C0 15 0 16.5 1 17c1.5.8 4 1 6.5 1 6.5 0 11.5-1.5 14.5-3.5 1.5 0 3-.5 3.5-1.5.5-.5.5-1.5.5-1.5z"
          fill="#ffffff"
        />
      </svg>
    );
  }

  // 2. Git files (.gitignore, .gitmodules)
  if (baseName.startsWith(".git") || ext === "patch" || ext === "diff") {
    return (
      <svg viewBox="0 0 32 32" className={className}>
        <rect width="32" height="32" rx="4" fill="#f05032" />
        <path
          d="M24.7 14.2l-6.9-6.9a2 2 0 0 0-2.8 0L12.5 9.8l3.2 3.2a2.3 2.3 0 0 1 2.9 2.9l3.1 3.1a2.3 2.3 0 1 1-1.4 1.4l-3-3v4.6a2.3 2.3 0 1 1-2 0V17l-3-3-5 5a2 2 0 0 0 0 2.8l6.9 6.9a2 2 0 0 0 2.8 0l9.7-9.7a2 2 0 0 0 0-2.8z"
          fill="#ffffff"
        />
      </svg>
    );
  }

  // 3. React TSX
  if (ext === "tsx") {
    return (
      <svg viewBox="0 0 32 32" className={className}>
        <rect width="32" height="32" rx="4" fill="#1e293b" stroke="#3178c6" strokeWidth="1" />
        <g transform="translate(16, 16) scale(0.6)" fill="none" stroke="#61dafb" strokeWidth="2">
          <ellipse rx="18" ry="7" />
          <ellipse rx="18" ry="7" transform="rotate(60)" />
          <ellipse rx="18" ry="7" transform="rotate(120)" />
          <circle r="3.5" fill="#61dafb" stroke="none" />
        </g>
      </svg>
    );
  }

  // 4. React JSX
  if (ext === "jsx") {
    return (
      <svg viewBox="0 0 32 32" className={className}>
        <rect width="32" height="32" rx="4" fill="#1e293b" stroke="#f7df1e" strokeWidth="1" />
        <g transform="translate(16, 16) scale(0.6)" fill="none" stroke="#61dafb" strokeWidth="2">
          <ellipse rx="18" ry="7" />
          <ellipse rx="18" ry="7" transform="rotate(60)" />
          <ellipse rx="18" ry="7" transform="rotate(120)" />
          <circle r="3.5" fill="#61dafb" stroke="none" />
        </g>
      </svg>
    );
  }

  // 5. TypeScript (.ts)
  if (ext === "ts") {
    return (
      <svg viewBox="0 0 32 32" className={className}>
        <rect width="32" height="32" rx="4" fill="#3178c6" />
        <path
          d="M12 12.5h-3v-2.5h8.5v2.5h-3v9.5h-2.5v-9.5zm7.8 7.2c.8.5 1.7.8 2.6.8 1 0 1.6-.4 1.6-1.1 0-.7-.5-1-1.8-1.5-1.9-.7-3.1-1.7-3.1-3.4 0-2 1.6-3.4 3.9-3.4 1.1 0 2 .3 2.7.7l-.7 2.1c-.6-.4-1.3-.6-2-.6-1 0-1.5.4-1.5 1 0 .6.5.9 1.8 1.4 2 .8 3.1 1.7 3.1 3.5 0 2.1-1.7 3.5-4.2 3.5-1.3 0-2.4-.3-3.2-.8l.8-2.2z"
          fill="#ffffff"
        />
      </svg>
    );
  }

  // 6. JavaScript (.js, .mjs, .cjs)
  if (ext === "js" || ext === "mjs" || ext === "cjs") {
    return (
      <svg viewBox="0 0 32 32" className={className}>
        <rect width="32" height="32" rx="4" fill="#f7df1e" />
        <path
          d="M13.5 19.8c0 2.4-1.5 3.7-3.8 3.7-1.3 0-2.3-.4-3-1l1-2.1c.5.4 1.2.7 1.9.7 1 0 1.5-.5 1.5-1.5v-7.8h2.4v8zm4.3 1c.9.6 2 .9 3.1.9 1.4 0 2.2-.6 2.2-1.6 0-1-.7-1.5-2.4-2.2-2.5-1-3.9-2.3-3.9-4.3 0-2.5 1.9-4.2 4.8-4.2 1.4 0 2.5.4 3.3 1l-1 2.2c-.6-.4-1.4-.7-2.3-.7-1.2 0-2 .6-2 1.4 0 .9.7 1.3 2.5 2.1 2.6 1.1 3.9 2.4 3.9 4.4 0 2.7-2.1 4.3-5.2 4.3-1.6 0-3-.4-3.9-1l1-2.2z"
          fill="#000000"
        />
      </svg>
    );
  }

  // 7. Python (.py)
  if (ext === "py") {
    return (
      <svg viewBox="0 0 32 32" className={className}>
        <rect width="32" height="32" rx="4" fill="#1e293b" />
        <g transform="translate(5, 5) scale(0.68)">
          <path
            d="M15.8 0c-4.2 0-7.8.4-7.8 2.5v2.6h7.9v.8H5.1C2.3 5.9 0 7.8 0 11.8c0 3.5 1.9 5.8 5.1 5.9h2.2v-2.8c0-3.3 2.8-5.9 6.2-5.9h7.8V6.2C21.3 2 17.8 0 15.8 0zm-3.6 2.4a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"
            fill="#387eb8"
          />
          <path
            d="M16.2 32c4.2 0 7.8-.4 7.8-2.5v-2.6h-7.9v-.8h10.8c2.8 0 5.1-1.9 5.1-5.9 0-3.5-1.9-5.8-5.1-5.9h-2.2v2.8c0 3.3-2.8 5.9-6.2 5.9H10.7v2.8c0 4.2 3.5 6.2 5.5 6.2zm3.6-2.4a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4z"
            fill="#ffe052"
          />
        </g>
      </svg>
    );
  }

  // 8. Rust (.rs)
  if (ext === "rs") {
    return (
      <svg viewBox="0 0 32 32" className={className}>
        <rect width="32" height="32" rx="4" fill="#000000" stroke="#f74c00" strokeWidth="0.8" />
        <g transform="translate(4, 4) scale(0.75)" fill="#f74c00">
          <circle cx="16" cy="16" r="14" fill="none" stroke="#f74c00" strokeWidth="2.5" />
          <path d="M11 9v14h4v-5h2.2l3.3 5H25l-4-5.8a4.5 4.5 0 0 0 2-4.2c0-2.6-2-4-5.5-4zm4 3h2.5c1.4 0 2.3.6 2.3 1.8 0 1.2-.9 1.8-2.3 1.8H15z" />
        </g>
      </svg>
    );
  }

  // 9. HTML (.html, .htm)
  if (ext === "html" || ext === "htm") {
    return (
      <svg viewBox="0 0 32 32" className={className}>
        <rect width="32" height="32" rx="4" fill="#e34f26" />
        <path
          d="M7 6l1.6 18 7.4 2 7.4-2 1.6-18H7zm13.7 5.2h-7.4l.2 2.6h7l-.6 6.8-4.9 1.4-4.9-1.4-.3-3.5h2.6l.1 1.6 2.5.7 2.5-.7.3-3.2H9.8L9.2 8.7h11.7l-.2 2.5z"
          fill="#ffffff"
        />
      </svg>
    );
  }

  // 10. CSS / SCSS
  if (ext === "css" || ext === "scss" || ext === "sass" || ext === "less") {
    return (
      <svg viewBox="0 0 32 32" className={className}>
        <rect width="32" height="32" rx="4" fill="#1572b6" />
        <path
          d="M7 6l1.6 18 7.4 2 7.4-2 1.6-18H7zm13.7 5.2h-7.4l.2 2.6h7l-.6 6.8-4.9 1.4-4.9-1.4-.3-3.5h2.6l.1 1.6 2.5.7 2.5-.7.3-3.2H9.8L9.2 8.7h11.7l-.2 2.5z"
          fill="#ffffff"
        />
      </svg>
    );
  }

  // 11. JSON
  if (ext === "json") {
    return (
      <svg viewBox="0 0 32 32" className={className}>
        <rect width="32" height="32" rx="4" fill="#1f1f23" stroke="#f59e0b" strokeWidth="1" />
        <text
          x="16"
          y="22"
          textAnchor="middle"
          fill="#f59e0b"
          fontFamily="monospace"
          fontWeight="bold"
          fontSize="15"
        >
          {"{ }"}
        </text>
      </svg>
    );
  }

  // 12. Markdown (.md, .markdown)
  if (ext === "md" || ext === "markdown") {
    return (
      <svg viewBox="0 0 32 32" className={className}>
        <rect width="32" height="32" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
        <g fill="#38bdf8">
          <path d="M6 10v12h3v-7l3 4 3-4v7h3V10h-3l-3 4-3-4H6zm16 6v6h3v-6h2l-3.5-4L20 16h2z" />
        </g>
      </svg>
    );
  }

  // 13. Shell / Bash (.sh, .bash, .zsh)
  if (ext === "sh" || ext === "bash" || ext === "zsh") {
    return (
      <svg viewBox="0 0 32 32" className={className}>
        <rect width="32" height="32" rx="4" fill="#09090b" stroke="#22c55e" strokeWidth="1" />
        <text
          x="16"
          y="21"
          textAnchor="middle"
          fill="#22c55e"
          fontFamily="monospace"
          fontWeight="bold"
          fontSize="14"
        >
          &gt;_
        </text>
      </svg>
    );
  }

  // 14. Go (.go)
  if (ext === "go") {
    return (
      <svg viewBox="0 0 32 32" className={className}>
        <rect width="32" height="32" rx="4" fill="#00add8" />
        <text
          x="16"
          y="22"
          textAnchor="middle"
          fill="#ffffff"
          fontFamily="sans-serif"
          fontWeight="900"
          fontSize="16"
        >
          GO
        </text>
      </svg>
    );
  }

  // 15. C / C++ (.c, .cpp, .h, .hpp)
  if (["c", "cpp", "cc", "cxx", "h", "hpp"].includes(ext)) {
    return (
      <svg viewBox="0 0 32 32" className={className}>
        <rect width="32" height="32" rx="4" fill="#00599c" />
        <text
          x="16"
          y="22"
          textAnchor="middle"
          fill="#ffffff"
          fontFamily="monospace"
          fontWeight="900"
          fontSize="14"
        >
          C++
        </text>
      </svg>
    );
  }

  // Default clean code document icon
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <rect width="32" height="32" rx="4" fill="#27272a" stroke="#3f3f46" strokeWidth="1" />
      <path
        d="M12 12l-4 4 4 4m8-8l4 4-4 4m-5-9l-2 10"
        stroke="#a1a1aa"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};
