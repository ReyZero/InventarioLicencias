"""
Backend con MySQL/PostgreSQL para Sistema de Inventario Altonorte

Instalación:
pip install fastapi uvicorn sqlalchemy pymysql python-dotenv xlsxwriter

Para PostgreSQL en lugar de MySQL:
pip install psycopg2-binary

Variables de entorno (.env):
DATABASE_URL=mysql://usuario:password@localhost:3306/inventario_altonorte
# O para PostgreSQL:
# DATABASE_URL=postgresql://usuario:password@localhost:5432/inventario_altonorte
"""

from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import List, Optional
import os
import logging
from pathlib import Path
from io import BytesIO
import xlsxwriter
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Database setup
DATABASE_URL = os.getenv('DATABASE_URL', 'mysql://root:password@localhost:3306/inventario_altonorte')
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# SQLAlchemy Models
class EquipmentDB(Base):
    __tablename__ = 'equipment'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nombre = Column(String(255), nullable=False)
    numero_serie = Column(String(100), unique=True, nullable=False)
    fecha_entrega = Column(String(10), nullable=False)
    jefatura = Column(String(255), nullable=False)
    usuario_final = Column(String(255), nullable=False)
    estado = Column(String(50), nullable=False)

class SupportHistoryDB(Base):
    __tablename__ = 'support_history'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    numero_serie = Column(String(100), ForeignKey('equipment.numero_serie', ondelete='CASCADE'), nullable=False)
    fecha_envio = Column(String(10), nullable=False)
    falla_reportada = Column(Text, nullable=False)
    estado_garantia = Column(String(50), nullable=False)
    resultado = Column(String(50), nullable=False)

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic Models
class Equipment(BaseModel):
    id: str
    nombre: str
    numero_serie: str
    fecha_entrega: str
    jefatura: str
    usuario_final: str
    estado: str
    
    class Config:
        from_attributes = True

class EquipmentCreate(BaseModel):
    nombre: str
    numero_serie: str
    fecha_entrega: str
    jefatura: str
    usuario_final: str
    estado: str

class SupportHistory(BaseModel):
    id: str
    numero_serie: str
    fecha_envio: str
    falla_reportada: str
    estado_garantia: str
    resultado: str
    
    class Config:
        from_attributes = True

class SupportHistoryCreate(BaseModel):
    numero_serie: str
    fecha_envio: str
    falla_reportada: str
    estado_garantia: str
    resultado: str

# FastAPI app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Equipment endpoints
@api_router.get("/equipment", response_model=List[Equipment])
async def get_equipment():
    db = SessionLocal()
    try:
        equipment_list = db.query(EquipmentDB).all()
        return equipment_list
    finally:
        db.close()

@api_router.post("/equipment", response_model=Equipment)
async def create_equipment(input: EquipmentCreate):
    db = SessionLocal()
    try:
        # Check if serial number already exists
        existing = db.query(EquipmentDB).filter(EquipmentDB.numero_serie == input.numero_serie).first()
        if existing:
            raise HTTPException(status_code=400, detail="El número de serie ya existe")
        
        equipment = EquipmentDB(
            id=str(uuid.uuid4()),
            **input.model_dump()
        )
        db.add(equipment)
        db.commit()
        db.refresh(equipment)
        return equipment
    finally:
        db.close()

@api_router.put("/equipment/{equipment_id}", response_model=Equipment)
async def update_equipment(equipment_id: str, input: EquipmentCreate):
    db = SessionLocal()
    try:
        equipment = db.query(EquipmentDB).filter(EquipmentDB.id == equipment_id).first()
        if not equipment:
            raise HTTPException(status_code=404, detail="Equipo no encontrado")
        
        for key, value in input.model_dump().items():
            setattr(equipment, key, value)
        
        db.commit()
        db.refresh(equipment)
        return equipment
    finally:
        db.close()

@api_router.delete("/equipment/{equipment_id}")
async def delete_equipment(equipment_id: str):
    db = SessionLocal()
    try:
        equipment = db.query(EquipmentDB).filter(EquipmentDB.id == equipment_id).first()
        if not equipment:
            raise HTTPException(status_code=404, detail="Equipo no encontrado")
        
        db.delete(equipment)
        db.commit()
        return {"message": "Equipo eliminado correctamente"}
    finally:
        db.close()

# Support History endpoints
@api_router.get("/support", response_model=List[SupportHistory])
async def get_support_history(numero_serie: Optional[str] = None):
    db = SessionLocal()
    try:
        query = db.query(SupportHistoryDB)
        if numero_serie:
            query = query.filter(SupportHistoryDB.numero_serie == numero_serie)
        support_list = query.all()
        return support_list
    finally:
        db.close()

@api_router.post("/support", response_model=SupportHistory)
async def create_support_history(input: SupportHistoryCreate):
    db = SessionLocal()
    try:
        # Verify equipment exists
        equipment = db.query(EquipmentDB).filter(EquipmentDB.numero_serie == input.numero_serie).first()
        if not equipment:
            raise HTTPException(status_code=404, detail="Equipo no encontrado con ese número de serie")
        
        support = SupportHistoryDB(
            id=str(uuid.uuid4()),
            **input.model_dump()
        )
        db.add(support)
        db.commit()
        db.refresh(support)
        return support
    finally:
        db.close()

# Export to Excel
@api_router.get("/export")
async def export_to_excel():
    db = SessionLocal()
    try:
        equipment_list = db.query(EquipmentDB).all()
        support_list = db.query(SupportHistoryDB).all()
        
        # Create Excel file in memory
        output = BytesIO()
        workbook = xlsxwriter.Workbook(output, {'in_memory': True})
        
        # Equipment sheet
        worksheet_equipment = workbook.add_worksheet('Equipos')
        headers_equipment = ['ID', 'Nombre del Equipo', 'Número de Serie', 'Fecha de Entrega', 'Jefatura', 'Usuario Final', 'Estado']
        header_format = workbook.add_format({'bold': True, 'bg_color': '#2563EB', 'font_color': 'white'})
        
        for col, header in enumerate(headers_equipment):
            worksheet_equipment.write(0, col, header, header_format)
        
        for row, equipment in enumerate(equipment_list, start=1):
            worksheet_equipment.write(row, 0, equipment.id)
            worksheet_equipment.write(row, 1, equipment.nombre)
            worksheet_equipment.write(row, 2, equipment.numero_serie)
            worksheet_equipment.write(row, 3, equipment.fecha_entrega)
            worksheet_equipment.write(row, 4, equipment.jefatura)
            worksheet_equipment.write(row, 5, equipment.usuario_final)
            worksheet_equipment.write(row, 6, equipment.estado)
        
        # Support History sheet
        worksheet_support = workbook.add_worksheet('Historial de Soporte')
        headers_support = ['ID', 'Número de Serie', 'Fecha de Envío', 'Falla Reportada', 'Estado de Garantía', 'Resultado']
        
        for col, header in enumerate(headers_support):
            worksheet_support.write(0, col, header, header_format)
        
        for row, support in enumerate(support_list, start=1):
            worksheet_support.write(row, 0, support.id)
            worksheet_support.write(row, 1, support.numero_serie)
            worksheet_support.write(row, 2, support.fecha_envio)
            worksheet_support.write(row, 3, support.falla_reportada)
            worksheet_support.write(row, 4, support.estado_garantia)
            worksheet_support.write(row, 5, support.resultado)
        
        workbook.close()
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            headers={'Content-Disposition': 'attachment; filename=inventario_equipos_altonorte.xlsx'}
        )
    finally:
        db.close()

# Seed data endpoint
@api_router.post("/seed")
async def seed_data():
    db = SessionLocal()
    try:
        count = db.query(EquipmentDB).count()
        if count > 0:
            return {"message": "Datos ya inicializados"}
        
        sample_equipment = [
            EquipmentDB(id=str(uuid.uuid4()), nombre="Notebook Dell Latitude 5420", numero_serie="ABC123", fecha_entrega="15/01/2026", jefatura="Juan Pérez", usuario_final="María Gómez", estado="Activo"),
            EquipmentDB(id=str(uuid.uuid4()), nombre="PC HP EliteDesk 800", numero_serie="DEF456", fecha_entrega="01/02/2026", jefatura="Carlos López", usuario_final="Pedro Ruiz", estado="Activo"),
            EquipmentDB(id=str(uuid.uuid4()), nombre="Monitor Samsung 27 Curvo", numero_serie="GHI789", fecha_entrega="10/01/2026", jefatura="Ana Martínez", usuario_final="Luis Torres", estado="En reparación"),
            EquipmentDB(id=str(uuid.uuid4()), nombre="Servidor Dell PowerEdge R740", numero_serie="JKL012", fecha_entrega="05/12/2025", jefatura="Roberto Silva", usuario_final="Equipo IT", estado="Activo"),
            EquipmentDB(id=str(uuid.uuid4()), nombre="Impresora HP LaserJet Pro", numero_serie="MNO345", fecha_entrega="20/01/2026", jefatura="Patricia Fernández", usuario_final="Administración", estado="Dado de baja")
        ]
        
        sample_support = [
            SupportHistoryDB(id=str(uuid.uuid4()), numero_serie="GHI789", fecha_envio="25/01/2026", falla_reportada="No enciende pantalla", estado_garantia="En garantía", resultado="En proceso"),
            SupportHistoryDB(id=str(uuid.uuid4()), numero_serie="MNO345", fecha_envio="15/01/2026", falla_reportada="Atasco de papel constante", estado_garantia="Fuera de garantía", resultado="No reparable")
        ]
        
        db.add_all(sample_equipment)
        db.add_all(sample_support)
        db.commit()
        
        return {"message": "Datos de ejemplo cargados correctamente"}
    finally:
        db.close()

# Clean database endpoint
@api_router.delete("/reset")
async def reset_database():
    db = SessionLocal()
    try:
        db.query(SupportHistoryDB).delete()
        db.query(EquipmentDB).delete()
        db.commit()
        return {"message": "Base de datos limpiada correctamente"}
    finally:
        db.close()

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
