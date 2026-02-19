import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, UserCircle, Wrench } from "lucide-react";

export const EquipmentDetailModal = ({ open, onOpenChange, equipment, supportHistory }) => {
  if (!equipment) return null;

  const getStatusColor = (estado) => {
    switch (estado) {
      case "Activo":
        return "bg-[#DCFCE7] text-[#166534]";
      case "En reparación":
        return "bg-[#FEF3C7] text-[#92400E]";
      case "Dado de baja":
        return "bg-[#FEE2E2] text-[#991B1B]";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getWarrantyColor = (estado) => {
    switch (estado) {
      case "En garantía":
        return "bg-[#DBEAFE] text-[#1E40AF]";
      case "Fuera de garantía":
        return "bg-[#F3F4F6] text-[#374151]";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            {equipment.nombre}
          </DialogTitle>
          <DialogDescription>Detalles del equipo y su historial de soporte</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Equipment Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-muted-foreground" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Número de Serie
              </p>
              <p className="font-mono text-sm font-medium">{equipment.numero_serie}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-muted-foreground" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Estado
              </p>
              <Badge className={`${getStatusColor(equipment.estado)} rounded-full`}>
                {equipment.estado}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
                <Calendar className="h-3 w-3" /> Fecha de Entrega
              </p>
              <p className="font-medium">{equipment.fecha_entrega}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
                <UserCircle className="h-3 w-3" /> Jefatura
              </p>
              <p className="font-medium">{equipment.jefatura}</p>
            </div>
            <div className="space-y-1 col-span-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
                <User className="h-3 w-3" /> Usuario Final
              </p>
              <p className="font-medium">{equipment.usuario_final}</p>
            </div>
          </div>

          <Separator />

          {/* Support History */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
              <Wrench className="h-5 w-5" />
              Historial de Soporte ({supportHistory.length})
            </h3>
            {supportHistory.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">
                No hay registros de soporte para este equipo
              </p>
            ) : (
              <div className="space-y-4">
                {supportHistory.map((support) => (
                  <div
                    key={support.id}
                    className="border border-border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
                          Fecha de Envío
                        </p>
                        <p className="font-medium">{support.fecha_envio}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={`${getWarrantyColor(support.estado_garantia)} rounded-full text-xs`}>
                          {support.estado_garantia}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Falla Reportada
                      </p>
                      <p className="text-sm">{support.falla_reportada}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Resultado
                      </p>
                      <p className="text-sm font-medium">{support.resultado}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentDetailModal;