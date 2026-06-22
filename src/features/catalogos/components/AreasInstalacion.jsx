import CatalogoNombreSimple from "./CatalogoNombreSimple";
import {
  listAreasInstalacion,
  createAreaInstalacion,
  updateAreaInstalacion,
  activateAreaInstalacion,
  deactivateAreaInstalacion,
} from "@features/catalogos/services/areasInstalacionService";
import {
  getAreaInstalacionId,
  getAreaInstalacionNombre,
  areaInstalacionActivo,
} from "@features/catalogos/utils/catalogEntityGetters";

export default function AreasInstalacion() {
  return (
    <CatalogoNombreSimple
      title="Áreas de instalación"
      subtitle="Catálogo de áreas e instalaciones para control de fauna nociva."
      idField="area_instalacion_id"
      entityLabel="área de instalación"
      entityLabelPlural="áreas de instalación"
      registerSuccessMsg="Área de instalación registrada"
      updateSuccessMsg="Área de instalación actualizada"
      listFn={listAreasInstalacion}
      createFn={createAreaInstalacion}
      updateFn={updateAreaInstalacion}
      activateFn={activateAreaInstalacion}
      deactivateFn={deactivateAreaInstalacion}
      getId={getAreaInstalacionId}
      getNombre={getAreaInstalacionNombre}
      isActivo={areaInstalacionActivo}
    />
  );
}
