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

export const AddEquipmentModal = ({ open, onOpenChange, onSubmit }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    numero_serie: "",
    fecha_entrega: "",
    jefatura: "",
    usuario_final: "",
    area_usuario: "",
    estado: "Activo",
  });

  const validateDate = (dateStr) => {
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    return regex.test(dateStr);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validations
    if (
      !formData.nombre ||
      !formData.numero_serie ||
      !formData.fecha_entrega ||
      !formData.jefatura ||
      !formData.usuario_final ||
      !formData.area_usuario
    ) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    if (!validateDate(formData.fecha_entrega)) {
      toast.error("Formato de fecha inválido. Use DD/MM/AAAA");
      return;
    }

    onSubmit(formData);
    setFormData({
      nombre: "",
      numero_serie: "",
      fecha_entrega: "",
      jefatura: "",
      usuario_final: "",
      estado: "Activo",
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
            Agregar Nuevo Equipo
          </DialogTitle>
          <DialogDescription>Complete los datos del equipo a registrar</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre del Equipo *</Label>
              <Input
                data-testid="equipment-name-input"
                id="nombre"
                placeholder="Ej: Notebook Dell Latitude 5420"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="numero_serie">Número de Serie *</Label>
              <Input
                data-testid="equipment-serial-input"
                id="numero_serie"
                placeholder="Ej: ABC123"
                value={formData.numero_serie}
                onChange={(e) =>
                  setFormData({ ...formData, numero_serie: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fecha_entrega">Fecha de Entrega (DD/MM/AAAA) *</Label>
              <Input
                data-testid="equipment-date-input"
                id="fecha_entrega"
                placeholder="Ej: 15/01/2026"
                value={formData.fecha_entrega}
                onChange={(e) =>
                  setFormData({ ...formData, fecha_entrega: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="jefatura">Jefatura *</Label>
              <Input
                data-testid="equipment-jefatura-input"
                id="jefatura"
                placeholder="Ej: Juan Pérez"
                value={formData.jefatura}
                onChange={(e) =>
                  setFormData({ ...formData, jefatura: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="usuario_final">Usuario Final *</Label>
              <Input
                data-testid="equipment-user-input"
                id="usuario_final"
                placeholder="Ej: María Gómez"
                value={formData.usuario_final}
                onChange={(e) =>
                  setFormData({ ...formData, usuario_final: e.target.value })
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
                <SelectTrigger data-testid="equipment-status-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="En reparación">En reparación</SelectItem>
                  <SelectItem value="Dado de baja">Dado de baja</SelectItem>
                </SelectContent>
              </Select>
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
              data-testid="submit-equipment-btn"
              type="submit"
              className="bg-primary hover:bg-primary/90"
            >
              Agregar Equipo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEquipmentModal;