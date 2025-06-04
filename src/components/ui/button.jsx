// src/components/ui/button.jsx
import React from "react";

export function Button({ children, onClick, variant = "default", disabled = false, className = "" }) {
  const baseStyles = `
    inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-semibold shadow-lg transition
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `;

  const variants = {
    default: `
      bg-gradient-to-r from-blue-500 to-indigo-500 text-white
      hover:from-blue-600 hover:to-indigo-600
      focus:ring-indigo-500
    `,
    outline: `
      border border-gray-300 bg-white text-gray-700
      hover:bg-gray-50
      focus:ring-gray-200
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-pink-500 text-white
      hover:from-red-600 hover:to-pink-600
      focus:ring-red-500
    `,
  };

  const disabledStyles = "opacity-50 cursor-not-allowed";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variants[variant] || variants.default}
        ${disabled ? disabledStyles : ""}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
