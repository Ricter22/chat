const chatForm = document.getElementById('form-log');
const socket = io();

socket.on('message', message => {
    console.log(message); //the messages that we emit from the server are catched here
}); 