import {initializeApp} from "firebase/app";
import {getFirestore} from "firebase/firestore";
import {getAuth} from "firebase/auth";
import {getStorage} from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBrJpdXDbZIhM4CjpO6ewltYSmfK6iPJ80",
    authDomain: "studentjobs-50af3.firebaseapp.com",
    projectId: "studentjobs-50af3",
    storageBucket: "studentjobs-50af3.firebasestorage.app",
    messagingSenderId: "1073151173148",
    appId: "1:1073151173148:web:ab912fb4eff13a11a6f5d9",
    measurementId: "G-VQLBE9J3ZR"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);

export const storage = getStorage(app);

export default app;