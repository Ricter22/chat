const socket = io();

const logForm = document.getElementById('form-log');

// creating a listener on the chat form
logForm.addEventListener('submit', (e) => {
    //e.preventDefault();

    //getting the text of the message
    const loginText = e.target.elements.inputMsg.value();
    socket.emit('loginUser', loginUsername);
    console.log(loginText);
})