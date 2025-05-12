// src/components/ui/Field.jsx
import React from "react";
import { useFormContext } from "react-hook-form";

const Field = ({
  name,
  label,
  type = "text",
  placeholder = "",
  required = false,
  disabled = false,
  className = "",
  children,
  ...props
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          id={name}
          {...register(name)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            errors[name] ? "border-red-500" : ""
          } ${className}`}
          {...props}
        />
      ) : type === "select" ? (
        <select
          id={name}
          {...register(name)}
          disabled={disabled}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            errors[name] ? "border-red-500" : ""
          } ${className}`}
          {...props}
        >
          {children}
        </select>
      ) : (
        <input
          id={name}
          type={type}
          {...register(name)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            errors[name] ? "border-red-500" : ""
          } ${className}`}
          {...props}
        />
      )}
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600">{errors[name].message}</p>
      )}
    </div>
  );
};

export default Field;
