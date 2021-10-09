const functions = require("firebase-functions");
const cors = require("cors");

const app = require("express")();
app.use(cors());

const { signUp, logIn, getAllUsers } = require("./handlers/users");
const { createMeeting, invite, acceptInvi } = require("./handlers/meeting");
const { sendMessage } = require("./handlers/chat");
const fbAuth = require("./util/FBAuth");

// User routes
app.post("/signup", signUp);
app.post("/login", logIn);
app.get("/users", getAllUsers);

//Meeting routes
app.post("/meeting", fbAuth, createMeeting);

app.post("/meeting/invite/:eventId", fbAuth, invite);
app.post("/meeting/accept/:invitationId", fbAuth, acceptInvi);

// Chat routes
app.post("/chat/:chatId", fbAuth, sendMessage);

exports.api = functions.https.onRequest(app);
