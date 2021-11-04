const functions = require("firebase-functions");
const cors = require("cors");

const app = require("express")();
app.use(cors());

const {
  signUp,
  logIn,
  getAllUsers,
  getUserMeetings,
  verifyToken,
} = require("./handlers/users");
const {
  createMeeting,
  invite,
  acceptInvi,
  getMeeting,
  invite2,
  deleteMeeting,
  kickFromMeeting,
  declineInvi,
} = require("./handlers/meeting");
const { sendMessage } = require("./handlers/chat");
const fbAuth = require("./util/FBAuth");

// User routes
app.post("/signup", signUp);
app.post("/login", logIn);
app.get("/users", getAllUsers);
app.get("/user/getMeetings", fbAuth, getUserMeetings);
app.get("/verifyToken", fbAuth, verifyToken);

//Meeting routes
app.post("/meeting", fbAuth, createMeeting);
app.get("/meeting/:meetingId", fbAuth, getMeeting);

app.post("/meeting/invite/:eventId", fbAuth, invite);
app.post("/meeting/accept/:invitationId", fbAuth, acceptInvi);
app.delete("/meeting/delete/:meetingId", fbAuth, deleteMeeting);
app.post("/meeting/kick/:meetingId&:userHandle", fbAuth, kickFromMeeting);
app.delete("/meeting/decline/:invitationId", fbAuth, declineInvi);

// Chat routes
app.post("/chat/:chatId", fbAuth, sendMessage);

exports.api = functions.https.onRequest(app);
