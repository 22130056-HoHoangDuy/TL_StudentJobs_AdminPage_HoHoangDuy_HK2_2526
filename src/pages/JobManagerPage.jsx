import {useEffect, useState} from "react";
import {collection, deleteDoc, doc, onSnapshot, updateDoc} from "firebase/firestore";
import {db} from "../firebase/firestore";

export function JobManagerPage() {
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "jobs"), (snapshot) => {
            setJobs(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
        });
        return () => unsub();
    }, []);

    const toggleJobStatus = async (jobId, currentStatus) => {
        const newStatus = currentStatus === "ACTIVE" ? "CLOSED" : "ACTIVE";
        await updateDoc(doc(db, "jobs", jobId), {status: newStatus});
    };

    const deleteJob = async (jobId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa job này vĩnh viễn không?")) {
            await deleteDoc(doc(db, "jobs", jobId));
        }
    };

    const styles = {
        container: {padding: "40px", backgroundColor: "#f8fafc", minHeight: "100vh"},
        table: {
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "white",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        },
        th: {padding: "16px", textAlign: "left", backgroundColor: "#f1f5f9", color: "#475569", fontWeight: "600"},
        td: {padding: "16px", borderBottom: "1px solid #e2e8f0"},
        btnAction: (color) => ({
            padding: "6px 12px", borderRadius: "6px", border: "none", color: "white",
            cursor: "pointer", fontSize: "12px", marginRight: "8px", backgroundColor: color
        })
    };

    return (
        <div style={styles.container}>
            <h1>💼 Quản lý Công việc</h1>
            <table style={styles.table}>
                <thead>
                <tr>
                    <th style={styles.th}>Tiêu đề Job</th>
                    <th style={styles.th}>Công ty (ID)</th>
                    <th style={styles.th}>Trạng thái</th>
                    <th style={styles.th}>Thao tác</th>
                </tr>
                </thead>
                <tbody>
                {jobs.map(job => (
                    <tr key={job.id}>
                        <td style={styles.td}>{job.title}</td>
                        <td style={styles.td}>{job.employerUid || "N/A"}</td>
                        <td style={styles.td}>
                                <span style={{
                                    padding: "4px 8px", borderRadius: "4px", fontSize: "12px",
                                    backgroundColor: job.status === "ACTIVE" ? "#dcfce7" : "#fee2e2",
                                    color: job.status === "ACTIVE" ? "#166534" : "#991b1b"
                                }}>
                                    {job.status || "ACTIVE"}
                                </span>
                        </td>
                        <td style={styles.td}>
                            <button style={styles.btnAction("#3b82f6")}
                                    onClick={() => toggleJobStatus(job.id, job.status)}>
                                Đổi trạng thái
                            </button>
                            <button style={styles.btnAction("#ef4444")} onClick={() => deleteJob(job.id)}>
                                Xóa
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}