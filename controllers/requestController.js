const {admin, db} = require('../config/firebase');
const { completeDonation } = require('./userController');

/**
 * @function POST /api/requests
 * @description (Recipient) Creates a new blood donation request.
 * @protected
 * @body { "bloodType": "A+", "location": "Kathmandu", "urgency": "high" }
 */

const postBloodRequest = async (req, res) => {
    try {
        const uid = req.user.uid;
        const { bloodType, location, urgency } = req.body;

        if (!bloodType || !location || !urgency) {
            return res.status(400).send({ message: "Missing required fields for request." });
        }

        const requestData = {
            recipientId: uid,
            bloodType: bloodType,
            location: location,
            urgency: urgency,
            status: 'active', // Status can be 'active', 'pending_confirmation', 'completed'
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            donorId: null // No donor assigned yet
        };

        const docRef = await db.collection('donation_requests').add(requestData);
        res.status(201).send({ message: 'Request created successfully', id: docRef.id });

    } catch (error) {
        console.error("Error creating request:", error);
        res.status(500).send({ message: "Error creating request." });
    }
}

/**
 * @function GET /api/requests
 * @description (Donor) Views active blood donation requests. Can filter by blood type.
 * @protected
 */

const getBloodRequest = async (req, res) => {
    try {
        const { bloodType } = req.query; // e.g., /api/requests?bloodType=A+

        console.log('Fetching requests with bloodType filter:', bloodType);

        let query = db.collection('donation_requests').where('status', '==', 'active');
        
        // Add blood type filter if provided
        if (bloodType) {
            query = query.where('bloodType', '==', bloodType);
        }
        
        // Since you've created the index, we can now use orderBy
        query = query.orderBy('createdAt', 'desc');
        
        console.log('Executing query...');
        const snapshot = await query.get();
        console.log('Query executed, found documents:', snapshot.size);
        
        if (snapshot.empty) {
            return res.status(200).send([]); // Return an empty array if no requests found
        }
        
        const requests = snapshot.docs.map(doc => {
            const data = doc.data();
            // Convert timestamp to a serializable format
            if (data.createdAt && data.createdAt.toDate) {
                data.createdAt = data.createdAt.toDate().toISOString();
            }
            return { id: doc.id, ...data };
        });
        
        console.log('Returning requests:', requests.length);
        res.status(200).send(requests);

    } catch (error) {
        console.error("Error fetching requests:", error);
        console.error("Query parameters:", req.query);
        console.error("Blood type parameter:", req.query.bloodType);
        res.status(500).send({ 
            message: "Error fetching requests.",
            error: error.message,
            bloodType: req.query.bloodType 
        });
    }
}

/**
 * @function POST /api/requests/:id/respond
 * @description (Donor) Responds to a specific donation request.
 * @protected
 */

const respondToBloodRequest = async (req, res) => {
    try {
        const donorId = req.user.uid;
        const requestId = req.params.id;

        const requestRef = db.collection('donation_requests').doc(requestId);
        const requestDoc = await requestRef.get();

        if (!requestDoc.exists || requestDoc.data().status !== 'active') {
            return res.status(404).send({ message: "Request not found or is no longer active." });
        }

        await requestRef.update({
            status: 'pending_confirmation',
            donorId: donorId
        });

        // In a real app, you would trigger a notification to the recipient here.
        res.status(200).send({ message: 'Response recorded. Awaiting recipient confirmation.' });

    } catch (error) {
        console.error("Error responding to request:", error);
        res.status(500).send({ message: "Error responding to request." });
    }
}

module.exports = { postBloodRequest, getBloodRequest, respondToBloodRequest, completeDonation};
