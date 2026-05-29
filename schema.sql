CREATE TABLE usuarios (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefono TEXT,
    plan_tipo TEXT DEFAULT 'gratis', -- 'gratis', 'plan_10k', 'plan_20k', 'plan_50k', 'admin'
    plan_expiracion DATETIME,
    plan_suscripcion_id TEXT,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE propiedades (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    tipo_operacion TEXT NOT NULL, -- 'venta', 'compra', 'arriendo'
    tipo_propiedad TEXT NOT NULL, -- 'terreno', 'casa', 'local'
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
    contacto_nombre TEXT,
    contacto_telefono TEXT,
    contacto_email TEXT,
    observaciones TEXT,
    documentos TEXT, -- Lista en JSON string de documentos checklist (ej. Rol propio, escritura)
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

CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,
    propiedad_id TEXT NOT NULL,
    url_r2 TEXT,
    url_externo TEXT,
    es_principal INTEGER DEFAULT 0,
    FOREIGN KEY (propiedad_id) REFERENCES propiedades(id) ON DELETE CASCADE
);
