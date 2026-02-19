import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const AddLicenseModal = ({ open, onOpenChange, onSubmit }) => {
  const [formData, setFormData] = useState({
    nombre_licencia: "",
    codigo_licencia: "",
    estado: "Disponible",
    usuario_final: "",
    area_usuario: "",
    vigencia: "",
  });

  const validateDate = (dateStr) => {
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    return regex.test(dateStr);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validations
    if (
      !formData.nombre_licencia ||
      !formData.codigo_licencia ||
      !formData.vigencia
    ) {
      toast.error("Nombre, código y vigencia son obligatorios");
      return;
    }

    if (!validateDate(formData.vigencia)) {
      toast.error("Formato de fecha inválido. Use DD/MM/AAAA");
      return;
    }

    // Si el estado es Instalada o Reasignada, validar que tenga usuario y área
    if ((formData.estado === "Instalada" || formData.estado === "Reasignada") && 
        (!formData.usuario_final || !formData.area_usuario)) {
      toast.error("Para licencias instaladas o reasignadas debe especificar usuario y área");
      return;
    }

    // Si está Disponible, limpiar usuario y área
    const dataToSubmit = { ...formData };
    if (formData.estado === "Disponible") {
      dataToSubmit.usuario_final = null;
      dataToSubmit.area_usuario = null;
    }

    onSubmit(dataToSubmit);
    setFormData({
      nombre_licencia: "",
      codigo_licencia: "",
      estado: "Disponible",
      usuario_final: "",
      area_usuario: "",
      vigencia: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Agregar Nueva Licencia
          </DialogTitle>
          <DialogDescription>Complete los datos de la licencia a registrar</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre_licencia">Nombre de la Licencia *</Label>
              <Input
                data-testid="license-name-input"
                id="nombre_licencia"
                placeholder="Ej: Microsoft Office 365"
                value={formData.nombre_licencia}
                onChange={(e) =>
                  setFormData({ ...formData, nombre_licencia: e.target.value })
                }
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="codigo_licencia">Código de Licencia *</Label>
              <Input
                data-testid="license-code-input"
                id="codigo_licencia"
                placeholder="Ej: XXXXX-XXXXX-XXXXX-XXXXX"
                value={formData.codigo_licencia}
                onChange={(e) =>
                  setFormData({ ...formData, codigo_licencia: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="estado">Estado *</Label>
              <Select
                value={formData.estado}
                onValueChange={(value) =>
                  setFormData({ ...formData, estado: value })
                }
              >
                <SelectTrigger data-testid="license-status-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Disponible">Disponible</SelectItem>
                  <SelectItem value="Instalada">Instalada</SelectItem>
                  <SelectItem value="Reasignada">Reasignada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.estado === "Instalada" || formData.estado === "Reasignada") && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="usuario_final">Usuario Final *</Label>
                  <Input
                    data-testid="license-user-input"
                    id="usuario_final"
                    placeholder="Ej: Juan Pérez"
                    value={formData.usuario_final}
                    onChange={(e) =>
                      setFormData({ ...formData, usuario_final: e.target.value })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="area_usuario">Área del Usuario *</Label>
                  <Input
                    data-testid="license-area-input"
                    id="area_usuario"
                    placeholder="Ej: Administración"
                    value={formData.area_usuario}
                    onChange={(e) =>
                      setFormData({ ...formData, area_usuario: e.target.value })
                    }
                  />
                </div>
              </>
            )}

            <div className="grid gap-2">
              <Label htmlFor="vigencia">Vigencia (DD/MM/AAAA) *</Label>
              <Input
                data-testid="license-expiry-input"
                id="vigencia"
                placeholder="Ej: 31/12/2026"
                value={formData.vigencia}
                onChange={(e) =>
                  setFormData({ ...formData, vigencia: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              data-testid="submit-license-btn"
              type="submit"
              className="bg-primary hover:bg-primary/90"
            >
              Agregar Licencia
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLicenseModal;
