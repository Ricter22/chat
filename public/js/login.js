const { users, newUserList, removedUserList} = require('./utils/users.js');

const logForm = document.getElementById('form-log');

// creating a listener on the chat form
logForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //getting the text of the message
    const loginText = e.target.elements.inputMsg.value;
    console.log(loginText);
})