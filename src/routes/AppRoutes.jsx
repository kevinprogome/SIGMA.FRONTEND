import { Routes, Route, Navigate } from "react-router-dom";

// Páginas públicas
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

// Protección de rutas
import ProtectedRoute from "./ProtectedRoute";

// Layouts
import StudentLayout from "../layouts/StudentLayout";
import SecretaryLayout from "../layouts/SecretaryLayout";

// STUDENT
import StudentDashboard from "../pages/student/Dashboard";
import StudentModalities from "../pages/student/Modalities";
import StudentStatus from "../pages/student/Status";

// SECRETARY
import StudentsPending from "../pages/secretary/StudentPending";
import StudentProfileSecretary from "../pages/secretary/StudentProfile";

function AppRoutes() {
  return (
    <Routes>
      {/* 🌐 RUTAS PÚBLICAS */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* 🔐 RUTAS STUDENT */}
      <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="modalities" element={<StudentModalities />} />
          <Route path="status" element={<StudentStatus />} />
        </Route>
      </Route>

      {/* 🔐 RUTAS SECRETARY */}
      <Route element={<ProtectedRoute allowedRoles={["SECRETARY"]} />}>
        <Route path="/secretary" element={<SecretaryLayout />}>
          <Route index element={<StudentsPending />} />
          <Route
            path="students/:studentModalityId"
            element={<StudentProfileSecretary />}
          />
        </Route>
      </Route>

      {/* 🔁 FALLBACK */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;