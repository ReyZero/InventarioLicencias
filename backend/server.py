from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from io import BytesIO
import xlsxwriter
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# JWT Configuration
SECRET_KEY = os.getenv('SECRET_KEY', 'altonorte-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Security
security = HTTPBearer()

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    username: str
    created_at: str

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User
class Equipment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    nombre: str
    numero_serie: str
    fecha_entrega: str  # DD/MM/AAAA
    jefatura: str
    usuario_final: str
    estado: str  # Activo / En reparación / Dado de baja

class EquipmentCreate(BaseModel):
    nombre: str
    numero_serie: str
    fecha_entrega: str
    jefatura: str
    usuario_final: str
    estado: str

class SupportHistory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    numero_serie: str
    fecha_envio: str  # DD/MM/AAAA
    falla_reportada: str
    estado_garantia: str  # En garantía / Fuera de garantía
    resultado: str  # Reparado / Cambiado / No reparable

class SupportHistoryCreate(BaseModel):
    numero_serie: str
    fecha_envio: str
    falla_reportada: str
    estado_garantia: str
    resultado: str

# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        
        user = await db.users.find_one({"username": username}, {"_id": 0, "password": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")
        
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

# Auth endpoints
@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Validar longitud de contraseña
    if len(user_data.password) < 8:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 8 caracteres")
    
    # Verificar si el usuario ya existe
    existing_user = await db.users.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="El nombre de usuario ya está en uso")
    
    # Crear nuevo usuario
    import uuid
    user_id = str(uuid.uuid4())
    hashed_password = hash_password(user_data.password)
    
    new_user = {
        "id": user_id,
        "username": user_data.username,
        "password": hashed_password,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(new_user)
    
    # Crear token
    access_token = create_access_token(data={"sub": user_data.username})
    
    user_response = User(
        id=user_id,
        username=user_data.username,
        created_at=new_user["created_at"]
    )
    
    return Token(access_token=access_token, token_type="bearer", user=user_response)

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    # Buscar usuario
    user = await db.users.find_one({"username": user_data.username})
    if not user:
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
    
    # Verificar contraseña
    if not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
    
    # Crear token
    access_token = create_access_token(data={"sub": user_data.username})
    
    user_response = User(
        id=user["id"],
        username=user["username"],
        created_at=user["created_at"]
    )
    
    return Token(access_token=access_token, token_type="bearer", user=user_response)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    return User(**current_user)

# Equipment endpoints
@api_router.get("/equipment", response_model=List[Equipment])
async def get_equipment(current_user: dict = Depends(get_current_user)):
    equipment_list = await db.equipment.find({}, {"_id": 0}).to_list(1000)
    return equipment_list

@api_router.post("/equipment", response_model=Equipment)
async def create_equipment(input: EquipmentCreate, current_user: dict = Depends(get_current_user)):
    # Check if serial number already exists
    existing = await db.equipment.find_one({"numero_serie": input.numero_serie}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="El número de serie ya existe")
    
    # Generate ID
    import uuid
    equipment_dict = input.model_dump()
    equipment_dict['id'] = str(uuid.uuid4())
    
    await db.equipment.insert_one(equipment_dict)
    return Equipment(**equipment_dict)

@api_router.put("/equipment/{equipment_id}", response_model=Equipment)
async def update_equipment(equipment_id: str, input: EquipmentCreate, current_user: dict = Depends(get_current_user)):
    equipment_dict = input.model_dump()
    equipment_dict['id'] = equipment_id
    
    result = await db.equipment.update_one(
        {"id": equipment_id},
        {"$set": equipment_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    
    return Equipment(**equipment_dict)

@api_router.delete("/equipment/{equipment_id}")
async def delete_equipment(equipment_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.equipment.delete_one({"id": equipment_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    
    # Also delete associated support history
    equipment = await db.equipment.find_one({"id": equipment_id}, {"_id": 0})
    if equipment:
        await db.support_history.delete_many({"numero_serie": equipment['numero_serie']})
    
    return {"message": "Equipo eliminado correctamente"}

# Support History endpoints
@api_router.get("/support", response_model=List[SupportHistory])
async def get_support_history(numero_serie: Optional[str] = None):
    query = {"numero_serie": numero_serie} if numero_serie else {}
    support_list = await db.support_history.find(query, {"_id": 0}).to_list(1000)
    return support_list

@api_router.post("/support", response_model=SupportHistory)
async def create_support_history(input: SupportHistoryCreate):
    # Verify equipment exists
    equipment = await db.equipment.find_one({"numero_serie": input.numero_serie}, {"_id": 0})
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipo no encontrado con ese número de serie")
    
    # Generate ID
    import uuid
    support_dict = input.model_dump()
    support_dict['id'] = str(uuid.uuid4())
    
    await db.support_history.insert_one(support_dict)
    return SupportHistory(**support_dict)

# Export to Excel
@api_router.get("/export")
async def export_to_excel():
    # Get all equipment and support history
    equipment_list = await db.equipment.find({}, {"_id": 0}).to_list(1000)
    support_list = await db.support_history.find({}, {"_id": 0}).to_list(1000)
    
    # Create Excel file in memory
    output = BytesIO()
    workbook = xlsxwriter.Workbook(output, {'in_memory': True})
    
    # Equipment sheet
    worksheet_equipment = workbook.add_worksheet('Equipos')
    
    # Headers
    headers_equipment = ['ID', 'Nombre del Equipo', 'Número de Serie', 'Fecha de Entrega', 'Jefatura', 'Usuario Final', 'Estado']
    header_format = workbook.add_format({'bold': True, 'bg_color': '#2563EB', 'font_color': 'white'})
    
    for col, header in enumerate(headers_equipment):
        worksheet_equipment.write(0, col, header, header_format)
    
    # Data
    for row, equipment in enumerate(equipment_list, start=1):
        worksheet_equipment.write(row, 0, equipment.get('id', ''))
        worksheet_equipment.write(row, 1, equipment.get('nombre', ''))
        worksheet_equipment.write(row, 2, equipment.get('numero_serie', ''))
        worksheet_equipment.write(row, 3, equipment.get('fecha_entrega', ''))
        worksheet_equipment.write(row, 4, equipment.get('jefatura', ''))
        worksheet_equipment.write(row, 5, equipment.get('usuario_final', ''))
        worksheet_equipment.write(row, 6, equipment.get('estado', ''))
    
    # Support History sheet
    worksheet_support = workbook.add_worksheet('Historial de Soporte')
    
    headers_support = ['ID', 'Número de Serie', 'Fecha de Envío', 'Falla Reportada', 'Estado de Garantía', 'Resultado']
    
    for col, header in enumerate(headers_support):
        worksheet_support.write(0, col, header, header_format)
    
    for row, support in enumerate(support_list, start=1):
        worksheet_support.write(row, 0, support.get('id', ''))
        worksheet_support.write(row, 1, support.get('numero_serie', ''))
        worksheet_support.write(row, 2, support.get('fecha_envio', ''))
        worksheet_support.write(row, 3, support.get('falla_reportada', ''))
        worksheet_support.write(row, 4, support.get('estado_garantia', ''))
        worksheet_support.write(row, 5, support.get('resultado', ''))
    
    workbook.close()
    output.seek(0)
    
    return StreamingResponse(
        output,
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers={'Content-Disposition': 'attachment; filename=inventario_equipos_altonorte.xlsx'}
    )

# Seed data endpoint (only for initialization)
@api_router.post("/seed")
async def seed_data():
    # Check if already seeded
    count = await db.equipment.count_documents({})
    if count > 0:
        return {"message": "Datos ya inicializados"}
    
    import uuid
    
    # Sample equipment data with unique UUIDs
    sample_equipment = [
        {
            "id": str(uuid.uuid4()),
            "nombre": "Notebook Dell Latitude 5420",
            "numero_serie": "ABC123",
            "fecha_entrega": "15/01/2026",
            "jefatura": "Juan Pérez",
            "usuario_final": "María Gómez",
            "estado": "Activo"
        },
        {
            "id": str(uuid.uuid4()),
            "nombre": "PC HP EliteDesk 800",
            "numero_serie": "DEF456",
            "fecha_entrega": "01/02/2026",
            "jefatura": "Carlos López",
            "usuario_final": "Pedro Ruiz",
            "estado": "Activo"
        },
        {
            "id": str(uuid.uuid4()),
            "nombre": "Monitor Samsung 27 Curvo",
            "numero_serie": "GHI789",
            "fecha_entrega": "10/01/2026",
            "jefatura": "Ana Martínez",
            "usuario_final": "Luis Torres",
            "estado": "En reparación"
        },
        {
            "id": str(uuid.uuid4()),
            "nombre": "Servidor Dell PowerEdge R740",
            "numero_serie": "JKL012",
            "fecha_entrega": "05/12/2025",
            "jefatura": "Roberto Silva",
            "usuario_final": "Equipo IT",
            "estado": "Activo"
        },
        {
            "id": str(uuid.uuid4()),
            "nombre": "Impresora HP LaserJet Pro",
            "numero_serie": "MNO345",
            "fecha_entrega": "20/01/2026",
            "jefatura": "Patricia Fernández",
            "usuario_final": "Administración",
            "estado": "Dado de baja"
        }
    ]
    
    # Sample support history
    sample_support = [
        {
            "id": str(uuid.uuid4()),
            "numero_serie": "GHI789",
            "fecha_envio": "25/01/2026",
            "falla_reportada": "No enciende pantalla",
            "estado_garantia": "En garantía",
            "resultado": "En proceso"
        },
        {
            "id": str(uuid.uuid4()),
            "numero_serie": "MNO345",
            "fecha_envio": "15/01/2026",
            "falla_reportada": "Atasco de papel constante",
            "estado_garantia": "Fuera de garantía",
            "resultado": "No reparable"
        }
    ]
    
    await db.equipment.insert_many(sample_equipment)
    await db.support_history.insert_many(sample_support)
    
    return {"message": "Datos de ejemplo cargados correctamente"}

# Clean database endpoint (development only)
@api_router.delete("/reset")
async def reset_database():
    await db.equipment.delete_many({})
    await db.support_history.delete_many({})
    return {"message": "Base de datos limpiada correctamente"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()