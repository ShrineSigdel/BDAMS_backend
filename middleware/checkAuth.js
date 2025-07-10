const { admin } = require('../config/firebase');

const checkAuth = async (req, res, next) => {
  try {
    const idToken = req.headers.authorization?.split('Bearer ')[1];

    if (!idToken) {
      return res.status(401).send({ message: 'No token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(401).send({ message: 'Unauthorized. Please log in.' });
  }
};

module.exports = checkAuth;
