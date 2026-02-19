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
import { Trash2, Search, CheckCircle, Clock, AlertCircle } from "lucide-react";
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

export const LicenseTable = ({ licenses, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("all");
  const [filterArea, setFilterArea] = useState("all");
  const [sortField, setSortField] = useState("nombre_licencia");
  const [sortDirection, setSortDirection] = useState("asc");
  const [deleteId, setDeleteId] = useState(null);

  // Get unique areas
  const uniqueAreas = [...new Set(licenses.filter(l => l.area_usuario).map((l) => l.area_usuario))];

  // Filter and sort licenses
  const filteredLicenses = useMemo(() => {
    let filtered = licenses.filter((item) => {
      const matchesSearch =
        item.nombre_licencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.codigo_licencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.usuario_final && item.usuario_final.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesEstado = filterEstado === "all" || item.estado === filterEstado;
      const matchesArea = filterArea === "all" || item.area_usuario === filterArea;

      return matchesSearch && matchesEstado && matchesArea;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "dias_restantes") {
        aVal = a.dias_restantes || 0;
        bVal = b.dias_restantes || 0;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [licenses, searchTerm, filterEstado, filterArea, sortField, sortDirection]);

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
      case "Disponible":
        return "bg-[#DBEAFE] text-[#1E40AF]";
      case "Instalada":
        return "bg-[#DCFCE7] text-[#166534]";
      case "Reasignada":
        return "bg-[#FEF3C7] text-[#92400E]";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (estado) => {
    switch (estado) {
      case "Disponible":
        return <Clock className="h-3 w-3 mr-1" />;
      case "Instalada":
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case "Reasignada":
        return <AlertCircle className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const getVigenciaColor = (diasRestantes) => {
    if (diasRestantes > 60) return "text-green-500 font-semibold";
    if (diasRestantes > 30) return "text-yellow-500 font-semibold";
    if (diasRestantes > 15) return "text-orange-500 font-semibold";
    return "text-red-500 font-bold";
  };

  const getVigenciaBadgeColor = (diasRestantes) => {
    if (diasRestantes > 60) return "bg-[#DCFCE7] text-[#166534]";
    if (diasRestantes > 30) return "bg-[#FEF3C7] text-[#92400E]";
    if (diasRestantes > 15) return "bg-[#FED7AA] text-[#9A3412]";
    return "bg-[#FEE2E2] text-[#991B1B]";
  };

  return (
    <>
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                data-testid="search-license-input"
                type="text"
                placeholder="Buscar por nombre, código o usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={filterEstado} onValueChange={setFilterEstado}>
            <SelectTrigger data-testid="filter-estado-license">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="Disponible">Disponible</SelectItem>
              <SelectItem value="Instalada">Instalada</SelectItem>
              <SelectItem value="Reasignada">Reasignada</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterArea} onValueChange={setFilterArea}>
            <SelectTrigger data-testid="filter-area-license">
              <SelectValue placeholder="Filtrar por área" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las áreas</SelectItem>
              {uniqueAreas.map((area) => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              ))}
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
                  onClick={() => handleSort("nombre_licencia")}
                >
                  Licencia {sortField === "nombre_licencia" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer font-semibold text-muted-foreground uppercase tracking-widest text-xs"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                  onClick={() => handleSort("codigo_licencia")}
                >
                  Código {sortField === "codigo_licencia" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer font-semibold text-muted-foreground uppercase tracking-widest text-xs"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                  onClick={() => handleSort("estado")}
                >
                  Estado {sortField === "estado" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer font-semibold text-muted-foreground uppercase tracking-widest text-xs"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                  onClick={() => handleSort("usuario_final")}
                >
                  Usuario {sortField === "usuario_final" && (sortDirection === "asc" ? "↑" : "↓")}
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
                  onClick={() => handleSort("vigencia")}
                >
                  Vigencia {sortField === "vigencia" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer font-semibold text-muted-foreground uppercase tracking-widest text-xs"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                  onClick={() => handleSort("dias_restantes")}
                >
                  Días Restantes {sortField === "dias_restantes" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="font-semibold text-muted-foreground uppercase tracking-widest text-xs" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLicenses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No se encontraron licencias
                  </TableCell>
                </TableRow>
              ) : (
                filteredLicenses.map((item) => (
                  <TableRow
                    key={item.id}
                    data-testid={`license-row-${item.codigo_licencia}`}
                    className="hover:bg-accent/50 transition-colors border-b border-border"
                  >
                    <TableCell className="p-4 font-medium text-foreground" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                      {item.nombre_licencia}
                    </TableCell>
                    <TableCell className="p-4 font-mono text-sm text-foreground" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                      {item.codigo_licencia}
                    </TableCell>
                    <TableCell className="p-4">
                      <Badge
                        data-testid={`status-badge-${item.codigo_licencia}`}
                        className={`${getStatusColor(item.estado)} rounded-full px-2.5 py-0.5 text-xs font-semibold flex items-center w-fit`}
                      >
                        {getStatusIcon(item.estado)}
                        {item.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                      {item.usuario_final || "-"}
                    </TableCell>
                    <TableCell className="p-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                      {item.area_usuario || "-"}
                    </TableCell>
                    <TableCell className="p-4 tabular-nums" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                      {item.vigencia}
                    </TableCell>
                    <TableCell className="p-4">
                      <Badge className={`${getVigenciaBadgeColor(item.dias_restantes)} rounded-full px-2.5 py-0.5 text-xs font-semibold`}>
                        {item.dias_restantes > 0 ? `${item.dias_restantes} días` : "Vencida"}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-4">
                      <Button
                        data-testid={`delete-license-btn-${item.codigo_licencia}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(item.id)}
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
            <AlertDialogTitle>¿Eliminar licencia?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La licencia será eliminada permanentemente.
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
    </>
  );
};

export default LicenseTable;
