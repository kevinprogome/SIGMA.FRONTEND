import { Routes, Route, Navigate } from "react-router-dom";

// Públicas
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

// Protección
import ProtectedRoute from "./ProtectedRoute";

// Layouts
import StudentLayout from "../layouts/StudentLayout";
import SecretaryLayout from "../layouts/SecretaryLayout";
import CouncilLayout from "../layouts/CouncilLayout";
import AdminLayout from "../layouts/AdminLayout";

// STUDENT
import StudentDashboard from "../pages/student/Dashboard";
import StudentModalities from "../pages/student/Modalities";
import StudentStatus from "../pages/student/Status";
import StudentCancellation from "../pages/student/Cancellation"; // ← NUEVO

// SECRETARY
import StudentsPending from "../pages/secretary/StudentPending";
import StudentProfileSecretary from "../pages/secretary/StudentProfile";

// COUNCIL
import CouncilDashboard from "../pages/council/councilDashboard";
import CouncilStudentProfile from "../pages/council/councilStudentProfile";
import CancellationRequests from "../pages/council/CancellationRequests";

// ADMIN
import Roles from "../pages/admin/Roles";
import Permissions from "../pages/admin/Permissions";
import Users from "../pages/admin/User";
import Modalities from "../pages/admin/Modalities";
import Requirements from "../pages/admin/Requirements";
import Documents from "../pages/admin/Documents";

function AppRoutes() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* STUDENT */}
      <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="modalities" element={<StudentModalities />} />
          <Route path="status" element={<StudentStatus />} />
          <Route path="cancellation" element={<StudentCancellation />} /> {/* ← NUEVO */}
        </Route>
      </Route>

      {/* SECRETARY */}
      <Route element={<ProtectedRoute allowedRoles={["SECRETARY"]} />}>
        <Route path="/secretary" element={<SecretaryLayout />}>
          <Route index element={<StudentsPending />} />
          <Route
            path="students/:studentModalityId"
            element={<StudentProfileSecretary />}
          />
        </Route>
      </Route>

      {/* COUNCIL */}
      <Route element={<ProtectedRoute allowedRoles={["COUNCIL"]} />}>
        <Route path="/council" element={<CouncilLayout />}>
          <Route index element={<CouncilDashboard />} />
          <Route
            path="students/:studentModalityId"
            element={<CouncilStudentProfile />}
          />
          <Route path="cancellations" element={<CancellationRequests />} />
        </Route>
      </Route>

      {/* ADMIN */}
      <Route element={<ProtectedRoute allowedRoles={["SUPERADMIN"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/roles" replace />} />
          <Route path="roles" element={<Roles />} />
          <Route path="permissions" element={<Permissions />} />
          <Route path="users" element={<Users />} />
          <Route path="modalities" element={<Modalities />} />
          <Route path="requirements" element={<Requirements />} />
          <Route path="documents" element={<Documents />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;