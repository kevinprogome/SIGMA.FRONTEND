import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStudentsPendingModalities } from "../../services/programsheadService";
import "../../styles/programhead/studentpending.css";

/* =========================
   ESTADOS DISPONIBLES
   ========================= */
const AVAILABLE_STATUSES = [
  { value: "UNDER_REVIEW_PROGRAM_HEAD", label: "En Revisión (Jefe de Programa)" },
  { value: "CORRECTIONS_REQUESTED_PROGRAM_HEAD", label: "Correcciones (Jefe de Programa)" },

  { value: "READY_FOR_PROGRAM_CURRICULUM_COMMITTEE", label: "Listo para comité de currículo de programa" },
  { value: "UNDER_REVIEW_PROGRAM_CURRICULUM_COMMITTEE", label: "En Revisión (Comité de currículo de programa)" },
  { value: "CORRECTIONS_REQUESTED_PROGRAM_CURRICULUM_COMMITTEE", label: "Correcciones (Comité de currículo de programa)" },

  { value: "PROPOSAL_APPROVED", label: "Propuesta Aprobada" },

  { value: "DEFENSE_SCHEDULED", label: "Sustentación Programada" },
  { value: "DEFENSE_COMPLETED", label: "Sustentación Realizada" },

  { value: "GRADED_APPROVED", label: "Aprobado con Nota" },
  { value: "GRADED_FAILED", label: "Reprobado" },

  { value: "CANCELLATION_REQUESTED", label: "Cancelación Solicitada" },
  { value: "CANCELLATION_REJECTED", label: "Cancelación Rechazada" },
  { value: "CANCELLED_WITHOUT_REPROVAL", label: "Cancelado sin Reprobación" },

  { value: "MODALITY_CANCELLED", label: "Modalidad Cancelada" },
  { value: "MODALITY_CLOSED", label: "Modalidad Cerrada" },
];

export default function StudentsPending() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  /* Filtros */
  const [selectedStatuses, setSelectedStatuses] = useState(["UNDER_REVIEW_PROGRAM_HEAD"]);
  const [searchName, setSearchName] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, [selectedStatuses, searchName]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await getStudentsPendingModalities(
        selectedStatuses,
        searchName
      );
      // Excluir estudiantes con estado MODALITY_SELECTED
      const filteredStudents = res.filter(
        (student) => student.currentStatus !== "MODALITY_SELECTED"
      );
      setStudents(filteredStudents);
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message ||
          "Error al cargar estudiantes pendientes"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     MANEJO DE FILTROS
     ========================= */
  const handleStatusToggle = (statusValue) => {
    setSelectedStatuses((prev) =>
      prev.includes(statusValue)
        ? prev.filter((s) => s !== statusValue)
        : [...prev, statusValue]
    );
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

  /* =========================
     HELPERS DE ESTADO
     ========================= */
  const getStatusClass = (status) => {
    switch (status) {

      case "UNDER_REVIEW_PROGRAM_HEAD":
      case "UNDER_REVIEW_PROGRAM_CURRICULUM_COMMITTEE":
        return "in-review";

      case "CORRECTIONS_REQUESTED_PROGRAM_HEAD":
      case "CORRECTIONS_REQUESTED_PROGRAM_CURRICULUM_COMMITTEE":
        return "corrections";

      case "READY_FOR_PROGRAM_CURRICULUM_COMMITTEE":
      case "DEFENSE_SCHEDULED":
        return "ready";

      case "PROPOSAL_APPROVED":
      case "DEFENSE_COMPLETED":
      case "GRADED_APPROVED":
        return "approved";

      case "GRADED_FAILED":
        return "rejected";

      case "MODALITY_CANCELLED":
      case "MODALITY_CLOSED":
      case "CANCELLED_WITHOUT_REPROVAL":
        return "cancelled";

      case "CANCELLATION_REQUESTED":
      case "CANCELLATION_REJECTED":
        return "pending";

      default:
        return "pending";
    }
  };

  const getStatusLabel = (status) => {
    const map = Object.fromEntries(
      AVAILABLE_STATUSES.map((s) => [s.value, s.label])
    );
    return map[status] || status;
  };

  if (loading && students.length === 0) {
    return (
      <div className="students-pending-loading">
        Cargando estudiantes...
      </div>
    );
  }

  return (
    <div className="students-pending-container">
      {/* HEADER */}
      <div className="students-pending-header">
        <h2 className="students-pending-title">
          Estudiantes Pendientes de Revisión
        </h2>
        <p className="students-pending-subtitle">
          Gestiona las solicitudes de modalidades de grado
        </p>
      </div>

      {/* MENSAJE */}
      {message && (
        <div className="students-pending-message error">
          {message}
        </div>
      )}

      {/* FILTROS */}
      <div className="students-pending-filters">
        <div className="filter-section">
          <label className="filter-label">Buscar por nombre</label>
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Nombre del estudiante..."
              className="search-input"
            />
            <button type="submit" className="search-button">
              Buscar
            </button>
          </form>
        </div>

        <div className="filter-section">
          <label className="filter-label">Filtrar por estado</label>
          <div className="status-checkboxes">
            {AVAILABLE_STATUSES.map((status) => (
              <label key={status.value} className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={selectedStatuses.includes(status.value)}
                  onChange={() => handleStatusToggle(status.value)}
                />
                <span>{status.label}</span>
              </label>
            ))}
          </div>
        </div>

        {(selectedStatuses.length > 0 || searchName) && (
          <button
            onClick={handleClearFilters}
            className="clear-filters-button"
          >
            ✕ Limpiar filtros
          </button>
        )}
      </div>

      {/* FILTROS ACTIVOS */}
      {(selectedStatuses.length > 0 || searchName) && (
        <div className="active-filters">
          <strong>Filtros activos:</strong>
          {searchName && (
            <span className="filter-tag">
              Nombre: "{searchName}"
            </span>
          )}
          {selectedStatuses.map((status) => (
            <span key={status} className="filter-tag">
              {getStatusLabel(status)}
            </span>
          ))}
        </div>
      )}

      {/* EMPTY / TABLE */}
      {students.length === 0 ? (
        <div className="students-pending-empty">
          <div className="students-pending-empty-icon">🔍</div>
          <p className="students-pending-empty-text">
            No se encontraron estudiantes
          </p>
          <p className="students-pending-empty-subtext">
            Ajusta los filtros para ver resultados
          </p>
        </div>
      ) : (
        <div className="students-pending-table-container">
          <div className="results-count">
            Mostrando {students.length} estudiante
            {students.length !== 1 && "s"}
          </div>

          <table className="students-pending-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Email</th>
                <th>Modalidad</th>
                <th>Estado</th>
                <th>Última actualización</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.studentModalityId}>
                  <td data-label="Estudiante">
                    <span className="student-name">{s.studentName}</span>
                  </td>
                  <td data-label="Email">
                    <span className="student-email">{s.studentEmail}</span>
                  </td>
                  <td data-label="Modalidad">
                    <span className="modality-name">{s.modalityName}</span>
                  </td>
                  <td data-label="Estado">
                    <span
                      className={`status-badge ${getStatusClass(
                        s.currentStatus
                      )}`}
                    >
                      {getStatusLabel(s.currentStatus)}
                    </span>
                  </td>
                  <td data-label="Última actualización">
                    <span className="last-updated">
                      {new Date(s.lastUpdatedAt).toLocaleDateString("es-CO")}
                    </span>
                  </td>
                  <td data-label="Acciones">
                    <button
                      className="view-profile-button"
                      onClick={() =>
                        navigate(
                          `/jefeprograma/students/${s.studentModalityId}`
                        )
                      }
                    >
                      Ver perfil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}