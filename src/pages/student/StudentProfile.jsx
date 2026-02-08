import { useEffect, useState } from "react";
import {
  getStudentProfile,
  saveStudentProfile,
  getActiveFacultiesStudent,
  getActiveProgramsStudent,
} from "../../services/studentService";
import "../../styles/student/studentProfile.css";

export default function StudentProfile() {
  const [profile, setProfile] = useState({
    facultyId: "",
    academicProgramId: "",
    approvedCredits: "",
    gpa: "",
    semester: "",
    studentCode: "",
  });

  const [userInfo, setUserInfo] = useState({
    name: "",
    lastname: "",
    email: "",
  });

  const [faculties, setFaculties] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [allPrograms, setAllPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Cargar datos en paralelo
        const [facultiesData, programsData, profileData] = await Promise.all([
          getActiveFacultiesStudent().catch(err => {
            console.error("Error al cargar facultades:", err);
            return [];
          }),
          getActiveProgramsStudent().catch(err => {
            console.error("Error al cargar programas:", err);
            return [];
          }),
          getStudentProfile().catch(err => {
            console.error("Error al cargar perfil:", err);
            throw err;
          })
        ]);

        console.log("📚 Facultades cargadas:", facultiesData);
        console.log("📖 Programas cargados:", programsData);
        console.log("👤 Perfil cargado:", profileData);

        // Asegurar que sean arrays
        setFaculties(Array.isArray(facultiesData) ? facultiesData : []);
        setAllPrograms(Array.isArray(programsData) ? programsData : []);

        setUserInfo({
          name: profileData.name || "",
          lastname: profileData.lastname || "",
          email: profileData.email || "",
        });

        // ✅ MAPEAR NOMBRES A IDs
        let facultyId = "";
        let academicProgramId = "";

        // Si el perfil tiene el nombre de la facultad, buscar su ID
        if (profileData.faculty && Array.isArray(facultiesData)) {
          const faculty = facultiesData.find(f => f.name === profileData.faculty);
          if (faculty) {
            facultyId = faculty.id;
            console.log("✅ Facultad encontrada:", faculty.name, "ID:", faculty.id);
          }
        }

        // Si el perfil tiene el nombre del programa, buscar su ID
        if (profileData.academicProgram && Array.isArray(programsData)) {
          const program = programsData.find(p => p.name === profileData.academicProgram);
          if (program) {
            academicProgramId = program.id;
            console.log("✅ Programa encontrado:", program.name, "ID:", program.id);
          }
        }

        setProfile({
          facultyId: facultyId || "",
          academicProgramId: academicProgramId || "",
          approvedCredits: profileData.approvedCredits ?? "",
          gpa: profileData.gpa ?? "",
          semester: profileData.semester ?? "",
          studentCode: profileData.studentCode ?? "",
        });

        // Filtrar programas si ya tiene facultad seleccionada
        if (facultyId && Array.isArray(programsData)) {
          const filtered = programsData.filter(p => p.facultyId === facultyId);
          setPrograms(filtered);
          console.log("📋 Programas filtrados:", filtered);
        }
      } catch (err) {
        console.error("❌ Error completo:", err);
        const errorMsg = err.response?.data?.message 
          || err.response?.data 
          || err.message
          || "No se pudo cargar el perfil";
        setMessage(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Filtrar programas cuando cambia la facultad
  useEffect(() => {
    if (profile.facultyId) {
      const filtered = allPrograms.filter(
        p => p.facultyId === parseInt(profile.facultyId)
      );
      setPrograms(filtered);
      
      // Si el programa actual no pertenece a la nueva facultad, resetear
      const programBelongsToFaculty = filtered.some(
        p => p.id === parseInt(profile.academicProgramId)
      );
      
      if (!programBelongsToFaculty && profile.academicProgramId) {
        setProfile(prev => ({ ...prev, academicProgramId: "" }));
      }
    } else {
      setPrograms([]);
      setProfile(prev => ({ ...prev, academicProgramId: "" }));
    }
  }, [profile.facultyId, allPrograms, profile.academicProgramId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setProfile({
      ...profile,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSaving(true);

    // Validaciones adicionales
    if (!profile.facultyId) {
      setMessage("Por favor selecciona una facultad");
      setSaving(false);
      return;
    }

    if (!profile.academicProgramId) {
      setMessage("Por favor selecciona un programa académico");
      setSaving(false);
      return;
    }

    try {
      // Asegurar que todos los valores numéricos sean válidos
      const approvedCredits = parseInt(profile.approvedCredits);
      const gpa = parseFloat(profile.gpa);
      const semester = parseInt(profile.semester);
      const facultyId = parseInt(profile.facultyId);
      const academicProgramId = parseInt(profile.academicProgramId);

      // Validar que las conversiones fueron exitosas
      if (isNaN(approvedCredits) || isNaN(gpa) || isNaN(semester) || isNaN(facultyId) || isNaN(academicProgramId)) {
        setMessage("Error: Algunos campos tienen valores inválidos");
        setSaving(false);
        return;
      }

      const profileData = {
        facultyId,
        academicProgramId,
        approvedCredits,
        gpa,
        semester,
        studentCode: profile.studentCode.trim(),
      };

      console.log("📤 Enviando perfil:", profileData);

      const response = await saveStudentProfile(profileData);
      
      console.log("✅ Respuesta del servidor:", response);
      
      setMessage(response.message || response.data || "Perfil actualizado correctamente");

    } catch (err) {
      console.error("❌ Error al guardar:", err);
      console.error("❌ Respuesta del error:", err.response);
      
      const errorMsg = err.response?.data?.message 
        || err.response?.data 
        || err.message
        || "No se pudo guardar el perfil";
      setMessage(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="profile-loading">Cargando perfil...</p>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1>Perfil del Estudiante</h1>
          <p>Consulta y actualiza tu información académica</p>
        </div>

        <div className="profile-body">
          {/* INFO USUARIO */}
          <div className="profile-info">
            <p>
              <strong>Nombre:</strong> {userInfo.name} {userInfo.lastname}
            </p>
            <p>
              <strong>Email:</strong> {userInfo.email}
            </p>
          </div>

          {message && (
            <div className={`profile-message ${message.includes("Error") || message.includes("favor") || message.includes("pudo") || message.includes("inválidos") ? "error" : "success"}`}>
              {message}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit}>
            {/* FACULTAD */}
            <div className="profile-group">
              <label>Facultad *</label>
              <select
                name="facultyId"
                value={profile.facultyId}
                onChange={handleChange}
                required
                disabled={saving}
              >
                <option value="">-- Selecciona una facultad --</option>
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </option>
                ))}
              </select>
            </div>

            {/* PROGRAMA ACADÉMICO */}
            <div className="profile-group">
              <label>Programa Académico *</label>
              <select
                name="academicProgramId"
                value={profile.academicProgramId}
                onChange={handleChange}
                required
                disabled={!profile.facultyId || saving}
              >
                <option value="">
                  {profile.facultyId 
                    ? "-- Selecciona un programa --" 
                    : "-- Primero selecciona una facultad --"}
                </option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>

            {/* CÓDIGO ESTUDIANTIL */}
            <div className="profile-group">
              <label>Código estudiantil *</label>
              <input
                type="text"
                name="studentCode"
                value={profile.studentCode}
                onChange={handleChange}
                placeholder="Ej: 20221204357"
                required
                disabled={saving}
              />
            </div>

            {/* SEMESTRE */}
            <div className="profile-group">
              <label>Semestre *</label>
              <input
                type="number"
                name="semester"
                value={profile.semester}
                onChange={handleChange}
                min="1"
                max="10"
                required
                disabled={saving}
              />
              <small style={{ color: "#666", fontSize: "0.85rem" }}>
                Debe estar entre 1 y 10
              </small>
            </div>

            {/* CRÉDITOS APROBADOS */}
            <div className="profile-group">
              <label>Créditos aprobados *</label>
              <input
                type="number"
                name="approvedCredits"
                value={profile.approvedCredits}
                onChange={handleChange}
                min="0"
                max="180"
                required
                disabled={saving}
              />
              <small style={{ color: "#666", fontSize: "0.85rem" }}>
                Máximo 180 créditos
              </small>
            </div>

            {/* GPA */}
            <div className="profile-group">
              <label>Promedio (GPA) *</label>
              <input
                type="number"
                step="0.01"
                name="gpa"
                value={profile.gpa}
                onChange={handleChange}
                min="0"
                max="5"
                required
                disabled={saving}
              />
              <small style={{ color: "#666", fontSize: "0.85rem" }}>
                Debe estar entre 0.0 y 5.0
              </small>
            </div>

            <button 
              className="profile-button" 
              type="submit"
              disabled={saving}
            >
              {saving ? "⏳ Guardando..." : "💾 Guardar perfil"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}