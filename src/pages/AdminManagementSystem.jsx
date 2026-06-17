// ====================================================================
// COMPONENT CHÍNH: LAYOUT HỆ THỐNG QUẢN TRỊ ADMIN (SIDEBAR + ROUTING TẠI CHỖ)
// ====================================================================
import {useEffect, useState} from "react";
import {collection, onSnapshot, query, where} from "firebase/firestore";
import {db} from "../firebase/firestore";


// 🔥 ĐÃ FIX: Import đúng chuẩn Default Export từ các file anh đã tách riêng biệt
import {DashboardPage} from "./DashboardPage.jsx"; // File này anh dùng Named Export (export function) nên giữ nguyên cặp {}
import EmployerPendingPage from "./EmployerPendingPage.jsx"; // Sửa bỏ dấu {} vì là Default Export
import {SubscriptionPendingPage} from "./SubscriptionPendingPage.jsx"; // Sửa bỏ dấu {} vì là Default Export

export default function AdminManagementSystem() {
    const [currentTab, setCurrentTab] = useState("dashboard");
    const [pendingNTDCount, setPendingNTDCount] = useState(0);
    const [pendingPlusCount, setPendingPlusCount] = useState(0);

    // Lắng nghe số lượng yêu cầu chờ duyệt realtime để hiển thị Badge ở Menu Sidebar
    useEffect(() => {
        const qNTD = query(collection(db, "employer_verifications"), where("submissionStatus", "==", "PENDING"));
        const qPlus = query(collection(db, "subscription_requests"), where("status", "==", "PENDING"));

        const unsubNTD = onSnapshot(qNTD, (snap) => setPendingNTDCount(snap.size));
        const unsubPlus = onSnapshot(qPlus, (snap) => setPendingPlusCount(snap.size));
        return () => {
            unsubNTD();
            unsubPlus();
        };
    }, []);

    const styles = {
        layout: {
            display: "flex",
            height: "100vh",
            backgroundColor: "#f8fafc",
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            overflow: "hidden"
        },
        sidebar: {
            width: "260px",
            backgroundColor: "#0f172a",
            color: "#94a3b8",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
        },
        brandHeader: {padding: "24px", borderBottom: "1px solid #1e293b"},
        nav: {padding: "16px", display: "flex", flexDirection: "column", gap: "8px"},
        navBtn: (isActive) => ({
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: isActive ? "#2563eb" : "transparent",
            color: isActive ? "white" : "#94a3b8",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s"
        }),
        menuBadge: {
            backgroundColor: "#ef4444",
            color: "white",
            fontSize: "11px",
            fontWeight: "700",
            padding: "2px 8px",
            borderRadius: "10px"
        },
        mainContent: {flex: 1, overflowY: "auto", display: "flex", flexDirection: "column"},
        topBar: {
            height: "64px",
            backgroundColor: "white",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            padding: "0 40px",
            justifyContent: "space-between"
        }
    };

    return (
        <div style={styles.layout}>
            <aside style={styles.sidebar}>
                <div>
                    <div style={styles.brandHeader}>
                        <h1 style={{color: "white", fontSize: "18px", fontWeight: "700", margin: 0}}>StudentJobs
                            Admin</h1>
                    </div>
                    <nav style={styles.nav}>
                        <button style={styles.navBtn(currentTab === "dashboard")}
                                onClick={() => setCurrentTab("dashboard")}>
                            📊 Bảng điều khiển
                        </button>
                        <button style={styles.navBtn(currentTab === "pending_employers")}
                                onClick={() => setCurrentTab("pending_employers")}>
                            <span>🏢 Duyệt Nhà Tuyển Dụng</span>
                            {pendingNTDCount > 0 && <span style={styles.menuBadge}>{pendingNTDCount}</span>}
                        </button>
                        <button style={styles.navBtn(currentTab === "pending_plus")}
                                onClick={() => setCurrentTab("pending_plus")}>
                            <span>✨ Duyệt Nâng Cấp PLUS</span>
                            {pendingPlusCount > 0 && <span style={styles.menuBadge}>{pendingPlusCount}</span>}
                        </button>
                    </nav>
                </div>
            </aside>
            <main style={styles.mainContent}>
                <header style={styles.topBar}>
                    <h2 style={{fontSize: "16px", fontWeight: "700", color: "#334155"}}>
                        {currentTab === "dashboard" && "HỆ THỐNG QUẢN TRỊ CHUNG"}
                        {currentTab === "pending_employers" && "XỬ LÝ PHÁP LÝ NHÀ TUYỂN DỤNG"}
                        {currentTab === "pending_plus" && "QUẢN LÝ DOANH THU ĐĂNG KÝ VIP"}
                    </h2>
                </header>
                <div style={{flex: 1}}>
                    {currentTab === "dashboard" && <DashboardPage setCurrentTab={setCurrentTab}/>}
                    {currentTab === "pending_employers" && <EmployerPendingPage/>}
                    {currentTab === "pending_plus" && <SubscriptionPendingPage/>}
                </div>
            </main>
        </div>
    );
}