  # BDAMS Backend: Step-by-Step API Testing Guide (Without Frontend)

  This guide explains how to test your backend API endpoints using tools like **Postman** or **curl**, including authentication with Firebase Emulator.

  ---

  ## 1. Prerequisites

  - **Firebase Emulators** running (`firebase emulators:start`)
  - **Backend server** running (`node index.js` or `npm start`)
  - **Postman** or **curl** installed

  ---

  ## 2. Start All Services

  - **Start Firebase Emulators:**
    ```bash
    firebase emulators:start
    ```
  - **Start Backend Server (on a port different from Firestore emulator, e.g., 5000):**
    ```bash
    node index.js
    # or
    npm start
    ```

  ---

  ## 3. Create a Test User in Firebase Auth Emulator

  1. Open **Emulator UI**: [http://localhost:4000/auth](http://localhost:4000/auth)
  2. Click **Add User** and fill in email and password (e.g., `test@example.com`, `password123`).

  ---

  ## 4. Get a Firebase ID Token for the Test User

  ### Option A: Use Emulator UI

  - Click the user you created.
  - Click **Copy ID Token** (if available).

  ### Option B: Use Firebase Client SDK (Node.js script)

  ```javascript
  // Save as getToken.js
  const firebase = require("firebase/app");
  require("firebase/auth");

  firebase.initializeApp({
    apiKey: "fake-api-key",
    authDomain: "localhost",
  });

  firebase
    .auth()
    .signInWithEmailAndPassword("test@example.com", "password123")
    .then((userCredential) => userCredential.user.getIdToken())
    .then((token) => {
      console.log("ID Token:", token);
      process.exit();
    });
  ```

  Run:

  ```bash
  node getToken.js
  ```

  ---

  ## 5. Test Protected Endpoints Using Postman or curl

  ### Example: Register (if open) or Profile (protected)

  #### **Profile Endpoint (GET)**

  ```bash
  curl -X GET http://localhost:5000/api/profile \
    -H "Authorization: Bearer <YOUR_ID_TOKEN>"
  ```

  #### **Update Profile (PUT)**

  ```bash
  curl -X PUT http://localhost:5000/api/profile \
    -H "Authorization: Bearer <YOUR_ID_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"name":"New Name","bloodType":"A+"}'
  ```

  #### **Post Blood Request (POST)**

  ```bash
  curl -X POST http://localhost:5000/api/requests \
    -H "Authorization: Bearer <YOUR_ID_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"bloodType":"A+","location":"City Hospital","urgency":"high"}'
  ```

  ---

  ## 6. Check Responses

  - **200 OK**: Endpoint is working.
  - **401 Unauthorized**: Token missing/invalid.
  - **404 Not Found**: Route does not exist.
  - **Other errors**: Check backend logs for details.

  ---

  ## 7. Troubleshooting

  - Ensure both emulators and backend are running.
  - Use correct port for backend (not Firestore emulator port).
  - Always include the `Authorization: Bearer <ID_TOKEN>` header for protected routes.
  - Check backend logs for errors.

  ---

  ## 8. Useful Resources

  - [Firebase Emulator Suite Docs](https://firebase.google.com/docs/emulator-suite)
  - [Postman Getting Started](https://learning.postman.com/docs/getting-started/introduction/)
  - [curl Manual](https://curl.se/docs/manpage.html)
  - [Express Middleware](https://expressjs.com/en/guide/using-middleware.html)

  ---

  **You can now fully test your BDAMS backend without a frontend!**
