# 📦 Sistema de Inventario Equipos TI Altonorte - Paquete de Deployment

## 🎨 Tema Oscuro Aplicado
✓ Interface con tonos slate/azul oscuro suave (más agradable a la vista)

## 📁 Estructura del Proyecto

```
inventario-altonorte/
├── backend/
│   ├── server.py              # API FastAPI
│   ├── requirements.txt       # Dependencias Python
│   ├── .env                   # Variables de entorno
│   └── database_mysql.py      # Versión con MySQL (opcional)
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EquipmentTable.jsx
│   │   │   ├── AddEquipmentModal.jsx
│   │   │   ├── AddSupportModal.jsx
│   │   │   └── EquipmentDetailModal.jsx
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   └── .env
└── README.md
```

## 🚀 Instrucciones de Deployment

### Opción 1: Con MongoDB (Actual)

#### Backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001
```

#### Frontend:
```bash
cd frontend
yarn install
yarn start
```

### Opción 2: Con MySQL/PostgreSQL

Ver archivo `backend/server_mysql.py` para la versión con base de datos SQL.

#### Configuración MySQL:
1. Crear base de datos:
```sql
CREATE DATABASE inventario_altonorte;
USE inventario_altonorte;

CREATE TABLE equipment (
    id VARCHAR(36) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    numero_serie VARCHAR(100) UNIQUE NOT NULL,
    fecha_entrega VARCHAR(10) NOT NULL,
    jefatura VARCHAR(255) NOT NULL,
    usuario_final VARCHAR(255) NOT NULL,
    estado VARCHAR(50) NOT NULL
);

CREATE TABLE support_history (
    id VARCHAR(36) PRIMARY KEY,
    numero_serie VARCHAR(100) NOT NULL,
    fecha_envio VARCHAR(10) NOT NULL,
    falla_reportada TEXT NOT NULL,
    estado_garantia VARCHAR(50) NOT NULL,
    resultado VARCHAR(50) NOT NULL,
    FOREIGN KEY (numero_serie) REFERENCES equipment(numero_serie) ON DELETE CASCADE
);
```

2. Actualizar `.env` del backend:
```
DATABASE_URL=mysql://usuario:password@localhost:3306/inventario_altonorte
```

## 🔧 Configuración en VSCode

### Extensiones recomendadas:
- Python
- Pylance
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- MySQL (si usas MySQL)

### Tasks.json para VSCode:
Crear `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Backend",
      "type": "shell",
      "command": "cd backend && uvicorn server:app --reload",
      "problemMatcher": []
    },
    {
      "label": "Start Frontend",
      "type": "shell",
      "command": "cd frontend && yarn start",
      "problemMatcher": []
    }
  ]
}
```

## 📋 Variables de Entorno

### Backend (.env):
```
# MongoDB
MONGO_URL=mongodb://localhost:27017
DB_NAME=inventario_altonorte
CORS_ORIGINS=http://localhost:3000

# O para MySQL
# DATABASE_URL=mysql://usuario:password@localhost:3306/inventario_altonorte
```

### Frontend (.env):
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 🌐 Deployment en Producción

### Heroku:
```bash
# Backend
heroku create inventario-altonorte-api
git subtree push --prefix backend heroku main

# Frontend
heroku create inventario-altonorte-app
git subtree push --prefix frontend heroku main
```

### Vercel (Frontend):
```bash
cd frontend
vercel deploy
```

### Railway/Render (Backend):
Conectar el repositorio y configurar las variables de entorno.

## 📝 Notas Importantes

1. **Seguridad**: En producción, no olvides:
   - Cambiar CORS_ORIGINS a tu dominio específico
   - Usar variables de entorno seguras
   - Implementar autenticación si es necesario

2. **Base de Datos**:
   - MongoDB es más flexible para este caso (sin schemas rígidos)
   - MySQL/PostgreSQL requiere más configuración pero ofrece mejor integridad referencial

3. **Performance**:
   - Agregar índices en numero_serie para búsquedas rápidas
   - Implementar paginación si esperas +1000 equipos

## 🎨 Personalización del Tema

Los colores están en `frontend/src/index.css` en la sección `:root`.
Valores actuales (tema oscuro slate):
- Background: `217 33% 17%` (azul oscuro suave)
- Foreground: `213 31% 91%` (texto claro)
- Primary: `217 91% 60%` (azul brillante para botones)

## 📞 Soporte

Para cualquier duda sobre el sistema, revisa la documentación en los comentarios del código.
