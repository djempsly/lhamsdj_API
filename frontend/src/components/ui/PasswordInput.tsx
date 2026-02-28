"use client";

import { useState, useCallback } from "react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/>
      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/>
      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/>
      <path d="m2 2 20 20"/>
    </svg>
  );
}

export default function PasswordInput({ className, type, ...rest }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  const toggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVisible((v) => !v);
  }, []);

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <input
        {...rest}
        type={visible ? "text" : "password"}
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition ${className || ""}`}
        style={{ paddingRight: 44 }}
      />
      <div
        role="button"
        tabIndex={-1}
        onClick={toggle}
        onMouseDown={(e) => e.preventDefault()}
        style={{
          position: "absolute",
          right: 8,
          top: "50%",
          transform: "translateY(-50%)",
          cursor: "pointer",
          padding: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 20,
          color: "#6b7280",
          userSelect: "none",
        }}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </div>
    </div>
  );
}
