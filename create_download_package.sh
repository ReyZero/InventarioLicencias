#!/bin/bash

echo "📦 Creando paquete completo del proyecto Inventario Altonorte..."

PACKAGE_NAME="inventario-altonorte"
PACKAGE_DIR="${PACKAGE_NAME}"

# Limpiar paquete anterior si existe
rm -rf "$PACKAGE_DIR" "${PACKAGE_DIR}.zip" "${PACKAGE_DIR}.tar.gz"

# Crear estructura de directorios
mkdir -p "$PACKAGE_DIR/backend"
mkdir -p "$PACKAGE_DIR/frontend/src/components"
mkdir -p "$PACKAGE_DIR/frontend/public"
mkdir -p "$PACKAGE_DIR/.vscode"

echo "📁 Copiando archivos del backend..."
cp /app/backend/server.py "$PACKAGE_DIR/backend/"
cp /app/backend/server_mysql.py "$PACKAGE_DIR/backend/" 2>/dev/null || true
cp /app/backend/requirements.txt "$PACKAGE_DIR/backend/"
cp /app/backend/schema_mysql.sql "$PACKAGE_DIR/backend/" 2>/dev/null || true

# Crear .env de ejemplo para backend
cat > "$PACKAGE_DIR/backend/.env.example" << 'EOF'
# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017
DB_NAME=inventario_altonorte
CORS_ORIGINS=http://localhost:3000

# Security
SECRET_KEY=change-this-secret-key-in-production

# Para MySQL (alternativa a MongoDB)
# DATABASE_URL=mysql://root:password@localhost:3306/inventario_altonorte
EOF

echo "📁 Copiando archivos del frontend..."
cp /app/frontend/package.json "$PACKAGE_DIR/frontend/"
cp /app/frontend/tailwind.config.js "$PACKAGE_DIR/frontend/" 2>/dev/null || true
cp /app/frontend/postcss.config.js "$PACKAGE_DIR/frontend/" 2>/dev/null || true
cp /app/frontend/craco.config.js "$PACKAGE_DIR/frontend/" 2>/dev/null || true

# Copiar src
cp /app/frontend/src/App.js "$PACKAGE_DIR/frontend/src/"
cp /app/frontend/src/App.css "$PACKAGE_DIR/frontend/src/"
cp /app/frontend/src/index.css "$PACKAGE_DIR/frontend/src/"
cp /app/frontend/src/index.js "$PACKAGE_DIR/frontend/src/"

# Copiar componentes
cp /app/frontend/src/components/*.jsx "$PACKAGE_DIR/frontend/src/components/" 2>/dev/null || true

# Copiar componentes UI (shadcn)
if [ -d "/app/frontend/src/components/ui" ]; then
    mkdir -p "$PACKAGE_DIR/frontend/src/components/ui"
    cp -r /app/frontend/src/components/ui/* "$PACKAGE_DIR/frontend/src/components/ui/"
fi

# Copiar hooks
if [ -d "/app/frontend/src/hooks" ]; then
    mkdir -p "$PACKAGE_DIR/frontend/src/hooks"
    cp -r /app/frontend/src/hooks/* "$PACKAGE_DIR/frontend/src/hooks/"
fi

# Copiar lib
if [ -d "/app/frontend/src/lib" ]; then
    mkdir -p "$PACKAGE_DIR/frontend/src/lib"
    cp -r /app/frontend/src/lib/* "$PACKAGE_DIR/frontend/src/lib/"
fi

# Copiar public
cp -r /app/frontend/public/* "$PACKAGE_DIR/frontend/public/" 2>/dev/null || true

# Crear .env de ejemplo para frontend
cat > "$PACKAGE_DIR/frontend/.env.example" << 'EOF'
REACT_APP_BACKEND_URL=http://localhost:8001
EOF

echo "📁 Copiando configuración de VSCode..."
cp /app/.vscode/launch.json "$PACKAGE_DIR/.vscode/" 2>/dev/null || true
cp /app/.vscode/tasks.json "$PACKAGE_DIR/.vscode/" 2>/dev/null || true

echo "📝 Creando documentación..."

# README principal
cat > "$PACKAGE_DIR/README.md" << 'EOF'
# 🏢 Sistema de Inventario de Equipos TI - Altonorte

Sistema completo de gestión de inventario de equipos tecnológicos y licencias con autenticación.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-19.0-61dafb)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688)

## ✨ Características

- 🔐 **Autenticación JWT** - Login y registro de usuarios
- 📦 **Gestión de Equipos** - CRUD completo con historial de soporte
- 🔑 **Gestión de Licencias** - Control de vigencias con alertas visuales
- 📊 **Exportación a Excel** - Reportes completos
- 🎨 **Tema Oscuro** - Diseño moderno slate/azul
- 🔍 **Búsqueda y Filtros** - Filtrado avanzado por múltiples campos
- ✏️ **Edición Completa** - Editar equipos, licencias y estados
- 📱 **Responsive** - Funciona en desktop y tablets

## 🚀 Inicio Rápido con VSCode

### Prerrequisitos

- **Node.js** 16+ y **Yarn**
- **Python** 3.8+
- **MongoDB** 4.4+ (o **MySQL** 8.0+ como alternativa)
- **VSCode** (recomendado)

### Instalación

1. **Extraer el proyecto**
   ```bash
   unzip inventario-altonorte.zip
   cd inventario-altonorte
   ```

2. **Abrir en VSCode**
   ```bash
   code .
   ```

3. **Instalar extensiones recomendadas de VSCode:**
   - Python
   - ES7+ React/Redux/React-Native snippets
   - Tailwind CSS IntelliSense
   - MongoDB for VS Code (opcional)

4. **Configurar variables de entorno**
   
   **Backend:**
   ```bash
   cd backend
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

   **Frontend:**
   ```bash
   cd frontend
   cp .env.example .env
   # Por defecto apunta a http://localhost:8001
   ```

5. **Instalar dependencias**

   **Backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

   **Frontend:**
   ```bash
   cd frontend
   yarn install
   ```

6. **Iniciar MongoDB**
   ```bash
   # Windows
   net start MongoDB
   
   # Mac
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

7. **Ejecutar la aplicación**

   **Opción A - Usando VSCode Tasks (Recomendado):**
   - Presiona `Ctrl+Shift+P` (Windows/Linux) o `Cmd+Shift+P` (Mac)
   - Escribe "Tasks: Run Task"
   - Selecciona "🚀 Iniciar Todo (MongoDB)"

   **Opción B - Manualmente:**
   
   Terminal 1 - Backend:
   ```bash
   cd backend
   python -m uvicorn server:app --reload --host 0.0.0.0 --port 8001
   ```

   Terminal 2 - Frontend:
   ```bash
   cd frontend
   yarn start
   ```

8. **Abrir la aplicación**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001/docs

### Primer Uso

1. Abre http://localhost:3000
2. Haz click en "¿No tienes cuenta? Créala aquí"
3. Crea tu usuario (solo nombre de usuario y contraseña de 8+ caracteres)
4. Los datos de ejemplo se cargan automáticamente

## 📚 Estructura del Proyecto

```
inventario-altonorte/
├── backend/
│   ├── server.py              # API FastAPI con MongoDB
│   ├── server_mysql.py        # API FastAPI con MySQL (alternativa)
│   ├── requirements.txt       # Dependencias Python
│   └── .env.example          # Plantilla de configuración
├── frontend/
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── App.js            # Componente principal
│   │   └── index.css         # Estilos + tema oscuro
│   ├── package.json          # Dependencias Node
│   └── .env.example          # Plantilla de configuración
└── .vscode/
    ├── launch.json           # Configuración de debugging
    └── tasks.json            # Tareas automatizadas
```

## 🎯 Módulos del Sistema

### 1. Equipos TI
- Registro de equipos con todos sus datos
- Historial de soporte técnico
- Estados: Activo, En reparación, Dado de baja
- Campos: Nombre, Serie, Fecha entrega, Jefatura, Usuario, Área, Estado

### 2. Licencias de Software
- Control de licencias con vigencias
- Estados: Disponible, Instalada, Reasignada
- **Alertas visuales por días restantes:**
  - 🟢 Verde: > 60 días
  - 🟡 Amarillo: 30-60 días
  - 🟠 Naranja: 15-30 días
  - 🔴 Rojo: < 15 días o vencida
- Asignación por usuario y área

### 3. Historial de Soporte
- Registro de reparaciones
- Estado de garantía
- Actualización automática de estado al reparar

## 🔧 Comandos Útiles

### Backend
```bash
# Ejecutar con recarga automática
python -m uvicorn server:app --reload

# Ver documentación de API
# Abrir http://localhost:8001/docs

# Resetear base de datos (desarrollo)
curl -X DELETE http://localhost:8001/api/reset \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend
```bash
# Iniciar desarrollo
yarn start

# Build para producción
yarn build

# Limpiar caché
yarn cache clean
rm -rf node_modules yarn.lock
yarn install
```

## 🗄️ Base de Datos

### Opción 1: MongoDB (Por defecto)

**Instalación:**
- Windows: https://www.mongodb.com/try/download/community
- Mac: `brew install mongodb-community`
- Linux: `sudo apt install mongodb`

**Configuración en .env:**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=inventario_altonorte
```

### Opción 2: MySQL (Alternativa)

**Crear base de datos:**
```bash
mysql -u root -p
```

```sql
CREATE DATABASE inventario_altonorte CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Ejecutar schema:**
```bash
mysql -u root -p inventario_altonorte < backend/schema_mysql.sql
```

**Usar server_mysql.py:**
```bash
python -m uvicorn server_mysql:app --reload
```

## 🎨 Personalización del Tema

El tema oscuro se puede personalizar en `frontend/src/index.css`:

```css
:root {
  --background: 217 33% 17%;    /* Fondo principal */
  --foreground: 213 31% 91%;    /* Texto */
  --primary: 217 91% 60%;       /* Botones */
  --border: 217 32% 30%;        /* Bordes */
}
```

**Para cambiar el tono:**
- Más oscuro: Reduce el % (ej: 17% → 12%)
- Más claro: Aumenta el % (ej: 17% → 25%)
- Otro color: Cambia el primer número (217=azul, 0=rojo, 120=verde)

## 🐛 Solución de Problemas

### Backend no inicia
```bash
# Verificar puerto
lsof -i :8001

# Instalar dependencias faltantes
pip install -r requirements.txt --force-reinstall
```

### Frontend no conecta con backend
1. Verificar que backend esté corriendo: http://localhost:8001/docs
2. Revisar `REACT_APP_BACKEND_URL` en `frontend/.env`
3. Verificar CORS en `backend/.env`

### Error de autenticación
1. Asegúrate de crear una cuenta primero
2. Verifica que `SECRET_KEY` esté configurada en `backend/.env`
3. Limpia localStorage del navegador: F12 → Application → Local Storage → Clear

### Base de datos no conecta
```bash
# MongoDB
sudo systemctl status mongod
mongo --eval 'db.runCommand({ connectionStatus: 1 })'

# MySQL
mysql -u root -p -e "SHOW DATABASES;"
```

## 📦 Deployment en Producción

### Backend (Render/Railway)
1. Conectar repositorio Git
2. Variables de entorno:
   - `MONGO_URL` o `DATABASE_URL`
   - `SECRET_KEY` (generar uno nuevo)
   - `CORS_ORIGINS` (URL del frontend)
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel)
1. Instalar Vercel CLI: `npm i -g vercel`
2. En carpeta frontend: `vercel --prod`
3. Configurar variable: `REACT_APP_BACKEND_URL` (URL del backend)

## 📄 Licencia

Uso interno de Altonorte. Todos los derechos reservados.

## 📞 Soporte

Para soporte técnico:
- Revisar documentación en este README
- Verificar logs de backend y frontend
- Consultar API docs: http://localhost:8001/docs

---

**Desarrollado para Altonorte** | Versión 1.0.0 | Febrero 2026
EOF

# Crear guía rápida
cat > "$PACKAGE_DIR/INICIO_RAPIDO.txt" << 'EOF'
═══════════════════════════════════════════════════
  INICIO RÁPIDO - Inventario Altonorte
═══════════════════════════════════════════════════

🚀 PASOS PARA EJECUTAR EN VSCODE:

1. Abrir el proyecto:
   - Abrir VSCode
   - File → Open Folder → Seleccionar "inventario-altonorte"

2. Instalar extensiones (VSCode te las sugerirá):
   - Python
   - ES7+ React snippets
   - Tailwind CSS IntelliSense

3. Configurar .env:
   Backend:  cd backend && cp .env.example .env
   Frontend: cd frontend && cp .env.example .env

4. Instalar dependencias:
   Backend:  cd backend && pip install -r requirements.txt
   Frontend: cd frontend && yarn install

5. Iniciar MongoDB:
   Windows: net start MongoDB
   Mac:     brew services start mongodb-community
   Linux:   sudo systemctl start mongod

6. Ejecutar aplicación:
   OPCIÓN FÁCIL (VSCode):
   - Ctrl+Shift+P → "Tasks: Run Task" → "🚀 Iniciar Todo"

   OPCIÓN MANUAL:
   Terminal 1: cd backend && python -m uvicorn server:app --reload
   Terminal 2: cd frontend && yarn start

7. Abrir navegador:
   http://localhost:3000

8. Crear tu cuenta:
   - Click en "¿No tienes cuenta? Créala aquí"
   - Usuario: el que quieras (sin @)
   - Contraseña: mínimo 8 caracteres

¡Listo! Ya puedes usar el sistema.

═══════════════════════════════════════════════════
URLs IMPORTANTES:
═══════════════════════════════════════════════════
Frontend:  http://localhost:3000
Backend:   http://localhost:8001
API Docs:  http://localhost:8001/docs

═══════════════════════════════════════════════════
ATAJOS DE TECLADO EN VSCODE:
═══════════════════════════════════════════════════
Ctrl+Shift+P   → Abrir comandos
Ctrl+`         → Abrir terminal
Ctrl+B         → Mostrar/Ocultar sidebar
F5             → Iniciar debugging

═══════════════════════════════════════════════════
EOF

echo "🗜️ Comprimiendo paquete..."
cd "$(dirname "$PACKAGE_DIR")"
zip -r "${PACKAGE_NAME}.zip" "$PACKAGE_NAME" > /dev/null 2>&1
tar -czf "${PACKAGE_NAME}.tar.gz" "$PACKAGE_NAME" 2>/dev/null

# Obtener tamaño
ZIP_SIZE=$(ls -lh "${PACKAGE_NAME}.zip" | awk '{print $5}')
TAR_SIZE=$(ls -lh "${PACKAGE_NAME}.tar.gz" 2>/dev/null | awk '{print $5}')

echo ""
echo "✅ ¡Paquete creado exitosamente!"
echo ""
echo "📦 Archivos generados:"
echo "   - ${PACKAGE_NAME}.zip (${ZIP_SIZE}) ← Para Windows/Mac"
echo "   - ${PACKAGE_NAME}.tar.gz (${TAR_SIZE}) ← Para Linux"
echo ""
echo "📥 Descarga el archivo ZIP y extráelo"
echo "📂 Abre la carpeta en VSCode: code ${PACKAGE_NAME}"
echo "📖 Lee el archivo README.md para instrucciones completas"
echo ""
