const functions = require("firebase-functions");

const app = require('express')(); 

const { signUp, logIn } = require('./handlers/users'); 
const { createMeeting, addGuests } = require('./handlers/meeting');
const { sendMessage } = require('./handlers/chat');
const fbAuth = require('./util/FBAuth'); 

// User routes 
app.post('/signup', signUp);
app.post('/login', logIn); 

//Meetin routes
//TODO: app.post('/user/createEvent', fbAuth, createMeeting);
app.post('/meeting', fbAuth, createMeeting); 
app.post("/meeting/addGuest/:eventId");
// Chat routes 
app.post('/chat/:chatId', fbAuth, sendMessage);
// TODO: chat message send route 

exports.api = functions.https.onRequest(app);