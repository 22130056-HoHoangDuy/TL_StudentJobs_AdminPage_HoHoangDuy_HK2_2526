import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firestore";

export function ReportManagerPage() {
    const [reports, setReports] = useState([]);

    useEffect(() => {
        const q = query(collection(db, "reports"), where("status", "==", "PENDING"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    const handleResolve = async (reportId) => {
        try {
            await updateDoc(doc(db, "reports", reportId), {
                status: "RESOLVED",
                resolvedAt: serverTimestamp(),
                resolvedBy: "ADMIN" // Có thể thay bằng ID admin hiện tại
            });
            alert("Đã đánh dấu báo cáo là đã xử lý!");
        } catch (error) {
            console.error("Lỗi duyệt báo cáo:", error);
            alert("Có lỗi xảy ra khi cập nhật trạng thái.");
        }
    };

    const styles = {
        container: { padding: "40px", backgroundColor: "#f8fafc", minHeight: "100vh" },
        card: {
            backgroundColor: "white", padding: "20px", borderRadius: "12px",
            marginBottom: "16px", border: "1px solid #e2e8f0",
            display: "flex", justifyContent: "space-between", alignItems: "center"
        },
        info: { display: "flex", flexDirection: "column", gap: "4px" },
        btn: {
            backgroundColor: "#10b981", color: "white", border: "none",
            padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600"
        }
    };

    return (
        <div style={styles.container}>
            <h1>🚩 Quản lý Báo cáo</h1>
            <p style={{color: "#64748b", marginBottom: "20px"}}>Danh sách các phản hồi/báo cáo từ người dùng cần xem xét.</p>

            {reports.length === 0 ? (
                <div style={{textAlign: "center", padding: "40px", color: "#94a3b8"}}>
                    Không có báo cáo mới cần duyệt.
                </div>
            ) : (
                reports.map(report => (
                    <div key={report.id} style={styles.card}>
                        <div style={styles.info}>
                            <div style={{fontWeight: "bold"}}>Loại: {report.reason || "Khác"}</div>
                            <div><strong>Người gửi:</strong> {report.reporterUid}</div>
                            <div><strong>Nội dung:</strong> {report.description}</div>
                            <div style={{fontSize: "12px", color: "#64748b"}}>
                                Gửi lúc: {report.createdAt?.toDate().toLocaleString()}
                            </div>
                        </div>
                        <button style={styles.btn} onClick={() => handleResolve(report.id)}>
                            Duyệt (Đã xử lý)
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}