const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 9090;
const basePath = './public';

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  // Agrega más tipos MIME según sea necesario.
};

const server = http.createServer((req, res) => {
  let filePath = path.join(basePath, req.url === '/' ? 'views/index.html' : req.url);
  if (req.url === '/ls') {
    fs.readdir(path.join(__dirname, 'public'), (err, files) => {
        if (err) {
          console.error('Error al listar los archivos:', err);
          res.writeHead(500);
          res.end('Error interno del servidor');
          return;
        }
        res.writeHead(200, {'Content-Type': 'text/html'});
        let fileList = files.reduce((acc, file) => acc + `<li>${file}</li>`, '');
        res.end(`<ul>${fileList}</ul>`);
      });
  } else {
    serveStaticFiles(filePath, res);
  }
});

server.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`);
});

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
