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
import DirectorLayout from "../layouts/DirectorLayout";

// STUDENT
import StudentDashboard from "../pages/student/Dashboard";
import StudentModalities from "../pages/student/Modalities";
import StudentDocuments from "../pages/student/Documents";
import StudentStatus from "../pages/student/Status";
import StudentCancellation from "../pages/student/Cancellation";
import StudentProfile from "../pages/student/StudentProfile";

// SECRETARY
import StudentsPending from "../pages/programhead/StudentPending";
import StudentProfileSecretary from "../pages/programhead/StudentProfile";

// COUNCIL
import CouncilDashboard from "../pages/committee/councilDashboard";
import CouncilStudentProfile from "../pages/committee/councilStudentProfile";
import CancellationRequests from "../pages/committee/CancellationRequests";
import CommitteeDefenseProposals from "../pages/committee/defenseProposals"

// DIRECTOR
import DirectorDashboard from "../pages/director/DirectorDashboard";
import DirectorStudentProfile from "../pages/director/DirectorStudentProfile";
import DirectorCancellationRequests from "../pages/director/DirectorCancellationRequest";

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
import DefenseProposals from "../pages/committee/defenseProposals";

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
          <Route path="profile" element={<StudentProfile />} />
          <Route path="modalities" element={<StudentModalities />} />
          <Route path="documents" element={<StudentDocuments />} /> {/* ✅ NUEVA RUTA */}
          <Route path="status" element={<StudentStatus />} />
          <Route path="cancellation" element={<StudentCancellation />} />
        </Route>
      </Route>

      {/* SECRETARY / PROGRAM HEAD */}
      <Route element={<ProtectedRoute allowedRoles={["PROGRAM_HEAD"]} />}>
        <Route path="/jefeprograma" element={<SecretaryLayout />}>
          <Route index element={<StudentsPending />} />
          <Route
            path="students/:studentModalityId"
            element={<StudentProfileSecretary />}
          />
        </Route>
      </Route>

      {/* COUNCIL / COMMITTEE */}
      <Route element={<ProtectedRoute allowedRoles={["PROGRAM_CURRICULUM_COMMITTEE"]} />}>
        <Route path="/comite" element={<CouncilLayout />}>
          <Route index element={<CouncilDashboard />} />
          <Route
            path="students/:studentModalityId"
            element={<CouncilStudentProfile />}
          />
          <Route path="cancellations" element={<CancellationRequests />} />
          <Route path="proposals" element={<DefenseProposals/>} />

        </Route>
      </Route>

      {/* DIRECTOR */}
      <Route element={<ProtectedRoute allowedRoles={["PROJECT_DIRECTOR"]} />}>
        <Route path="/project-director" element={<DirectorLayout />}>
          <Route index element={<DirectorDashboard />} />
          <Route 
            path="students/:studentModalityId" 
            element={<DirectorStudentProfile />} 
          />
          <Route 
            path="cancellations" 
            element={<DirectorCancellationRequests />} 
          />
        </Route>
      </Route>

      {/* ADMIN */}
      <Route element={<ProtectedRoute allowedRoles={["SUPERADMIN"]} />}>
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