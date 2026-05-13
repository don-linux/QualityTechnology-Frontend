import Ubicaciones from "@features/catalogos/components/Ubicaciones";

export default function UbicacionesGranjasPage() {
  return (
    <Ubicaciones
      titulo="Ubicaciones de granjas"
      subtitulo="Alta de sedes físicas enlazadas a inventarios y filtros por ubicacion_id."
      alertText={
        "Estas ubicaciones sustituyen el filtro textual de granja en el servidor cuando se envía ubicacion_id. " +
          "Nombre y dirección son los campos principales que ve el sistema."
      }
    />
  );
}
