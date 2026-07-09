import CatalogoNombreSimple from "./CatalogoNombreSimple";
import {
  listEstadosTrampa,
  createEstadoTrampa,
  updateEstadoTrampa,
  activateEstadoTrampa,
  deactivateEstadoTrampa,
} from "@features/catalogos/services/estadosTrampaService";

export default function EstadosTrampa() {
  return (
    <CatalogoNombreSimple
      title="Estados de trampa"
      subtitle="Catálogo de estados operativos de trampas de control."
      idField="estado_trampa_id"
      entityLabel="estado de trampa"
      entityLabelPlural="estados de trampa"
      registerSuccessMsg="Estado de trampa registrado"
      updateSuccessMsg="Estado de trampa actualizado"
      listFn={listEstadosTrampa}
      createFn={createEstadoTrampa}
      updateFn={updateEstadoTrampa}
      activateFn={activateEstadoTrampa}
      deactivateFn={deactivateEstadoTrampa}
    />
  );
}
