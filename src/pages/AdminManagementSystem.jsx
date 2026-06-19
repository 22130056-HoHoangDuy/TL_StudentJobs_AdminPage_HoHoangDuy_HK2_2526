import {useEffect, useState} from "react";
import {collection, onSnapshot, query, where} from "firebase/firestore";
import {db} from "../firebase/firestore";

// Các Sub-components
import {DashboardPage} from "./DashboardPage.jsx";
import EmployerPendingPage from "./EmployerPendingPage.jsx";
import {SubscriptionPendingPage} from "./SubscriptionPendingPage.jsx";
import {UserManagerPage} from "./UserManagerPage.jsx"; // Mới
import {JobManagerPage} from "./JobManagerPage.jsx"; // Mới
import {ReportManagerPage} from "./ReportManagerPage.jsx"; // Mới

export default function AdminManagementSystem() {
    const [currentTab, setCurrentTab] = useState("dashboard");
    const [stats, setStats] = useState({pendingNTD: 0, pendingPlus: 0});

    useEffect(() => {
        const unsubNTD = onSnapshot(query(collection(db, "employer_verifications"), where("submissionStatus", "==", "PENDING")),
            (snap) => setStats(prev => ({...prev, pendingNTD: snap.size})));
        const unsubPlus = onSnapshot(query(collection(db, "subscription_requests"), where("status", "==", "PENDING")),
            (snap) => setStats(prev => ({...prev, pendingPlus: snap.size})));
        return () => {
            unsubNTD();
            unsubPlus();
        };
    }, []);

    const styles = {
        layout: {display: "flex", height: "100vh", backgroundColor: "#f8fafc"},
        sidebar: {width: "260px", backgroundColor: "#0f172a", color: "#94a3b8", padding: "20px"},
        navBtn: (active) => ({
            width: "100%", padding: "12px", marginBottom: "8px", borderRadius: "8px", border: "none",
            backgroundColor: active ? "#2563eb" : "transparent", color: "white", cursor: "pointer", textAlign: "left"
        }),
        mainContent: {flex: 1, overflowY: "auto", padding: "20px"}
    };

    return (
        <div style={styles.layout}>
            <aside style={styles.sidebar}>
                <h2 style={{color: "white"}}>Admin System</h2>
                <button style={styles.navBtn(currentTab === "dashboard")} onClick={() => setCurrentTab("dashboard")}>📊
                    Dashboard
                </button>
                <button style={styles.navBtn(currentTab === "users")} onClick={() => setCurrentTab("users")}>👥 Quản lý
                    người dùng
                </button>
                <button style={styles.navBtn(currentTab === "jobs")} onClick={() => setCurrentTab("jobs")}>💼 Quản lý
                    Jobs
                </button>
                <button style={styles.navBtn(currentTab === "pending_employers")}
                        onClick={() => setCurrentTab("pending_employers")}>🏢 Duyệt NTD ({stats.pendingNTD})
                </button>
                <button style={styles.navBtn(currentTab === "pending_plus")}
                        onClick={() => setCurrentTab("pending_plus")}>✨ Duyệt VIP ({stats.pendingPlus})
                </button>
                <button style={styles.navBtn(currentTab === "reports")} onClick={() => setCurrentTab("reports")}>🚩 Quản
                    lý Báo cáo
                </button>
            </aside>
            <main style={styles.mainContent}>
                {currentTab === "dashboard" && <DashboardPage setCurrentTab={setCurrentTab}/>}
                {currentTab === "users" && <UserManagerPage/>}
                {currentTab === "jobs" && <JobManagerPage/>}
                {currentTab === "pending_employers" && <EmployerPendingPage/>}
                {currentTab === "pending_plus" && <SubscriptionPendingPage/>}
                {currentTab === "reports" && <ReportManagerPage/>}
            </main>
        </div>
    );
}