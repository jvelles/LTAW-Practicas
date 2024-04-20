const electron = require('electron');

console.log("Hola desde el proceso de la web...");

//-- Obtener elementos de la interfaz
const display = document.getElementById("display");
const info1 = document.getElementById("info1");
const info2 = document.getElementById("info2");
const info3 = document.getElementById("info3");
const Vnode = document.getElementById("Vnode");
const Vchrome = document.getElementById("Vchrome");
const Velectron = document.getElementById("Velectron");
const numeroclientes = document.getElementById("numeroclientes");
const ip = document.getElementById("ip");
const btn_test = document.getElementById("btn_test");

//-- Acceder a la API de node para obtener la info
//-- Sólo es posible si nos han dado permisos desde
//-- el proceso princpal
info1.textContent = process.arch;
info2.textContent = process.platform;
info3.textContent = process.cwd();
Vnode.textContent = process.versions.node;
Vchrome.textContent = process.versions.chrome;
Velectron.textContent = process.versions.electron;


btn_test.onclick = () => {
    console.log("Botón apretado!");

    //-- Enviar mensaje al proceso principal
    electron.ipcRenderer.invoke('btn_test', "MENSAJE DE PRUEBA");
}


//-- Numero de clientes
numeroclientes.textContent = 0;
electron.ipcRenderer.on("numeroclientes",(event, message) => {
    numeroclientes.textContent = message;
});

electron.ipcRenderer.on("recibiendo",(event,message) => {
    display.innerHTML += message + "</p>";
  });

//-- Dirección IP
electron.ipcRenderer.on("ip",(event,mensaje) => {
  ip.innerHTML = mensaje + "/chat.html";
  ip.href = mensaje + "/chat.html";
});