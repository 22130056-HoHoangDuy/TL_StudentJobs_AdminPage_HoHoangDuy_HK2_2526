import {Route, Routes} from "react-router-dom";
import AdminManagementSystem from "../pages/AdminManagementSystem.jsx";
import {DashboardPage} from "../pages/DashboardPage.jsx";
import EmployerPendingPage from "../pages/EmployerPendingPage.jsx";
import {SubscriptionPendingPage} from "../pages/SubscriptionPendingPage.jsx";

export default function AppRoutes() {
    return (
        <Routes>
            {/* Giao diện tổng bọc Sidebar */}
            <Route path="/" element={<AdminManagementSystem/>}/>

            {/* Các tuyến đường dẫn phụ */}
            <Route path="/dashboard" element={<DashboardPage/>}/>

            {/* Hàng chờ duyệt Nhà Tuyển Dụng (Cả đường dẫn ngắn và đường dẫn đầy đủ) */}
            <Route path="/employer-pending" element={<EmployerPendingPage/>}/>
            <Route path="/employers/pending" element={<EmployerPendingPage/>}/>

            {/* Hàng chờ duyệt gói cước VIP PLUS (Cả đường dẫn ngắn và đường dẫn đầy đủ) */}
            <Route path="/subscription-pending" element={<SubscriptionPendingPage/>}/>
            <Route path="/subscriptions/pending" element={<SubscriptionPendingPage/>}/>
        </Routes>
    );
}