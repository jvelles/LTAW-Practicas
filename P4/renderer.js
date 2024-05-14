const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.on('info', (event, data) => {
        document.getElementById('node-version').textContent = data.nodeVersion;
        document.getElementById('chrome-version').textContent = data.chromeVersion;
        document.getElementById('electron-version').textContent = data.electronVersion;
        document.getElementById('ip-address').textContent = data.ip;
        const chatUrlElement = document.getElementById('chat-url');
        chatUrlElement.textContent = data.chatUrl;
        chatUrlElement.href = data.chatUrl;
        document.getElementById('user-count').textContent = data.users.length;

        updateMessages(data.messages);
        updateUserList(data.users);
    });

    ipcRenderer.on('update', (event, data) => {
        updateMessages(data.messages);
        updateUserList(data.users);
    });

    document.getElementById('test-button').addEventListener('click', () => {
        ipcRenderer.send('send-test-message', 'Mensaje de prueba desde el servidor');
    });
});

function updateMessages(messages) {
    const messageList = document.getElementById('message-list');
    messageList.innerHTML = messages.map(msg => `<li>${msg}</li>`).join('');
}

function updateUserList(users) {
    const userCount = document.getElementById('user-count');
    userCount.textContent = users.length;
}
