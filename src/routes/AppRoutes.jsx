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
import StudentCancellation from "../pages/student/Cancellation";
import StudentProfile from "../pages/student/StudentProfile"; // ✅ Agregar esta importación

// JEFE PROGRAMA
import StudentsPending from "../pages/programhead/StudentPending";
import StudentProfileSecretary from "../pages/programhead/StudentProfile";

// COMITE
import CouncilDashboard from "../pages/committee/councilDashboard";
import CouncilStudentProfile from "../pages/committee/councilStudentProfile";
import CancellationRequests from "../pages/committee/CancellationRequests";

// ADMIN
import Roles from "../pages/admin/Roles";
import Permissions from "../pages/admin/Permissions";
import Users from "../pages/admin/User";
import Faculties from "../pages/admin/Faculties";
import Programs from "../pages/admin/Programs";
import Modalities from "../pages/admin/Modalities";
import Requirements from "../pages/admin/Requirements";
import Documents from "../pages/admin/Documents";
import Assignments from "../pages/admin/Assignments";
import ProgramDegreeModalities from "../pages/admin/ProgramDegreeModalities";

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
          <Route path="cancellation" element={<StudentCancellation />} />
          <Route path="profile" element={<StudentProfile />} /> {/* ✅ Agregar ruta de perfil */}
        </Route>
      </Route>

      {/* JEFE PROGRAMA */}
      <Route element={<ProtectedRoute allowedRoles={["PROGRAM_HEAD"]} />}>
        <Route path="/jefeprograma" element={<SecretaryLayout />}>
          <Route index element={<StudentsPending />} />
          <Route
            path="students/:studentModalityId"
            element={<StudentProfileSecretary />}
          />
        </Route>
      </Route>

      {/* COMITE */}
      <Route element={<ProtectedRoute allowedRoles={["PROGRAM_CURRICULUM_COMMITTEE"]} />}>
        <Route path="/comite" element={<CouncilLayout />}>
          <Route index element={<CouncilDashboard />} />
          <Route
            path="students/:studentModalityId"
            element={<CouncilStudentProfile />}
          />
          <Route path="cancellations" element={<CancellationRequests />} />
        </Route>
      </Route>

      {/* ADMIN - ✅ Cambiado a ADMIN (o mantén SUPERADMIN si así lo requieres) */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/faculties" replace />} />
          <Route path="roles" element={<Roles />} />
          <Route path="permissions" element={<Permissions />} />
          <Route path="users" element={<Users />} />
          <Route path="faculties" element={<Faculties />} />
          <Route path="programs" element={<Programs />} />
          <Route path="modalities" element={<Modalities />} />
          <Route path="program-credits" element={<ProgramDegreeModalities />} />
          <Route path="requirements" element={<Requirements />} />
          <Route path="documents" element={<Documents />} />
          <Route path="assignments" element={<Assignments />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;