const path = require('path');
let alert = require('alert');
const http = require('http');
const express = require('express');
const bcrypt = require('bcrypt');
//const userModel = require('./models/userModelDb');
const multer = require('multer');
//const socketio = require('socket.io');
const moment = require('moment'); //time library
//Database connection
const mongoose = require('mongoose');

//chat-db or localhost
mongoose.connect('mongodb://chat-db:27017/TEST', {
    useNewUrlParser: true,
    
}).then(()=>{
    console.log('Database connected...');
}).catch(err=>{
    console.log(err);
    })

const userFromDb = require('./models/userModelDb');
const messagesFromDb = require('./models/messagesModelDb');
/*const uploadModel = require('./models/imageModelDb');*/


const app = express();
const server = http.createServer(app);
//const io = socketio(server);
const io = require("socket.io")(server, {
    maxHttpBufferSize: 1e8,
  });


// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended : true}));
app.use(express.json());

//importing functions for managing users, messages and credentials
const { users, newUserList, removedUserList, isInList} = require('./utils/users.js');
const {Parsing} = require('./utils/mexParsing.js');

let usernameFromLogin = '';

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/public/login.html'));
});

const Storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename:(req,file,cb)=>{
        cb(null, file.fieldname+"_"+Date.now()+path.extname(file.originalname));
    }
});

const upload = multer({
    storage:Storage
}).single('file');

app.post('/register', upload, function(request, response){
    let username = request.body.username;
    let password = request.body.psw;
    let image = request.body.file;
    
userFromDb.findOne({'username': username/*, 'password':password*/}, function(err, result){
        if(err){ console.log("Error with the database");};
        
        if(result!=null){
            response.redirect('login.html');
        }
        else{
            const userSavedInDb = new userFromDb({username:username, password:password, image:image});
            userSavedInDb.save();
            response.redirect('login.html');
        }
    })
});

app.post('/auth', function(request, response) {
    let username = request.body.username;
    let password = request.body.password;
    let flag = false;
    console.log(username);
    users.forEach( user => {
        if (user.username == username){
            flag = true;
        }
    })

    //here we search the username in the database, if we find it we search 
    //his encrypted password and compare it with the password that we receive from the post
    userFromDb.findOne({'username': username}, function(err, result){
        if(err){ console.log("Error with the database");};

        if(result==null || flag){
            alert("Invalid username e/o password");
            response.redirect('login.html');
        }
        else{   
            result.comparePassword(password, function(err, isMatch) {
                if (err) throw err;
                //console.log(password, isMatch);
                if (isMatch){
                    usernameFromLogin = username;
                    response.redirect('homePage.html');
                }else{
                    alert("Invalid username e/o password");
                    response.redirect('login.html');
                }
            });
        }
    })
});


// Run when client connects
io.on('connection', socket => { //socket is a parameter    

        const user = {
            username: usernameFromLogin,
            id: socket.id,
            room: "room"
            /*image: user.image;*/
        };

        socket.on('userConnected', userConnected =>{
            user.username = userConnected.username;
            socket.emit('userProperties', user);
            io.emit('user', users);
            /*newUserList(user);
            io.emit('user', users);*/
        })

        socket.emit('userProperties', user);

        //joining the global room
        socket.join(user.room);

        //here I want to upload all the previous messages of the room I'm entering
        messagesFromDb.find({'room': user.room}, function(err, result){
            //here we send the array of old messages to the client 
            //so that we can display it
            socket.emit('oldMessages', result);
        })

        //adding the new user to the list 
        //and emitting the updated list to client
        newUserList(user);
        io.emit('user', users);

        //Welcome current user
        socket.emit('message', msg={
            username: 'admin',
            text: 'Welcome to MELO chat!',
            time: moment().format('h:mm a'),
            countries: []
        });
        
        //Broadcast when a user connects
        //it notifies me when someone different than me connects
        socket.broadcast.to(user.room).emit('message', msg={
            username: 'admin',
            text: user.username + ' has joined the chat!',
            time: moment().format('h:mm a'),
            countries: []
        }); 

        //joining a new room
        socket.on("new room", room =>{
            socket.leave(user.room);

            //notification for a user that leaves a room, 
            //but doesn't disconnect
            io.to(user.room).emit('message', msg={
                username: 'admin',
                text: user.username + ' has left the room',
                time: moment().format('h:mm a'),
                countries: []
            })

            //changing the room parameter of the user and 
            //joining the new room
            user.room = room;
            socket.join(user.room);
            socket.emit('userProperties', user);

            //here I want to upload all the previous messages of the room I'm entering
            messagesFromDb.find({'room': user.room}, function(err, result){
                //here we send the array of old messages to the client 
                //so that we can display it
                socket.emit('oldMessages', result);
            })

            //welcoming the new user in the room
            socket.emit('message', msg={
                username: 'admin',
                text: 'Welcome to '+ user.room,
                time: moment().format('h:mm a'),
                countries: []
            });

            //emitting to users of a room that a new users joined the room
            socket.broadcast.to(user.room).emit('message', msg={
                username: 'admin',
                text: user.username + ' has joined ' + user.room,
                time: moment().format('h:mm a'),
                countries: []
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
                time: moment().format('h:mm a'),
                countries: []
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
            socket.emit('userProperties', user);

            //here I want to upload all the previous messages of the room I'm entering
            messagesFromDb.find({"$or": [
                {"room": user.username+us.username}, 
                {"room": us.username+user.username}
            ]}, function(err, result){
                //here we send the array of old messages to the client 
                //so that we can display it
                socket.emit('oldMessages', result);
            })

            //notification for the user that somebody is trying to contact him
            //in a private chat
            socket.to(id).emit('privConnection', msg= user.username + 
            " wants to chat with you!\nClick its username to start chatting privately(if it hasn't already joined you)!");

            //notification for a user that the other user is in the private chat
            socket.broadcast.to(user.room).emit('message', msg={
                username: 'admin',
                text: user.username + ' has joined the private chat',
                time: moment().format('h:mm a'),
                countries: []
            });
        
        })

        socket.on('binary', bin =>{
            bin.time = moment().format('h:mm a');
            console.log(bin.username);
            io.to(user.room).emit('file', bin);
        })

        /*socket.on('profilePic', bin =>{
            bin.t
        })*/

        //listen for chat messages
        //here I receive the message from the client
        //so first thing I want to do is to save the message in the database
        socket.on('chatMessage', msg =>{
        msg.time = moment().format('h:mm a');

        //Parsing the message
        msg.countries = Parsing(msg.text)[0];
        msg.text = Parsing(msg.text)[1];

        //qui voglio salvare il messaggio nel database
        const msgSavedInDb = new messagesFromDb({username:msg.username, text:msg.text, time:msg.time, room:user.room, countries:msg.countries});
        msgSavedInDb.save().then(()=>{
            io.to(user.room).emit('message', msg);
            })
        })

        //Runs when client disconnect
        //io.emit is for all clients in general
        socket.on('disconnect', () => {
            io.to(user.room).emit('message', msg={
                username: 'admin',
                text: user.username + ' has left the chat!',
                time: moment().format('h:mm a'),
                countries: []
            });

            //updating the list and sending it back to client
            removedUserList(user);
            io.emit('user', users);

            
        });
    
});

const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));