import React from "react";
import TextField from "@mui/material/TextField";
import { NumericFormat } from "react-number-format";

/**
 * Input numérico con separadores de miles (ej. 1,234,567.89).
 *
 * Se integra con el patrón habitual de formularios del proyecto: emite
 * `onChange` con un evento sintético `{ target: { name, value } }` donde
 * `value` es el número CRUDO sin separadores (ej. "1234567"). Así el estado
 * del formulario, las validaciones y el envío al backend siguen recibiendo un
 * número limpio, sin comas.
 *
 * Props principales:
 *  - value:        número crudo (string|number) desde el estado del formulario.
 *  - onChange:     (e) => void; recibe e.target.name y e.target.value crudos.
 *  - decimalScale: nº de decimales permitidos. 0 = solo enteros.
 *                  Si se omite, se permiten decimales libres.
 *  - allowNegative (default false), prefix, thousandSeparator, decimalSeparator.
 *  - El resto de props se reenvían al <TextField> de MUI
 *    (label, name, error, helperText, fullWidth, disabled, inputProps, sx...).
 *
 * NOTA: No pasar `type="number"`; este componente usa un input de texto para
 * poder mostrar los separadores de miles.
 */
export default function CampoNumerico({
  value,
  onChange,
  name,
  decimalScale,
  allowNegative = false,
  thousandSeparator = ",",
  decimalSeparator = ".",
  prefix,
  ...textFieldProps
}) {
  return (
    <NumericFormat
      {...textFieldProps}
      name={name}
      value={value ?? ""}
      customInput={TextField}
      thousandSeparator={thousandSeparator}
      decimalSeparator={decimalSeparator}
      decimalScale={decimalScale}
      allowNegative={allowNegative}
      prefix={prefix}
      valueIsNumericString
      onValueChange={(values, sourceInfo) => {
        // Propagar únicamente los cambios originados por el usuario para evitar
        // bucles cuando el valor se reformatea por un cambio de prop.
        if (sourceInfo.source !== "event") return;
        onChange?.({ target: { name, value: values.value } });
      }}
    />
  );
}
