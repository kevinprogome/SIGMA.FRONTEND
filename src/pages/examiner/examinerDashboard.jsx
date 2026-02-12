import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyExaminerAssignments, getStatusLabel, getStatusBadgeClass, formatDate } from "../../services/examinerService";
import "../../styles/admin/Roles.css";

export default function ExaminerDashboard() {
  const navigate = useNavigate();
  
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const data = await getMyExaminerAssignments();
      console.log("📋 Mis asignaciones:", data);
      setAssignments(data);
    } catch (err) {
      console.error("Error al obtener asignaciones:", err);
      setError("Error al cargar tus asignaciones como juez");
    } finally {
      setLoading(false);
    }
  };

  const getExaminerTypeLabel = (type) => {
    const labels = {
      PRIMARY_EXAMINER_1: "🥇 Juez Principal 1",
      PRIMARY_EXAMINER_2: "🥈 Juez Principal 2",
      TIEBREAKER_EXAMINER: "⚖️ Juez de Desempate",
    };
    return labels[type] || type;
  };

  const getActionButton = (assignment) => {
    // Si ya evaluó, mostrar "Ver Evaluación"
    if (assignment.hasEvaluated) {
      return (
        <button
          onClick={() => navigate(`/examiner/student/${assignment.studentModalityId}`)}
          className="admin-btn-secondary"
          style={{ width: "100%" }}
        >
          ✅ Ver Mi Evaluación
        </button>
      );
    }

    // Si puede evaluar
    if (
      assignment.currentStatus === "READY_FOR_DEFENSE" ||
      assignment.currentStatus === "DEFENSE_COMPLETED" ||
      assignment.currentStatus === "UNDER_EVALUATION_PRIMARY_EXAMINERS" ||
      assignment.currentStatus === "UNDER_EVALUATION_TIEBREAKER" ||
      assignment.currentStatus === "DISAGREEMENT_REQUIRES_TIEBREAKER"
    ) {
      return (
        <button
          onClick={() => navigate(`/examiner/student/${assignment.studentModalityId}`)}
          className="admin-btn-primary"
          style={{ width: "100%" }}
        >
          📊 Evaluar Sustentación
        </button>
      );
    }

    // Si necesita revisar documentos
    if (assignment.currentStatus === "EXAMINERS_ASSIGNED") {
      return (
        <button
          onClick={() => navigate(`/examiner/student/${assignment.studentModalityId}`)}
          className="admin-btn-action"
          style={{ width: "100%" }}
        >
          📄 Revisar Documentos
        </button>
      );
    }

    // Botón genérico para ver detalles
    return (
      <button
        onClick={() => navigate(`/examiner/student/${assignment.studentModalityId}`)}
        className="admin-btn-secondary"
        style={{ width: "100%" }}
      >
        👁️ Ver Detalles
      </button>
    );
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">Cargando tus asignaciones como juez...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Mis Asignaciones como Juez</h1>
          <p className="admin-page-subtitle">
            Modalidades de grado en las que participas como evaluador
          </p>
        </div>
      </div>

      {error && (
        <div className="admin-message error">
          {error}
          <button onClick={() => setError("")}>✕</button>
        </div>
      )}

      {/* Estadísticas */}
      {assignments.length > 0 && (
        <div style={{
          background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
          color: "white",
          padding: "1.5rem 2rem",
          borderRadius: "12px",
          marginBottom: "2rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)"
        }}>
          <div style={{ fontSize: "3rem" }}>👨‍⚖️</div>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "0.25rem" }}>
              {assignments.length}
            </div>
            <div style={{ fontSize: "1rem", opacity: 0.95 }}>
              {assignments.length === 1 
                ? "Asignación activa" 
                : "Asignaciones activas"}
            </div>
          </div>
        </div>
      )}

      {/* Lista de Asignaciones */}
      {assignments.length === 0 ? (
        <div className="admin-card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem", opacity: 0.5 }}>📭</div>
          <h3 style={{ color: "#666", marginBottom: "0.5rem" }}>
            No tienes asignaciones pendientes
          </h3>
          <p style={{ color: "#999" }}>
            Cuando el comité te asigne como juez de una sustentación,
            aparecerá aquí para tu revisión.
          </p>
        </div>
      ) : (
        <div className="admin-cards-grid">
          {assignments.map((assignment) => (
            <div key={assignment.studentModalityId} className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">{assignment.studentName}</h3>
                <span className={`admin-status-badge ${getStatusBadgeClass(assignment.currentStatus)}`}>
                  {getStatusLabel(assignment.currentStatus)}
                </span>
              </div>

              <div className="admin-card-body">
                {/* Mi Rol como Juez */}
                <div style={{
                  background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                  padding: "1rem",
                  borderRadius: "8px",
                  border: "2px solid #0ea5e9",
                  marginBottom: "1.5rem"
                }}>
                  <div style={{ fontWeight: "700", color: "#0c4a6e", marginBottom: "0.5rem" }}>
                    {getExaminerTypeLabel(assignment.examinerType)}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#0369a1" }}>
                    Asignado: {formatDate(assignment.assignmentDate)}
                  </div>
                </div>

                {/* Información del Estudiante */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <div className="admin-card-label">Información del Estudiante</div>
                  <div style={{ display: "grid", gap: "0.5rem", fontSize: "0.9rem" }}>
                    <div>
                      <strong>Email:</strong> {assignment.studentEmail}
                    </div>
                    {assignment.studentCode && (
                      <div>
                        <strong>Código:</strong> {assignment.studentCode}
                      </div>
                    )}
                    <div>
                      <strong>Programa:</strong> {assignment.academicProgram}
                    </div>
                    <div>
                      <strong>Modalidad:</strong> {assignment.modalityName}
                    </div>
                  </div>
                </div>

                {/* Información de Sustentación */}
                {assignment.defenseDate && (
                  <div style={{
                    background: "#fef3c7",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid #fbbf24",
                    marginBottom: "1.5rem"
                  }}>
                    <div style={{ fontWeight: "700", color: "#92400e", marginBottom: "0.5rem" }}>
                      📅 Fecha de Sustentación
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "#78350f" }}>
                      {formatDate(assignment.defenseDate)}
                    </div>
                    {assignment.defenseLocation && (
                      <div style={{ fontSize: "0.9rem", color: "#78350f", marginTop: "0.25rem" }}>
                        📍 {assignment.defenseLocation}
                      </div>
                    )}
                  </div>
                )}

                {/* Estado de Evaluación */}
                {assignment.hasEvaluated && (
                  <div style={{
                    background: "#d1fae5",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid #10b981",
                    marginBottom: "1.5rem"
                  }}>
                    <div style={{ fontWeight: "700", color: "#065f46", marginBottom: "0.25rem" }}>
                      ✅ Evaluación Registrada
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#047857" }}>
                      Ya completaste tu evaluación para esta sustentación
                    </div>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="admin-card-actions" style={{ display: "block" }}>
                {getActionButton(assignment)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}