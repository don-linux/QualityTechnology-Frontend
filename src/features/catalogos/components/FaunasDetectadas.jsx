import CatalogoNombreSimple from "./CatalogoNombreSimple";
import {
  listFaunasDetectadas,
  createFaunaDetectada,
  updateFaunaDetectada,
  activateFaunaDetectada,
  deactivateFaunaDetectada,
} from "@features/catalogos/services/faunasDetectadasService";
import {
  getFaunaDetectadaId,
  getFaunaDetectadaNombre,
  faunaDetectadaActivo,
} from "@features/catalogos/utils/catalogEntityGetters";

export default function FaunasDetectadas() {
  return (
    <CatalogoNombreSimple
      title="Faunas detectadas"
      subtitle="Catálogo de tipos de fauna detectada en trampas e instalaciones."
      idField="fauna_detectada_id"
      entityLabel="fauna detectada"
      entityLabelPlural="faunas detectadas"
      registerSuccessMsg="Fauna detectada registrada"
      updateSuccessMsg="Fauna detectada actualizada"
      listFn={listFaunasDetectadas}
      createFn={createFaunaDetectada}
      updateFn={updateFaunaDetectada}
      activateFn={activateFaunaDetectada}
      deactivateFn={deactivateFaunaDetectada}
      getId={getFaunaDetectadaId}
      getNombre={getFaunaDetectadaNombre}
      isActivo={faunaDetectadaActivo}
    />
  );
}
