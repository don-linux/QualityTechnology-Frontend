import React, { useLayoutEffect, useRef } from "react";
import TextField from "@mui/material/TextField";
import {
  aplicarFormatoTexto,
  debeAplicarFormatoTexto,
  formatoMayusculaInicialEnVivo,
  FORMATOS_TEXTO,
} from "@shared/utils/formatosTexto";

/**
 * Input de texto con title case automático mientras se escribe y al perder foco.
 *
 * Detecta por type/name/select si aplica formato. Usar formato={null} para
 * desactivar explícitamente.
 */
export default function CampoTexto({
  value,
  onChange,
  name,
  type,
  select,
  inputMode,
  slotProps,
  inputProps,
  InputProps,
  readOnly,
  formato,
  onBlur,
  inputRef: inputRefProp,
  ...textFieldProps
}) {
  const inputRef = useRef(null);
  const pendingSelection = useRef(null);

  const readOnlyField =
    readOnly ||
    slotProps?.input?.readOnly ||
    inputProps?.readOnly ||
    InputProps?.readOnly;

  const formatoActivo = debeAplicarFormatoTexto({
    type,
    name,
    select,
    inputMode: inputMode || inputProps?.inputMode,
    readOnly: readOnlyField,
    formato: formato === undefined ? FORMATOS_TEXTO.MAYUSCULA_INICIAL_TODO : formato,
  });

  const setInputRef = (node) => {
    inputRef.current = node;
    if (typeof inputRefProp === "function") inputRefProp(node);
    else if (inputRefProp) inputRefProp.current = node;
  };

  useLayoutEffect(() => {
    const sel = pendingSelection.current;
    if (!sel || !inputRef.current) return;
    pendingSelection.current = null;
    try {
      inputRef.current.setSelectionRange(sel.start, sel.end);
    } catch {
      // Ignorar si el input no admite selección en este render.
    }
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value;
    const next = formatoActivo ? formatoMayusculaInicialEnVivo(raw) : raw;

    pendingSelection.current = {
      start: e.target.selectionStart ?? next.length,
      end: e.target.selectionEnd ?? next.length,
    };

    onChange?.({ target: { name, value: next } });
  };

  const handleBlur = (e) => {
    if (formatoActivo) {
      const formatted = aplicarFormatoTexto(
        e.target.value,
        FORMATOS_TEXTO.MAYUSCULA_INICIAL_TODO,
      );
      if (formatted !== e.target.value) {
        onChange?.({ target: { name, value: formatted } });
      }
    }
    onBlur?.(e);
  };

  return (
    <TextField
      {...textFieldProps}
      name={name}
      type={type}
      select={select}
      inputMode={inputMode}
      slotProps={slotProps}
      inputProps={inputProps}
      InputProps={InputProps}
      readOnly={readOnly}
      inputRef={setInputRef}
      value={value ?? ""}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
}
