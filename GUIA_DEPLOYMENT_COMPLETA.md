# 📦 PAQUETE COMPLETO DE CÓDIGO - Inventario Altonorte

## ✅ Tema Oscuro Optimizado
- Fondo principal: Slate/Azul oscuro suave (#2B3544)
- Tablas y cards: Tono oscuro armonioso
- Texto: Alto contraste para fácil lectura
- Badges de estado: Colores vivos y distintivos

## 📂 Archivos del Paquete

Tienes **2 archivos ZIP** disponibles para descargar:

1. **inventario-altonorte-deployment_[timestamp].tar.gz** - Para Linux/Mac
2. **inventario-altonorte-deployment_[timestamp].zip** - Para Windows/VSCode

## 🎯 Contenido del Paquete

```
inventario-altonorte/
├── backend/
│   ├── server.py              ← Backend con MongoDB (más simple)
│   ├── server_mysql.py        ← Backend con MySQL/PostgreSQL
│   ├── schema_mysql.sql       ← Schema completo para MySQL
│   ├── requirements.txt       ← Dependencias MongoDB
│   ├── requirements_mysql.txt ← Dependencias MySQL
│   └── .env.example           ← Plantilla de configuración
│
├── frontend/
│   ├── src/
│   │   ├── components/        ← Componentes React
│   │   ├── App.js            ← App principal
│   │   ├── index.css         ← Tema oscuro configurado
│   │   └── App.css
│   ├── package.json          ← Dependencias frontend
│   └── .env.example          ← Plantilla de configuración
│
├── .vscode/                  ← Configuración VSCode
│   ├── launch.json          ← Debugger configurado
│   └── tasks.json           ← Tareas automatizadas
│
├── README.md                 ← Documentación completa
└── INICIO_RAPIDO.txt        ← Guía de 5 minutos
```

## 🚀 Instalación en VSCode

### Paso 1: Extraer archivos
```bash
# Descomprimir el ZIP
unzip inventario-altonorte-deployment_*.zip
cd inventario-altonorte-deployment_*
```

### Paso 2: Abrir en VSCode
```bash
code .
```

### Paso 3: Configurar variables de entorno

**Backend (.env):**
```env
# Opción A: MongoDB
MONGO_URL=mongodb://localhost:27017
DB_NAME=inventario_altonorte
CORS_ORIGINS=http://localhost:3000

# Opción B: MySQL
# DATABASE_URL=mysql://root:password@localhost:3306/inventario_altonorte
# CORS_ORIGINS=http://localhost:3000
```

**Frontend (.env):**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

### Paso 4: Instalar dependencias

**Opción A - MongoDB:**
```bash
# Terminal 1: Backend
cd backend
pip install -r requirements.txt

# Terminal 2: Frontend
cd frontend
yarn install
```

**Opción B - MySQL:**
```bash
# Primero crear base de datos
mysql -u root -p < backend/schema_mysql.sql

# Terminal 1: Backend
cd backend
pip install -r requirements_mysql.txt

# Terminal 2: Frontend
cd frontend
yarn install
```

### Paso 5: Ejecutar aplicación

**Usando VSCode Tasks (Recomendado):**
1. Presiona `Ctrl+Shift+P` (Windows/Linux) o `Cmd+Shift+P` (Mac)
2. Escribe "Tasks: Run Task"
3. Selecciona:
   - "🚀 Iniciar Todo (MongoDB)" o
   - "🚀 Iniciar Todo (MySQL)"

**Manualmente:**
```bash
# Terminal 1: Backend
cd backend
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Terminal 2: Frontend
cd frontend
yarn start
```

### Paso 6: Abrir la aplicación
- Frontend: http://localhost:3000
- Backend API Docs: http://localhost:8001/docs

## 🎨 Personalizar Colores

Los colores están en `frontend/src/index.css`:

```css
:root {
  /* Fondo principal */
  --background: 217 33% 17%;    /* Azul oscuro actual */
  
  /* Cards y tabla */
  --card: 217 33% 20%;          /* Ligeramente más claro que el fondo */
  
  /* Texto principal */
  --foreground: 213 31% 91%;    /* Texto claro */
  
  /* Botones principales */
  --primary: 217 91% 60%;       /* Azul brillante */
}
```

**Para cambiar el tono:**
- Más oscuro: Reduce el % (ej: 17% → 12%)
- Más claro: Aumenta el % (ej: 17% → 25%)
- Otro color: Cambia el primer número (217=azul, 0=rojo, 120=verde, 280=morado)

## 🗄️ Elegir Base de Datos

### MongoDB (Recomendado - Más simple)
✅ No requiere schema rígido
✅ Más flexible para cambios
✅ Instalación más rápida
✅ Ideal para desarrollo

**Instalación MongoDB:**
- Windows: https://www.mongodb.com/try/download/community
- Mac: `brew install mongodb-community`
- Linux: `sudo apt install mongodb`

### MySQL/PostgreSQL
✅ Mejor integridad referencial
✅ Más familiar si ya usas SQL
✅ Consultas SQL estándar
✅ Mejor para reportes complejos

**Instalación MySQL:**
- Windows: https://dev.mysql.com/downloads/installer/
- Mac: `brew install mysql`
- Linux: `sudo apt install mysql-server`

**Instalación PostgreSQL:**
- Windows: https://www.postgresql.org/download/windows/
- Mac: `brew install postgresql`
- Linux: `sudo apt install postgresql`

## 📝 Comandos Útiles

### Backend
```bash
# Ver logs del servidor
python -m uvicorn server:app --log-level debug

# Resetear base de datos
curl -X DELETE http://localhost:8001/api/reset
curl -X POST http://localhost:8001/api/seed

# Verificar que esté corriendo
curl http://localhost:8001/api/equipment
```

### Frontend
```bash
# Limpiar caché
yarn cache clean

# Reinstalar dependencias
rm -rf node_modules yarn.lock
yarn install

# Build para producción
yarn build
```

## 🌐 Deployment en Producción

### Backend en Render.com (Gratis)
1. Crear cuenta en https://render.com
2. New → Web Service
3. Conectar tu repositorio Git
4. Configurar:
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - Variables: `MONGO_URL`, `CORS_ORIGINS`

### Frontend en Vercel (Gratis)
1. Crear cuenta en https://vercel.com
2. New Project → Import Git Repository
3. Framework: Create React App
4. Root Directory: `frontend`
5. Variable: `REACT_APP_BACKEND_URL` = URL de Render

## 🔍 Solución de Problemas

### La tabla se ve blanca
✅ **Solucionado** - La última versión usa `bg-card` en vez de `bg-white`

### Backend no inicia
```bash
# Verificar que el puerto esté libre
lsof -i :8001

# Matar proceso si está ocupado
kill -9 $(lsof -t -i:8001)
```

### Frontend no conecta con backend
1. Verifica CORS en backend `.env`
2. Verifica `REACT_APP_BACKEND_URL` en frontend `.env`
3. Asegúrate que backend esté corriendo: http://localhost:8001/docs

### Error de dependencias
```bash
# Backend
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall

# Frontend
yarn cache clean
rm -rf node_modules
yarn install
```

## 📞 Características del Sistema

✅ Gestión completa de equipos (agregar, editar, eliminar)
✅ Historial de soporte por número de serie
✅ Búsqueda por nombre o número de serie
✅ Filtros múltiples (jefatura, usuario, estado)
✅ Ordenamiento por cualquier columna
✅ Vista detallada con historial completo
✅ Exportación a Excel de todos los datos
✅ Validación de fechas formato DD/MM/AAAA
✅ Validación de número de serie único
✅ Tema oscuro optimizado para reducir fatiga visual
✅ Responsive design para tablets y desktop
✅ Datos de ejemplo incluidos

## 📧 Soporte

Si tienes dudas durante la instalación:
1. Revisa la documentación en `README.md`
2. Consulta `INICIO_RAPIDO.txt` para pasos básicos
3. Revisa los comentarios en el código

---

**Versión**: 1.0.1 (Tema Oscuro Optimizado)  
**Última actualización**: 19 Febrero 2026  
**Desarrollado para**: Altonorte
