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

// Run when client connects
io.on('connection', socket => { //socket is a parameter    
    //Welcome current user
    socket.emit('message', 'Welcome to a chat');
    
    //Broadcast when a user connects    
    socket.broadcast.emit('message', 'A user has joined the chat'); //it notifies me when 
                                                                    //someone different than me connects
    //io.emit is for all clients in general
    
    //Runs when client disconnect
    socket.on('disconnect', () => {
        io.emit('message', 'A user has left the chat');
    });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));