import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStudentsPendingModalities } from "../../services/secretaryService";
import "../../styles/secretary/studentpending.css"; // 👈 Importa el CSS

export default function StudentsPending() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await getStudentsPendingModalities();
        setStudents(res);
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

    fetchStudents();
  }, []);

  // Función helper para determinar la clase del badge según el estado
  const getStatusClass = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("pending") || statusLower.includes("pendiente")) {
      return "pending";
    }
    if (statusLower.includes("review") || statusLower.includes("revisión")) {
      return "in-review";
    }
    if (statusLower.includes("approved") || statusLower.includes("aprobado")) {
      return "approved";
    }
    if (statusLower.includes("rejected") || statusLower.includes("rechazado")) {
      return "rejected";
    }
    return "pending"; // default
  };

  if (loading) {
    return (
      <div className="students-pending-loading">
        Cargando estudiantes pendientes...
      </div>
    );
  }

  return (
    <div className="students-pending-container">
      {/* Header */}
      <div className="students-pending-header">
        <h2 className="students-pending-title">Estudiantes Pendientes de Revisión</h2>
        <p className="students-pending-subtitle">
          Gestiona las solicitudes de modalidades de grado
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className="students-pending-message error">
          {message}
        </div>
      )}

      {/* Empty State */}
      {students.length === 0 ? (
        <div className="students-pending-empty">
          <div className="students-pending-empty-icon">🎉</div>
          <p className="students-pending-empty-text">
            ¡No hay estudiantes pendientes!
          </p>
          <p className="students-pending-empty-subtext">
            Todas las solicitudes han sido procesadas
          </p>
        </div>
      ) : (
        /* Table */
        <div className="students-pending-table-container">
          <table className="students-pending-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Modalidad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {students.map((s) => (
                <tr key={s.studentModalityId}>
                  <td data-label="Estudiante">
                    <span className="student-name">{s.studentName}</span>
                  </td>
                  <td data-label="Modalidad">
                    <span className="modality-name">{s.modalityName}</span>
                  </td>
                  <td data-label="Estado">
                    <span className={`status-badge ${getStatusClass(s.currentStatus)}`}>
                      {s.currentStatus}
                    </span>
                  </td>
                  <td data-label="Acciones">
                    <button
                      onClick={() =>
                        navigate(
                          `/secretary/students/${s.studentModalityId}`
                        )
                      }
                      className="view-profile-button"
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