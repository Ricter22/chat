
const socket = io();
let urlParams = new URLSearchParams(window.location.search);
const userName = urlParams.get("username");
let userContainer = document.querySelector("#user");
const chatform = document.getElementById('chatForm');
const usersOnline = document.getElementById('usersAvalaible');

socket.on('message', (message) => {
    console.log(message); //the messages that we emit from the server are catched here
    outPut(message);
}); 

//I have the username and send it to the server
socket.emit('joinUser', userName);

socket.on('user', users => {
    //console.log(userName);
    outPutUsername(users);
})

// creating a listener on the chat form
chatform.addEventListener('submit', (e) => {
    e.preventDefault();

    //getting the text of the message
    const msgText = e.target.elements.inputMsg.value;
    console.log(msgText);

    socket.emit('chatMessage', msgText);
})


function outPutUsername(users){
    usersOnline.innerHTML = '';
    users.forEach((username) => {
        const li = document.createElement('li');
        li.classList.add('meta');
        li.innerText = username;
        usersOnline.appendChild(li);
    });
}

function outPut(message){
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
    p.innerText = 'username and time';
    div.appendChild(p);

    //creating another paragraph to put inside
    //the text of the message
    const paraText = document.createElement('p');
    paraText.classList.add('text');
    paraText.innerText = message;
    div.appendChild(paraText);
    document.querySelector('.messages').appendChild(div);
}