const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const moment = require('moment'); //time library

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const { users, newUserList, removedUserList} = require('./utils/users.js');


// Run when client connects
io.on('connection', socket => { //socket is a parameter    

    //put everything inside to use the user scope
    socket.on('joinUser', user =>{

        socket.join(user.room);

        user.id = socket.id;
        
        newUserList(user);
        io.emit('user', users);

        //Welcome current user
        socket.emit('message', msg={
            username: 'admin',
            text: 'Welcome to MELO chat!',
            time: moment().format('h:mm a')
        });
        
        //Broadcast when a user connects
        //it notifies me when someone different than me connects
        socket.broadcast.to(user.room).emit('message', msg={
            username: 'admin',
            text: user.username + ' has joined the chat!',
            time: moment().format('h:mm a')
        }); 
        
        //Runs when client disconnect
        //io.emit is for all clients in general
        socket.on('disconnect', () => {
            
            io.to(user.room).emit('message', msg={
                username: 'admin',
                text: user.username + ' has left the chat!',
                time: moment().format('h:mm a')
            });

            removedUserList(user);
            io.emit('user', users);

        });
    });

    //listen for chat messages
    socket.on('chatMessage', msg =>{
        msg.time = moment().format('h:mm a');
        io.emit('message', msg);
    })

    
});


const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));