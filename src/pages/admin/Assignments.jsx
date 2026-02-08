import { useEffect, useState } from "react";
import {
  getAllUsers,
  getAllAcademicPrograms,
  getAllFaculties,
  assignProgramHead,
  assignProjectDirector,
  assignCommitteeMember,
} from "../../services/adminService";
import "../../styles/admin/Roles.css";

const ASSIGNMENT_TYPES = [
  { value: "PROGRAM_HEAD", label: "Jefe de Programa", endpoint: assignProgramHead },
  { value: "PROJECT_DIRECTOR", label: "Director de Proyecto", endpoint: assignProjectDirector },
  { value: "COMMITTEE_MEMBER", label: "Miembro de Comité", endpoint: assignCommitteeMember },
];

export default function Assignments() {
  const [users, setUsers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [filteredPrograms, setFilteredPrograms] = useState([]);

  const [formData, setFormData] = useState({
    assignmentType: "",
    userId: "",
    academicProgramId: "",
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedFacultyId) {
      const filtered = programs.filter(p => p.facultyId === parseInt(selectedFacultyId));
      setFilteredPrograms(filtered);
    } else {
      setFilteredPrograms(programs);
    }
  }, [selectedFacultyId, programs]);

  const fetchInitialData = async () => {
    try {
      const [usersData, programsData, facultiesData] = await Promise.all([
        getAllUsers(),
        getAllAcademicPrograms(),
        getAllFaculties(),
      ]);
      setUsers(usersData);
      setPrograms(programsData);
      setFaculties(facultiesData);
    } catch (err) {
      setMessage("Error al cargar datos: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      assignmentType: "",
      userId: "",
      academicProgramId: "",
    });
    setSelectedFacultyId("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const assignmentConfig = ASSIGNMENT_TYPES.find(
      t => t.value === formData.assignmentType
    );
    
    if (!assignmentConfig) {
      setMessage("Tipo de asignación no válido");
      return;
    }

    try {
      await assignmentConfig.endpoint({
        userId: parseInt(formData.userId),
        academicProgramId: parseInt(formData.academicProgramId),
      });
      
      setMessage(`${assignmentConfig.label} asignado exitosamente`);
      setShowModal(false);
      
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.response?.data || "Error al asignar usuario");
    }
  };

  const getFullName = (user) => {
    if (user.name) {
      return user.name;
    }
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'Sin nombre';
  };

  const getProgramName = (programId) => {
    const program = programs.find(p => p.id === programId);
    return program ? program.name : "Programa no encontrado";
  };

  const getFacultyName = (facultyId) => {
    const faculty = faculties.find(f => f.id === facultyId);
    return faculty ? faculty.name : "Sin facultad";
  };

  if (loading) {
    return <div className="admin-loading">Cargando datos...</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Asignaciones de Usuarios</h1>
          <p className="admin-page-subtitle">Asigna jefes de programa, directores y miembros de comité</p>
        </div>
        <button onClick={handleOpenModal} className="admin-btn-primary">
          ➕ Nueva Asignación
        </button>
      </div>

      {message && (
        <div className={`admin-message ${message.includes("Error") || message.includes("error") ? "error" : "success"}`}>
          {message}
          <button onClick={() => setMessage("")} style={{ marginLeft: "1rem" }}>✕</button>
        </div>
      )}

      <div style={{ 
        background: "#f8f9fa", 
        padding: "2rem", 
        borderRadius: "8px",
        textAlign: "center",
        marginTop: "2rem"
      }}>
        <p style={{ fontSize: "1.1rem", color: "#666" }}>
          Utiliza el botón "Nueva Asignación" para asignar usuarios a programas académicos.
        </p>
        <p style={{ fontSize: "0.95rem", color: "#999", marginTop: "0.5rem" }}>
          Puedes asignar jefes de programa, directores de proyecto o miembros de comité curricular.
        </p>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Nueva Asignación de Usuario</h2>
              <button onClick={() => setShowModal(false)} className="admin-modal-close">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form-group">
                <label className="admin-label">Tipo de Asignación *</label>
                <select
                  value={formData.assignmentType}
                  onChange={(e) => setFormData({ ...formData, assignmentType: e.target.value })}
                  className="admin-select"
                  required
                >
                  <option value="">-- Selecciona el tipo de asignación --</option>
                  {ASSIGNMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Usuario *</label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="admin-select"
                  required
                >
                  <option value="">-- Selecciona un usuario --</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {getFullName(user)} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Facultad (Filtro)</label>
                <select
                  value={selectedFacultyId}
                  onChange={(e) => setSelectedFacultyId(e.target.value)}
                  className="admin-select"
                >
                  <option value="">-- Todas las facultades --</option>
                  {faculties.map((faculty) => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </option>
                  ))}
                </select>
                <small style={{ color: "#666", marginTop: "0.5rem", display: "block" }}>
                  Filtra los programas por facultad
                </small>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Programa Académico *</label>
                <select
                  value={formData.academicProgramId}
                  onChange={(e) => setFormData({ ...formData, academicProgramId: e.target.value })}
                  className="admin-select"
                  required
                >
                  <option value="">-- Selecciona un programa académico --</option>
                  {filteredPrograms.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name} - {getFacultyName(program.facultyId)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="admin-btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="admin-btn-primary">
                  Asignar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}