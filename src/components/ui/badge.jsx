// src/components/ui/badge.jsx
import React from "react";

export function Badge({ variant = "default", className = "", children }) {
  const base = "px-2 py-1 rounded-full text-sm font-medium";
  const variants = {
    default: "bg-gray-100 text-gray-700",
    outline: "bg-transparent border border-gray-300 text-gray-700",
  };
  return <span className={`${base} ${variants[variant] || variants.default} ${className}`}>{children}</span>;
}
