CREATE TABLE usuarios (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefono TEXT,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE propiedades (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    tipo_operacion TEXT NOT NULL,
    tipo_propiedad TEXT NOT NULL,
    titulo TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    descripcion TEXT NOT NULL,
    precio_pesos INTEGER,
    precio_uf REAL,
    region TEXT NOT NULL,
    comuna TEXT NOT NULL,
    habitaciones INTEGER DEFAULT 0,
    banos INTEGER DEFAULT 0,
    superficie_total INTEGER,
    prioridad_score INTEGER DEFAULT 0,
    fecha_expiracion_impulso DATETIME,
    fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE fotos (
    id TEXT PRIMARY KEY,
    propiedad_id TEXT NOT NULL,
    url_r2 TEXT NOT NULL,
    es_principal INTEGER DEFAULT 0,
    FOREIGN KEY(propiedad_id) REFERENCES propiedades(id) ON DELETE CASCADE
);
