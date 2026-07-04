import { describe, expect, it } from "vitest";
import {
  aplicarFiltros,
  hayFiltroActivo,
  rangoFechasDesdeSeleccion,
  valoresIniciales,
} from "./registroFiltros";

const rows = [
  { id: 1, nombre: "Alpha", fecha: "2026-07-01" },
  { id: 2, nombre: "Beta", fecha: "2026-07-02" },
  { id: 3, nombre: "Gamma", fecha: "2026-07-03" },
];

describe("valoresIniciales", () => {
  it("builds empty values for active filters", () => {
    expect(valoresIniciales(["busqueda", "fechas"])).toEqual({
      busqueda: "",
      fechas: { desde: "", hasta: "" },
    });
  });
});

describe("aplicarFiltros", () => {
  it("filters by search keys", () => {
    const result = aplicarFiltros(rows, ["busqueda"], { busqueda: "alp" }, {
      busqueda: { keys: ["nombre"] },
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it("filters by inclusive date range", () => {
    const result = aplicarFiltros(rows, ["fechas"], {
      fechas: { desde: "2026-07-01", hasta: "2026-07-02" },
    }, {
      fechas: { campo: "fecha" },
    });
    expect(result.map((r) => r.id)).toEqual([1, 2]);
  });

  it("composes search and date filters", () => {
    const result = aplicarFiltros(
      rows,
      ["busqueda", "fechas"],
      { busqueda: "a", fechas: { desde: "2026-07-02", hasta: "2026-07-03" } },
      { busqueda: { keys: ["nombre"] }, fechas: { campo: "fecha" } },
    );
    expect(result.map((r) => r.id)).toEqual([2, 3]);
  });

  it("applies only selected filter ids", () => {
    const result = aplicarFiltros(
      rows,
      ["busqueda", "fechas"],
      { busqueda: "a", fechas: { desde: "2026-07-03", hasta: "2026-07-03" } },
      { busqueda: { keys: ["nombre"] }, fechas: { campo: "fecha" } },
      ["busqueda"],
    );
    expect(result.length).toBeGreaterThan(1);
  });
});

describe("hayFiltroActivo", () => {
  it("detects active search or date filters", () => {
    expect(hayFiltroActivo(["busqueda"], { busqueda: "" })).toBe(false);
    expect(hayFiltroActivo(["busqueda"], { busqueda: "x" })).toBe(true);
    expect(hayFiltroActivo(["fechas"], { fechas: { desde: "2026-07-01", hasta: "" } })).toBe(true);
  });
});

describe("rangoFechasDesdeSeleccion", () => {
  it("maps export footer range from modal dates", () => {
    expect(rangoFechasDesdeSeleccion({ desde: "2026-07-01", hasta: "2026-07-03" })).toEqual({
      desde: "2026-07-01",
      hasta: "2026-07-03",
    });
    expect(rangoFechasDesdeSeleccion({ desde: "", hasta: "" })).toBeNull();
  });
});
