const functions = require("firebase-functions");

const app = require('express')(); 

const { signUp, logIn } = require('./handlers/users'); 
<<<<<<< HEAD
const { createMeeting, addGuests } = require('./handlers/meeting');
=======
const { createMeeting, addGuest, sendInvi } = require('./handlers/meeting');
>>>>>>> dev
const { sendMessage } = require('./handlers/chat');
const fbAuth = require('./util/FBAuth'); 

// User routes 
app.post('/signup', signUp);
app.post('/login', logIn); 

//Meeting routes
//TODO: app.post('/user/createEvent', fbAuth, createMeeting);
app.post('/meeting', fbAuth, createMeeting); 
<<<<<<< HEAD
app.post("/meeting/addGuest/:eventId");
=======
// app.post('/meeting/addGuest/:eventId', fbAuth, addGuest); 
app.post('/meeting/sendInvi/:eventId', fbAuth, sendInvi);

>>>>>>> dev
// Chat routes 
app.post('/chat/:chatId', fbAuth, sendMessage);
// TODO: chat message send route 

exports.api = functions.https.onRequest(app);