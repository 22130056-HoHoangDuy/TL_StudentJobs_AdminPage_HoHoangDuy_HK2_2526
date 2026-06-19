import {useEffect, useState} from "react";
import {collection, onSnapshot, query, where} from "firebase/firestore";
import {db} from "../firebase/firestore";

export function DashboardPage({setCurrentTab}) {
    const [stats, setStats] = useState({
        totalUsers: 0,
        pendingEmployers: 0,
        activeJobs: 0,
        pendingReports: 0
    });

    useEffect(() => {
        // Lắng nghe số lượng các collection quan trọng
        const unsub1 = onSnapshot(collection(db, "users"), (snap) => setStats(prev => ({
            ...prev,
            totalUsers: snap.size
        })));
        const unsub2 = onSnapshot(query(collection(db, "employer_verifications"), where("submissionStatus", "==", "PENDING")), (snap) => setStats(prev => ({
            ...prev,
            pendingEmployers: snap.size
        })));
        const unsub3 = onSnapshot(query(collection(db, "jobs"), where("status", "==", "ACTIVE")), (snap) => setStats(prev => ({
            ...prev,
            activeJobs: snap.size
        })));
        const unsub4 = onSnapshot(query(collection(db, "reports"), where("status", "==", "PENDING")), (snap) => setStats(prev => ({
            ...prev,
            pendingReports: snap.size
        })));

        return () => {
            unsub1();
            unsub2();
            unsub3();
            unsub4();
        };
    }, []);

    const styles = {
        wrapper: {padding: "40px", maxWidth: "1200px", margin: "0 auto"},
        statGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            marginBottom: "40px"
        },
        statCard: {
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
        },
        grid: {display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px"},
        card: {
            backgroundColor: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "30px",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
        },
        actionBtn: (color) => ({
            backgroundColor: color,
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: "10px",
            fontWeight: "600",
            cursor: "pointer"
        })
    };

    return (
        <div style={styles.wrapper}>
            <h1 style={{fontSize: "28px", fontWeight: "800", color: "#0f172a", marginBottom: "30px"}}>Bảng điều khiển hệ
                thống</h1>

            {/* Thanh Thống kê nhanh */}
            <div style={styles.statGrid}>
                <div style={styles.statCard}><h3>Người dùng</h3><p
                    style={{fontSize: "24px", fontWeight: "700", color: "#2563eb"}}>{stats.totalUsers}</p></div>
                <div style={styles.statCard}><h3>Jobs Đang Mở</h3><p
                    style={{fontSize: "24px", fontWeight: "700", color: "#059669"}}>{stats.activeJobs}</p></div>
                <div style={styles.statCard}><h3>Cần duyệt NTD</h3><p
                    style={{fontSize: "24px", fontWeight: "700", color: "#d97706"}}>{stats.pendingEmployers}</p></div>
                <div style={styles.statCard}><h3>Báo cáo mới</h3><p
                    style={{fontSize: "24px", fontWeight: "700", color: "#e11d48"}}>{stats.pendingReports}</p></div>
            </div>

            {/* Các nút điều hướng nhanh */}
            <div style={styles.grid}>
                <div style={styles.card}>
                    <div>
                        <h3 style={{marginTop: 0}}>🏢 Quản trị Doanh nghiệp</h3>
                        <p style={{color: "#64748b"}}>Duyệt hồ sơ pháp lý và xác thực nhà tuyển dụng.</p>
                    </div>
                    <button style={styles.actionBtn("#2563eb")} onClick={() => setCurrentTab("pending_employers")}>Đi
                        tới duyệt NTD ➔
                    </button>
                </div>
                <div style={styles.card}>
                    <div>
                        <h3 style={{marginTop: 0}}>🚩 Quản lý Báo cáo</h3>
                        <p style={{color: "#64748b"}}>Xử lý các báo cáo vi phạm từ người dùng.</p>
                    </div>
                    <button style={styles.actionBtn("#e11d48")} onClick={() => setCurrentTab("reports")}>Đi tới báo cáo
                        ➔
                    </button>
                </div>
            </div>
        </div>
    );
}