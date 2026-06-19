import {useEffect, useState} from "react";
import {collection, onSnapshot} from "firebase/firestore";
import {db} from "../firebase/firestore";

export function UserManagerPage() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null); // Để hiển thị màn profile

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
            setUsers(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
        });
        return () => unsub();
    }, []);

    const students = users.filter(u => u.role === "STUDENT");
    const employers = users.filter(u => u.role === "EMPLOYER");

    const styles = {
        container: {padding: "40px", backgroundColor: "#f8fafc", minHeight: "100vh"},
        statsGrid: {display: "flex", gap: "20px", marginBottom: "30px"},
        statCard: (color) => ({
            padding: "20px", backgroundColor: "white", borderRadius: "12px",
            borderLeft: `5px solid ${color}`, boxShadow: "0 2px 4px rgba(0,0,0,0.05)", flex: 1
        }),
        table: {
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "white",
            borderRadius: "12px",
            overflow: "hidden"
        },
        th: {padding: "16px", textAlign: "left", backgroundColor: "#f1f5f9", color: "#475569"},
        td: {padding: "16px", borderBottom: "1px solid #e2e8f0", cursor: "pointer"},
        profileModal: {
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center"
        },
        modalContent: {backgroundColor: "white", padding: "30px", borderRadius: "16px", width: "500px"}
    };

    return (
        <div style={styles.container}>
            <h1>👥 Quản lý Người dùng</h1>

            <div style={styles.statsGrid}>
                <div style={styles.statCard("#3b82f6")}>
                    <h3>Sinh viên</h3>
                    <p style={{fontSize: "24px", fontWeight: "bold"}}>{students.length}</p>
                </div>
                <div style={styles.statCard("#f59e0b")}>
                    <h3>Nhà tuyển dụng</h3>
                    <p style={{fontSize: "24px", fontWeight: "bold"}}>{employers.length}</p>
                </div>
            </div>

            <table style={styles.table}>
                <thead>
                <tr>
                    <th style={styles.th}>Họ tên</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Vai trò</th>
                </tr>
                </thead>
                <tbody>
                {users.map(user => (
                    <tr key={user.id} onClick={() => setSelectedUser(user)} style={{cursor: "pointer"}}>
                        <td style={styles.td}>{user.fullName || "Chưa cập nhật"}</td>
                        <td style={styles.td}>{user.email}</td>
                        <td style={styles.td}>{user.role}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* Modal hiển thị chi tiết Profile */}
            {selectedUser && (
                <div style={styles.profileModal} onClick={() => setSelectedUser(null)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h2>Hồ sơ người dùng</h2>
                        <p><strong>ID:</strong> {selectedUser.id}</p>
                        <p><strong>Họ tên:</strong> {selectedUser.fullName}</p>
                        <p><strong>Email:</strong> {selectedUser.email}</p>
                        <p><strong>Vai trò:</strong> {selectedUser.role}</p>
                        <button onClick={() => setSelectedUser(null)} style={{marginTop: "20px"}}>Đóng</button>
                    </div>
                </div>
            )}
        </div>
    );
}