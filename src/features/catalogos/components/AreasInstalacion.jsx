import CatalogoNombreSimple from "./CatalogoNombreSimple";
import {
  listAreasInstalacion,
  createAreaInstalacion,
  updateAreaInstalacion,
  activateAreaInstalacion,
  deactivateAreaInstalacion,
} from "@features/catalogos/services/areasInstalacionService";

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
    />
  );
}
