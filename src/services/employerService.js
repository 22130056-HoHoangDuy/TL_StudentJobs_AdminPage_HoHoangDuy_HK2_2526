import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase/firestore"; // Đồng bộ import { db }

export function listenPendingEmployers(callback) {
    // Sửa từ "status" thành "submissionStatus" để khớp với DB của anh
    const q = query(
        collection(db, "employer_verifications"),
        where("submissionStatus", "==", "PENDING")
    );

    return onSnapshot(q, (snapshot) => {
        const employers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(employers);
    });
}