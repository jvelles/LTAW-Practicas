const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const port = 9090;
const publicPath = path.join(__dirname, 'public');
const viewsPath = path.join(__dirname, 'views');
// Ruta al archivo JSON de la base de datos
const dbPath = path.join(__dirname, 'tienda.json');

// Usuarios predefinidos para simplificar el ejemplo
const users = {
    'root': {},
    'usuarioNormal': {}
};

// Almacenamiento simple de sesiones
let sessions = {};

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        // Servir la página principal
        sendFile(res, path.join(viewsPath, 'index.html'));
    } else if (req.method === 'GET' && req.url.startsWith('/public/')) {
        // Servir archivos estáticos
        const filePath = path.join(__dirname, req.url);
        serveStaticFiles(res, filePath);
    } else if (req.method === 'POST' && req.url === '/public/views/login') {
        // Manejar el intento de login
        handleLogin(req, res);
    } else {
        // Manejar el resto de las rutas
        // ...
    }
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

function serveStaticFiles(res, filePath) {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            return res.end('404 Not Found');
        }
        res.writeHead(200, { 'Content-Type': getContentType(filePath) });
        res.end(content);
    });
}

function handleLogin(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
        const { username } = querystring.parse(body);
        if (username in users) {
            // Crear y asignar sesión
            const sessionId = Math.random().toString();
            sessions[sessionId] = { username };
            res.setHeader('Set-Cookie', `sessionId=${sessionId}; Path=/; HttpOnly`);
            res.writeHead(302, { 'Location': '/' });
            res.end();
        } else {
            res.writeHead(302, { 'Location': '/views/login.html' });
            res.end();
        }
    });
}

function sendFile(res, filePath) {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            return res.end('404 Not Found');
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
    });
}

function getContentType(filePath) {
    const ext = path.extname(filePath);
    switch (ext) {
        case '.html': return 'text/html';
        case '.css': return 'text/css';
        case '.jpg': case '.jpeg': return 'image/jpeg';
        case '.png': return 'image/png';
        case '.js': return 'application/javascript';
        case '.json': return 'application/json';
        default: return 'application/octet-stream';
    }
}

function serveStaticFiles(res, filePath) {
  console.log(`Intentando servir: ${filePath}`); // Log para depuración
  fs.readFile(filePath, (err, content) => {
      if (err) {
          console.log(`Error: ${err.message}`); // Log para depuración
          res.writeHead(404);
          return res.end('404 Not Found');
      }
      res.writeHead(200, { 'Content-Type': getContentType(filePath) });
      res.end(content);
  });
}


// Cargar la base de datos
function cargarDB() {
  return new Promise((resolve, reject) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
}

// Guardar la base de datos
function guardarDB(db) {
  return new Promise((resolve, reject) => {
    fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Ejemplo de uso
async function ejemplo() {
  try {
    const db = await cargarDB();
    // Modificar la base de datos aquí, por ejemplo, añadir un nuevo usuario
    db.usuarios.push({
      "nombreUsuario": "usuario2",
      "nombreReal": "Ana López",
      "correo": "ana.lopez@tienda.com"
    });
    // Guardar los cambios en la base de datos
    await guardarDB(db);
    console.log('Base de datos actualizada con éxito.');
  } catch (error) {
    console.error('Error al manejar la base de datos:', error);
  }
}

ejemplo();