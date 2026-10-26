-- =====================================================================
-- Transportes y Logística Sur S.A. - Base de datos (MySQL 8, 3FN)
-- Estructura según el Diccionario de Datos del Trabajo Final - Grupo 2
-- =====================================================================

CREATE DATABASE IF NOT EXISTS logistica CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE logistica;

-- ---------------------------------------------------------------------
-- 1 - Tablas Catálogo / Dominio
-- ---------------------------------------------------------------------

CREATE TABLE Provincias (
    IdProvincia      INT           NOT NULL AUTO_INCREMENT,
    NombreProvincia  VARCHAR(100)  NOT NULL,
    PRIMARY KEY (IdProvincia),
    UNIQUE KEY UQ_Provincias_Nombre (NombreProvincia)
);

CREATE TABLE Localidades (
    IdLocalidad      INT           NOT NULL AUTO_INCREMENT,
    IdProvincia      INT           NOT NULL,
    NombreLocalidad  VARCHAR(100)  NOT NULL,
    CodigoPostal     VARCHAR(10)   NOT NULL,
    PRIMARY KEY (IdLocalidad),
    UNIQUE KEY UQ_Localidades (IdProvincia, NombreLocalidad, CodigoPostal),
    CONSTRAINT FK_Localidades_Provincias FOREIGN KEY (IdProvincia) REFERENCES Provincias (IdProvincia)
);

CREATE TABLE Roles (
    IdRol        INT           NOT NULL AUTO_INCREMENT,
    NombreRol    VARCHAR(50)   NOT NULL,
    Descripcion  VARCHAR(255)  NULL,
    PRIMARY KEY (IdRol),
    UNIQUE KEY UQ_Roles_Nombre (NombreRol)
);

CREATE TABLE MarcasVehiculo (
    IdMarca      INT          NOT NULL AUTO_INCREMENT,
    NombreMarca  VARCHAR(50)  NOT NULL,
    PRIMARY KEY (IdMarca),
    UNIQUE KEY UQ_MarcasVehiculo_Nombre (NombreMarca)
);

CREATE TABLE ModelosVehiculo (
    IdModelo      INT          NOT NULL AUTO_INCREMENT,
    IdMarca       INT          NOT NULL,
    NombreModelo  VARCHAR(50)  NOT NULL,
    PRIMARY KEY (IdModelo),
    UNIQUE KEY UQ_ModelosVehiculo (IdMarca, NombreModelo),
    CONSTRAINT FK_ModelosVehiculo_Marcas FOREIGN KEY (IdMarca) REFERENCES MarcasVehiculo (IdMarca)
);

-- Los Id son fijos: el backend los referencia (Logistica.Abstracciones/Comun/Constantes.cs)
CREATE TABLE EstadosPaquete (
    IdEstadoPaquete  INT          NOT NULL,
    NombreEstado     VARCHAR(30)  NOT NULL,
    PRIMARY KEY (IdEstadoPaquete),
    UNIQUE KEY UQ_EstadosPaquete_Nombre (NombreEstado)
);

CREATE TABLE EstadosViaje (
    IdEstadoViaje      INT          NOT NULL,
    NombreEstadoViaje  VARCHAR(30)  NOT NULL,
    PRIMARY KEY (IdEstadoViaje),
    UNIQUE KEY UQ_EstadosViaje_Nombre (NombreEstadoViaje)
);

-- ---------------------------------------------------------------------
-- 2 - Tablas Principales y Transaccionales
-- ---------------------------------------------------------------------

CREATE TABLE Clientes (
    IdCliente          INT           NOT NULL AUTO_INCREMENT,
    RazonSocialNombre  VARCHAR(100)  NOT NULL,
    Apellido           VARCHAR(100)  NULL,
    TipoDocumento      VARCHAR(10)   NOT NULL,
    NumeroDocumento    VARCHAR(20)   NOT NULL,
    Telefono           VARCHAR(30)   NULL,
    Calle              VARCHAR(100)  NOT NULL,
    Altura             INT           NOT NULL,
    PisoDepto          VARCHAR(20)   NULL,
    IdLocalidad        INT           NOT NULL,
    Email              VARCHAR(100)  NULL,
    PRIMARY KEY (IdCliente),
    UNIQUE KEY UQ_Clientes_Documento (TipoDocumento, NumeroDocumento),
    CONSTRAINT FK_Clientes_Localidades FOREIGN KEY (IdLocalidad) REFERENCES Localidades (IdLocalidad),
    CONSTRAINT CK_Clientes_Altura CHECK (Altura > 0)
);

CREATE TABLE Vehiculos (
    IdVehiculo   INT            NOT NULL AUTO_INCREMENT,
    Patente      VARCHAR(10)    NOT NULL,
    IdModelo     INT            NOT NULL,
    CapacidadKg  DECIMAL(10,2)  NOT NULL,
    Activo       CHAR(1)        NOT NULL DEFAULT 'S',
    PRIMARY KEY (IdVehiculo),
    UNIQUE KEY UQ_Vehiculos_Patente (Patente),
    CONSTRAINT FK_Vehiculos_Modelos FOREIGN KEY (IdModelo) REFERENCES ModelosVehiculo (IdModelo),
    CONSTRAINT CK_Vehiculos_Capacidad CHECK (CapacidadKg > 0),
    CONSTRAINT CK_Vehiculos_Activo CHECK (Activo IN ('S','N'))
);

-- PasswordHash: formato de ASP.NET Core Identity PasswordHasher (PBKDF2)
CREATE TABLE Usuario (
    IdUsuario      INT           NOT NULL AUTO_INCREMENT,
    NombreUsuario  VARCHAR(50)   NOT NULL,
    PasswordHash   VARCHAR(255)  NOT NULL,
    IdRol          INT           NOT NULL,
    Activo         CHAR(1)       NOT NULL DEFAULT 'S',
    PRIMARY KEY (IdUsuario),
    UNIQUE KEY UQ_Usuario_Nombre (NombreUsuario),
    CONSTRAINT FK_Usuario_Roles FOREIGN KEY (IdRol) REFERENCES Roles (IdRol),
    CONSTRAINT CK_Usuario_Activo CHECK (Activo IN ('S','N'))
);

CREATE TABLE Chofer (
    IdChofer                  INT          NOT NULL AUTO_INCREMENT,
    IdUsuario                 INT          NOT NULL,
    Nombre                    VARCHAR(50)  NOT NULL,
    Apellido                  VARCHAR(50)  NOT NULL,
    Dni                       VARCHAR(15)  NOT NULL,
    LicenciaConducir          CHAR(1)      NOT NULL DEFAULT 'N',
    FechaVencimientoLicencia  DATE         NULL,
    Telefono                  VARCHAR(30)  NULL,
    Activo                    CHAR(1)      NOT NULL DEFAULT 'S',
    PRIMARY KEY (IdChofer),
    UNIQUE KEY UQ_Chofer_Usuario (IdUsuario),
    UNIQUE KEY UQ_Chofer_Dni (Dni),
    CONSTRAINT FK_Chofer_Usuario FOREIGN KEY (IdUsuario) REFERENCES Usuario (IdUsuario),
    CONSTRAINT CK_Chofer_Licencia CHECK (LicenciaConducir IN ('S','N')),
    CONSTRAINT CK_Chofer_Activo CHECK (Activo IN ('S','N'))
);

CREATE TABLE Paquete (
    IdPaquete           INT            NOT NULL AUTO_INCREMENT,
    CodigoSeguimiento   VARCHAR(20)    NOT NULL,
    IdClienteRem        INT            NOT NULL,
    IdClienteDest       INT            NOT NULL,
    IdUsuarioRecepcion  INT            NOT NULL,
    Descripcion         VARCHAR(255)   NULL,
    PesoKg              DECIMAL(10,2)  NOT NULL,
    AltoCm              DECIMAL(8,2)   NOT NULL,
    AnchoCm             DECIMAL(8,2)   NOT NULL,
    LargoCm             DECIMAL(8,2)   NOT NULL,
    IdEstadoActual      INT            NOT NULL,
    FechaIngreso        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (IdPaquete),
    UNIQUE KEY UQ_Paquete_Codigo (CodigoSeguimiento),
    KEY IX_Paquete_Estado (IdEstadoActual),
    CONSTRAINT FK_Paquete_ClienteRem FOREIGN KEY (IdClienteRem) REFERENCES Clientes (IdCliente),
    CONSTRAINT FK_Paquete_ClienteDest FOREIGN KEY (IdClienteDest) REFERENCES Clientes (IdCliente),
    CONSTRAINT FK_Paquete_UsuarioRecepcion FOREIGN KEY (IdUsuarioRecepcion) REFERENCES Usuario (IdUsuario),
    CONSTRAINT FK_Paquete_Estado FOREIGN KEY (IdEstadoActual) REFERENCES EstadosPaquete (IdEstadoPaquete),
    CONSTRAINT CK_Paquete_Peso CHECK (PesoKg > 0),
    CONSTRAINT CK_Paquete_Dimensiones CHECK (AltoCm > 0 AND AnchoCm > 0 AND LargoCm > 0)
);

CREATE TABLE HistorialPaquete (
    IdHistorial      INT           NOT NULL AUTO_INCREMENT,
    IdPaquete        INT           NOT NULL,
    IdEstadoPaquete  INT           NOT NULL,
    IdUsuario        INT           NOT NULL,
    FechaHora        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Observacion      VARCHAR(255)  NULL,
    PRIMARY KEY (IdHistorial),
    KEY IX_HistorialPaquete_Paquete (IdPaquete, FechaHora),
    CONSTRAINT FK_HistorialPaquete_Paquete FOREIGN KEY (IdPaquete) REFERENCES Paquete (IdPaquete),
    CONSTRAINT FK_HistorialPaquete_Estado FOREIGN KEY (IdEstadoPaquete) REFERENCES EstadosPaquete (IdEstadoPaquete),
    CONSTRAINT FK_HistorialPaquete_Usuario FOREIGN KEY (IdUsuario) REFERENCES Usuario (IdUsuario)
);

CREATE TABLE Viaje (
    IdViaje               INT       NOT NULL AUTO_INCREMENT,
    IdVehiculo            INT       NOT NULL,
    IdChofer              INT       NOT NULL,
    IdUsuarioDespachante  INT       NOT NULL,
    FechaSalida           DATETIME  NOT NULL,
    FechaLlegadaEstimada  DATETIME  NULL,
    IdEstadoViaje         INT       NOT NULL,
    PRIMARY KEY (IdViaje),
    KEY IX_Viaje_Estado (IdEstadoViaje),
    CONSTRAINT FK_Viaje_Vehiculo FOREIGN KEY (IdVehiculo) REFERENCES Vehiculos (IdVehiculo),
    CONSTRAINT FK_Viaje_Chofer FOREIGN KEY (IdChofer) REFERENCES Chofer (IdChofer),
    CONSTRAINT FK_Viaje_Despachante FOREIGN KEY (IdUsuarioDespachante) REFERENCES Usuario (IdUsuario),
    CONSTRAINT FK_Viaje_Estado FOREIGN KEY (IdEstadoViaje) REFERENCES EstadosViaje (IdEstadoViaje)
);

-- Clave primaria compuesta (IdViaje + IdPaquete): 2FN en la relación N:M
CREATE TABLE DetalleViaje (
    IdViaje       INT  NOT NULL,
    IdPaquete     INT  NOT NULL,
    OrdenEntrega  INT  NOT NULL,
    PRIMARY KEY (IdViaje, IdPaquete),
    UNIQUE KEY UQ_DetalleViaje_Orden (IdViaje, OrdenEntrega),
    CONSTRAINT FK_DetalleViaje_Viaje FOREIGN KEY (IdViaje) REFERENCES Viaje (IdViaje),
    CONSTRAINT FK_DetalleViaje_Paquete FOREIGN KEY (IdPaquete) REFERENCES Paquete (IdPaquete),
    CONSTRAINT CK_DetalleViaje_Orden CHECK (OrdenEntrega > 0)
);


-- =====================================================================
-- Datos semilla
-- =====================================================================

INSERT INTO EstadosPaquete (IdEstadoPaquete, NombreEstado) VALUES
(1, 'En depósito'),
(2, 'En tránsito'),
(3, 'Entregado'),
(4, 'Cancelado');

INSERT INTO EstadosViaje (IdEstadoViaje, NombreEstadoViaje) VALUES
(1, 'Programado'),
(2, 'En curso'),
(3, 'Finalizado'),
(4, 'Cancelado');

-- Los nombres deben coincidir con RolesSistema (Logistica.Abstracciones/Comun/Constantes.cs)
INSERT INTO Roles (NombreRol, Descripcion) VALUES
('Recepcionista', 'Registra clientes y da de alta las encomiendas en el depósito'),
('Despachante',   'Arma los viajes (hojas de ruta) asignando paquetes, vehículo y chofer'),
('Chofer',        'Consulta su hoja de ruta y registra el estado final de cada entrega'),
('Gerente',       'Administra usuarios, flota y choferes. Acceso de supervisión a todo el sistema');

INSERT INTO Provincias (NombreProvincia) VALUES
('Buenos Aires'),
('Río Negro'),
('Neuquén'),
('Chubut');

INSERT INTO Localidades (IdProvincia, NombreLocalidad, CodigoPostal) VALUES
(1, 'Bahía Blanca',          '8000'),
(1, 'Carmen de Patagones',   '8504'),
(2, 'Viedma',                '8500'),
(2, 'General Roca',          '8332'),
(2, 'San Carlos de Bariloche','8400'),
(3, 'Neuquén',               '8300'),
(3, 'Cutral Có',             '8322'),
(4, 'Trelew',                '9100'),
(4, 'Puerto Madryn',         '9120');

INSERT INTO MarcasVehiculo (NombreMarca) VALUES
('Renault'),
('Mercedes-Benz'),
('Iveco'),
('Ford');

INSERT INTO ModelosVehiculo (IdMarca, NombreModelo) VALUES
(1, 'Kangoo Furgón'),
(1, 'Master'),
(2, 'Sprinter 415'),
(2, 'Atego 1726'),
(3, 'Daily 35S14'),
(4, 'Transit');

INSERT INTO Vehiculos (Patente, IdModelo, CapacidadKg, Activo) VALUES
('AE123BC', 1,  650.00, 'S'),
('AF456CD', 3, 1500.00, 'S'),
('AD789EF', 4, 8000.00, 'S'),
('AC012GH', 5, 3500.00, 'S'),
('AB345IJ', 2, 1200.00, 'N');

-- Contraseña de todos los usuarios de prueba: Dev123!
INSERT INTO Usuario (NombreUsuario, PasswordHash, IdRol, Activo) VALUES
('gerente',   'AQAAAAIAAYagAAAAEGjVShlwMKsRSlndDmRlb9vxmbw5IzBYfC7hwQecpQnqQndK+bgw649iqrZCGzOKxg==', 4, 'S'),
('recepcion', 'AQAAAAIAAYagAAAAEJIbPG+CFIwkd1fJAQHbZoKdySGujShY2xPPXzKGkSclPITjT+YtuD8AXUQ7i79t+A==', 1, 'S'),
('despacho',  'AQAAAAIAAYagAAAAEARpyQHrMmk4EV862wQfaPRStgZJQhLgOAKBc55jM+hl5CQ6C1IGn7E5t4z6lzTU2Q==', 2, 'S'),
('chofer1',   'AQAAAAIAAYagAAAAEML76ZoI0XOrFpeDzEs4QIcNkMl19NJEJ56ccdqRtzMuO/s86bdY8JgzOk6lT2CS4A==', 3, 'S'),
('chofer2',   'AQAAAAIAAYagAAAAELk4aK2kvHBZ0Ttjy8D45+NkosaaA92HhnayTNz1KnmFAeZZJlv9sbaYB3hMjBVUmw==', 3, 'S'),
('chofer3',   'AQAAAAIAAYagAAAAEAMijyJEM0LIW2F2OM41pPuctNUTfOMz+LkA0GqLXFZmCkN4iSlSz+bYsEtjDmB/LQ==', 3, 'S');

-- chofer3 tiene la licencia vencida: no aparece como habilitado para armar viajes
INSERT INTO Chofer (IdUsuario, Nombre, Apellido, Dni, LicenciaConducir, FechaVencimientoLicencia, Telefono, Activo) VALUES
(4, 'Juan',   'Pérez', '28456789', 'S', '2028-05-31', '291-4123456', 'S'),
(5, 'María',  'Gómez', '31987654', 'S', '2027-11-30', '299-4567890', 'S'),
(6, 'Carlos', 'López', '25123456', 'S', '2025-03-31', '280-4445566', 'S');

INSERT INTO Clientes (RazonSocialNombre, Apellido, TipoDocumento, NumeroDocumento, Telefono, Calle, Altura, PisoDepto, IdLocalidad, Email) VALUES
('Distribuidora Austral S.R.L.', NULL,        'CUIT', '30712345678', '291-4550000', 'Av. Colón',          1250, NULL,  1, 'ventas@australsrl.com.ar'),
('Ana',                          'Fernández', 'DNI',  '33444555',    '2920-421111', 'Belgrano',            345, '2B',  3, 'ana.fernandez@mail.com'),
('Ferretería El Tornillo',       NULL,        'CUIT', '30698765432', '298-4432211', 'Tucumán',             780, NULL,  4, 'compras@eltornillo.com.ar'),
('Lucas',                        'Martínez',  'DNI',  '40111222',    '299-5123456', 'Av. Argentina',      1500, '5A',  6, 'lucas.martinez@mail.com'),
('Sofía',                        'Ríos',      'DNI',  '37888999',    '280-4789012', 'Rivadavia',           620, NULL,  8, NULL),
('Supermercado La Costa S.A.',   NULL,        'CUIT', '30555666777', '280-4471000', 'Av. Julio A. Roca',  2100, NULL,  9, 'logistica@lacosta.com.ar');

-- Paquetes "En depósito" listos para despachar (peso total 833,5 kg: supera los 650 kg de la Kangoo AE123BC)
INSERT INTO Paquete (CodigoSeguimiento, IdClienteRem, IdClienteDest, IdUsuarioRecepcion, Descripcion, PesoKg, AltoCm, AnchoCm, LargoCm, IdEstadoActual, FechaIngreso) VALUES
('TLS-261020-K7M2QA', 1, 2, 2, 'Electrodomésticos (2 cajas)',  120.00,  80.00,  60.00,  60.00, 1, '2026-10-20 09:15:00'),
('TLS-261020-P3XW8N', 1, 4, 2, 'Pallet de bebidas',            350.00, 120.00, 100.00, 120.00, 1, '2026-10-20 10:40:00'),
('TLS-261021-H9RT4E', 3, 5, 2, 'Herramientas',                  45.50,  40.00,  30.00,  50.00, 1, '2026-10-21 11:05:00'),
('TLS-261021-Z5CJ6U', 1, 6, 2, 'Mercadería surtida',           300.00, 100.00, 100.00, 100.00, 1, '2026-10-21 15:30:00'),
('TLS-261022-B2LV7Y', 2, 3, 2, 'Documentación y muestras',      18.00,  30.00,  25.00,  40.00, 1, '2026-10-22 08:50:00');

INSERT INTO HistorialPaquete (IdPaquete, IdEstadoPaquete, IdUsuario, FechaHora, Observacion) VALUES
(1, 1, 2, '2026-10-20 09:15:00', 'Ingreso al depósito de origen'),
(2, 1, 2, '2026-10-20 10:40:00', 'Ingreso al depósito de origen'),
(3, 1, 2, '2026-10-21 11:05:00', 'Ingreso al depósito de origen'),
(4, 1, 2, '2026-10-21 15:30:00', 'Ingreso al depósito de origen'),
(5, 1, 2, '2026-10-22 08:50:00', 'Ingreso al depósito de origen');
