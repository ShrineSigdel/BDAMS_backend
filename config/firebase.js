const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Environment check for emulator
const isEmulator = true; // for development use

if (isEmulator) {
  // Configure emulator endpoints
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
}

//Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'bdams-f241f' 
});

const db = admin.firestore();

if (isEmulator) {
  // Set Firestore to use local emulator
  db.settings({
    host: 'localhost:8080',
    ssl: false
  });
}

module.exports = { admin, db };