//-- Cargar el módulo de electron
const electron = require('electron');

console.log("Arrancando electron...");

//-- Variable para acceder a la ventana principal
//-- Se pone aquí para que sea global al módulo principal


//-- Punto de entrada. En cuanto electron está listo,
//-- ejecuta esta función
electron.app.on('ready', () => {
    console.log("Evento Ready!");

    //-- Crear la ventana principal de nuestra aplicación
    win = new electron.BrowserWindow({
        width: 1500,   //-- Anchura 
        height: 1000,  //-- Altura

        //-- Permitir que la ventana tenga ACCESO AL SISTEMA
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
        }
    });

  //-- En la parte superior se nos ha creado el menu
  //-- por defecto
  //-- Si lo queremos quitar, hay que añadir esta línea
  //win.setMenuBarVisibility(false)

  //-- Cargar contenido web en la ventana
  //-- La ventana es en realidad.... ¡un navegador!
  //win.loadURL('https://www.urjc.es/etsit');

  //-- Cargar interfaz gráfica en HTML
  win.loadFile("index.html");

  //-- Esperar a que la página se cargue y se muestre
  //-- y luego enviar el mensaje al proceso de renderizado para que 
  //-- lo saque por la interfaz gráfica
  win.on('ready-to-show', () => {
    win.webContents.send('ip', 'http://' + ip.address() + ':' + PUERTO);
  });

  electron.ipcMain.handle("btn_test", async(event, mensaje) => {
    console.log(mensaje);
    io.send("Hola a todos", mensaje);
    win.webContents.send("recibiendo", "Holaaaaaaaaaaaaa");
  }
  )
});




//-- Cargar las dependencias
const socket = require('socket.io');
const http = require('http');
const express = require('express');
const colors = require('colors');
const ip = require('ip');

const PUERTO = 9000;

//-- Crear una nueva aplciacion web
const app = express();

//-- Crear un servidor, asosiaco a la App de express
const server = http.Server(app);

//-- Crear el servidor de websockets, asociado al servidor http
const io = socket(server);

//-------- PUNTOS DE ENTRADA DE LA APLICACION WEB
//-- Definir el punto de entrada principal de mi aplicación web
app.get('/', (req, res) => {
  res.send('Bienvenido a mi Chat!!!' + '<p><a href="/chat.html">Entrar al Chat</a></p>');
});

//-- Esto es necesario para que el servidor le envíe al cliente la
//-- biblioteca socket.io para el cliente
app.use('/', express.static(__dirname +'/'));

//-- El directorio publico contiene ficheros estáticos
app.use(express.static('public'));

//------------------- GESTION SOCKETS IO
//-- Evento: Nueva conexion recibida
io.on('connect', (socket) => {
  
  console.log('** NUEVO USUARIO CONECTADO **'.yellow);

  win.webContents.send("numeroclientes",io.engine.clientsCount);

  //-- Evento de desconexión
  socket.on('disconnect', function(){
    console.log('** USUARIO DESCONECTADO **'.yellow);

    win.webContents.send("numeroclientes",io.engine.clientsCount);
  
  });  

  //-- Mensaje recibido: Reenviarlo a todos los clientes conectados
  socket.on("message", (msg)=> {
    console.log(`Mensaje recibido!:` + msg.blue);
    const command = msg.split("/")[1];

switch (command) {
  case 'help':
    socket.send("Comandos soportados : /hello, /list, /hour y /date");
    break;

  case 'hello':
    socket.send('Bienvenido al chat!!!!');
  break;

  case 'list':
    const users = 'Número de usuarios conectados: ' + io.engine.clientsCount;
    socket.send(users);
    break;

  case 'hour':
    const currentTime = new Date();
    const timeString = 'Son las: ' + currentTime.toLocaleTimeString();
    socket.send(timeString);
  break;

  case 'date':
    const currentDate = new Date();
    const dateString = 'Hoy es: ' + currentDate.toLocaleDateString();
    socket.send(dateString);
    break;

  default:
    io.send(msg);
    break;
    win.webContents.send("recibiendo", msg);
}
  });

});

//-- Lanzar el servidor HTTP
//-- ¡Que empiecen los juegos de los WebSockets!
server.listen(PUERTO);
console.log("Escuchando en puerto: " + PUERTO);


