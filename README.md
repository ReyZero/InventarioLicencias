# 📥 CÓMO DESCARGAR Y USAR EL PROYECTO

## Archivos Disponibles

Tu proyecto está empaquetado en 2 formatos:

1. **inventario-.zip** (90KB) ← Recomendado para Windows/Mac
2. **inventario-.tar.gz** (50KB) ← Para Linux

## 🔽 Pasos para Descargar

### Desde Emergent Platform:

1. Los archivos están en la carpeta `/app/` del contenedor
2. Puedes descargarlos usando el explorador de archivos de Emergent
3. O usar el comando para copiarlos a tu máquina local

### Usando el Navegador de Archivos:

```bash
# Los archivos están aquí:
/app/inventario.zip
/app/inventario.tar.gz
```

## 📂 Después de Descargar

### 1. Extraer el Archivo

**Windows:**
```
- Click derecho en inventario-.zip
- Selecciona "Extraer todo..."
- Elige la ubicación
```

**Mac:**
```bash
unzip inventario-.zip
cd inventario-
```

**Linux:**
```bash
tar -xzf inventario-.tar.gz
cd inventario-
```

### 2. Abrir en VSCode

```bash
# Desde la terminal
code inventario

# O desde VSCode:
# File → Open Folder → Seleccionar "inventario-"
```

### 3. Instalar Prerrequisitos

Antes de iniciar, necesitas tener instalado:

✅ **Node.js 16+** → https://nodejs.org/
✅ **Python 3.8+** → https://www.python.org/downloads/
✅ **MongoDB** → https://www.mongodb.com/try/download/community
✅ **Yarn** → `npm install -g yarn`

### 4. Configurar el Proyecto

```bash
# 1. Backend - Instalar dependencias
cd backend
pip install -r requirements.txt

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env si es necesario

# 3. Frontend - Instalar dependencias
cd ../frontend
yarn install

# 4. Configurar variables de entorno
cp .env.example .env
```

### 5. Iniciar MongoDB

**Windows:**
```cmd
net start MongoDB
```

**Mac:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### 6. Ejecutar la Aplicación

**Opción A - Usando VSCode (Más Fácil):**

1. Abre el proyecto en VSCode
2. Presiona `Ctrl+Shift+P` (Windows/Linux) o `Cmd+Shift+P` (Mac)
3. Escribe "Tasks: Run Task"
4. Selecciona "🚀 Iniciar Todo (MongoDB)"

**Opción B - Manual:**

Terminal 1 (Backend):
```bash
cd backend
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

Terminal 2 (Frontend):
```bash
cd frontend
yarn start
```

### 7. Abrir en el Navegador

```
http://localhost:3000
```

### 8. Crear tu Primera Cuenta

1. Haz click en "¿No tienes cuenta? Créala aquí"
2. Ingresa un nombre de usuario (sin @)
3. Ingresa una contraseña de 8+ caracteres
4. Click en "Crear Cuenta"

¡Listo! Ya puedes usar el sistema completo.

## 📋 Contenido del Paquete

```
inventario-altonorte/
├── README.md                  ← Documentación completa
├── INICIO_RAPIDO.txt         ← Guía rápida
├── backend/
│   ├── server.py             ← API con MongoDB
│   ├── server_mysql.py       ← API con MySQL (alternativa)
│   ├── requirements.txt      ← Dependencias Python
│   ├── schema_mysql.sql      ← Schema MySQL (opcional)
│   └── .env.example          ← Plantilla configuración
├── frontend/
│   ├── src/
│   │   ├── components/       ← Todos los componentes React
│   │   ├── App.js           ← App principal
│   │   └── index.css        ← Estilos + tema oscuro
│   ├── package.json         ← Dependencias
│   └── .env.example         ← Plantilla configuración
└── .vscode/
    ├── launch.json          ← Debugging
    └── tasks.json           ← Tareas automatizadas
```

## 🎯 Características Incluidas

✅ Login y registro de usuarios (JWT)
✅ Gestión de equipos TI (CRUD completo)
✅ Historial de soporte técnico
✅ Gestión de licencias con vigencias
✅ Exportación a Excel
✅ Tema oscuro moderno
✅ Búsqueda y filtros avanzados
✅ Responsive design
✅ Datos de ejemplo precargados

## 🔧 Solución de Problemas

### "No se puede conectar al backend"
→ Verifica que el backend esté corriendo en http://localhost:8001/docs

### "Error al instalar dependencias"
Backend:
```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

Frontend:
```bash
yarn cache clean
rm -rf node_modules yarn.lock
yarn install
```

### "MongoDB no conecta"
→ Verifica que MongoDB esté corriendo:
```bash
# Windows
tasklist | findstr mongod

# Mac/Linux
ps aux | grep mongod
```

## 📞 Soporte

- Lee el **README.md** completo en la carpeta del proyecto
- Consulta el **INICIO_RAPIDO.txt** para pasos básicos
- Revisa la documentación de API: http://localhost:8001/docs

---

**Sistema de Inventario Altonorte** | Versión 1.0.0
**Listo para usar en VSCode** ✅
