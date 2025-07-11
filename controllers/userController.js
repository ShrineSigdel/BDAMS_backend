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

const completeDonation = async (req, res) => {
  try {
    const requestId = req.params.id;
    const requestRef = db.collection('donation_requests').doc(requestId);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists) {
        return res.status(404).send({ message: "Request not found." });
    }

    const requestData = requestDoc.data();
    if (requestData.status !== 'pending_confirmation') {
        return res.status(400).send({ message: "This request is not pending confirmation." });
    }

    const donorId = requestData.donorId;

    // --- Core Logic: Update both the request and the donor's profile ---
    const donorRef = db.collection('users').doc(donorId);

    // Use a batch write to ensure both operations succeed or fail together
    const batch = db.batch();
    
    // 1. Update the request status to 'completed'
    batch.update(requestRef, { status: 'completed' });

    // 2. Update the donor's lastDonationDate to now
    batch.update(donorRef, { lastDonationDate: admin.firestore.FieldValue.serverTimestamp() });

    await batch.commit();

    res.status(200).send({ message: "Donation confirmed successfully!" });

} catch (error) {
    console.error("Error completing donation:", error);
    res.status(500).send({ message: "Error completing donation." });
}
}

module.exports = { registerUser, getProfile, updateProfile, completeDonation };
