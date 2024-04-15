// Importar módulos necesarios
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Inicializar servidor y socket.io
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Servir la página principal
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Lista de usuarios conectados
let users = {};

// Manejo de eventos de conexión de Socket.io
io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado');

    // Enviar bienvenida al usuario
    socket.on('new user', (nickname) => {
        users[socket.id] = nickname;
        socket.broadcast.emit('message', `${nickname} se ha unido al chat`);
        io.emit('update user list', Object.values(users));
    });

    // Manejo de mensajes de chat
    socket.on('chat message', (msg) => {
        if (msg.startsWith('/')) {
            // Comandos especiales
            handleCommands(socket, msg);
        } else {
            // Reenviar mensaje a todos
            io.emit('chat message', `${users[socket.id]}: ${msg}`);
        }
    });

    // Notificar cuando un usuario está escribiendo
    socket.on('typing', () => {
        socket.broadcast.emit('display typing', users[socket.id]);
    });

    // Manejo de desconexión
    socket.on('disconnect', () => {
        if (users[socket.id]) {
            io.emit('message', `${users[socket.id]} se ha desconectado.`);
            delete users[socket.id];
            io.emit('update user list', Object.values(users));
        }
    });
});

// Función para manejar comandos
function handleCommands(socket, msg) {
    switch (msg) {
        case '/help':
            socket.emit('message', 'Comandos: /help, /list, /hello, /date');
            break;
        case '/list':
            socket.emit('message', `Usuarios conectados: ${Object.values(users).join(', ')}`);
            break;
        case '/hello':
            socket.emit('message', '¡Hola!');
            break;
        case '/date':
            socket.emit('message', `Fecha actual: ${new Date().toLocaleString()}`);
            break;
        default:
            socket.emit('message', 'Comando no reconocido');
    }
}

// Iniciar servidor
server.listen(9090, () => {
    console.log('Servidor corriendo en http://localhost:9090');
});
