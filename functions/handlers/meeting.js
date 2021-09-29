const { db, admin } = require('../util/admin'); 
const config = require('../util/config');

const { validateSignUp, validateLogIn } = require('../util/validators');

const firebase = require('firebase').default
// firebase.initializeApp(config)

exports.createMeeting = (req,res) => {
    let chatId, eventId, newChat;
    const uData = {}
    uData[req.user.handle] = req.user.uid;

    const meetingData = { 
        title: req.body.title,
        owner: req.user.handle, 
        description: req.body.description, 
        createdAt: new Date().toISOString(), 
        chatId: '',
        guests: [req.user.handle]
    };
    //TODO: Validate data 

    // Data validated
    db
    .collection('/events') 
    .add(meetingData)
    .then(doc => {
        eventId = doc.id; 
        // Chat initialized
        newChat = { 
            owner: req.user.handle,
            eventId: eventId, 
            createdAt: new Date().toISOString()
        }   
        return newChat;     
    }) 
    .then( (newChat)=> {
        db
        .collection('/chats') 
        .add(newChat) 
        .then(doc => {
            chatId = doc.id; 
            return chatId;
        }) 
        .then(chatId => {
            db.doc(`/events/${eventId}`).update({chatId});  
            return res.status(200).json({message: `Event ${eventId} and chat ${chatId} created succesfully`});
        })
    }) 
    .catch(err =>{
        console.error(err)     
        return res.status(500).json({error: err.code})
    });

} 
