import CatalogoNombreSimple from "./CatalogoNombreSimple";
import {
  listEvidenciasFauna,
  createEvidenciaFauna,
  updateEvidenciaFauna,
  activateEvidenciaFauna,
  deactivateEvidenciaFauna,
} from "@features/catalogos/services/evidenciasFaunaService";

export default function EvidenciasFauna() {
  return (
    <CatalogoNombreSimple
      title="Evidencias"
      subtitle="Catálogo de evidencias de presencia de fauna nociva."
      idField="evidencia_fauna_id"
      entityLabel="evidencia"
      entityLabelPlural="evidencias"
      registerSuccessMsg="Evidencia registrada"
      updateSuccessMsg="Evidencia actualizada"
      listFn={listEvidenciasFauna}
      createFn={createEvidenciaFauna}
      updateFn={updateEvidenciaFauna}
      activateFn={activateEvidenciaFauna}
      deactivateFn={deactivateEvidenciaFauna}
    />
  );
}
