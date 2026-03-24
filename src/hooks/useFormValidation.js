import { useState, useCallback } from "react";

export default function useFormValidation() {
  const [errors, setErrors] = useState({});

  const validate = useCallback((form, requiredFields) => {
    const newErrors = {};
    for (const field of requiredFields) {
      const value = form[field];
      if (value === undefined || value === null || String(value).trim() === "") {
        newErrors[field] = "Campo requerido";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const clearFieldError = useCallback((fieldName) => {
    setErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const { [fieldName]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors((prev) => (Object.keys(prev).length === 0 ? prev : {}));
  }, []);

  return { errors, validate, clearFieldError, clearErrors };
}
