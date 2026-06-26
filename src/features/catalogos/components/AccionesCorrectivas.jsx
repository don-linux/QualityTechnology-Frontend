import CatalogoNombreSimple from "./CatalogoNombreSimple";
import {
  listAccionesCorrectivas,
  createAccionCorrectiva,
  updateAccionCorrectiva,
  activateAccionCorrectiva,
  deactivateAccionCorrectiva,
} from "@features/catalogos/services/accionesCorrectivasService";

export default function AccionesCorrectivas() {
  return (
    <CatalogoNombreSimple
      title="Acciones correctivas"
      subtitle="Catálogo de acciones correctivas ante hallazgos de fauna nociva."
      idField="accion_correctiva_id"
      entityLabel="acción correctiva"
      entityLabelPlural="acciones correctivas"
      registerSuccessMsg="Acción correctiva registrada"
      updateSuccessMsg="Acción correctiva actualizada"
      listFn={listAccionesCorrectivas}
      createFn={createAccionCorrectiva}
      updateFn={updateAccionCorrectiva}
      activateFn={activateAccionCorrectiva}
      deactivateFn={deactivateAccionCorrectiva}
    />
  );
}
