const mongoose = require('mongoose');

const messagesSchema = new mongoose.Schema({
    //sender
    username: String,
    text: String,
    time: String,
    //room receiver
    room: String,
    countries: Array
    
  });


const messages = mongoose.model('messages', messagesSchema);
module.exports = messages;