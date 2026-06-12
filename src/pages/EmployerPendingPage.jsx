import {useEffect, useState} from "react";

import {collection, doc, getDoc, getDocs, onSnapshot, query, setDoc, updateDoc, where, serverTimestamp} from "firebase/firestore";

import db from "../firebase/firestore";

export default function EmployerPendingPage() {

    const [employers, setEmployers] = useState([]);

    useEffect(() => {

        const q = query(collection(db, "employer_verifications"), where("submissionStatus", "==", "PENDING"));

        const unsubscribe = onSnapshot(q, (snapshot) => {

            const data = snapshot.docs.map(doc => ({
                id: doc.id, ...doc.data()
            }));

            setEmployers(data);
        });

        return () => unsubscribe();

    }, []);

    // ✅ APPROVE
    const approveEmployer = async (employer) => {

        try {

            // ========================================
            // EMPLOYER VERIFICATION
            // ========================================

            await updateDoc(doc(db, "employer_verifications", employer.id), {
                submissionStatus: "VERIFIED"
            });

            // ========================================
            // USER VERIFIED
            // ========================================

            await updateDoc(doc(db, "users", employer.id), {
                userVerified: true
            });

            // ========================================
            // TRUST SCORE + TRUST LOG
            // CHỈ THỰC HIỆN 1 LẦN
            // ========================================

            const trustLogQuery = query(collection(db, "trust_logs"), where("userUid", "==", employer.id), where("actionType", "==", "EMPLOYER_VERIFIED"));

            const trustLogSnapshot = await getDocs(trustLogQuery);

            const alreadyRewarded = !trustLogSnapshot.empty;

            if (!alreadyRewarded) {

                const userDoc = await getDoc(doc(db, "users", employer.id));

                const currentTrust = userDoc.data()?.trustScore || 0;

                await updateDoc(doc(db, "users", employer.id), {
                    trustScore: currentTrust + 30
                });

                const trustLogRef = doc(collection(db, "trust_logs"));

                await setDoc(trustLogRef, {
                    trustLogId: trustLogRef.id,

                    userUid: employer.id,

                    actionType: "EMPLOYER_VERIFIED",

                    changeAmount: 30,

                    severity: "LOW",

                    description: "Doanh nghiệp được xác thực",

                    createdAt:serverTimestamp()
                });
            }

            // ========================================
            // CREATE EMPLOYER PROFILE
            // ========================================

            await setDoc(doc(db, "employers", employer.id), {
                uid: employer.id,

                businessName: employer.businessName || "",

                businessCategory: employer.businessCategory || "",

                businessDescription: employer.businessDescription || "",

                businessAddressText: employer.businessAddressText || "",

                businessLocationUrl: employer.businessLocationUrl || "",

                businessStoreFrontImageUrl: employer.businessStoreFrontImageUrl || "",

                createdAt: serverTimestamp(),

                updatedAt: serverTimestamp()
            }, {
                merge: true
            });

            alert("Approved successfully");

        } catch (error) {

            console.error(error);

            alert("Approve failed");
        }
    };

    // ❌ REJECT
    const rejectEmployer = async (id) => {

        try {

            await updateDoc(doc(db, "employer_verifications", id), {
                submissionStatus: "REJECTED"
            });

            alert("Rejected");

        } catch (error) {

            console.error(error);

            alert("Reject failed");
        }
    };

    return (

        <div style={{padding: "20px"}}>

            <h1>Employer Pending</h1>

            {employers.map((employer) => (

                <div
                    key={employer.id}
                    style={{
                        border: "1px solid gray", padding: "16px", marginBottom: "16px", borderRadius: "12px"
                    }}
                >

                    <h2>
                        {employer.businessName}
                    </h2>

                    <p>
                        Category: {employer.businessCategory}
                    </p>

                    <p>
                        Address: {employer.businessAddressText}
                    </p>

                    <p>
                        Status: {employer.submissionStatus}
                    </p>

                    <img
                        src={employer.businessStoreFrontImageUrl}
                        alt=""
                        width="250"
                    />

                    <br/>
                    <br/>

                    <button
                        onClick={() => approveEmployer(employer)}
                    >
                        ✅ Approve
                    </button>

                    <button
                        onClick={() => rejectEmployer(employer.id)}
                        style={{
                            marginLeft: "10px"
                        }}
                    >
                        ❌ Reject
                    </button>

                </div>))}

        </div>);
}