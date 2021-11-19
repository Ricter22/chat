const path = require('path');
let alert = require('alert');
const http = require('http');
const express = require('express');
//const socketio = require('socket.io');
const moment = require('moment'); //time library
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/TEST').then(()=>{
    console.log('Database connected');
}).catch(err=>{
    console.log(err);
    })

const userFromDb = require('./models/userModelDb')


const app = express();
const server = http.createServer(app);
//const io = socketio(server);
const io = require("socket.io")(server, {
    maxHttpBufferSize: 1e8
  });

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended : true}));
app.use(express.json());

//importing functions for managing users
const { users, newUserList, removedUserList, isInList} = require('./utils/users.js');

let usernameFromLogin = '';

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/public/login.html'));
});

app.post('/auth', function(request, response) {
    var username = request.body.username;
    let flag = false;
    console.log(username);
    /*for(i = 0; i<users.length; i++){
        if (users[i].username == username){
            flag = true;
        }
    }*/

    userFromDb.findOne({'username': username}, 'username', function(err, result){
        if(err){ console.log("Error with the database");};
        console.log(result);
        if (result != null){
            flag = true;
        }
        console.log(flag);
        if(flag){
            alert("Invalid username");
            response.redirect('login.html');
        }
        else{
                usernameFromLogin = username;
                const userSavedInDb = new userFromDb({username:username});
                userSavedInDb.save();
                response.redirect('homePage.html');
            }
    })

    

    /*if(flag){
        alert("Invalid username");
        response.redirect('login.html');
    }
    else{
            usernameFromLogin = username;
            const userSavedInDb = new userFromDb({username:username});
            userSavedInDb.save();
            response.redirect('homePage.html');
        }*/
});


// Run when client connects
io.on('connection', socket => { //socket is a parameter    


        const user = {
            username: usernameFromLogin,
            id: socket.id,
            room: "room"
        };

        socket.emit('userProperties', user);

        //joining the global room
        socket.join(user.room);

        //adding the new user to the list 
        //and emitting the updated list to client
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

            //notification for a user that leaves a room, 
            //but doesn't disconnect
            io.to(user.room).emit('message', msg={
                username: 'admin',
                text: user.username + ' has left the room',
                time: moment().format('h:mm a')
            })

            //changing the room parameter of the user and 
            //joining the new room
            user.room = room;
            socket.join(user.room);

            //welcoming the new user in the room
            socket.emit('message', msg={
                username: 'admin',
                text: 'Welcome to '+ user.room,
                time: moment().format('h:mm a')
            });

            //emitting to users of a room that a new users joined the room
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
            //and depending on that join a room or another
            if (us.room === us.username+user.username){
                user.room = us.username+user.username;
                socket.join(user.room);
            }
            else{
                user.room = user.username+us.username;
                socket.join(user.room);
            }

            //notification for the user that somebody is trying to contact him
            //in a private chat
            socket.to(id).emit('privConnection', msg= user.username + 
            " wants to chat with you!\nClick its username to start chatting privately(if it hasn't already joined you)!");

            //notification for a user that the other user is in the private chat
            socket.broadcast.to(user.room).emit('message', msg={
                username: 'admin',
                text: user.username + ' has joined the private chat',
                time: moment().format('h:mm a')
            });
        
        })

        socket.on('binary', bin =>{
            bin.time = moment().format('h:mm a');
            console.log(bin.username);
            io.to(user.room).emit('file', bin);
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

            //updating the list and sending it back to client
            removedUserList(user);
            io.emit('user', users);

        });
    
});

const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));