import {collection, doc, getDocs, updateDoc} from "firebase/firestore";

import {db} from "../firebase/firestore";

// ========================================
// GET PENDING REQUESTS
// ========================================

export const getPendingSubscriptionRequests =
    async () => {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "subscription_requests"
                )
            );

        const data = snapshot.docs.map(doc => ({

            id: doc.id,

            ...doc.data()
        }));

        console.log(
            "Subscription Requests:",
            data
        );

        return data;
    };

// ========================================
// APPROVE SUBSCRIPTION
// ========================================

export const approveSubscription =
    async (request) => {

        // ====================================
        // UPDATE REQUEST STATUS
        // ====================================

        await updateDoc(
            doc(
                db,
                "subscription_requests",
                request.id
            ),

            {

                status: "APPROVED",

                reviewedAt:
                    Date.now()
            }
        );

        // ====================================
        // CALCULATE EXPIRED DATE
        // ====================================

        const expiredAt =

            Date.now() +

            (
                request.durationDays *
                24 *
                60 *
                60 *
                1000
            );

        // ====================================
        // UPDATE USER PLAN
        // ====================================

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
    };