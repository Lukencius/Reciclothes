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

// Configuración de la base de datos
const dbConfig = {
    host: 'servicioalochoro-prueba1631.l.aivencloud.com',
    user: 'avnadmin',
    password: 'AVNS_XIL6StsPZSOwo0ZxNfr',
    database: 'RECICLOTHES',
    port: '15140',
    charset: "utf8mb4"
};

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// Ruta para la página de registro
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Ruta para el registro de usuarios
app.post('/signup', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const { name, email, phone, address, password } = req.body;
        
        // Volver a usar bcryptjs
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);
        
        const [result] = await connection.execute(
            'INSERT INTO clientes (name, email, phone, address, password_hash) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone, address, hashedPassword]
        );
        
        res.json({ success: true, message: 'Usuario registrado exitosamente' });
    } catch (error) {
        console.error('Error en signup:', error);
        res.status(500).json({ success: false, message: 'Error al registrar usuario' });
    }
});

// Ruta para la página de inicio de sesión
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Login.html'));
});

// Ruta para el proceso de inicio de sesión
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM clientes WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }
        
        const user = rows[0];
        
        // Volver a la verificación con bcryptjs
        const validPassword = await bcryptjs.compare(password, user.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }
        
        const token = jwt.sign(
            { userId: user.id }, 
            process.env.JWT_SECRET || 'tu_clave_secreta',
            { expiresIn: '24h' }
        );
        
        res.json({ 
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Ruta para obtener todos los productos
app.get('/api/productos', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Conexión a base de datos establecida');
        
        const [rows] = await connection.execute('SELECT * FROM Productos');
        console.log('Productos encontrados:', rows);
        
        await connection.end();
        
        res.json(rows);
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener los productos',
            error: error.message 
        });
    }
});

async function testDatabaseConnection() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Conexión a la base de datos exitosa');
        await connection.end();
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }
}

testDatabaseConnection();

async function checkTableStructure() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('DESCRIBE clientes');
        console.log('Estructura de la tabla clientes:', rows);
        await connection.end();
    } catch (error) {
        console.error('Error al verificar la estructura de la tabla:', error);
    }
}

checkTableStructure();

async function checkProductsTable() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('DESCRIBE Productos');
        console.log('Estructura de la tabla Productos:', rows);
        await connection.end();
    } catch (error) {
        console.error('Error al verificar la tabla Productos:', error);
        // Si la tabla no existe, la creamos
        try {
            const connection = await mysql.createConnection(dbConfig);
            await connection.execute(`
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
            console.log('Tabla Productos creada exitosamente');
            await connection.end();
        } catch (createError) {
            console.error('Error al crear la tabla Productos:', createError);
        }
    }
}

// Llamar a la función de verificación al iniciar el servidor
checkProductsTable();

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
