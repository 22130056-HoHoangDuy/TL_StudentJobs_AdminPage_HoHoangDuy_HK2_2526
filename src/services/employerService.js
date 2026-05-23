import {collection, onSnapshot, query, where} from "firebase/firestore";

import db from "../firebase/firestore";

export function listenPendingEmployers(callback) {

    const q = query(
        collection(db, "employer_verifications"),

        where("status", "==", "PENDING")
    );

    return onSnapshot(q, (snapshot) => {

        const employers = snapshot.docs.map(doc => ({

            id: doc.id,
            ...doc.data()
        }));

        callback(employers);
    });
}