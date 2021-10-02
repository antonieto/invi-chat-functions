const functions = require("firebase-functions");

const app = require('express')(); 

const { signUp, logIn } = require('./handlers/users'); 
const { createMeeting, invite, acceptInvi } = require('./handlers/meeting');
const { sendMessage } = require('./handlers/chat');
const fbAuth = require('./util/FBAuth'); 

// User routes 
app.post('/signup', signUp);
app.post('/login', logIn); 

//Meeting routes
app.post('/meeting', fbAuth, createMeeting); 

app.post('/meeting/invite/:eventId', fbAuth, invite);
app.post('/meeting/accept/:invitationId', fbAuth, acceptInvi);

// Chat routes 
app.post('/chat/:chatId', fbAuth, sendMessage);

exports.api = functions.https.onRequest(app);