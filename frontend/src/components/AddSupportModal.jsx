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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const AddSupportModal = ({ open, onOpenChange, onSubmit, equipment }) => {
  const [formData, setFormData] = useState({
    numero_serie: "",
    fecha_envio: "",
    falla_reportada: "",
    estado_garantia: "En garantía",
    resultado: "En proceso",
  });

  const validateDate = (dateStr) => {
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    return regex.test(dateStr);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validations
    if (
      !formData.numero_serie ||
      !formData.fecha_envio ||
      !formData.falla_reportada
    ) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    if (!validateDate(formData.fecha_envio)) {
      toast.error("Formato de fecha inválido. Use DD/MM/AAAA");
      return;
    }

    onSubmit(formData);
    setFormData({
      numero_serie: "",
      fecha_envio: "",
      falla_reportada: "",
      estado_garantia: "En garantía",
      resultado: "En proceso",
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
            Registrar Soporte Técnico
          </DialogTitle>
          <DialogDescription>
            Complete los datos del soporte enviado al fabricante
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="numero_serie">Número de Serie del Equipo *</Label>
              <Select
                value={formData.numero_serie}
                onValueChange={(value) =>
                  setFormData({ ...formData, numero_serie: value })
                }
              >
                <SelectTrigger data-testid="support-serial-select">
                  <SelectValue placeholder="Seleccione un equipo" />
                </SelectTrigger>
                <SelectContent>
                  {equipment.map((eq) => (
                    <SelectItem key={eq.numero_serie} value={eq.numero_serie}>
                      {eq.numero_serie} - {eq.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fecha_envio">Fecha de Envío a Soporte (DD/MM/AAAA) *</Label>
              <Input
                data-testid="support-date-input"
                id="fecha_envio"
                placeholder="Ej: 25/01/2026"
                value={formData.fecha_envio}
                onChange={(e) =>
                  setFormData({ ...formData, fecha_envio: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="falla_reportada">Falla Reportada *</Label>
              <Textarea
                data-testid="support-issue-input"
                id="falla_reportada"
                placeholder="Ej: No enciende pantalla"
                value={formData.falla_reportada}
                onChange={(e) =>
                  setFormData({ ...formData, falla_reportada: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="estado_garantia">Estado de Garantía *</Label>
              <Select
                value={formData.estado_garantia}
                onValueChange={(value) =>
                  setFormData({ ...formData, estado_garantia: value })
                }
              >
                <SelectTrigger data-testid="support-warranty-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="En garantía">En garantía</SelectItem>
                  <SelectItem value="Fuera de garantía">Fuera de garantía</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="resultado">Resultado *</Label>
              <Select
                value={formData.resultado}
                onValueChange={(value) =>
                  setFormData({ ...formData, resultado: value })
                }
              >
                <SelectTrigger data-testid="support-result-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="En proceso">En proceso</SelectItem>
                  <SelectItem value="Reparado">Reparado</SelectItem>
                  <SelectItem value="Cambiado">Cambiado</SelectItem>
                  <SelectItem value="No reparable">No reparable</SelectItem>
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
              data-testid="submit-support-btn"
              type="submit"
              className="bg-primary hover:bg-primary/90"
            >
              Registrar Soporte
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSupportModal;