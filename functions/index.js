const functions = require("firebase-functions");

const app = require('express')(); 

const { signUp, logIn } = require('./handlers/users'); 
const { createMeeting } = require('./handlers/meeting');
const fbAuth = require('./util/FBAuth'); 

// User routes 
app.post('/signup', signUp);
app.post('/login', logIn); 

//Meetin routes
//TODO: app.post('/user/createEvent', fbAuth, createMeeting);
app.post('/meeting', fbAuth, createMeeting); 

// Chat routes 
app.post('/chat:cha', chatAuth, sendChat);
// TODO: chat message send route 

exports.api = functions.https.onRequest(app);