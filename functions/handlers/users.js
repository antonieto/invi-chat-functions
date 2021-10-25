// Aquí deben de ir las funciones de Login y Signup

const { db, admin } = require("../util/admin");
const config = require("../util/config");
const cors = require("cors")({ origin: true });

const { validateSignUp, validateLogIn } = require("../util/validators");

const firebase = require("firebase").default;
firebase.initializeApp(config);

exports.signUp = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.password,
    handle: req.body.handle,
  };

  // Validar newUser data

  const { valid, errors } = validateSignUp(newUser);
  if (!valid) return res.status(400).json(errors);

  // newUser validado, procediendo

  let token, userId, userCredentials;
  db.doc(`/users/${newUser.handle}`)
    .get() //Esta linea "obtiene" el documento con esa ubicacion.
    .then((doc) => {
      // Se checa que no exista el mismo usuario registrado
      if (doc.exists) {
        return res.status(400).json({ error: "Handle alrleady taken" });
      } else {
        // No existe, entonces se crea el usuario con las funciones incluidas con firebase
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
        // Retorna una promesa
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken; // Almacenamos el token
      userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId,
        currentMeetings: [], //La clave en el documento y el valor son iguales
      };
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(200).json({ token, data: userCredentials });
    })
    .catch((err) => {
      if (err === "auth/user-already-in-use") {
        return res.status(400).json({ email: "Error: email already in use" });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
};

// Login

exports.logIn = (req, res) => {
  // Se utiliza firebase.auth, signIn with email and password
  let userToken, userData;
  cors(req, res, () => {
    const user = {
      email: req.body.email,
      password: req.body.password,
    };
    // Primero se validan los datos
    const { errors, valid } = validateLogIn(user);
    if (!valid) return res.status(400).json(errors);

    //Login validado, proceder a autenticar
    firebase
      .auth()
      .signInWithEmailAndPassword(user.email, user.password)
      .then((data) => {
        return data.user.getIdToken();
      })
      .then((token) => {
        userToken = token;
        return admin.auth().verifyIdToken(token);
      })
      .then((decodedToken) => {
        return db
          .collection("users")
          .where("userId", "==", decodedToken.uid)
          .limit(1)
          .get();
      })
      .then((data) => {
        userData = data.docs[0].data();
        return res.status(200).json({ token: userToken, data: userData });
      })
      .catch((err) => {
        if (err.code === "auth/wrong-password") {
          return res.status(403).json({ error: "Incorrect password" });
        } else {
          console.error(err.code);
          return res.status(500).json({ error: err.code });
        }
      });
  });
};

exports.getAllUsers = (req, res) => {
  cors(req, res, () => {
    db.collection("/users")
      .get()
      .then((docs) => {
        let arr = [];
        docs.forEach((doc) => {
          arr.push(doc.data());
        });
        return arr;
      })
      .then((arr) => {
        return res.status(200).json({ data: arr });
      });
  });
};

// Route to get events owned by user

exports.getUserMeetings = (req, res) => {
  cors(req, res, () => {
    db.collection("/events")
      .where("owner", "==", req.user.handle)
      .get()
      .then((docs) => {
        let arr = [];
        docs.forEach((doc) => {
          arr.push(doc.data());
        });
        return arr;
      })
      .then((arr) => {
        return res.status(200).json({ data: arr });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: err.code });
      });
  });
};
