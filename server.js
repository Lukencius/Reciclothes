const express = require('express');
const cors = require('cors');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const { Pool } = require('pg');
const path = require('path');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();

// Configuración de la base de datos como constante
const dbConfig = {
    host: 'servicioalochoro-prueba1631.l.aivencloud.com',
    user: 'avnadmin',
    password: 'AVNS_XIL6StsPZSOwo0ZxNfr',
    database: 'RECICLOTHES',
    port: '15140',
    charset: "utf8mb4"
};

// Función helper para crear conexión a la base de datos
const createDbConnection = async () => {
    return await mysql.createConnection(dbConfig);
};

// Middleware optimizado
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// Ruta para la página de registro
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Ruta optimizada para el registro de usuarios
app.post('/signup', async (req, res) => {
    const connection = await createDbConnection();
    try {
        const { name, email, phone, address, password } = req.body;
        const saltRounds = 10;
        const salt = await bcryptjs.genSalt(saltRounds);
        const passwordHash = await bcryptjs.hash(password, salt);
        
        const [result] = await connection.execute(
            'INSERT INTO clientes (name, email, phone, address, password_hash, salt) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, phone, address, passwordHash, salt]
        );
        
        res.json({ 
            success: result.affectedRows === 1, 
            message: result.affectedRows === 1 ? 'Cliente registrado correctamente' : 'Error al registrar cliente'
        });
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    } finally {
        await connection.end();
    }
});

// Ruta para la página de inicio de sesión
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Login.html'));
});

// Ruta optimizada para el login
app.post('/login', async (req, res) => {
    const connection = await createDbConnection();
    try {
        const { email, password } = req.body;
        const [rows] = await connection.execute('SELECT * FROM clientes WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }
        
        const user = rows[0];
        const validPassword = await bcryptjs.compare(password, user.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }
        
        res.json({ 
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    } finally {
        await connection.end();
    }
});

// Ruta para obtener todos los productos
app.get('/api/Productos', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT Id_Producto, name, description, price, category, stock, imagen FROM Productos');
        await connection.end();

        // Convertir BLOB a base64
        const productosConImagenes = rows.map(producto => ({
            ...producto,
            imagen: producto.imagen ? producto.imagen.toString('base64') : null
        }));

        res.json(productosConImagenes);
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/Productos', async (req, res) => {
    console.log('Solicitud recibida en /api/productos');
    // ... resto del código ...
});



// Función helper para verificar tablas
const checkTable = async (tableName, createTableSQL = null) => {
    const connection = await createDbConnection();
    try {
        const [rows] = await connection.execute(`DESCRIBE ${tableName}`);
        console.log(`Estructura de la tabla ${tableName}:`, rows);
    } catch (error) {
        console.error(`Error al verificar la tabla ${tableName}:`, error);
        if (createTableSQL) {
            try {
                await connection.execute(createTableSQL);
                console.log(`Tabla ${tableName} creada exitosamente`);
            } catch (createError) {
                console.error(`Error al crear la tabla ${tableName}:`, createError);
            }
        }
    } finally {
        await connection.end();
    }
};

// Inicialización de la base de datos
const initDatabase = async () => {
    await createDbConnection()
        .then(() => console.log('Conexión a la base de datos exitosa'))
        .catch(error => console.error('Error al conectar a la base de datos:', error));

    await checkTable('clientes');
    await checkTable('Productos', `
        CREATE TABLE IF NOT EXISTS Productos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            category VARCHAR(50),
            price DECIMAL(10,2) NOT NULL,
            stock INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
};

initDatabase();

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
