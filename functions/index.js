const functions = require("firebase-functions");

const app = require('express')(); 

const { signUp, logIn, acceptInvi } = require('./handlers/users'); 
const { createMeeting, sendInvi } = require('./handlers/meeting');
const { sendMessage } = require('./handlers/chat');
const fbAuth = require('./util/FBAuth'); 

// User routes 
app.post('/signup', signUp);
app.post('/login', logIn); 
app.post('/accept/:invitationId', fbAuth, acceptInvi);

//Meeting routes
//TODO: app.post('/user/createEvent', fbAuth, createMeeting);
app.post('/meeting', fbAuth, createMeeting); 
// app.post('/meeting/addGuest/:eventId', fbAuth, addGuest); 
app.post('/meeting/sendInvi/:eventId', fbAuth, sendInvi);

// Chat routes 
app.post('/chat/:chatId', fbAuth, sendMessage);
// TODO: chat message send route 

exports.api = functions.https.onRequest(app);