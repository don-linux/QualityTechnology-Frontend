import { useState } from "react";

export default function useFormValidation() {
  const [errors, setErrors] = useState({});

  const validate = (form, requiredFields) => {
    const newErrors = {};
    for (const field of requiredFields) {
      const value = form[field];
      if (value === undefined || value === null || String(value).trim() === "") {
        newErrors[field] = "Campo requerido";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearFieldError = (fieldName) => {
    setErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const { [fieldName]: _, ...rest } = prev;
      return rest;
    });
  };

  const clearErrors = () => setErrors({});

  return { errors, validate, clearFieldError, clearErrors };
}
