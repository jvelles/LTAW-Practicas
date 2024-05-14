const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configura el directorio para servir los archivos del cliente del chat
app.use('/chat', express.static(__dirname + '/chat-client'));

// Servir la página principal de la interfaz de Electron
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

let users = {};

io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado');

    socket.emit('message', 'Bienvenido al chat!');

    socket.on('new user', (nickname) => {
        users[socket.id] = nickname;
        socket.emit('message', 'Te has unido al chat.');
        socket.broadcast.emit('message', `${nickname} se ha unido al chat`);
        io.emit('update user list', Object.values(users));
    });

    socket.on('chat message', (msg) => {
        if (msg.startsWith('/')) {
            handleCommands(socket, msg);
        } else {
            io.emit('chat message', `${users[socket.id]}: ${msg}`);
        }
    });

    socket.on('typing', () => {
        socket.broadcast.emit('display typing', users[socket.id]);
    });

    socket.on('disconnect', () => {
        if (users[socket.id]) {
            io.emit('message', `${users[socket.id]} se ha desconectado.`);
            delete users[socket.id];
            io.emit('update user list', Object.values(users));
        }
    });
});

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

const PORT = process.env.PORT || 9091;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
