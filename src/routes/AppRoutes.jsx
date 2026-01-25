import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProtectedRoute from "./ProtectedRoute";
import StudentLayout from "../layouts/StudentLayout";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import StudentDashboard from "../pages/student/Dashboard";
import StudentModalities from "../pages/student/Modalities";
import StudentStatus from "../pages/student/Status";

function AppRoutes() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />



      {/* Protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="modalities" element={<StudentModalities />} />
          <Route path="status" element={<StudentStatus />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default AppRoutes;
