const { db, admin } = require("../util/admin");
const config = require("../util/config");

const {
  validateSignUp,
  validateLogIn,
  validateMeeting,
} = require("../util/validators");

const firebase = require("firebase").default;
// firebase.initializeApp(config)

exports.invite = (req, res) => {
  const newInvi = {
    from: req.user.handle,
    to: req.body.to,
    eventId: req.params.eventId,
    createdAt: new Date().toISOString(),
  };

  // First, check user isn't in meeting yet
  db.doc(`/events/${newInvi.eventId}`)
    .get()
    .then((doc) => {
      const { guests } = doc.data();
      if (guests.includes(newInvi.to)) {
        return res.status(403).json({ error: "User is already in meeting!" });
      } else {
        // If user is not in meeting, check if it hasnt been invited yet
        return db
          .collection("/invitations")
          .where("to", "==", newInvi.to)
          .where("eventId", "==", newInvi.eventId)
          .get();
      }
    })
    .then((docs) => {
      if (!docs.empty) {
        return res
          .status(403)
          .json({ error: `${newInvi.to} is already invited!` });
      } else {
        // Not invited and not in meeting, proceeding
        // Verify that the sender is the owner of the meeting
        return db.doc(`/events/${newInvi.eventId}`).get();
      }
    })
    .then((doc) => {
      // If the sender isnt admin, return error
      if (doc.data().owner !== newInvi.from) {
        return res.status(401).json({ error: "You do not have permission" });
      }
      // If user invited himself, return error
      else if (newInvi.from === newInvi.to) {
        return res.status(400).json({ error: "Invalid invitation" });
      } else {
        return db.doc(`/users/${newInvi.to}`).get();
      }
    })
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "User not found" });
      } else {
        return db.collection("/invitations").add(newInvi);
      }
    })
    .then(() => {
      return res.status(200).json({ msg: `Invitation sent to ${newInvi.to}` });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

exports.acceptInvi = (req, res) => {
  let eventId;

  // Steps
  // Verify that req.user.handle is inside the invitation to accept

  db.doc(`/invitations/${req.params.invitationId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Event not found" });
      } else if (doc.data().to != req.user.handle) {
        // Veryfies the user accepting the invitation is actually the one invited
        return res.status(401).json({ error: "Unauthorized" });
      } else {
        return db.doc(`/events/${doc.data().eventId}`).get(); //All verified, adding sender to event.guests
      }
    })
    .then((doc) => {
      // Agregar req.user.handle a event
      const guests = doc.data().guests;
      guests.push(req.user.handle);
      // Hacer update
      eventId = doc.id;
      console.log(doc.data());
      // return db.doc(`/events/${doc.data().eventId}`).update({guests});
      return db.doc(`/events/${doc.id}`).update({ guests });
    })
    .then(() => {
      // Deleting the invitation
      db.doc(`/invitations/${req.params.invitationId}`).delete();
    })
    .then(() => {
      return res.status(200).json({ msg: `Invitation to ${eventId} accepted` });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

exports.declineInvi = (req, res) => {
  // Verify invitation exists
  const invi = req.params.invitationId;
  db.doc(`/invitations/${invi}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Invitation does not exist" });
      } else {
        // If invitation exists and user is the one invited, delete invitation
        if (doc.data().to === req.user.handle) {
          return db.doc(`/invitations/${invi}`).delete();
        }
      }
    })
    .then(() => {
      return res.status(200).json({ msg: "Invitation declined successfully" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

exports.createMeeting = (req, res) => {
  let chatId, eventId, newChat;
  const uData = {};
  uData[req.user.handle] = req.user.uid;

  const meetingData = {
    title: req.body.title,
    owner: req.user.handle,
    description: req.body.description,
    location: req.body.location,
    createdAt: new Date().toISOString(),
    chatId: "",
    guests: [req.user.handle],
  };
  //TODO: Validate data
  const { errors, valid } = validateMeeting(meetingData);
  if (!valid) return res.status(400).json({ errors });
  // Data validated
  db.collection("/events")
    .add(meetingData)
    .then((doc) => {
      eventId = doc.id;
      // Chat initialized
      newChat = {
        owner: req.user.handle,
        eventId: eventId,
        createdAt: new Date().toISOString(),
      };
      return newChat;
    })
    .then((newChat) => {
      db.collection("/chats")
        .add(newChat)
        .then((doc) => {
          chatId = doc.id;
          return chatId;
        })
        .then((chatId) => {
          db.doc(`/events/${eventId}`).update({ chatId });
        })
        .then(() => {
          return res.status(200).json({
            message: `Event ${eventId} and chat ${chatId} created succesfully`,
            eventId,
            chatId,
          });
        });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

exports.getMeeting = (req, res) => {
  db.doc(`/events/${req.params.meetingId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ message: "meeting not fonud" });
      } else {
        return res.status(200).json(doc.data());
      }
    });
};

exports.deleteMeeting = (req, res) => {
  // Delete chat first
  db.doc(`/events/${req.params.meetingId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Meeting not found" });
      } else if (req.user.handle !== doc.data().owner) {
        return res.status(403).json({ error: "Forbidden request" });
      } else {
        return db.doc(`/chats/${doc.data().chatId}`).delete();
      }
    })
    .then(() => {
      return db.doc(`/events/${req.params.meetingId}`).delete();
    })
    .then(() => {
      return res
        .status(200)
        .json({ msg: `Meeting ${req.params.meetingId} deleted successfully` });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

exports.kickFromMeeting = (req, res) => {
  let guestList;
  const toKick = req.params.userHandle;
  db.doc(`/events/${req.params.meetingId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Meeting not found" });
      } else if (req.user.handle !== doc.data().owner) {
        // Check if
        return res.status(403).json({ error: "Forbidden request" });
      } else {
        // Proceed to delete
        guestList = doc.data().guests;
        if (guestList.includes(toKick)) {
          guestList.splice(guestList.indexOf(toKick), 1);
          return db
            .doc(`/events/${req.params.meetingId}`)
            .update({ guests: guestList });
        } else {
          return res.status(404).json({ error: "User is not invited yet" });
        }
      }
    })
    .then(() => {
      return res
        .status(200)
        .json({ msg: `User ${toKick} kicked successfully` });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
