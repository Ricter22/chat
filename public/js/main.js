
const socket = io();
let urlParams = new URLSearchParams(window.location.search);
const userName = urlParams.get("username");
let userContainer = document.querySelector("#user");
const chatform = document.getElementById('chatForm');
const usersOnline = document.getElementById('usersAvalaible');

//listening for a message from the server
socket.on('message', (msg) => {
    console.log(msg); //the messages that we emit from the server are catched here
    outPut(msg);
}); 

//I have the username and send it to the server
socket.emit('joinUser', userName);

//receiving the update list of online users
socket.on('user', users => {
    //creating the li objects for the ul
    outPutUsername(users);
})

// creating a listener on the chat form
chatform.addEventListener('submit', (e) => {
    e.preventDefault();

    //getting the text of the message
    const msgText = e.target.elements.inputMsg.value;
    console.log(msgText);

    //creating the message object and sending it to the server
    const msg = {username:userName, text:msgText, time:''};
    socket.emit('chatMessage', msg);

    // Clear input
    e.target.elements.inputMsg.value = '';
    e.target.elements.inputMsg.focus();
})

//creates the html objects with the list of usernames
//in future change username with user objects
function outPutUsername(users){
    usersOnline.innerHTML = '';
    users.forEach((username) => {
        const li = document.createElement('li');
        li.classList.add('onUsers');
        li.innerText = username;
        usersOnline.appendChild(li);
    });
}

function outPut(msg){
    //message = userName + ' ' + message;

    //creating the div
    const div = document.createElement('div');
    div.classList.add('message');

    //creating the first paragraph with time
    //and username
    const p = document.createElement('p');
    p.classList.add('meta');
    //p.innerText = message.username;
    //p.innerHTML += `<span>${message.time}</span>`;
    p.innerText = msg.username + ' ' + msg.time;
    div.appendChild(p);

    //creating another paragraph to put inside
    //the text of the message
    const paraText = document.createElement('p');
    paraText.classList.add('text');
    paraText.innerText = msg.text;
    div.appendChild(paraText);
    document.querySelector('.messages').appendChild(div);
}