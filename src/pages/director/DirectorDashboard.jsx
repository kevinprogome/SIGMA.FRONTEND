import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDirectorStudents,
  DIRECTOR_STATUS_OPTIONS,
  getStatusBadgeClass,
  getStatusLabel,
  getErrorMessage,
} from "../../services/directorService";
import "../../styles/director/directorDashboard.css";

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
    return <div className="director-loading">Cargando estudiantes...</div>;
  }

  return (
    <div className="director-container">
      <div className="director-header">
        <div className="director-header-content">
          <h1 className="director-title">Mis Estudiantes Asignados</h1>
          <p className="director-subtitle">
            Vista general de estudiantes bajo tu dirección, con información detallada sobre su modalidad, estado académico y contacto para seguimiento.
          </p>
        </div>
      </div>

      {message && (
        <div className={`director-message ${message.includes("Error") ? "error" : "success"}`}>
          <span>{message}</span>
          <button onClick={() => setMessage("")}>✕</button>
        </div>
      )}

      {/* Filtros */}
      <div className="director-filter-panel">
        {/* Búsqueda por nombre */}
        <div className="director-filter-group">
          <label className="director-filter-label">Buscar por nombre o Correo institucional</label>
          <form className="director-search-box" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar estudiante..."
              className="director-input"
            />
            <button type="submit" className="director-btn director-btn-primary">
              Buscar
            </button>
          </form>
        </div>

        {/* Filtro por estado (select múltiple) */}
        <div className="director-filter-group">
          <label className="director-filter-label">Filtrar por estado</label>
          <select
            className="director-status-select"
            value={selectedStatuses}
            onChange={e => {
              const options = Array.from(e.target.selectedOptions, option => option.value);
              setSelectedStatuses(options.filter(v => v !== ""));
            }}
            multiple
            size={Math.min(5, DIRECTOR_STATUS_OPTIONS.length)}
            disabled={DIRECTOR_STATUS_OPTIONS.length === 0}
          >
            <option value="">-- Todos los estados --</option>
            {DIRECTOR_STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <div className="director-status-select-hint">(Ctrl/Cmd + clic para seleccionar varios)</div>
        </div>

        {/* Botón limpiar filtros */}
        {(selectedStatuses.length > 0 || searchName) && (
          <button 
            onClick={handleClearFilters}
            className="director-btn director-btn-secondary"
            style={{ marginTop: "1rem", width: "100%" }}
          >
            ✕ Limpiar Filtros
          </button>
        )}
      </div>

      {/* Indicador de resultados */}
      <div className="director-stats-bar">
        <strong>
          {filteredStudents.length === students.length
            ? `Total: ${students.length} estudiante${students.length !== 1 ? 's' : ''}`
            : `Mostrando ${filteredStudents.length} de ${students.length} estudiante${students.length !== 1 ? 's' : ''}`
          }
        </strong>
      </div>

      {/* Tabla de estudiantes */}
      <div className="director-table-container">
        <table className="director-table">
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
                <td colSpan="6" style={{ textAlign: "center", padding: "3rem" }}>
                  <div className="director-empty-state">
                    <div className="director-empty-icon">📭</div>
                    <div className="director-empty-text">
                      {students.length === 0 
                        ? "No tienes estudiantes asignados"
                        : "No hay estudiantes que coincidan con los filtros"}
                    </div>
                  </div>
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
                    <span className={`director-status-badge ${getStatusBadgeClass(student.currentStatus)}`}>
                      {getStatusLabel(student.currentStatus)}
                    </span>
                    {student.hasPendingActions && (
                      <div className="director-attention-badge">⚠️ Requiere atención</div>
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
                      className="director-btn-action"
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