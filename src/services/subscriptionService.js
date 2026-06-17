import { collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "../firebase/firestore";

// ========================================
// 1. GET PENDING REQUESTS
// ========================================
export const getPendingSubscriptionRequests = async () => {
    try {
        const q = query(
            collection(db, "subscription_requests"),
            where("status", "==", "PENDING")
        );

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log("Subscription Requests Pending:", data);
        return data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách đăng ký PLUS:", error);
        throw error;
    }
};

// ========================================
// 2. APPROVE SUBSCRIPTION
// ========================================
export const approveSubscription = async (request) => {
    try {
        // Cập nhật trạng thái yêu cầu
        await updateDoc(
            doc(db, "subscription_requests", request.id),
            {
                status: "APPROVED",
                reviewedAt: serverTimestamp()
            }
        );

        // Tính toán mốc thời gian hết hạn chuẩn đối tượng Date
        const expiredDate = new Date(Date.now() + (request.durationDays * 24 * 60 * 60 * 1000));

        // Cập nhật thông tin gói cước của User
        await updateDoc(
            doc(db, "users", request.userUid),
            {
                subscriptionPlan: "PLUS",
                subscriptionExpiredAt: expiredDate
            }
        );

        console.log(`Đã nâng cấp PLUS thành công cho User: ${request.userUid}`);
    } catch (error) {
        console.error("Lỗi trong quá trình phê duyệt gói cước:", error);
        throw error;
    }
};