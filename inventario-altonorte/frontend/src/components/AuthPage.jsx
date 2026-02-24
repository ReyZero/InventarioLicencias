import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AuthPage = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!username || !password) {
      toast.error("Por favor complete todos los campos");
      return;
    }

    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const response = await axios.post(`${API}${endpoint}`, {
        username,
        password,
      });

      // Guardar token y usuario
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      toast.success(isLogin ? "Sesión iniciada correctamente" : "Cuenta creada correctamente");
      onLoginSuccess(response.data);
    } catch (error) {
      const message = error.response?.data?.detail || "Error al procesar la solicitud";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Inventario de Equipos TI
          </CardTitle>
          <CardDescription className="text-lg">
            Altonorte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de Usuario</Label>
              <Input
                data-testid="auth-username-input"
                id="username"
                type="text"
                placeholder="Ingrese su usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="bg-input border-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                data-testid="auth-password-input"
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-input border-input"
              />
              <p className="text-xs text-muted-foreground">
                La contraseña debe tener al menos 8 caracteres
              </p>
            </div>

            <Button
              data-testid="auth-submit-btn"
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? "Procesando..." : isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              data-testid="auth-toggle-btn"
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setPassword("");
              }}
              className="text-sm text-primary hover:underline"
              disabled={loading}
            >
              {isLogin ? "¿No tienes cuenta? Créala aquí" : "¿Ya tienes cuenta? Inicia sesión"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
