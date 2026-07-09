import { useState, useCallback } from "react";

export default function useFormularioVisible(initialVisible = false) {
  const [visible, setVisible] = useState(initialVisible);
  const abrir = useCallback(() => setVisible(true), []);
  const cerrar = useCallback(() => setVisible(false), []);
  const toggle = useCallback(() => setVisible((current) => !current), []);

  return { visible, setVisible, abrir, cerrar, toggle };
}
