// index.js

// 1. Import all the necessary libraries
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

// 2. Setup the Express App
const app = express();
app.use(cors());         // Enable CORS for all routes
app.use(express.json()); // Allow the server to understand JSON from request bodies

// 3. Initialize the Firebase Admin SDK
// This uses the key file you downloaded to give your server access to your Firebase project
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Create a shorthand for the Firestore database
const db = admin.firestore();

// --- API FUNCTIONS TO IMPLEMENT TODAY ---

/**
 * @function /api/register
 * @description Registers a new user in the system.
 * @method POST
 * @body {
 * "email": "test@example.com",
 * "password": "password123",
 * "name": "John Doe",
 * "role": "donor", // Can be 'donor' or 'recipient'
 * "bloodType": "O+" // Required if role is 'donor'
 * }
 */
app.post('/api/register', async (req, res) => {
  try {
    // Get the user data from the request body
    const { email, password, name, role, bloodType } = req.body;

    // --- Data Validation ---
    if (!email || !password || !name || !role) {
      return res.status(400).send({ message: "Email, password, name, and role are required." });
    }
    if (role === 'donor' && !bloodType) {
        return res.status(400).send({ message: "Blood type is required for donors." });
    }

    // --- Step 1: Create the user in Firebase Authentication ---
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: name,
    });

    // --- Step 2: Store additional user details in Firestore ---
    // We create a document in the 'users' collection. The ID of the document is the user's unique UID from Authentication.
    const userRef = db.collection('users').doc(userRecord.uid);
    
    // Prepare the data object to save
    const userData = {
        name: name,
        email: email,
        role: role,
    };

    // Add donor-specific fields if the role is 'donor'
    if (role === 'donor') {
        userData.bloodType = bloodType;
        userData.lastDonationDate = null; // Set to null initially
    }
    
    await userRef.set(userData);

    // --- Step 3: Send a success response ---
    console.log(`Successfully created new user: ${name} (${userRecord.uid})`);
    res.status(201).send({
      message: 'User created successfully!',
      uid: userRecord.uid
    });

  } catch (error) {
    // If an error occurs (e.g., email already exists), send a server error response
    console.error("Error creating user:", error.message);
    res.status(500).send({ message: "Error creating user", error: error.code });
  }
});


// 4. Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});