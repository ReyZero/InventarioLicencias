import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Search, Filter } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import EquipmentDetailModal from "@/components/EquipmentDetailModal";

export const EquipmentTable = ({ equipment, supportHistory, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJefatura, setFilterJefatura] = useState("all");
  const [filterUsuario, setFilterUsuario] = useState("all");
  const [filterEstado, setFilterEstado] = useState("all");
  const [sortField, setSortField] = useState("nombre");
  const [sortDirection, setSortDirection] = useState("asc");
  const [deleteId, setDeleteId] = useState(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(null);

  // Get unique values for filters
  const uniqueJefaturas = [...new Set(equipment.map((e) => e.jefatura))];
  const uniqueUsuarios = [...new Set(equipment.map((e) => e.usuario_final))];

  // Filter and sort equipment
  const filteredEquipment = useMemo(() => {
    let filtered = equipment.filter((item) => {
      const matchesSearch =
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.numero_serie.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesJefatura =
        filterJefatura === "all" || item.jefatura === filterJefatura;
      const matchesUsuario =
        filterUsuario === "all" || item.usuario_final === filterUsuario;
      const matchesEstado =
        filterEstado === "all" || item.estado === filterEstado;

      return (
        matchesSearch && matchesJefatura && matchesUsuario && matchesEstado
      );
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "fecha_entrega") {
        // Convert DD/MM/AAAA to comparable format
        const parseDate = (dateStr) => {
          const [day, month, year] = dateStr.split("/");
          return new Date(year, month - 1, day);
        };
        aVal = parseDate(aVal);
        bVal = parseDate(bVal);
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [equipment, searchTerm, filterJefatura, filterUsuario, filterEstado, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

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

  const selectedEquipmentData = equipment.find((e) => e.id === selectedEquipmentId);
  const selectedSupportHistory = supportHistory.filter(
    (s) => s.numero_serie === selectedEquipmentData?.numero_serie
  );

  return (
    <>
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                data-testid="search-input"
                type="text"
                placeholder="Buscar por nombre o número de serie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={filterJefatura} onValueChange={setFilterJefatura}>
            <SelectTrigger data-testid="filter-jefatura">
              <SelectValue placeholder="Filtrar por jefatura" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las jefaturas</SelectItem>
              {uniqueJefaturas.map((jef) => (
                <SelectItem key={jef} value={jef}>
                  {jef}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterUsuario} onValueChange={setFilterUsuario}>
            <SelectTrigger data-testid="filter-usuario">
              <SelectValue placeholder="Filtrar por usuario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los usuarios</SelectItem>
              {uniqueUsuarios.map((user) => (
                <SelectItem key={user} value={user}>
                  {user}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterEstado} onValueChange={setFilterEstado}>
            <SelectTrigger data-testid="filter-estado">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="Activo">Activo</SelectItem>
              <SelectItem value="En reparación">En reparación</SelectItem>
              <SelectItem value="Dado de baja">Dado de baja</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead
                  className="cursor-pointer font-semibold text-muted-foreground uppercase tracking-widest text-xs"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                  onClick={() => handleSort("nombre")}
                >
                  Nombre del Equipo {sortField === "nombre" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer font-semibold text-muted-foreground uppercase tracking-widest text-xs"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                  onClick={() => handleSort("numero_serie")}
                >
                  N° de Serie {sortField === "numero_serie" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer font-semibold text-muted-foreground uppercase tracking-widest text-xs"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                  onClick={() => handleSort("fecha_entrega")}
                >
                  Fecha Entrega {sortField === "fecha_entrega" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer font-semibold text-muted-foreground uppercase tracking-widest text-xs"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                  onClick={() => handleSort("jefatura")}
                >
                  Jefatura {sortField === "jefatura" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer font-semibold text-muted-foreground uppercase tracking-widest text-xs"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                  onClick={() => handleSort("usuario_final")}
                >
                  Usuario Final {sortField === "usuario_final" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer font-semibold text-muted-foreground uppercase tracking-widest text-xs"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                  onClick={() => handleSort("area_usuario")}
                >
                  Área {sortField === "area_usuario" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer font-semibold text-muted-foreground uppercase tracking-widest text-xs"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                  onClick={() => handleSort("estado")}
                >
                  Estado {sortField === "estado" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="font-semibold text-muted-foreground uppercase tracking-widest text-xs" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEquipment.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No se encontraron equipos
                  </TableCell>
                </TableRow>
              ) : (
                filteredEquipment.map((item) => (
                  <TableRow
                    key={item.id}
                    data-testid={`equipment-row-${item.numero_serie}`}
                    className="hover:bg-accent/50 transition-colors cursor-pointer border-b border-border"
                    onClick={() => setSelectedEquipmentId(item.id)}
                  >
                    <TableCell className="p-4 font-medium text-foreground" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                      {item.nombre}
                    </TableCell>
                    <TableCell className="p-4 font-mono text-sm text-foreground" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                      {item.numero_serie}
                    </TableCell>
                    <TableCell className="p-4 tabular-nums text-foreground" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                      {item.fecha_entrega}
                    </TableCell>
                    <TableCell className="p-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                      {item.jefatura}
                    </TableCell>
                    <TableCell className="p-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                      {item.usuario_final}
                    </TableCell>
                    <TableCell className="p-4">
                      <Badge
                        data-testid={`status-badge-${item.numero_serie}`}
                        className={`${getStatusColor(item.estado)} rounded-full px-2.5 py-0.5 text-xs font-semibold`}
                      >
                        {item.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-4">
                      <Button
                        data-testid={`delete-btn-${item.numero_serie}`}
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(item.id);
                        }}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar equipo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El equipo y su historial de
              soporte serán eliminados permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(deleteId);
                setDeleteId(null);
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Equipment Detail Modal */}
      <EquipmentDetailModal
        open={!!selectedEquipmentId}
        onOpenChange={() => setSelectedEquipmentId(null)}
        equipment={selectedEquipmentData}
        supportHistory={selectedSupportHistory}
      />
    </>
  );
};

export default EquipmentTable;