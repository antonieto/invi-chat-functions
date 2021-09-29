// Aquí deben de ir las funciones de Login y Signup 

const { db, admin } = require('../util/admin'); 
const config = require('../util/config');

const { validateSignUp, validateLogIn } = require('../util/validators');

const firebase = require('firebase').default
firebase.initializeApp(config)

exports.signUp = (req, res)=>{

    const newUser = { 
        email: req.body.email, 
        password: req.body.password, 
        confirmPassword: req.body.password, 
        handle: req.body.handle
    }    

    // Validar newUser data 

    const { valid, errors } = validateSignUp(newUser); 
    if(!valid) return res.status(400).json(errors);

    // newUser validado, procediendo 

    let token, userId;
    db.doc(`/users/${newUser.handle}`).get() //Esta linea "obtiene" el documento con esa ubicacion.
    .then( doc => { 
        // Se checa que no exista el mismo usuario registrado
        if(doc.exists){
            return res.status(400).json({error: 'Handle alrleady taken'});
        } else { 
            // No existe, entonces se crea el usuario con las funciones incluidas con firebase
            return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password); 
            // Retorna una promesa
        }
    }) 
    .then( data => { 
        userId = data.user.uid; 
        return data.user.getIdToken();
    }) 
    .then( idToken => { 
        token = idToken; // Almacenamos el token 
        const userCredentials = { 
            handle: newUser.handle, 
            email: newUser.email, 
            createdAt: new Date().toISOString(), 
            userId //La clave en el documento y el valor son iguales 
        } 
        return db.doc(`/users/${newUser.handle}`).set(userCredentials); 
    }) 
    .then(()=>{
        return res.status(200).json({msg: 'User created succesfully', token});
    }) 
    .catch(err => { 
        if(err === "auth/user-already-in-use"){
            return res.status(400).json({email: 'Error: email already in use'});
        } else {
            return res.status(500).json({error: err.code});
        }
    })


} 

// Login 

exports.logIn = (req, res)=>{
    // Se utiliza firebase.auth, signIn with email and password
    
    const user = { 
        email: req.body.email, 
        password: req.body.password
    } 
    console.log(user.email, user.password);
    
    // Primero se validan los datos 
    const { errors, valid } = validateLogIn(user); 
    if(!valid) return res.status(400).json(errors); 

    console.log("Here");

    //Login validado, proceder a autenticar 
    firebase.auth().signInWithEmailAndPassword(user.email, user.password) 
        .then(data => { 
            console.log("here");
            return data.user.getIdToken();
        })
        .then( token => { 
            return res.status(200).json({token}); 
        }) 
        .catch(err => {
            if(err. code === 'auth/wrond-password'){
                return res.status(403).json({error: 'Incorrect password'});
            } else { 
                console.error(err.code);
                return res.status(500).json({error: err.code});
            }
        })

}