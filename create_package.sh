#!/bin/bash

# Script para crear paquete de deployment
# Uso: bash create_package.sh

echo "📦 Creando paquete de deployment para Inventario Altonorte..."

PACKAGE_NAME="inventario-altonorte-deployment"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE_DIR="${PACKAGE_NAME}_${TIMESTAMP}"

# Crear directorio del paquete
mkdir -p "$PACKAGE_DIR"

# Copiar archivos del backend
echo "📁 Copiando backend..."
mkdir -p "$PACKAGE_DIR/backend"
cp backend/server.py "$PACKAGE_DIR/backend/"
cp backend/server_mysql.py "$PACKAGE_DIR/backend/"
cp backend/requirements.txt "$PACKAGE_DIR/backend/"
cp backend/requirements_mysql.txt "$PACKAGE_DIR/backend/"
cp backend/schema_mysql.sql "$PACKAGE_DIR/backend/"
cp backend/.env "$PACKAGE_DIR/backend/.env.example"

# Copiar archivos del frontend
echo "📁 Copiando frontend..."
mkdir -p "$PACKAGE_DIR/frontend/src/components"
mkdir -p "$PACKAGE_DIR/frontend/public"

cp frontend/package.json "$PACKAGE_DIR/frontend/"
cp frontend/tailwind.config.js "$PACKAGE_DIR/frontend/"
cp frontend/postcss.config.js "$PACKAGE_DIR/frontend/"
cp frontend/.env "$PACKAGE_DIR/frontend/.env.example"

cp frontend/src/App.js "$PACKAGE_DIR/frontend/src/"
cp frontend/src/App.css "$PACKAGE_DIR/frontend/src/"
cp frontend/src/index.css "$PACKAGE_DIR/frontend/src/"
cp frontend/src/index.js "$PACKAGE_DIR/frontend/src/"

cp -r frontend/src/components/*.jsx "$PACKAGE_DIR/frontend/src/components/" 2>/dev/null || true
cp -r frontend/src/components/ui "$PACKAGE_DIR/frontend/src/components/" 2>/dev/null || true

# Copiar documentación
echo "📝 Copiando documentación..."
cp DEPLOYMENT_PACKAGE.md "$PACKAGE_DIR/README.md"

# Crear archivo de instrucciones rápidas
cat > "$PACKAGE_DIR/INICIO_RAPIDO.txt" << 'EOF'
🚀 INICIO RÁPIDO - Inventario Altonorte

=== OPCIÓN 1: Con MongoDB (más simple) ===

1. Backend:
   cd backend
   pip install -r requirements.txt
   # Editar .env y configurar MONGO_URL
   python -m uvicorn server:app --reload --host 0.0.0.0 --port 8001

2. Frontend:
   cd frontend
   yarn install
   # Editar .env y configurar REACT_APP_BACKEND_URL
   yarn start

=== OPCIÓN 2: Con MySQL ===

1. Crear base de datos:
   mysql -u root -p < backend/schema_mysql.sql

2. Backend:
   cd backend
   pip install -r requirements_mysql.txt
   # Editar .env y configurar DATABASE_URL
   python -m uvicorn server_mysql:app --reload --host 0.0.0.0 --port 8001

3. Frontend:
   (mismo que opción 1)

=== URLs por defecto ===
- Frontend: http://localhost:3000
- Backend: http://localhost:8001
- API Docs: http://localhost:8001/docs

¡Listo! Abre http://localhost:3000 en tu navegador.
EOF

# Comprimir el paquete
echo "🗜️ Comprimiendo paquete..."
tar -czf "${PACKAGE_DIR}.tar.gz" "$PACKAGE_DIR"
zip -r "${PACKAGE_DIR}.zip" "$PACKAGE_DIR" > /dev/null 2>&1

# Limpiar directorio temporal
rm -rf "$PACKAGE_DIR"

echo "✅ Paquete creado exitosamente:"
echo "   - ${PACKAGE_DIR}.tar.gz"
echo "   - ${PACKAGE_DIR}.zip"
echo ""
echo "📤 Puedes enviar cualquiera de estos archivos para deployment."
