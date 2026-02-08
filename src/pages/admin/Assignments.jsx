import { useEffect, useState } from "react";
import {
  getAllUsers,
  getAllAcademicPrograms,
  getAllFaculties,
  assignProgramHead,
  assignProjectDirector,
  assignCommitteeMember,
  getCommitteeMembers,
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
  const [committeeMembers, setCommitteeMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Filtros para crear asignación
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [filteredPrograms, setFilteredPrograms] = useState([]);

  // Filtros para ver asignaciones
  const [viewFacultyFilter, setViewFacultyFilter] = useState("");
  const [viewProgramFilter, setViewProgramFilter] = useState("");

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

  useEffect(() => {
    fetchAssignments();
  }, [viewFacultyFilter, viewProgramFilter]);

  const fetchInitialData = async () => {
    try {
      const [usersData, programsData, facultiesData] = await Promise.all([
        getAllUsers(),
        getAllAcademicPrograms(),
        getAllFaculties(),
      ]);
      
      setUsers(Array.isArray(usersData) ? usersData : []);
      setPrograms(Array.isArray(programsData) ? programsData : []);
      setFaculties(Array.isArray(facultiesData) ? facultiesData : []);
      setFilteredPrograms(Array.isArray(programsData) ? programsData : []);
      
      // Cargar asignaciones inmediatamente
      await fetchAssignments();
    } catch (err) {
      console.error("❌ Error loading data:", err);
      setMessage("Error al cargar datos: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    setLoadingMembers(true);
    try {
      const filters = {};
      if (viewProgramFilter) filters.academicProgramId = viewProgramFilter;
      if (viewFacultyFilter) filters.facultyId = viewFacultyFilter;

      console.log("📋 Fetching committee members with filters:", filters);
      
      const committeeData = await getCommitteeMembers(filters);

      console.log("✅ Committee Members received:", committeeData);

      setCommitteeMembers(Array.isArray(committeeData) ? committeeData : []);
    } catch (err) {
      console.error("❌ Error fetching assignments:", err);
      console.error("❌ Error details:", err.response?.data);
      setCommitteeMembers([]);
      
      const errorMsg = err.response?.data?.message || err.response?.data || err.message;
      setMessage("Error al cargar miembros del comité: " + errorMsg);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      assignmentType: "",
      userId: "",
      academicProgramId: "",
    });
    setSelectedFacultyId("");
    setMessage(""); // Limpiar mensajes anteriores
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
      
      setMessage(`✅ ${assignmentConfig.label} asignado exitosamente`);
      setShowModal(false);
      
      // Refrescar la lista
      await fetchAssignments();
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("❌ Error assigning user:", err);
      const errorMsg = err.response?.data?.message || err.response?.data || "Error al asignar usuario";
      setMessage("❌ " + errorMsg);
    }
  };

  const getFullName = (member) => {
    if (!member) return "Usuario no encontrado";
    const name = member.name || "";
    const lastName = member.lastName || "";
    return `${name} ${lastName}`.trim() || "Sin nombre";
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
          <h1 className="admin-page-title">Gestión de Asignaciones</h1>
          <p className="admin-page-subtitle">
            Asigna usuarios a programas y visualiza los miembros del comité curricular
          </p>
        </div>
        <button onClick={handleOpenModal} className="admin-btn-primary">
          ➕ Nueva Asignación
        </button>
      </div>

      {message && (
        <div className={`admin-message ${message.includes("Error") || message.includes("❌") ? "error" : "success"}`}>
          {message}
          <button 
            onClick={() => setMessage("")} 
            style={{ 
              marginLeft: "auto", 
              background: "transparent", 
              border: "none", 
              cursor: "pointer",
              fontSize: "1.2rem",
              color: "inherit"
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Filtros */}
      <div style={{ 
        display: "flex", 
        gap: "1rem", 
        marginBottom: "2rem",
        padding: "1.5rem",
        background: "#f8f9fa",
        borderRadius: "8px"
      }}>
        <div className="admin-form-group" style={{ flex: 1, marginBottom: 0 }}>
          <label className="admin-label">Filtrar por Facultad</label>
          <select
            value={viewFacultyFilter}
            onChange={(e) => {
              setViewFacultyFilter(e.target.value);
              setViewProgramFilter(""); // Reset program filter
            }}
            className="admin-select"
          >
            <option value="">-- Todas las facultades --</option>
            {faculties.map((faculty) => (
              <option key={faculty.id} value={faculty.id}>
                {faculty.name}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-form-group" style={{ flex: 1, marginBottom: 0 }}>
          <label className="admin-label">Filtrar por Programa</label>
          <select
            value={viewProgramFilter}
            onChange={(e) => setViewProgramFilter(e.target.value)}
            className="admin-select"
            disabled={!viewFacultyFilter && programs.length > 20} // Deshabilitar si no hay facultad y hay muchos programas
          >
            <option value="">
              {viewFacultyFilter ? "-- Todos los programas --" : "-- Primero selecciona una facultad --"}
            </option>
            {programs
              .filter(p => !viewFacultyFilter || p.facultyId === parseInt(viewFacultyFilter))
              .map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Tabla de Miembros del Comité Curricular */}
      <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
          Miembros del Comité Curricular
        </h2>
        
        {loadingMembers ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
            <div className="admin-loading" style={{ display: "inline-block" }}>
              Cargando miembros...
            </div>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Programa Académico</th>
                </tr>
              </thead>
              <tbody>
                {committeeMembers.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: "center", padding: "3rem", color: "#999" }}>
                      {viewFacultyFilter || viewProgramFilter 
                        ? "No hay miembros asignados con los filtros seleccionados" 
                        : "No hay miembros del comité asignados"}
                    </td>
                  </tr>
                ) : (
                  committeeMembers.map((member, idx) => (
                    <tr key={member.id || idx}>
                      <td>
                        <strong>{getFullName(member)}</strong>
                      </td>
                      <td>{member.email || "N/A"}</td>
                      <td>
                        <span className="admin-tag">
                          {viewProgramFilter 
                            ? getProgramName(parseInt(viewProgramFilter))
                            : "Múltiples programas"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
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
                  onChange={(e) => {
                    setSelectedFacultyId(e.target.value);
                    setFormData({ ...formData, academicProgramId: "" }); // Reset program
                  }}
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
                  Filtra los programas académicos por facultad
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
                      {program.name}
                      {!selectedFacultyId && ` - ${getFacultyName(program.facultyId)}`}
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