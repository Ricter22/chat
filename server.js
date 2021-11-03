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

        //joining a new room
        socket.on("new room", room =>{
            socket.leave(user.room);

            io.to(user.room).emit('message', msg={
                username: 'admin',
                text: user.username + ' has left the room',
                time: moment().format('h:mm a')
            })

            user.room = room;
            socket.join(user.room);

            socket.emit('message', msg={
                username: 'admin',
                text: 'Welcome to '+ user.room,
                time: moment().format('h:mm a')
            });

            socket.broadcast.to(user.room).emit('message', msg={
                username: 'admin',
                text: user.username + ' has joined ' + user.room,
                time: moment().format('h:mm a')
            });
        })

        //private messaging
        socket.on('private', id =>{

            //searching the user using the id
            let us = '';
            users.forEach(usr => {
                if (usr.id === id){
                    us = usr;
                }
            });

            //leaving the old room
            socket.leave(user.room);
            io.to(user.room).emit('message', msg={
                username: 'admin',
                text: user.username + ' has left the room',
                time: moment().format('h:mm a')
            })

            //checking if the receiver is already in the private room or not
            if (us.room === us.username+user.username){
                user.room = us.username+user.username;
                socket.join(user.room);
            }
            else{
                user.room = user.username+us.username;
                socket.join(user.room);
            }

            socket.to(id).emit('privConnection', msg= user.username + 
            " wants to chat with you!\nClick its username to start chatting privately(if it hasn't already joined you)!");

            socket.broadcast.to(user.room).emit('message', msg={
                username: 'admin',
                text: user.username + ' has joined the private chat',
                time: moment().format('h:mm a')
            });
            console.log(us.username + ' ' + us.room);
        })

        //listen for chat messages
        socket.on('chatMessage', msg =>{
        msg.time = moment().format('h:mm a');
        io.to(user.room).emit('message', msg);
        })

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
});

const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));