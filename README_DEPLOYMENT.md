# 🏢 Sistema de Inventario de Equipos TI - Altonorte

Sistema completo de gestión de inventario de equipos tecnológicos con historial de soporte técnico.

![Tema Oscuro](https://img.shields.io/badge/tema-oscuro%20slate-blue)
![React](https://img.shields.io/badge/React-19.0-61dafb)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688)

## ✨ Características

- ✅ Gestión completa de equipos (CRUD)
- ✅ Historial de soporte por fabricante
- ✅ Búsqueda y filtros avanzados
- ✅ Ordenamiento de columnas
- ✅ Exportación a Excel
- ✅ Validación de formularios
- ✅ Tema oscuro agradable (slate/azul)
- ✅ Responsive design
- ✅ Compatible con MongoDB y MySQL/PostgreSQL

## 📋 Requisitos Previos

- Python 3.8+
- Node.js 16+ y Yarn
- MongoDB 4.4+ o MySQL 8.0+ / PostgreSQL 13+

## 🚀 Instalación Rápida

### Opción A: Con MongoDB (Recomendado - más simple)

```bash
# 1. Clonar o descargar el proyecto
cd inventario-altonorte

# 2. Backend
cd backend
pip install -r requirements.txt
cp .env.example .env
# Editar .env y configurar MONGO_URL si es necesario
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8001

# 3. Frontend (en otra terminal)
cd frontend
yarn install
cp .env.example .env
# Editar .env si cambias el puerto del backend
yarn start
```

### Opción B: Con MySQL

```bash
# 1. Crear base de datos
mysql -u root -p
# En MySQL:
source backend/schema_mysql.sql

# 2. Backend
cd backend
pip install -r requirements_mysql.txt
cp .env.example .env
# Editar .env y configurar DATABASE_URL=mysql://user:pass@localhost:3306/inventario_altonorte
python -m uvicorn server_mysql:app --reload --host 0.0.0.0 --port 8001

# 3. Frontend
cd frontend
yarn install
cp .env.example .env
yarn start
```

## 💻 Desarrollo en VSCode

1. Abre el proyecto en VSCode
2. Instala extensiones recomendadas:
   - Python
   - ES7+ React/Redux
   - Tailwind CSS IntelliSense
3. Usa `Ctrl+Shift+P` → "Tasks: Run Task" → "🚀 Iniciar Todo (MongoDB)" o "🚀 Iniciar Todo (MySQL)"

## 📁 Estructura del Proyecto

```
inventario-altonorte/
├── backend/
│   ├── server.py              # Backend con MongoDB
│   ├── server_mysql.py        # Backend con MySQL/PostgreSQL
│   ├── requirements.txt       # Dependencias MongoDB
│   ├── requirements_mysql.txt # Dependencias MySQL
│   ├── schema_mysql.sql       # Schema SQL
│   └── .env                   # Configuración
├── frontend/
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── App.js            # Componente principal
│   │   ├── index.css         # Estilos globales + tema
│   │   └── App.css
│   ├── package.json
│   └── .env
└── .vscode/                   # Configuración VSCode
    ├── tasks.json            # Tareas automatizadas
    └── launch.json           # Configuración debug
```

## 🎨 Personalización del Tema

El tema oscuro está en `frontend/src/index.css`. Variables principales:

```css
:root {
  --background: 217 33% 17%;    /* Fondo oscuro slate/azul */
  --foreground: 213 31% 91%;    /* Texto claro */
  --primary: 217 91% 60%;       /* Azul brillante (botones) */
  --border: 217 32% 30%;        /* Bordes */
}
```

Para cambiar el tono:
- **Más oscuro**: Reduce el 17% en background a 12-14%
- **Más claro**: Aumenta a 22-25%
- **Otro color**: Cambia el primer número (217 = azul, 0 = rojo, 120 = verde)

## 🌐 Deployment en Producción

### Vercel (Frontend)
```bash
cd frontend
npm i -g vercel
vercel deploy --prod
```

### Render/Railway (Backend)
1. Conecta tu repositorio Git
2. Configura variables de entorno:
   - `MONGO_URL` o `DATABASE_URL`
   - `CORS_ORIGINS` (URL del frontend)
3. Deploy automático en cada push

### Docker
```dockerfile
# Backend Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

## 🔒 Seguridad en Producción

1. **Variables de entorno**: Nunca commitees `.env` al repositorio
2. **CORS**: Cambia `CORS_ORIGINS=*` a tu dominio específico
3. **Database**: Usa conexiones SSL en producción
4. **Autenticación**: Considera agregar JWT si necesitas multiusuario

## 📊 Datos de Ejemplo

Al iniciar por primera vez, se cargan automáticamente 5 equipos de ejemplo. Para resetear:

```bash
# MongoDB
curl -X DELETE http://localhost:8001/api/reset
curl -X POST http://localhost:8001/api/seed

# MySQL
mysql -u root -p inventario_altonorte < backend/schema_mysql.sql
```

## 🐛 Troubleshooting

### Backend no inicia
```bash
# Verificar dependencias
pip list | grep fastapi
pip list | grep motor  # MongoDB
pip list | grep pymysql  # MySQL

# Verificar puerto
lsof -i :8001
```

### Frontend no carga datos
1. Verifica que el backend esté corriendo: `http://localhost:8001/docs`
2. Revisa CORS en backend `.env`
3. Verifica `REACT_APP_BACKEND_URL` en frontend `.env`

### Error de conexión a base de datos
- **MongoDB**: Verifica que MongoDB esté corriendo: `systemctl status mongod`
- **MySQL**: Verifica credenciales en `.env` y que la BD exista

## 📝 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/equipment` | Listar todos los equipos |
| POST | `/api/equipment` | Crear nuevo equipo |
| PUT | `/api/equipment/{id}` | Actualizar equipo |
| DELETE | `/api/equipment/{id}` | Eliminar equipo |
| GET | `/api/support` | Listar historial de soporte |
| POST | `/api/support` | Registrar nuevo soporte |
| GET | `/api/export` | Descargar Excel |
| POST | `/api/seed` | Cargar datos de ejemplo |

Documentación interactiva: `http://localhost:8001/docs`

## 🤝 Contribuciones

Este es un proyecto interno de Altonorte. Para cambios, contacta al equipo de TI.

## 📄 Licencia

Propiedad de Altonorte. Uso interno únicamente.

## 📞 Soporte

Para soporte técnico, contacta a:
- Email: ti@altonorte.com
- Tel: [tu teléfono]

---

**Versión**: 1.0.0  
**Última actualización**: Febrero 2026  
**Desarrollado con**: React, FastAPI, MongoDB/MySQL
