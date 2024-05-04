const firebase = require('firebase-admin');

const serviceAccount = require('../threddit-clone-app-firebase-adminsdk-wtua5-118fdbe10f.json');

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
});

module.exports = firebase;
