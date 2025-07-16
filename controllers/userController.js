const { admin, db } = require('../config/firebase');

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { email, password, name, role, bloodType } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).send({ message: "Required fields missing" });
    }
    if (role === 'donor' && !bloodType) {
      return res.status(400).send({ message: "Blood type required for donors." });
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name
    });

    const userData = {
      name,
      email,
      role,
      ...(role === 'donor' && { bloodType, lastDonationDate: null })
    };

    await db.collection('users').doc(userRecord.uid).set(userData);

    res.status(201).send({ message: 'User created!', uid: userRecord.uid });
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).send({ message: "Error", error: error.code });
  }
};

// Get profile
const getProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).send({ message: 'User not found' });
    }

    res.status(200).send(userDoc.data());
  } catch (error) {
    res.status(500).send({ message: "Error fetching profile." });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const profileData = req.body;

    delete profileData.email;
    delete profileData.role;

    await db.collection('users').doc(uid).update(profileData);

    res.status(200).send({ message: "Profile updated!" });
  } catch (error) {
    res.status(500).send({ message: "Error updating profile." });
  }
};

/**
 * @function POST /api/requests/:id/complete
 * @description (Recipient/Admin) Confirms a donation is complete.
 * @protected
 */



module.exports = { registerUser, getProfile, updateProfile };
