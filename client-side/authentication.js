const express = require("express");
const router = express.Router();
const { DB, auth } = require('./config');
const { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithCustomToken } = require('firebase/auth');
const { collection, doc, setDoc, getDocs} = require("firebase/firestore");

// Sign in route
router.post('/signin', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Find the user by username
        const usersRef = collection(DB, "users");
        const querySnapshot = await getDocs(usersRef);
        let email = null;
        querySnapshot.forEach((document) => {
            if (document.data().username === username) {
                email = document.data().email;
            }
        });

        if (!email) {
            return res.status(401).json({
                status: "Failed",
                code: "auth/user-not-found",
                message: "Your Username or Password is incorrect"
            });
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        res.status(200).json({
            status: "Success",
            token: `Bearer ${userCredential.user.stsTokenManager.accessToken}`,
            expirationTime: userCredential.user.stsTokenManager.expirationTime
        });
    } catch (error) {
        const errorCode = error.code;

        if (errorCode === 'auth/invalid-credential' || errorCode === "auth/wrong-password") {
            return res.status(401).json({
                status: "Failed",
                code: "auth/invalid-credential",
                message: "Your Username or Password is incorrect"
            });
        }

        else if (errorCode === 'auth/user-not-found' || errorCode === "auth/wrong-password") {
            return res.status(401).json({
                status: "Failed",
                code: "auth/user-not-found",
                message: "Your Username or Password is incorrect"
            });
        }

        console.error(error);
        res.status(500).send('Server error');
    }
});

// Sign up route
router.post('/signup', async (req, res) => {
    const { name, username, email, password } = req.body;

    try {
        // Check if username already exists
        const usersRef = collection(DB, "users");
        const querySnapshot = await getDocs(usersRef);
        let usernameExists = false;
        querySnapshot.forEach((document) => {
            if (document.data().username === username) {
                usernameExists = true;
            }
        });

        if (usernameExists) {
            return res.status(409).json({
                status: "Failed",
                code: "auth/username-already-in-use",
                message: "Username already in use"
            });
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const docID = userCredential.user.uid;
        const userData = {
            "uid": docID,
            "name": name,
            "username": username,
            "email": email,
        };

        const userDocRef = doc(DB, "users", docID);

        await setDoc(userDocRef, userData);

        res.status(200).json({
            status: "Success",
            token: `Bearer ${userCredential.user.stsTokenManager.accessToken}`,
            expirationTime: userCredential.user.stsTokenManager.expirationTime
        });
    } catch (error) {
        if (error.code === "auth/email-already-in-use") {
            return res.status(409).json({
                status: "Failed",
                code: "auth/email-already-in-use",
                message: "Email already in use"
            });
        } else if (error.code === "auth/weak-password") {
            return res.status(400).json({
                status: "Failed",
                code: "auth/invalid-password",
                message: "The password must be at least six characters"
            });
        } else if (error.code === "auth/invalid-email") {
            return res.status(400).json({
                status: "Failed",
                code: "auth/invalid-email",
                message: "Please provide a correct email"
            });
        }
        console.error(error);
        res.status(500).send('Server error');
    }
});

// New access token route
router.post("/newAccess", async (req, res) => {
    try {
        const userCredential = await signInWithCustomToken(auth, req.headers.newtoken);
        return res.json({
            token: `Bearer ${userCredential.user.stsTokenManager.accessToken}`,
            expirationTime: userCredential.user.stsTokenManager.expirationTime
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred' });
    }
});

// Get user details route
router.get('/users', async (req, res) => {
    try {
        const usersRef = collection(DB, "users");
        const querySnapshot = await getDocs(usersRef);
        const users = [];

        querySnapshot.forEach((document) => {
            users.push(document.data());
        });

        res.status(200).json({
            status: "Success",
            data: users
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "Failed",
            message: "Server error"
        });
    }
});

module.exports = router;
