import * as React from "react";

function IconInfo(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      height="1em"
      width="1em"
      {...props}
    >
      <defs>
        <linearGradient id="gradient" gradientTransform="rotate(45)">
          <stop offset="0%" stopColor="#00EE66" />
          <stop offset="100%" stopColor="#0475E6" />
        </linearGradient>
      </defs>
      <path
        d="M12 22a10 10 0 110-20 10 10 0 010 20zm0-2a8 8 0 100-16 8 8 0 000 16zm0-9a1 1 0 011 1v4a1 1 0 01-2 0v-4a1 1 0 011-1zm0-4a1 1 0 110 2 1 1 0 010-2z"
        fill="url(#gradient)"
      />
    </svg>
  );
}

export default IconInfo;

