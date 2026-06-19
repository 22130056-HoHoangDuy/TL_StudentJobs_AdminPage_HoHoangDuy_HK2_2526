import { getFirestore } from "firebase/firestore";
import app from "./firebaseConfig"; // Hoặc "../firebaseConfig" tùy vị trí file này

export const db = getFirestore(app);