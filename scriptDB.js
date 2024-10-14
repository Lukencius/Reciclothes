const mysql = require('mysql');
const crypto = require('crypto');

// Configuración de la conexión a la base de datos
const DB_CONFIG = {
    host: "servicioalochoro-prueba1631.l.aivencloud.com",
    port: 15140,
    user: "avnadmin",
    password: "AVNS_XIL6StsPZSOwo0ZxNfr",
    database: "RECICLOTHES",
    charset: "utf8mb4"
};

// Función para conectar a la base de datos
function conectarBaseDeDatos() {
    return new Promise((resolve, reject) => {
        const conexion = mysql.createConnection(DB_CONFIG);
        
        conexion.connect((error) => {
            if (error) {
                console.error('Error al conectar a la base de datos:', error);
                reject(error);
            } else {
                console.log('Conexión exitosa a la base de datos');
                resolve(conexion);
            }
        });
    });
}

// Función para generar un salt aleatorio
function generarSalt() {
    return crypto.randomBytes(16).toString('hex');
}

// Función para hashear la contraseña con salt
function hashearContraseña(contraseña, salt) {
    return crypto.pbkdf2Sync(contraseña, salt, 1000, 64, 'sha512').toString('hex');
}

// Función para registrar un nuevo cliente
function registrarCliente(name, email, phone, address, password) {
    return new Promise((resolve, reject) => {
        const salt = generarSalt();
        const password_hash = hashearContraseña(password, salt);

        conectarBaseDeDatos()
            .then(conexion => {
                const query = 'INSERT INTO clientes (name, email, phone, address, password_hash, salt) VALUES (?, ?, ?, ?, ?, ?)';
                conexion.query(query, [name, email, phone, address, password_hash, salt], (error, results) => {
                    conexion.end(); // Cerrar la conexión después de la consulta
                    if (error) {
                        console.error('Error al registrar cliente:', error);
                        reject(error);
                    } else {
                        console.log('Cliente registrado exitosamente');
                        resolve(results.insertId);
                    }
                });
            })
            .catch(error => {
                console.error('Error en la conexión:', error);
                reject(error);
            });
    });
}

// Exportar las funciones
module.exports = {
    conectarBaseDeDatos,
    registrarCliente
};
