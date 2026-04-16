export const GRANJA_MEDELLIN = "Granja Acuícola Medellin";
export const GRANJA_CEIBA = "Granja Acuícola La Ceiba";

export const GRANJAS = [
  { value: GRANJA_MEDELLIN, label: "Medellín" },
  { value: GRANJA_CEIBA, label: "La Ceiba" },
];

export function normalizarGranja(g) {
  if (!g) return GRANJA_MEDELLIN;

  const txt = g
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (txt.includes("ceib")) return GRANJA_CEIBA;
  return GRANJA_MEDELLIN;
}
