let urlParams = new URLSearchParams(window.location.search);
const userName = urlParams.get("username");
let userContainer = document.querySelector("#user");
const chatform = document.getElementById('chatForm');
const usersOnline = document.getElementById('usersAvalaible');
const roomsOnline = document.getElementById('roomsAvalaible');
const multimedia = document.getElementById('multimedia');

const socket = io({
    'reconnection': true,
    'reconnectionDelay': 1000,
    'reconnectionDelayMax' : 5000,
    'reconnectionAttempts': 5,
});

let userP = {username:'', id:'', room:''};
let userAfterCrash = {username:'', id:'', room:''};
let isConnected = false;


socket.on('connect', function () {
    if(isConnected){
        console.log("already connected " + userP.username);
        socket.emit('userConnected', userP);
    }
    else{
        console.log("New connect ");
    }
  });

socket.on('disconnect', function () {
    console.log("disconnect");
    isConnected = true;
  });



socket.on('userProperties', user =>{
    userP.username = user.username;
    userP.id = user.id;
    userP.room = user.room;
    userP.image = user.image;
    console.log(userP.room);
})

//receiving the update list of online users
socket.on('user', users => {
    //creating the li objects for the ul
    outPutUsername(users);
})

//listening for a message from the server
socket.on('message', (msg) => {
    console.log(msg.countries);
    outPut(msg);
    
    //scroll down the message list
    document.querySelector('.messages').scrollTop = document.querySelector('.messages').scrollHeight;
}); 

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
    //here the div is empty and I want to populate it with the old messages
})

//listening for a private connection 
socket.on('privConnection', msg =>{
    alert(msg);
})

socket.on("oldMessages", result =>{
    console.log(result);
    result.forEach(message => {
        outPut(message);
    })
})

socket.on('file', bin => {
    displayFiles(bin);
})

// creating a listener on the chat form
chatform.addEventListener('submit', (e) => {
    e.preventDefault(); //we don't want the page to refresh so that the messages stay on screen

    //getting the text of the message
    const msgText = e.target.elements.inputMsg.value;

    //creating the message object and sending it to the server
    const msg = {username:userP.username, text:msgText, time:''};
    socket.emit('chatMessage', msg);
    
    // Clear input
    e.target.elements.inputMsg.value = '';
    e.target.elements.inputMsg.focus();
})

//function to display the list of users online
function outPutUsername(users){
    usersOnline.innerHTML = '';
    users.forEach((user) => {
        const userDiv = document.createElement('div');
        const btn = document.createElement('button');
        btn.classList.add('userBtn');
        btn.setAttribute('id', user.id);
        btn.innerText = user.username;
        userDiv.appendChild(btn);
        const img = document.createElement("img");
        img.height = "25"; img.width = "25";
        console.log(user.image);
        if(user.image){
            img.src = user.image; 
        }else {
            img.src = "./images/user.png"; 
        }
        userDiv.appendChild(img);
        usersOnline.appendChild(userDiv);
        /*const br = document.createElement('br');
        usersOnline.appendChild(br);*/
    });
}

//function to display messages
function outPut(msg){
    
    //creating the div
    const div = document.createElement('div');
    div.classList.add('message');

    //creating the first paragraph with time
    //and username
    const p = document.createElement('p');
    p.style = "color: white;";
    p.classList.add('meta');
    //p.innerText = message.username;
    //p.innerHTML += `<span>${message.time}</span>`;
    p.innerText = msg.username + ' ' + msg.time;
    div.appendChild(p);

    //creating another paragraph to put inside
    //the text of the message
    const paraText = document.createElement('p');
    paraText.style = "color: white;";
    paraText.classList.add('text');
    paraText.innerText = msg.text;
    div.appendChild(paraText);

    //appending countries links
    msg.countries.forEach(country => {
        let link = document.createElement('a');
        link.innerText = country;
        link.href = country;
        link.style = "color: white;";
        div.appendChild(link);
        const br = document.createElement('br');
        div.appendChild(br);
    })
    
    document.querySelector('.messages').appendChild(div);
    const br = document.createElement('br');
    document.querySelector('.messages').appendChild(br);
    
}

function displayFiles(bin){
    const div = document.createElement('div');
    div.classList.add('message');
    const p = document.createElement('p');
    p.innerText = bin.username + ' ' + bin.time;
    div.appendChild(p);
    const file = document.createElement('a');    
    file.href = bin.binary;
    file.target = "_blank";
    const image = document.createElement('img');
    image.classList.add('fileImage');
    image.src = '/images/files-a.jpg';
    file.appendChild(image);
    div.appendChild(file);
    document.querySelector('.messages').appendChild(div);
}

multimedia.addEventListener('change', (e)=>{
    const file = multimedia.files[0];
    
    console.log(file);
    let bin = {
        username : userP.username,
        binary : '',
        time : ''
    };
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(e){
        console.log(reader.result);
        bin.binary = reader.result;
        socket.emit('binary', bin);
    }
})