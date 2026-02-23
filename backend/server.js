const express = require('express');
const sql = require('mssql/msnodesqlv8');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// 🔹 Configuración SQL Server con Windows Auth
const config = {
    connectionString:
        "Driver={ODBC Driver 18 for SQL Server};" +
        "Server=DESKTOP-EI3A2BT\\SQLEXPRESS;" +
        "Database=CleanWorld;" +
        "Trusted_Connection=Yes;" +
        "TrustServerCertificate=Yes;"
};

// 🔹 Conectar a la base de datos
async function conectarDB() {
    try {
        await sql.connect(config);
        console.log('Conectado a SQL Server con Windows Auth');
    } catch (err) {
        console.log('Error de conexión:');
        console.log(err);
    }
}

conectarDB();

// 🔹 Ruta de prueba
app.get('/', (req, res) => {
    res.send('API Clean World funcionando correctamente');
});

// 🔹 REGISTRO DE USUARIOS
app.post('/registro', async (req, res) => {

    const { nombre, email, password } = req.body;

    // Validación básica
    if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        const pool = await sql.connect(config);

        await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, password)
            .query(`
                INSERT INTO dbo.usuarios (nombre, email, password)
                VALUES (@nombre, @email, @password)
            `);

        res.json({ mensaje: 'Usuario registrado correctamente' });

    } catch (error) {

        // Error de correo duplicado
        if (error.number === 2627) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        console.log(error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

// 🔹 INICIAR SERVIDOR
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});
