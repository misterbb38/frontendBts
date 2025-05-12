// src/components/ui/Loader.jsx
import React from "react";

const Loader = ({ size = "md", className = "" }) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-500 ${sizes[size]}`}
      />
    </div>
  );
};

export default Loader;
