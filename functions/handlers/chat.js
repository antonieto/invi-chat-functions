const { db } = require("../util/admin");
const cors = require("cors")({ origin: true });

exports.sendMessage = (req, res) => {
  let event;

  const msgBody = {
    text: req.body.text,
    createdAt: new Date().toISOString(),
    handle: req.user.handle,
  };

  console.log(req.params.chatId);
  db.doc(`/chats/${req.params.chatId}`)
    .get()
    .then((doc) => {
      event = doc.data().eventId;
      return db.doc(`/events/${event}`).get();
    })
    .then((doc) => {
      if (doc.data().guests.includes(req.user.handle)) {
        return db
          .collection(`/chats/${req.params.chatId}/messages`)
          .add(msgBody);
      } else {
        return res.status(200).json({ msg: "You are NOT invited" });
      }
    })
    .then((doc) => {
      return res.status(200).json({ msg: `Message ${doc.id} sent` });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
