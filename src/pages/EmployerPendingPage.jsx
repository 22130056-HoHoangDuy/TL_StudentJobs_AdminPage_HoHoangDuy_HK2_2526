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
    where,
} from "firebase/firestore";
import {db} from "../firebase/firestore";

export default function EmployerPendingPage() {
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
            console.error(error);
            alert("Từ chối thất bại.");
        }
    };

    // Hệ thống Style CSS-in-JS được thu gọn, canh giữa màn hình cực kỳ cân đối
    const styles = {
        container: {
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            backgroundColor: "#f8fafc",
            minHeight: "100vh",
            padding: "40px",
        },
        headerArea: {
            maxWidth: "1000px",
            margin: "0 auto 24px auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "2px solid #e2e8f0",
            paddingBottom: "16px"
        },
        title: {fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: 0},
        badgeCount: {
            backgroundColor: "#2563eb",
            color: "white",
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "600"
        },
        list: {maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px"},

        // Thẻ Card chia đôi bố cục: Bên trái thông tin chữ, bên phải ảnh minh chứng
        card: {
            backgroundColor: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: "24px",
            alignItems: "start"
        },
        infoSide: {display: "flex", flexDirection: "column", gap: "12px"},
        imageSide: {display: "flex", flexDirection: "column", gap: "8px", alignItems: "center"},
        infoRow: {display: "flex", fontSize: "15px", lineHeight: "1.5"},
        label: {width: "130px", fontWeight: "600", color: "#64748b", flexShrink: 0},
        valueTxt: {color: "#1e293b", fontWeight: "500"},
        valueUid: {
            fontFamily: "monospace",
            backgroundColor: "#f1f5f9",
            padding: "2px 6px",
            borderRadius: "6px",
            color: "#475569",
            fontSize: "13px"
        },

        imgPreview: {
            width: "100%",
            height: "200px",
            objectFit: "cover",
            borderRadius: "12px",
            border: "1px solid #e2e8f0"
        },

        btnContainer: {
            display: "flex",
            gap: "12px",
            marginTop: "12px",
            borderTop: "1px solid #f1f5f9",
            paddingTop: "16px"
        },
        btnApprove: {
            backgroundColor: "#10b981", color: "white", border: "none", padding: "10px 20px", borderRadius: "10px",
            fontWeight: "600", fontSize: "14px", cursor: "pointer", transition: "background-color 0.2s"
        },
        btnReject: {
            backgroundColor: "#f43f5e", color: "white", border: "none", padding: "10px 20px", borderRadius: "10px",
            fontWeight: "600", fontSize: "14px", cursor: "pointer", transition: "background-color 0.2s"
        },
        empty: {
            textAlign: "center",
            padding: "60px",
            color: "#64748b",
            backgroundColor: "white",
            borderRadius: "16px",
            border: "1px dashed #cbd5e1"
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.headerArea}>
                <h1 style={styles.title}>Duyệt Hồ Sơ Nhà Tuyển Dụng</h1>
                <span style={styles.badgeCount}>{employers.length} Đang chờ duyệt</span>
            </div>

            <div style={styles.list}>
                {employers.length === 0 ? (
                    <div style={styles.empty}>🎉 Toàn bộ hồ sơ doanh nghiệp đã được xử lý xong!</div>
                ) : (
                    employers.map(emp => (
                        <div key={emp.id} style={styles.card}>
                            {/* BÊN TRÁI: KHU VỰC CHỮ */}
                            <div style={styles.infoSide}>
                                <div style={styles.infoRow}>
                                    <span style={styles.label}>Mã ID đối tác:</span>
                                    <span style={styles.valueUid}>{emp.id}</span>
                                </div>
                                <div style={styles.infoRow}>
                                    <span style={styles.label}>Doanh nghiệp:</span>
                                    <span style={{...styles.valueTxt, fontWeight: "700", color: "#0f172a"}}>
                                        {emp.businessName || "(Trống tên - Vui lòng kiểm tra lại DB)"}
                                    </span>
                                </div>
                                <div style={styles.infoRow}>
                                    <span style={styles.label}>Lĩnh vực:</span>
                                    <span style={{
                                        ...styles.valueTxt,
                                        color: "#2563eb"
                                    }}>{emp.businessCategory || "Chưa cập nhật"}</span>
                                </div>
                                <div style={styles.infoRow}>
                                    <span style={styles.label}>Địa chỉ:</span>
                                    <span style={styles.valueTxt}>{emp.businessAddressText || "Chưa cập nhật"}</span>
                                </div>

                                {/* Nút bấm chuyển xuống góc trái thẻ cho dễ thao tác */}
                                <div style={styles.btnContainer}>
                                    <button
                                        onClick={() => approveEmployer(emp)}
                                        style={styles.btnApprove}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#059669"}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#10b981"}
                                    >
                                        ✓ Phê Duyệt
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

                            {/* BÊN PHẢI: KHU VỰC ẢNH MINH CHỨNG */}
                            <div style={styles.imageSide}>
                                <span style={{fontSize: "13px", fontWeight: "600", color: "#64748b"}}>Ảnh minh chứng mặt tiền</span>
                                {emp.businessStoreFrontImageUrl ? (
                                    <img src={emp.businessStoreFrontImageUrl} alt="Storefront"
                                         style={styles.imgPreview}/>
                                ) : (
                                    <div style={{
                                        ...styles.imgPreview,
                                        backgroundColor: "#f1f5f9",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#94a3b8",
                                        fontSize: "13px",
                                        fontStyle: "italic"
                                    }}>
                                        Không có hình ảnh
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}