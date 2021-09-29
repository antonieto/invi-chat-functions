const functions = require("firebase-functions");

const app = require('express')(); 

const { signUp, logIn } = require('./handlers/users'); 
const fbAuth = require('./util/FBAuth');


// User routes 
app.post('/signup', signUp);
app.post('/login', logIn);

// app.get('/get', (req, res)=> { 
    
// })

exports.api = functions.https.onRequest(app);