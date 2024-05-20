const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const QRCode = require('qrcode'); // Importa la librería QRCode

// Configuración del servidor Express y Socket.io
const expressApp = express();
const server = http.createServer(expressApp);
const io = socketIo(server);

function getIPAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const net of interfaces[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return '127.0.0.1'; // Default fallback IP
}

let users = {};
let messages = [];

function updateRenderer() {
    const window = BrowserWindow.getAllWindows()[0];
    if (window) {
        window.webContents.send('update', {
            users: Object.values(users),
            messages: messages
        });
    }
}

io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado');

    socket.emit('message', 'Bienvenido al chat!');

    socket.on('new user', (nickname) => {
        users[socket.id] = nickname;
        socket.emit('message', 'Te has unido al chat.');
        socket.broadcast.emit('message', `${nickname} se ha unido al chat`);
        io.emit('update user list', Object.values(users));
        updateRenderer();
    });

    socket.on('chat message', (msg) => {
        const message = `${users[socket.id]}: ${msg}`;
        messages.push(message);
        io.emit('chat message', message);
        updateRenderer();
    });

    socket.on('typing', () => {
        socket.broadcast.emit('display typing', users[socket.id]);
    });

    socket.on('disconnect', () => {
        if (users[socket.id]) {
            io.emit('message', `${users[socket.id]} se ha desconectado.`);
            delete users[socket.id];
            io.emit('update user list', Object.values(users));
            updateRenderer();
        }
    });
});

// Servir los archivos estáticos del cliente de chat
expressApp.use('/chat', express.static(path.join(__dirname, 'chat-client')));
expressApp.use(express.static(path.join(__dirname, 'public')));
expressApp.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'public', 'renderer.js'), // Asegúrate de que la ruta es correcta
            contextIsolation: false,
            enableRemoteModule: true,
            nodeIntegration: true
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));

    mainWindow.webContents.openDevTools();

    mainWindow.webContents.on('did-finish-load', async () => {
        const ip = getIPAddress();
        const chatUrl = `http://${ip}:9091/chat`;

        // Genera el código QR
        const qrCodeUrl = await QRCode.toDataURL(chatUrl);

        mainWindow.webContents.send('info', {
            nodeVersion: process.versions.node,
            chromeVersion: process.versions.chrome,
            electronVersion: process.versions.electron,
            ip: ip,
            chatUrl: chatUrl,
            qrCodeUrl: qrCodeUrl, // Envia el código QR al renderizador
            users: Object.values(users),
            messages: messages
        });
    });

    // Asegúrate de eliminar cualquier escucha duplicada
    ipcMain.removeAllListeners('send-test-message');
    ipcMain.on('send-test-message', (event, message) => {
        const testMessage = `Servidor: ${message}`;
        messages.push(testMessage);
        io.emit('chat message', testMessage);
        updateRenderer();
    });
}

app.on('ready', () => {
    createWindow();
    server.listen(9091, () => {
        console.log('Servidor corriendo en http://localhost:9091');
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
