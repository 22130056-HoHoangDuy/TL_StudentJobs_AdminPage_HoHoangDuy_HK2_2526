import { Routes, Route } from "react-router-dom";

import DashboardPage from "../pages/DashboardPage";

import EmployerPendingPage from "../pages/EmployerPendingPage";

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

        </Routes>
    )
}