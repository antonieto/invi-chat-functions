const { db, admin } = require('../util/admin'); 
const config = require('../util/config');

const { validateSignUp, validateLogIn } = require('../util/validators');

const firebase = require('firebase').default
// firebase.initializeApp(config)

exports.invite = (req,res) => {
    const newInvi = {
        from: req.user.handle, 
        to: req.body.to, 
        eventId: req.params.eventId,
        createdAt: new Date().toISOString()
    }

    db.doc(`/events/${newInvi.eventId}`).get() 
    .then(doc => {
        if(doc.data().owner !== req.user.handle){
            return res.status(401).json({error: "You do not have permission"});
        } 
    }) 
    .catch(err => {
        console.error(err); 
        return res.status(500).json({error: err.code});
    })

    db.doc(`/users/${newInvi.to}`).get() 
    .then(doc => {
        if(!doc.exists){
            return res.status(404).json({error: 'User invitated not found'});
        } else {
            return db.collection('/invitations').add(newInvi)
        }
    })
    .then(doc => {
        return res.status(200).json({msg: `Invitation sent to ${newInvi.to}`});
    })  
    .catch(err => {
        console.error(err); 
        return res.status(500).json({error: err.code});
    })

}

exports.acceptInvi = (req,res) => {

    let eventId;

    // Steps 
    // Verify that req.user.handle is inside the invitation to accept

    db.doc(`/invitations/${req.params.invitationId}`).get() 
    .then(doc => {
        if(!doc.exists){
            return res.status(404).json({error: 'Event not found'});
        
        } else if( doc.data().to != req.user.handle ) { // Veryfies the user accepting the invitation is actually the one invited
            return res.status(401).json({error: 'Unauthorized'}) 
        
        } else { 
            return db.doc(`/events/${doc.data().eventId}`).get(); //All verified, adding sender to event.guests
    
        }
    }) 
    .then(doc => {
        // Agregar req.user.handle a event 
        const guests = doc.data().guests; 
        guests.push(req.user.handle); 
        // Hacer update 
        eventId = doc.id; 
        console.log(doc.data());
        // return db.doc(`/events/${doc.data().eventId}`).update({guests}); 
        return db.doc(`/events/${doc.id}`).update({guests});
    }) 
    .then(() => {
        // Deleting the invitation 
        return db.doc(`/invitations/${req.params.invitationId}`).delete()
    })
    .then(() => {
        return res.status(200).json({msg: `Invitation to ${eventId} accepted`});
    }) 
    .catch(err => { 
        console.error(err); 
        return res.status(500).json({error: err.code});
    })

}

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
