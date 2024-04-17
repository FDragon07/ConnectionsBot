// import admin from "firebase-admin";
// import { initializeApp } from 'firebase-admin/app';
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, setDoc, doc, getDoc } from "firebase/firestore";

import { config } from "./config.js";

// Initialize Firebase
// const cert = admin.credential.cert(config.serviceAccount);
const app = initializeApp({
    // credential: cert,
    ...config.firebaseConfig,
});

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export const createUser = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("User created: ", userCredential.user.uid);
    } catch (e) {
        console.error("Error creating user: ", e);
    }
};

const signInUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("User signed in: ", userCredential.user.uid);
        return userCredential.user;
    } catch (e) {
        console.error("Error signing in user: ", e);
    }
};

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export const database = {
    getConnectionsChannel: async (guildId) => {
        try {
            const docRef = doc(db, "guilds", guildId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data().connectionsChannelId;
            } else {
                return null;
            }
        } catch (e) {
            console.error("Error getting document: ", e);
            return null;
        }
    },
    setConnectionsChannel: async (guildId, channelId) => {
        try {
            const docRef = await setDoc(doc(db, "guilds", guildId), {
                id: guildId,
                connectionsChannelId: channelId,
            });
            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    },
    signIn: async () =>{
        await signInUser(config.firebaseConfig.auth.email, config.firebaseConfig.auth.password);
    },
};
