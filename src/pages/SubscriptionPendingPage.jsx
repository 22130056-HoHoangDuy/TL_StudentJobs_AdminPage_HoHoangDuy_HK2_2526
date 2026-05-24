import {useEffect, useState} from "react";

import {collection, doc, onSnapshot, query, updateDoc, where} from "firebase/firestore";

import db from "../firebase/firestore";

export default function
    SubscriptionPendingPage() {

    const [requests, setRequests] =
        useState([]);

    // ====================================
    // REALTIME LOAD
    // ====================================

    useEffect(() => {

        const q = query(
            collection(
                db,
                "subscription_requests"
            ),

            where(
                "status",
                "==",
                "PENDING"
            )
        );

        const unsubscribe =
            onSnapshot(q, (snapshot) => {

                const data =
                    snapshot.docs.map(doc => ({

                        id: doc.id,

                        ...doc.data()
                    }));

                setRequests(data);
            });

        return () => unsubscribe();

    }, []);

    // ====================================
    // APPROVE
    // ====================================

    const approveSubscription =
        async (request) => {

            try {

                // request
                await updateDoc(
                    doc(
                        db,
                        "subscription_requests",
                        request.id
                    ),

                    {

                        status:
                            "APPROVED",

                        reviewedAt:
                        // eslint-disable-next-line react-hooks/purity
                            Date.now()
                    }
                );

                // expired date
                const expiredAt =

                    // eslint-disable-next-line react-hooks/purity
                    Date.now() +

                    (
                        request.durationDays *
                        24 *
                        60 *
                        60 *
                        1000
                    );

                // users
                await updateDoc(
                    doc(
                        db,
                        "users",
                        request.userUid
                    ),

                    {

                        subscriptionPlan:
                            "PLUS",

                        subscriptionExpiredAt:
                        expiredAt
                    }
                );

                alert(
                    "Approved successfully"
                );

            } catch (error) {

                console.error(error);

                alert("Approve failed");
            }
        };

    // ====================================
    // REJECT
    // ====================================

    const rejectSubscription =
        async (requestId) => {

            try {

                await updateDoc(
                    doc(
                        db,
                        "subscription_requests",
                        requestId
                    ),

                    {

                        status:
                            "REJECTED"
                    }
                );

                alert("Rejected");

            } catch (error) {

                console.error(error);

                alert("Reject failed");
            }
        };

    // ====================================
    // UI
    // ====================================

    return (

        <div style={{padding: 20}}>

            <h1>
                Subscription Pending
            </h1>

            {

                requests.map(request => (

                    <div

                        key={request.id}

                        style={{

                            border:
                                "1px solid #ccc",

                            padding: 16,

                            borderRadius: 12,

                            marginBottom: 16
                        }}
                    >

                        <p>
                            <b>User UID:</b>
                            {" "}
                            {request.userUid}
                        </p>

                        <p>
                            <b>Plan:</b>
                            {" "}
                            {request.requestedPlan}
                        </p>

                        <p>
                            <b>Duration:</b>
                            {" "}
                            {request.durationDays}
                            {" "}
                            days
                        </p>

                        <p>
                            <b>Status:</b>
                            {" "}
                            {request.status}
                        </p>

                        <button

                            onClick={() =>
                                approveSubscription(
                                    request
                                )
                            }
                        >
                            ✅ Approve
                        </button>

                        <button

                            onClick={() =>
                                rejectSubscription(
                                    request.id
                                )
                            }

                            style={{
                                marginLeft: 10
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