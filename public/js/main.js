const socket = io();
let urlParams = new URLSearchParams(window.location.search);
const userName = urlParams.get("username");
let userContainer = document.querySelector("#user");
const chatform = document.getElementById('chatForm');
const usersOnline = document.getElementById('usersAvalaible');
const roomsOnline = document.getElementById('roomsAvalaible');

const user = {
    username: userName,
    id: '',
    room: "room"
};

//listening for a message from the server
socket.on('message', (msg) => {
    //console.log(msg); used for debugging
    //console.log(user); used for debugging
    outPut(msg);
    
    //scroll down the message list
    document.querySelector('.messages').scrollTop = document.querySelector('.messages').scrollHeight;
}); 

//I have the username and send it to the server
socket.emit('joinUser', user);

//receiving the update list of online users
socket.on('user', users => {
    //creating the li objects for the ul
    outPutUsername(users);
})

socket.on('privConnection', msg =>{
    alert(msg);
})

// creating a listener on the chat form
chatform.addEventListener('submit', (e) => {
    e.preventDefault(); //we don't want the page to refresh so that the messages stay on screen

    //getting the text of the message
    const msgText = e.target.elements.inputMsg.value;
    //console.log(msgText);

    //creating the message object and sending it to the server
    const msg = {username:userName, text:msgText, time:''};
    if (msg.text != ''){
        socket.emit('chatMessage', msg);
    }

    // Clear input
    e.target.elements.inputMsg.value = '';
    e.target.elements.inputMsg.focus();
})

//Adding a listener to the users list, so when you click on a user
//displayed, you'll be able to send a private message to him grabbing
//the id
usersOnline.addEventListener('click', (e)=>{
    //e.preventDefault();
    const isButton = e.target.nodeName === 'BUTTON';
    if (!isButton) {
        return;
    }

    //console.log(e.target.id); used for debugging
    const id = e.target.id;
    //alert(id); we don't want to show the id of the user
    socket.emit('private', id);
    document.querySelector('.messages').innerHTML="";
})

//Adding a listener to the rooms list, so when you click on a list
//displayed, you'll be able to join the room and send messages
roomsOnline.addEventListener('click', (e)=>{
    //e.preventDefault();
    const isButton = e.target.nodeName === 'BUTTON';
    if (!isButton) {
        return;
    }

    //console.log(e.target.id);
    const room = e.target.id;
    socket.emit("new room", room);
    document.querySelector('.messages').innerHTML="";
})

function outPutUsername(users){
    usersOnline.innerHTML = '';
    users.forEach((user) => {
        const btn = document.createElement('button');
        btn.classList.add('userBtn');
        btn.setAttribute('id', user.id);
        btn.innerText = user.username;
        usersOnline.appendChild(btn);
        const br = document.createElement('br');
        usersOnline.appendChild(br);
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
    const br = document.createElement('br');
    document.querySelector('.messages').appendChild(br);
    
}