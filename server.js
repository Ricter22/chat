const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

//This is a comment

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

//users list
const users = [];

// Run when client connects
io.on('connection', socket => { //socket is a parameter    
    //Welcome current user
    socket.emit('message', 'welcome to MELO chat');
    
    //Broadcast when a user connects
    //it notifies me when someone different than me connects
    socket.broadcast.emit('message', ' has joined the chat'); 
    
    //Runs when client disconnect
    //io.emit is for all clients in general
    socket.on('disconnect', () => {
        io.emit('message', ' has left the chat');
    });

    //listen for chat messages
    socket.on('chatMessage', msgText =>{
        console.log(msgText);
        io.emit('message', msgText);
    })

    socket.on('joinUser', userName =>{
        users.push(userName);
        io.emit('user', users);
    });
});


const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));