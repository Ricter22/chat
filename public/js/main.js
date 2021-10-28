const socket = io();

socket.on('message', (message) => {
    console.log(message); //the messages that we emit from the server are catched here
    outPut(message);
}); 

function outPut(message){
    //creating the div
    const div = document.createElement('div');
    div.classList.add('message');

    //creating the first paragraph with time
    //and username
    const p = document.createElement('p');
    p.classList.add('meta');
    //p.innerText = message.username;
    //p.innerHTML += `<span>${message.time}</span>`;
    p.innerText = 'username and time'
    div.appendChild(p);

    //creating another paragraph to put inside
    //the text of the message
    const paraText = document.createElement('p');
    paraText.classList.add('text');
    paraText.innerText = message;
    div.appendChild(paraText);
    document.querySelector('.messages').appendChild(div);
}