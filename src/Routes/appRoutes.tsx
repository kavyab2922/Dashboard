import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "../Components/layout";
import DashboardPage from "../Pages/Dashboard/dashboard";
import NotFoundPage from "../Pages/notFound";
import { canAccessRoute } from "./routeProtection";

const AppRoutes = () => {
  if (!canAccessRoute()) {
    return <Navigate to="/not-found" replace />;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>
      <Route path="/not-found" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  );
};

export default AppRoutes;
