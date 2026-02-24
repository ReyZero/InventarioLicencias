-- Schema para MySQL
-- Crear base de datos
CREATE DATABASE IF NOT EXISTS inventario_altonorte 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE inventario_altonorte;

-- Tabla de equipos
CREATE TABLE IF NOT EXISTS equipment (
    id VARCHAR(36) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    numero_serie VARCHAR(100) UNIQUE NOT NULL,
    fecha_entrega VARCHAR(10) NOT NULL,
    jefatura VARCHAR(255) NOT NULL,
    usuario_final VARCHAR(255) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_numero_serie (numero_serie),
    INDEX idx_estado (estado),
    INDEX idx_jefatura (jefatura)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de historial de soporte
CREATE TABLE IF NOT EXISTS support_history (
    id VARCHAR(36) PRIMARY KEY,
    numero_serie VARCHAR(100) NOT NULL,
    fecha_envio VARCHAR(10) NOT NULL,
    falla_reportada TEXT NOT NULL,
    estado_garantia VARCHAR(50) NOT NULL,
    resultado VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (numero_serie) REFERENCES equipment(numero_serie) ON DELETE CASCADE,
    INDEX idx_numero_serie (numero_serie),
    INDEX idx_fecha_envio (fecha_envio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos de ejemplo
INSERT INTO equipment (id, nombre, numero_serie, fecha_entrega, jefatura, usuario_final, estado) VALUES
(UUID(), 'Notebook Dell Latitude 5420', 'ABC123', '15/01/2026', 'Juan Pérez', 'María Gómez', 'Activo'),
(UUID(), 'PC HP EliteDesk 800', 'DEF456', '01/02/2026', 'Carlos López', 'Pedro Ruiz', 'Activo'),
(UUID(), 'Monitor Samsung 27 Curvo', 'GHI789', '10/01/2026', 'Ana Martínez', 'Luis Torres', 'En reparación'),
(UUID(), 'Servidor Dell PowerEdge R740', 'JKL012', '05/12/2025', 'Roberto Silva', 'Equipo IT', 'Activo'),
(UUID(), 'Impresora HP LaserJet Pro', 'MNO345', '20/01/2026', 'Patricia Fernández', 'Administración', 'Dado de baja');

INSERT INTO support_history (id, numero_serie, fecha_envio, falla_reportada, estado_garantia, resultado) VALUES
(UUID(), 'GHI789', '25/01/2026', 'No enciende pantalla', 'En garantía', 'En proceso'),
(UUID(), 'MNO345', '15/01/2026', 'Atasco de papel constante', 'Fuera de garantía', 'No reparable');

-- Verificar datos
SELECT COUNT(*) as total_equipos FROM equipment;
SELECT COUNT(*) as total_soporte FROM support_history;
