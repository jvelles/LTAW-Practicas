const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 9090;
const basePath = './public';
const dbPath = './tienda.json';

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  // Agrega más tipos MIME según sea necesario.
};

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    handleGetRequest(req, res);
  } else if (req.method === 'POST') {
    handlePostRequest(req, res);
  } else {
    res.writeHead(405, {'Content-Type': 'text/plain'});
    res.end('Método no permitido');
  }
});

server.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`);
});

function handleGetRequest(req, res) {
  let filePath = path.join(basePath, req.url === '/' ? 'views/index.html' : req.url);
  if (req.url.startsWith('/api/productos')) {
    fs.readFile(dbPath, (err, data) => {
      if (err) {
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: 'Error al leer la base de datos'}));
        return;
      }
      const tienda = JSON.parse(data);
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(tienda.productos));
    });
  } else if (req.url.startsWith('/api/usuarios')) {
    fs.readFile(dbPath, (err, data) => {
      if (err) {
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: 'Error al leer la base de datos'}));
        return;
      }
      const tienda = JSON.parse(data);
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(tienda.usuarios));
    });
  } else {
    serveStaticFiles(filePath, res);
  }
}

function handlePostRequest(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    const parsedBody = JSON.parse(body);
    if (req.url === '/api/login') {
      handleLoginRequest(parsedBody, res);
    } else if (req.url === '/api/pedido') {
      handlePedidoRequest(parsedBody, res);
    } else {
      res.writeHead(404, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({error: 'Ruta no encontrada'}));
    }
  });
}

function handleLoginRequest(data, res) {
  fs.readFile(dbPath, (err, dbData) => {
    if (err) {
      res.writeHead(500, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({error: 'Error al leer la base de datos'}));
      return;
    }
    const tienda = JSON.parse(dbData);
    const usuario = tienda.usuarios.find(u => u.nombre === data.nombre);
    if (usuario) {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({message: 'Login exitoso', usuario}));
    } else {
      res.writeHead(401, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({error: 'Usuario no encontrado'}));
    }
  });
}

function handlePedidoRequest(data, res) {
  fs.readFile(dbPath, (err, dbData) => {
    if (err) {
      res.writeHead(500, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({error: 'Error al leer la base de datos'}));
      return;
    }
    const tienda = JSON.parse(dbData);
    tienda.pedidos.push(data);
    fs.writeFile(dbPath, JSON.stringify(tienda, null, 2), (err) => {
      if (err) {
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: 'Error al guardar el pedido'}));
        return;
      }
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({message: 'Pedido realizado con éxito'}));
    });
  });
}

function serveStaticFiles(filePath, res) {
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Página de error
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end('<h1>404 Not Found</h1>');
      } else {
        res.writeHead(500);
        res.end('Error interno del servidor');
      }
    } else {
      res.writeHead(200, {'Content-Type': contentType});
      res.end(content, 'utf-8');
    }
  });
}
