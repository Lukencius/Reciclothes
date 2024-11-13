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
const mercadopago = require('mercadopago');

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
app.use(cors({
    origin: 'https://reci-clothes.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

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

// Añadir una clave secreta para JWT
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_temporal';

// Actualizar la ruta de login
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

        // Generar token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            JWT_SECRET,
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

        // Ya no es necesario convertir BLOB a base64
        res.json(rows);
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
            imagen VARCHAR(500),  // Cambiado de BLOB a VARCHAR para almacenar URLs
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
};

initDatabase();

// Middleware para verificar token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido' });
        }
        req.user = user;
        next();
    });
};

// Ejemplo de ruta protegida
app.get('/api/user-profile', authenticateToken, async (req, res) => {
    res.json({ user: req.user });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

// Ruta para obtener un producto específico por ID
app.get('/api/productos/:id', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT Id_Producto, name, description, price, category, stock, imagen FROM Productos WHERE Id_Producto = ?',
            [req.params.id]
        );
        await connection.end();

        if (rows.length === 0) {
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener el producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Agregar ruta de ping simple
app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

// Ruta para añadir un nuevo producto
app.post('/api/Productos', async (req, res) => {
    try {
        const { name, category, price, stock, imagen, description } = req.body;

        // Validar que los campos requeridos estén presentes
        if (!name || !category || !price || !stock) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'INSERT INTO Productos (name, category, price, stock, imagen, description) VALUES (?, ?, ?, ?, ?, ?)',
            [name, category, price, stock, imagen || null, description || null]
        );
        await connection.end();

        res.status(201).json({
            message: 'Producto agregado exitosamente',
            productId: result.insertId
        });
    } catch (error) {
        console.error('Error al agregar el producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta para modificar un producto
app.put('/api/Productos/:id', async (req, res) => {
    try {
        const { name, category, price, stock, imagen } = req.body;
        const productId = req.params.id;

        const connection = await mysql.createConnection(dbConfig);
        
        // Verificar si el producto existe
        const [rows] = await connection.execute(
            'SELECT Id_Producto FROM Productos WHERE Id_Producto = ?',
            [productId]
        );

        if (rows.length === 0) {
            await connection.end();
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Actualizar el producto
        await connection.execute(
            'UPDATE Productos SET name = ?, category = ?, price = ?, stock = ?, imagen = ? WHERE Id_Producto = ?',
            [name, category, price, stock, imagen || null, productId]
        );

        await connection.end();

        res.json({ 
            message: 'Producto actualizado exitosamente',
            productId: productId
        });
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta para eliminar un producto
app.delete('/api/Productos/:id', async (req, res) => {
    console.log('Intentando eliminar producto con ID:', req.params.id);
    try {
        const productId = req.params.id;
        const connection = await mysql.createConnection(dbConfig);
        
        // Verificar si el producto existe
        const [rows] = await connection.execute(
            'SELECT Id_Producto FROM Productos WHERE Id_Producto = ?',
            [productId]
        );

        console.log('Resultado de la búsqueda:', rows);

        if (rows.length === 0) {
            console.log('Producto no encontrado');
            await connection.end();
            return res.status(404).json({ 
                success: false,
                error: 'Producto no encontrado' 
            });
        }

        // Eliminar el producto
        const [result] = await connection.execute(
            'DELETE FROM Productos WHERE Id_Producto = ?',
            [productId]
        );

        await connection.end();

        console.log('Producto eliminado exitosamente');
        res.json({ 
            success: true,
            message: 'Producto eliminado exitosamente',
            productId: productId
        });
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error interno del servidor' 
        });
    }
});

// Agrega esta nueva ruta para crear preferencias de pago
app.post('/crear-preferencia', async (req, res) => {
    try {
        const { items, nombre, email, telefono, direccion } = req.body;

        const preference = {
            items: items.map(item => ({
                title: item.title,
                unit_price: Number(item.unit_price),
                quantity: Number(item.quantity),
                currency_id: 'CLP'
            })),
            payer: {
                name: nombre,
                email: email,
                phone: {
                    number: telefono
                },
                address: {
                    street_name: direccion
                }
            },
            back_urls: {
                success: "https://reci-clothes.vercel.app/success",
                failure: "https://reci-clothes.vercel.app/failure", 
                pending: "https://reci-clothes.vercel.app/pending"
            },
            auto_return: "approved",
            binary_mode: true,
            statement_descriptor: "RECICLOTHES",
            external_reference: Date.now().toString()
        };

        const response = await mercadopago.preferences.create(preference);
        res.json(response.body.id);
    } catch (error) {
        console.error('Error al crear preferencia:', error);
        res.status(500).json({ error: 'Error al crear preferencia de pago' });
    }
});

// Rutas para manejar los diferentes estados del pago
app.get('/success', (req, res) => {
    res.send(`
        <script>
            alert('¡Pago exitoso!');
            localStorage.removeItem('carrito');
            window.location.href = '/';
        </script>
    `);
});

app.get('/failure', (req, res) => {
    res.send(`
        <script>
            alert('El pago falló. Por favor intenta nuevamente.');
            window.location.href = '/carrito.html';
        </script>
    `);
});

app.get('/pending', (req, res) => {
    res.send(`
        <script>
            alert('El pago está pendiente.');
            localStorage.removeItem('carrito');
            window.location.href = '/';
        </script>
    `);
});
