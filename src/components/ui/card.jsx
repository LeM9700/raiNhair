// src/components/ui/card.jsx
import React from "react";

export function Card({ className = "", children }) {
  return (
    <div className={`bg-white rounded-2xl shadow-lg transition-shadow ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children }) {
  return <div className={`px-6 pt-6 ${className}`}>{children}</div>;
}

export function CardTitle({ className = "", children }) {
  return <h3 className={`${className}`}>{children}</h3>;
}

export function CardContent({ className = "", children }) {
  return <div className={`px-6 pt-2 ${className}`}>{children}</div>;
}

export function CardFooter({ className = "", children }) {
  return <div className={`px-6 pb-6 ${className}`}>{children}</div>;
}
