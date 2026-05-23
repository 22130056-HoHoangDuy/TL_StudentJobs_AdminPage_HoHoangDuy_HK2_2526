import {useEffect, useState} from "react";

import {collection, doc, onSnapshot, query, setDoc, updateDoc, where} from "firebase/firestore";

import db from "../firebase/firestore";

export default function EmployerPendingPage() {

    const [employers, setEmployers] = useState([]);

    useEffect(() => {

        const q = query(
            collection(db, "employer_verifications"),

            where("submissionStatus", "==", "PENDING")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {

            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setEmployers(data);
        });

        return () => unsubscribe();

    }, []);

    // ✅ APPROVE
    const approveEmployer = async (employer) => {

        try {

            // employer_verifications
            await updateDoc(
                doc(db, "employer_verifications", employer.id),
                {
                    submissionStatus: "VERIFIED"
                }
            );

            // users
            // users
            await updateDoc(
                doc(db, "users", employer.id),
                {
                    userVerified: true
                }
            );

            // employers profile
            await setDoc(
                doc(db, "employers", employer.id),
                {
                    uid: employer.id,

                    businessName:
                        employer.businessName || "",

                    businessCategory:
                        employer.businessCategory || "",

                    businessDescription:
                        employer.businessDescription || "",

                    businessAddressText:
                        employer.businessAddressText || "",

                    businessLocationUrl:
                        employer.businessLocationUrl || "",

                    businessStoreFrontImageUrl:
                        employer.businessStoreFrontImageUrl || "",

                    // eslint-disable-next-line react-hooks/purity
                    createdAt: Date.now(),

                    // eslint-disable-next-line react-hooks/purity
                    updatedAt: Date.now()
                },
                {merge: true}
            );

            alert("Approved successfully");

        } catch (error) {

            console.error(error);

            alert("Approve failed");
        }
    };

    // ❌ REJECT
    const rejectEmployer = async (id) => {

        try {

            await updateDoc(
                doc(db, "employer_verifications", id),
                {
                    submissionStatus: "REJECTED"
                }
            );

            alert("Rejected");

        } catch (error) {

            console.error(error);

            alert("Reject failed");
        }
    };

    return (

        <div style={{padding: "20px"}}>

            <h1>Employer Pending</h1>

            {
                employers.map((employer) => (

                    <div
                        key={employer.id}
                        style={{
                            border: "1px solid gray",
                            padding: "16px",
                            marginBottom: "16px",
                            borderRadius: "12px"
                        }}
                    >

                        <h2>
                            {employer.businessName}
                        </h2>

                        <p>
                            Category:
                            {" "}
                            {employer.businessCategory}
                        </p>

                        <p>
                            Address:
                            {" "}
                            {employer.businessAddressText}
                        </p>

                        <p>
                            Status:
                            {" "}
                            {employer.submissionStatus}
                        </p>

                        <img
                            src={
                                employer.businessStoreFrontImageUrl
                            }
                            alt=""
                            width="250"
                        />

                        <br/><br/>

                        <button
                            onClick={() =>
                                approveEmployer(employer)
                            }
                        >
                            ✅ Approve
                        </button>

                        <button
                            onClick={() =>
                                rejectEmployer(employer.id)
                            }
                            style={{
                                marginLeft: "10px"
                            }}
                        >
                            ❌ Reject
                        </button>

                    </div>
                ))
            }

        </div>
    );
}