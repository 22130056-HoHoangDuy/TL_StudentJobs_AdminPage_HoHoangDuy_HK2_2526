import { Routes, Route } from "react-router-dom";

import DashboardPage from "../pages/DashboardPage";

import EmployerPendingPage from "../pages/EmployerPendingPage";
import SubscriptionPendingPage from "../pages/SubscriptionPendingPage.jsx";

export default function AppRoutes() {

    return (

        <Routes>

            <Route
                path="/"
                element={<DashboardPage />}
            />

            <Route
                path="/employers/pending"
                element={<EmployerPendingPage />}
            />
            <Route
                path="/subscription/pending"
                element={<SubscriptionPendingPage/>}
            />

        </Routes>
    )
}