import { useState, useEffect } from "react";
import "@/App.css";
import { Toaster } from "@/components/ui/sonner";
import axios from "axios";
import EquipmentTable from "@/components/EquipmentTable";
import AddEquipmentModal from "@/components/AddEquipmentModal";
import AddSupportModal from "@/components/AddSupportModal";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus, Download, Wrench } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [equipment, setEquipment] = useState([]);
  const [supportHistory, setSupportHistory] = useState([]);
  const [isAddEquipmentOpen, setIsAddEquipmentOpen] = useState(false);
  const [isAddSupportOpen, setIsAddSupportOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  useEffect(() => {
    fetchData();
    seedDataIfNeeded();
  }, []);

  const seedDataIfNeeded = async () => {
    try {
      await axios.post(`${API}/seed`);
    } catch (e) {
      console.log("Data already seeded or error:", e.message);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [equipmentRes, supportRes] = await Promise.all([
        axios.get(`${API}/equipment`),
        axios.get(`${API}/support`),
      ]);
      setEquipment(equipmentRes.data);
      setSupportHistory(supportRes.data);
    } catch (e) {
      console.error("Error fetching data:", e);
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEquipment = async (data) => {
    try {
      await axios.post(`${API}/equipment`, data);
      toast.success("Equipo agregado correctamente");
      fetchData();
      setIsAddEquipmentOpen(false);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Error al agregar equipo");
    }
  };

  const handleAddSupport = async (data) => {
    try {
      await axios.post(`${API}/support`, data);
      toast.success("Soporte registrado correctamente");
      fetchData();
      setIsAddSupportOpen(false);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Error al registrar soporte");
    }
  };

  const handleDeleteEquipment = async (id) => {
    try {
      await axios.delete(`${API}/equipment/${id}`);
      toast.success("Equipo eliminado correctamente");
      fetchData();
    } catch (e) {
      toast.error("Error al eliminar equipo");
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API}/export`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "inventario_equipos_altonorte.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Archivo Excel descargado");
    } catch (e) {
      toast.error("Error al exportar datos");
    }
  };

  return (
    <div className="App min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Inventario de Equipos TI
          </h1>
          <p className="text-muted-foreground" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Altonorte - Sistema de gestión de equipos tecnológicos
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <Button
            data-testid="add-equipment-btn"
            onClick={() => setIsAddEquipmentOpen(true)}
            className="bg-primary hover:bg-primary/90 transition-transform hover:translate-y-[-1px]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Equipo
          </Button>
          <Button
            data-testid="register-support-btn"
            onClick={() => setIsAddSupportOpen(true)}
            variant="outline"
            className="transition-transform hover:translate-y-[-1px]"
          >
            <Wrench className="mr-2 h-4 w-4" />
            Registrar Soporte
          </Button>
          <Button
            data-testid="export-excel-btn"
            onClick={handleExport}
            variant="outline"
            className="ml-auto transition-transform hover:translate-y-[-1px]"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar a Excel
          </Button>
        </div>

        {/* Equipment Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando datos...</p>
          </div>
        ) : (
          <EquipmentTable
            equipment={equipment}
            supportHistory={supportHistory}
            onDelete={handleDeleteEquipment}
          />
        )}
      </div>

      {/* Modals */}
      <AddEquipmentModal
        open={isAddEquipmentOpen}
        onOpenChange={setIsAddEquipmentOpen}
        onSubmit={handleAddEquipment}
      />
      <AddSupportModal
        open={isAddSupportOpen}
        onOpenChange={setIsAddSupportOpen}
        onSubmit={handleAddSupport}
        equipment={equipment}
      />

      <Toaster position="top-right" />
    </div>
  );
}

export default App;