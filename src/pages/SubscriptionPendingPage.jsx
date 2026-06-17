// ====================================================================
// PHÂN HỆ 3: MÀN DUYỆT GÓI PLUS CỦA ANH (ĐÃ FIX TOÀN DIỆN LỖI TIMESTAMP)
// ====================================================================
import {useEffect, useState} from "react";
import {collection, doc, onSnapshot, query, serverTimestamp, updateDoc, where} from "firebase/firestore";
import {db} from "../firebase/firestore"; // 🔥 ĐÃ FIX: Đồng bộ import { db } có ngoặc nhọn để tránh lỗi undefined


export function SubscriptionPendingPage() {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        const q = query(collection(db, "subscription_requests"), where("status", "==", "PENDING"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setRequests(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
        });
        return () => unsubscribe();
    }, []);

    const approveSubscription = async (request) => {
        try {
            await updateDoc(doc(db, "subscription_requests", request.id), {
                status: "APPROVED",
                reviewedAt: serverTimestamp()
            });

            const expiredDate = new Date(Date.now() + (request.durationDays * 24 * 60 * 60 * 1000));

            await updateDoc(doc(db, "users", request.userUid), {
                subscriptionPlan: "PLUS",
                subscriptionExpiredAt: expiredDate
            });

            alert("Đã duyệt nâng cấp gói PLUS thành công! 🎉");
        } catch (error) {
            console.error(error);
            alert("Duyệt thất bại, vui lòng kiểm tra lại log.");
        }
    };

    const rejectSubscription = async (requestId) => {
        try {
            await updateDoc(doc(db, "subscription_requests", requestId), {status: "REJECTED"});
            alert("Đã từ chối yêu cầu.");
        } catch (error) {
            console.error(error);
            alert("Từ chối thất bại.");
        }
    };

    const styles = {
        container: {
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            backgroundColor: "#f8fafc",
            minHeight: "100vh",
            padding: "40px 20px",
            color: "#1e293b"
        },
        headerContainer: {
            maxWidth: "1000px",
            margin: "0 auto 30px auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "2px solid #e2e8f0",
            paddingBottom: "16px"
        },
        title: {fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: 0},
        countBadge: {
            backgroundColor: "#7c3aed",
            color: "white",
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "14px",
            fontWeight: "600",
            marginLeft: "12px"
        },
        listContainer: {maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px"},
        card: {
            backgroundColor: "white",
            border: "1px solid #e2e8f0",
            padding: "24px",
            borderRadius: "16px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
        },
        infoRow: {display: "flex", alignItems: "center", fontSize: "15px", lineHeight: "1.5"},
        label: {width: "140px", fontWeight: "600", color: "#64748b"},
        valueUid: {
            fontFamily: "monospace",
            backgroundColor: "#f1f5f9",
            padding: "3px 8px",
            borderRadius: "6px",
            color: "#334155",
            fontSize: "14px"
        },
        valuePlan: {
            fontWeight: "700",
            color: "#7c3aed",
            backgroundColor: "#f3e8ff",
            padding: "2px 10px",
            borderRadius: "6px",
            fontSize: "13px"
        },
        statusBadge: {
            backgroundColor: "#fef3c7",
            color: "#d97706",
            padding: "4px 12px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "600"
        },
        buttonContainer: {
            display: "flex",
            gap: "12px",
            marginTop: "12px",
            borderTop: "1px solid #f1f5f9",
            paddingTop: "16px"
        },
        btnApprove: {
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "10px",
            fontWeight: "600",
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px"
        },
        btnReject: {
            backgroundColor: "#f43f5e",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "10px",
            fontWeight: "600",
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px"
        },
        emptyState: {
            textAlign: "center",
            padding: "60px 20px",
            color: "#64748b",
            fontSize: "16px",
            backgroundColor: "white",
            borderRadius: "16px",
            border: "1px dashed #cbd5e1"
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.headerContainer}>
                <div style={{display: "flex", alignItems: "center"}}>
                    <h1 style={styles.title}>Phê Duyệt Nâng Cấp Gói PLUS</h1>
                    <span style={styles.countBadge}>{requests.length} Đang chờ</span>
                </div>
            </div>

            <div style={styles.listContainer}>
                {requests.length === 0 ? (
                    <div style={styles.emptyState}>🎉 Tuyệt vời! Không có yêu cầu nào đang chờ phê duyệt.</div>
                ) : (
                    requests.map(request => (
                        <div key={request.id} style={styles.card}>
                            <div style={styles.infoRow}><span style={styles.label}>Mã người dùng:</span><span
                                style={styles.valueUid}>{request.userUid}</span></div>
                            <div style={styles.infoRow}><span style={styles.label}>Gói đăng ký:</span><span
                                style={styles.valuePlan}>✨ {request.requestedPlan}</span></div>
                            <div style={styles.infoRow}><span style={styles.label}>Thời hạn gói:</span><span
                                style={{fontWeight: "500"}}>{request.durationDays} ngày</span></div>
                            <div style={styles.infoRow}><span style={styles.label}>Trạng thái:</span><span
                                style={styles.statusBadge}>⏳ {request.status}</span></div>
                            <div style={styles.buttonContainer}>
                                <button
                                    onClick={() => approveSubscription(request)}
                                    style={styles.btnApprove}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#059669"}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#10b981"}
                                >
                                    ✓ Phê Duyệt
                                </button>
                                <button
                                    onClick={() => rejectSubscription(request.id)}
                                    style={styles.btnReject}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#e11d48"}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#f43f5e"}
                                >
                                    ✕ Từ Chối
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}