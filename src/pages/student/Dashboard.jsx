import { useState } from "react";
import StudentProfile from "./StudentProfile";
import Modalities from "./Modalities";

export default function StudentDashboard() {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("studentProfile");
    return saved ? JSON.parse(saved) : null;
  });

  const basicInfo = JSON.parse(
    localStorage.getItem("studentBasicInfo")
  );

  const [editing, setEditing] = useState(false);

  if (!profile || editing) {
    return (
      <StudentProfile
        initialData={profile}
        onProfileCreated={(p) => {
          setProfile(p);
          setEditing(false);
        }}
      />
    );
  }

  return (
    <div>
      <h2>
        Bienvenido{" "}
        <strong>
          {basicInfo?.firstName} {basicInfo?.lastName}
        </strong>
      </h2>

      <p><strong>Email:</strong> {basicInfo?.email}</p>

      <hr />

      <h3>Perfil académico</h3>
      <p><strong>Código:</strong> {profile.studentCode}</p>
      <p><strong>Créditos aprobados:</strong> {profile.approvedCredits}</p>
      <p><strong>Promedio:</strong> {profile.gpa}</p>
      <p><strong>Semestre:</strong> {profile.semester}</p>

      <button onClick={() => setEditing(true)}>
        Editar perfil
      </button>

      <hr />

      <Modalities profile={profile} />
    </div>
  );
}
