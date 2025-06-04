// src/components/ui/input.jsx
import React from "react";

export function Input({
  id,
  type = "text",
  placeholder = "",
  value,
  onChange,
  className = "",
  ...props
}) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`
        block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-gray-900
        placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200
        focus:outline-none transition
        ${className}
      `}
      {...props}
    />
  );
}
