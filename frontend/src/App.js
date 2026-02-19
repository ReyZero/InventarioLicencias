import { useState, useEffect } from "react";
import "@/App.css";
import { Toaster } from "@/components/ui/sonner";
import axios from "axios";
import EquipmentTable from "@/components/EquipmentTable";
import AddEquipmentModal from "@/components/AddEquipmentModal";
import AddSupportModal from "@/components/AddSupportModal";
import LicenseTable from "@/components/LicenseTable";
import AddLicenseModal from "@/components/AddLicenseModal";
import AuthPage from "@/components/AuthPage";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus, Download, Wrench, LogOut, Package, Key } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Configurar axios para incluir el token en todas las peticiones
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Manejar errores de autenticación
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

function App() {
  const [equipment, setEquipment] = useState([]);
  const [supportHistory, setSupportHistory] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [isAddEquipmentOpen, setIsAddEquipmentOpen] = useState(false);
  const [isAddSupportOpen, setIsAddSupportOpen] = useState(false);
  const [isAddLicenseOpen, setIsAddLicenseOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("equipos"); // "equipos" | "licencias"

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    if (token && user) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(user));
      fetchData();
      seedDataIfNeeded();
    } else {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (data) => {
    setIsAuthenticated(true);
    setCurrentUser(data.user);
    fetchData();
    seedDataIfNeeded();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setCurrentUser(null);
    toast.success("Sesión cerrada correctamente");
  };

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
      const [equipmentRes, supportRes, licensesRes] = await Promise.all([
        axios.get(`${API}/equipment`),
        axios.get(`${API}/support`),
        axios.get(`${API}/licenses`),
      ]);
      setEquipment(equipmentRes.data);
      setSupportHistory(supportRes.data);
      setLicenses(licensesRes.data);
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

  // Si no está autenticado, mostrar página de login
  if (!isAuthenticated) {
    return (
      <>
        <AuthPage onLoginSuccess={handleLoginSuccess} />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <div className="App min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Inventario de Equipos TI
            </h1>
            <p className="text-muted-foreground" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              Altonorte - Sistema de gestión de equipos tecnológicos
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Usuario</p>
              <p className="font-medium text-foreground">{currentUser?.username}</p>
            </div>
            <Button
              data-testid="logout-btn"
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="transition-transform hover:translate-y-[-1px]"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
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