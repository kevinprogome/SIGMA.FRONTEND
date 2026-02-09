import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDirectorStudents,
  DIRECTOR_STATUS_OPTIONS,
  getStatusBadgeClass,
  getStatusLabel,
  getErrorMessage,
} from "../../services/directorService";
import "../../styles/admin/Roles.css";

export default function DirectorDashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  
  // Filtros
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [students, selectedStatuses, searchName]);

  const fetchStudents = async () => {
    try {
      const data = await getDirectorStudents();
      console.log("Students data:", data);
      setStudents(Array.isArray(data) ? data : []);
      setFilteredStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching students:", err);
      setMessage("Error al cargar estudiantes: " + getErrorMessage(err));
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...students];

    // Filtrar por estados seleccionados
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(student => 
        selectedStatuses.includes(student.currentStatus)
      );
    }

    // Filtrar por nombre
    if (searchName.trim()) {
      const searchLower = searchName.toLowerCase();
      filtered = filtered.filter(student => {
        const fullName = `${student.studentName || ''}`.toLowerCase();
        const email = (student.studentEmail || '').toLowerCase();
        
        return fullName.includes(searchLower) || 
               email.includes(searchLower);
      });
    }

    setFilteredStudents(filtered);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchName(searchInput);
  };

  const handleClearFilters = () => {
    setSelectedStatuses([]);
    setSearchName("");
    setSearchInput("");
  };

  const handleStatusToggle = (status) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleViewProfile = (studentModalityId) => {
    navigate(`/project-director/students/${studentModalityId}`);
  };

  if (loading) {
    return <div className="admin-loading">Cargando estudiantes...</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Mis Estudiantes Asignados</h1>
          <p className="admin-page-subtitle">
            Vista general de estudiantes bajo tu dirección
          </p>
        </div>
      </div>

      {message && (
        <div className={`admin-message ${message.includes("Error") ? "error" : "success"}`}>
          {message}
          <button onClick={() => setMessage("")} style={{ marginLeft: "1rem" }}>✕</button>
        </div>
      )}

      {/* Filtros */}
      <div style={{ marginBottom: "2rem" }}>
        {/* Búsqueda por nombre */}
        <div className="admin-form-group" style={{ marginBottom: "1rem" }}>
          <label className="admin-label">Buscar por nombre o email</label>
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar estudiante..."
              className="admin-input"
              style={{ flex: 1 }}
            />
            <button type="submit" className="admin-btn-primary">
              Buscar
            </button>
          </form>
        </div>

        {/* Filtros por estado */}
        <div className="admin-form-group">
          <label className="admin-label">Filtrar por estado</label>
          <div style={{ 
            display: "flex", 
            flexWrap: "wrap", 
            gap: "0.5rem",
            marginTop: "0.5rem"
          }}>
            {DIRECTOR_STATUS_OPTIONS.map((status) => (
              <label 
                key={status.value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0.5rem 1rem",
                  background: selectedStatuses.includes(status.value) ? "#3b82f6" : "#f3f4f6",
                  color: selectedStatuses.includes(status.value) ? "white" : "#374151",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  transition: "all 0.2s"
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(status.value)}
                  onChange={() => handleStatusToggle(status.value)}
                  style={{ marginRight: "0.5rem" }}
                />
                {status.label}
              </label>
            ))}
          </div>
        </div>

        {/* Botón limpiar filtros */}
        {(selectedStatuses.length > 0 || searchName) && (
          <button 
            onClick={handleClearFilters}
            className="admin-btn-secondary"
            style={{ marginTop: "1rem" }}
          >
            ✕ Limpiar Filtros
          </button>
        )}
      </div>

      {/* Indicador de resultados */}
      <div style={{ 
        padding: "1rem", 
        background: "#f9fafb", 
        borderRadius: "6px",
        marginBottom: "1rem"
      }}>
        <strong>
          {filteredStudents.length === students.length
            ? `Total: ${students.length} estudiante${students.length !== 1 ? 's' : ''}`
            : `Mostrando ${filteredStudents.length} de ${students.length} estudiante${students.length !== 1 ? 's' : ''}`
          }
        </strong>
      </div>

      {/* Tabla de estudiantes */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Email</th>
              <th>Modalidad</th>
              <th>Estado</th>
              <th>Última Actualización</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "3rem", color: "#999" }}>
                  {students.length === 0 
                    ? "No tienes estudiantes asignados"
                    : "No hay estudiantes que coincidan con los filtros"}
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.studentModalityId}>
                  <td>
                    <strong>{student.studentName}</strong>
                  </td>
                  <td>{student.studentEmail}</td>
                  <td>{student.modalityName}</td>
                  <td>
                    <span className={`admin-status-badge ${getStatusBadgeClass(student.currentStatus)}`}>
                      {getStatusLabel(student.currentStatus)}
                    </span>
                    {student.hasPendingActions && (
                      <div style={{ marginTop: "0.25rem" }}>
                        <span style={{ 
                          fontSize: "0.75rem", 
                          color: "#f59e0b",
                          fontWeight: "600"
                        }}>
                          ⚠️ Requiere atención
                        </span>
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                    {student.lastUpdatedAt 
                      ? new Date(student.lastUpdatedAt).toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : "N/A"
                    }
                  </td>
                  <td>
                    <button
                      onClick={() => handleViewProfile(student.studentModalityId)}
                      className="admin-btn-action"
                    >
                      Ver Perfil
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}