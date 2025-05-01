//const firebaseConfig = require('./pyra-center-firebase-adminsdk-ranud-12b440d2d4.json')
const firebaseConfig = require('./firebase.json')
const fbAdmin = require('firebase-admin')
const {Firestore} = require('@google-cloud/firestore');

/** FIRE BASE CONNECTION */
if(!global.firebase) {
  global.firebase = fbAdmin.initializeApp({credential:fbAdmin.credential.cert(firebaseConfig)})
}
console.log("..FIREBASE CONNECTED..")
