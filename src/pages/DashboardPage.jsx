import {useEffect, useState} from "react";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from "firebase/firestore";
import {db} from "../firebase/firestore";

export function DashboardPage({setCurrentTab}) {
    const styles = {
        wrapper: {padding: "40px", maxWidth: "1100px", margin: "0 auto", width: "100%"},
        grid: {display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px"},
        card: {
            backgroundColor: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "30px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
            gap: "20px"
        },
        actionBtn: (color) => ({
            backgroundColor: color,
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: "10px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: `0 4px 12px ${color}25`,
            transition: "opacity 0.2s"
        })
    };
    return (
        <div style={styles.wrapper}>
            <h1 style={{fontSize: "28px", fontWeight: "800", color: "#0f172a", marginBottom: "24px"}}>Xin chào Admin!
                👋</h1>
            <div style={styles.grid}>
                <div style={styles.card}>
                    <div>
                        <h3 style={{fontSize: "18px", fontWeight: "700", color: "#0f172a", marginTop: 0}}>🏢 Duyệt Xác
                            Thực Doanh Nghiệp</h3>
                        <p style={{color: "#64748b", fontSize: "14px", lineHeight: "1.5"}}>Kiểm tra hồ sơ pháp lý, mã số
                            thuế và hình ảnh minh chứng của các công ty đăng ký tuyển dụng.</p>
                    </div>
                    <button style={styles.actionBtn("#2563eb")} onClick={() => setCurrentTab("pending_employers")}>
                        Đi tới hàng chờ duyệt ➔
                    </button>
                </div>
                <div style={styles.card}>
                    <div>
                        <h3 style={{fontSize: "18px", fontWeight: "700", color: "#0f172a", marginTop: 0}}>✨ Phê Duyệt
                            Gói Cước VIP PLUS</h3>
                        <p style={{color: "#64748b", fontSize: "14px", lineHeight: "1.5"}}>Phê duyệt lịch sử thanh toán
                            hóa đơn nâng cấp tài khoản PLUS Premium cho người dùng sinh viên.</p>
                    </div>
                    <button style={styles.actionBtn("#7c3aed")} onClick={() => setCurrentTab("pending_plus")}>
                        Đi tới hàng chờ Plus ➔
                    </button>
                </div>
            </div>
        </div>
    );
}

// ====================================================================
// PHÂN HỆ 2: MÀN DUYỆT NHÀ TUYỂN DỤNG (ĐÃ ĐỒNG BỘ UI XỊN SÒ THEO MÀN VIP)
// ====================================================================
export function EmployerPendingPage() {
    const [employers, setEmployers] = useState([]);

    useEffect(() => {
        const q = query(collection(db, "employer_verifications"), where("submissionStatus", "==", "PENDING"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setEmployers(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
        });
        return () => unsubscribe();
    }, []);

    const approveEmployer = async (employer) => {
        try {
            await updateDoc(doc(db, "employer_verifications", employer.id), {submissionStatus: "VERIFIED"});
            await updateDoc(doc(db, "users", employer.id), {userVerified: true});

            const trustLogQuery = query(collection(db, "trust_logs"), where("userUid", "==", employer.id), where("actionType", "==", "EMPLOYER_VERIFIED"));
            const trustLogSnapshot = await getDocs(trustLogQuery);
            if (trustLogSnapshot.empty) {
                const userDoc = await getDoc(doc(db, "users", employer.id));
                const currentTrust = userDoc.data()?.trustScore || 0;
                await updateDoc(doc(db, "users", employer.id), {trustScore: currentTrust + 30});

                const trustLogRef = doc(collection(db, "trust_logs"));
                await setDoc(trustLogRef, {
                    trustLogId: trustLogRef.id,
                    userUid: employer.id,
                    actionType: "EMPLOYER_VERIFIED",
                    changeAmount: 30,
                    severity: "LOW",
                    description: "Doanh nghiệp được xác thực",
                    createdAt: serverTimestamp()
                });
            }
            await setDoc(doc(db, "employers", employer.id), {
                uid: employer.id,
                businessName: employer.businessName || "",
                businessCategory: employer.businessCategory || "",
                businessAddressText: employer.businessAddressText || "",
                businessStoreFrontImageUrl: employer.businessStoreFrontImageUrl || "",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            }, {merge: true});
            alert("Đã phê duyệt nhà tuyển dụng thành công! 🏢");
        } catch (error) {
            console.error(error);
            alert("Phê duyệt thất bại!");
        }
    };

    const rejectEmployer = async (id) => {
        try {
            await updateDoc(doc(db, "employer_verifications", id), {submissionStatus: "REJECTED"});
            alert("Đã từ chối hồ sơ nhà tuyển dụng.");
        } catch (error) {
            console.error("Lỗi reject nhà tuyển dụng:", error);
            alert("Từ chối thất bại.");
        }
    };

    // Tone màu Xanh dương công nghệ chủ đạo phối hợp đồng điệu với cấu trúc CSS-in-JS xịn sò của anh
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
            backgroundColor: "#2563eb", // Sử dụng màu xanh Blue phân biệt với màu tím của gói Plus
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
        infoRow: {display: "flex", alignItems: "flex-start", fontSize: "15px", lineHeight: "1.5"},
        label: {width: "150px", fontWeight: "600", color: "#64748b", flexShrink: 0},
        valueUid: {
            fontFamily: "monospace",
            backgroundColor: "#f1f5f9",
            padding: "3px 8px",
            borderRadius: "6px",
            color: "#334155",
            fontSize: "14px"
        },
        valueCategory: {
            fontWeight: "700",
            color: "#2563eb",
            backgroundColor: "#eff6ff",
            padding: "2px 10px",
            borderRadius: "6px",
            fontSize: "13px"
        },
        imgPreview: {
            width: "100%",
            maxWidth: "320px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            marginTop: "4px"
        },
        buttonContainer: {
            display: "flex",
            gap: "12px",
            marginTop: "12px",
            borderTop: "1px solid #f1f5f9",
            paddingTop: "16px"
        },
        btnApprove: {
            backgroundColor: "#10b981", color: "white", border: "none", padding: "10px 20px", borderRadius: "10px",
            fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
        },
        btnReject: {
            backgroundColor: "#f43f5e", color: "white", border: "none", padding: "10px 20px", borderRadius: "10px",
            fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
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
                    <h1 style={styles.title}>Duyệt Hồ Sơ Nhà Tuyển Dụng</h1>
                    <span style={styles.countBadge}>{employers.length} Chờ kiểm duyệt</span>
                </div>
            </div>

            <div style={styles.listContainer}>
                {employers.length === 0 ? (
                    <div style={styles.emptyState}>
                        🎉 Tuyệt vời! Không có hồ sơ doanh nghiệp nào đang chờ xử lý.
                    </div>
                ) : (
                    employers.map(emp => (
                        <div key={emp.id} style={styles.card}>
                            <div style={styles.infoRow}>
                                <span style={styles.label}>Mã ID đối tác:</span>
                                <span style={styles.valueUid}>{emp.id}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.label}>Tên doanh nghiệp:</span>
                                <span style={{fontWeight: "700", color: "#0f172a"}}>{emp.businessName}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.label}>Lĩnh vực kinh doanh:</span>
                                <span style={styles.valueCategory}>🏢 {emp.businessCategory || "Chưa cập nhật"}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.label}>Địa chỉ trụ sở:</span>
                                <span style={{fontWeight: "500", color: "#334155"}}>{emp.businessAddressText}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.label}>Minh chứng mặt tiền:</span>
                                {emp.businessStoreFrontImageUrl ? (
                                    <img src={emp.businessStoreFrontImageUrl} alt="Storefront"
                                         style={styles.imgPreview}/>
                                ) : (
                                    <span style={{color: "#94a3b8", fontStyle: "italic", fontSize: "14px"}}>Không cung cấp hình ảnh</span>
                                )}
                            </div>

                            <div style={styles.buttonContainer}>
                                <button
                                    onClick={() => approveEmployer(emp)}
                                    style={styles.btnApprove}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#059669"}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#10b981"}
                                >
                                    ✓ Phê Duyệt Doanh Nghiệp
                                </button>
                                <button
                                    onClick={() => rejectEmployer(emp.id)}
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
