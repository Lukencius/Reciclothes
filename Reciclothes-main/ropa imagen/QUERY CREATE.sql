CREATE TABLE Usuario (
    id_usuario bigint primary key,
    nombredeusuario text NOT NULL,
    rol text NOT NULL,
    contrasena text NOT NULL
);

CREATE TABLE Documento (
    id_documento bigint primary key,
    fecha date NOT NULL,
    establecimiento text NOT NULL,
    tipodedocumento text NOT NULL,
    nrodocumento text NOT NULL,
    materia text NOT NULL,
    destino text NOT NULL,
    firma text NOT NULL,
    usuario_id bigint,
    departamento_id bigint,
    estado text NOT NULL,
    CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES Usuario(id_usuario),
    CONSTRAINT fk_departamento FOREIGN KEY (departamento_id) REFERENCES Departamento(iddepartamento)
);

CREATE TABLE Departamento (
    iddepartamento bigint primary key,
    categoria text NOT NULL,
    nombre_departamento text NOT NULL
);

ALTER TABLE Usuario
ADD COLUMN password_hash text NOT NULL,
ADD COLUMN salt text NOT NULL;

Alter table Usuario
drop column contrasena;