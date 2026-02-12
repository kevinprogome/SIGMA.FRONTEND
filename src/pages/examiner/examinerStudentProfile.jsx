import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getExaminerStudentProfile,
  getDocumentBlobUrl,
  reviewDocumentExaminer,
  registerEvaluation,
  getStatusLabel,
  getStatusBadgeClass,
  formatDate,
  getErrorMessage,
  EXAMINER_DOCUMENT_STATUS,
  EXAMINER_DECISIONS,
  isGradeConsistentWithDecision,
  getSuggestedDecision,
} from "../../services/examinerService";
import "../../styles/admin/Roles.css";

export default function ExaminerStudentProfile() {
  const { studentModalityId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Estados para revisión de documentos
  const [reviewingDocId, setReviewingDocId] = useState(null);
  const [reviewData, setReviewData] = useState({
    status: "",
    notes: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [loadingDocId, setLoadingDocId] = useState(null);

  // Estados para evaluación
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [evaluationData, setEvaluationData] = useState({
    grade: "",
    decision: "",
    observations: "",
  });
  const [submittingEvaluation, setSubmittingEvaluation] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [studentModalityId]);

  const fetchProfile = async () => {
    try {
      const data = await getExaminerStudentProfile(studentModalityId);
      console.log("📋 Perfil del estudiante:", data);
      setProfile(data);
    } catch (err) {
      console.error("Error al obtener perfil:", err);
      setMessage("Error al cargar el perfil del estudiante");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // FUNCIONES DE REVISIÓN DE DOCUMENTOS
  // ========================================

  const handleViewDocument = async (studentDocumentId, documentName) => {
    console.log("📄 Viendo documento:", studentDocumentId);
    setLoadingDocId(studentDocumentId);

    try {
      const blobUrl = await getDocumentBlobUrl(studentDocumentId);
      window.open(blobUrl, "_blank");

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 60000);
    } catch (err) {
      console.error("Error al ver documento:", err);
      setMessage(`Error al cargar el documento: ${documentName}`);
      setMessageType("error");
    } finally {
      setLoadingDocId(null);
    }
  };

  const handleSubmitReview = async (studentDocumentId) => {
    if (!reviewData.status) {
      setMessage("Debes seleccionar una decisión para el documento");
      setMessageType("error");
      return;
    }

    if (
      (reviewData.status === EXAMINER_DOCUMENT_STATUS.REJECTED ||
        reviewData.status === EXAMINER_DOCUMENT_STATUS.CORRECTIONS) &&
      !reviewData.notes.trim()
    ) {
      setMessage("Debes proporcionar notas al rechazar o solicitar correcciones");
      setMessageType("error");
      return;
    }

    setSubmittingReview(true);

    try {
      const response = await reviewDocumentExaminer(studentDocumentId, reviewData);
      console.log("✅ Documento revisado:", response);

      setMessage(response.message || "Documento revisado correctamente");
      setMessageType("success");

      // Limpiar form
      setReviewingDocId(null);
      setReviewData({ status: "", notes: "" });

      // Recargar perfil
      await fetchProfile();

      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
    } catch (err) {
      console.error("Error al revisar documento:", err);
      setMessage(getErrorMessage(err));
      setMessageType("error");
    } finally {
      setSubmittingReview(false);
    }
  };

  // ========================================
  // FUNCIONES DE EVALUACIÓN
  // ========================================

  const handleGradeChange = (grade) => {
    setEvaluationData({
      ...evaluationData,
      grade,
      decision: getSuggestedDecision(grade),
    });
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!evaluationData.grade || !evaluationData.decision) {
      setMessage("Debes proporcionar calificación y decisión");
      setMessageType("error");
      return;
    }

    if (!evaluationData.observations.trim()) {
      setMessage("Debes proporcionar observaciones sobre la sustentación");
      setMessageType("error");
      return;
    }

    // Validar consistencia
    if (!isGradeConsistentWithDecision(evaluationData.grade, evaluationData.decision)) {
      setMessage(
        "La calificación no es consistente con la decisión. Por favor, verifica los rangos."
      );
      setMessageType("error");
      return;
    }

    setSubmittingEvaluation(true);

    try {
      const response = await registerEvaluation(studentModalityId, {
        grade: parseFloat(evaluationData.grade),
        decision: evaluationData.decision,
        observations: evaluationData.observations,
      });

      console.log("✅ Evaluación registrada:", response);

      setMessage(response.message || "Evaluación registrada correctamente");
      setMessageType("success");

      // Limpiar form
      setShowEvaluationForm(false);
      setEvaluationData({ grade: "", decision: "", observations: "" });

      // Recargar perfil
      await fetchProfile();

      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 10000);
    } catch (err) {
      console.error("Error al registrar evaluación:", err);
      setMessage(getErrorMessage(err));
      setMessageType("error");
    } finally {
      setSubmittingEvaluation(false);
    }
  };

  // ========================================
  // HELPERS
  // ========================================

  const canReviewDocuments = () => {
    return profile?.currentStatus === "EXAMINERS_ASSIGNED" || 
           profile?.currentStatus === "CORRECTIONS_REQUESTED_EXAMINERS";
  };

  const canEvaluate = () => {
    return (
      profile?.currentStatus === "READY_FOR_DEFENSE" ||
      profile?.currentStatus === "DEFENSE_COMPLETED" ||
      profile?.currentStatus === "UNDER_EVALUATION_PRIMARY_EXAMINERS" ||
      profile?.currentStatus === "UNDER_EVALUATION_TIEBREAKER" ||
      profile?.currentStatus === "DISAGREEMENT_REQUIRES_TIEBREAKER"
    );
  };

  const hasEvaluated = () => {
    return profile?.hasEvaluated === true;
  };

  if (loading) {
    return <div className="admin-page"><div className="admin-loading">Cargando perfil...</div></div>;
  }

  if (!profile) {
    return (
      <div className="admin-page">
        <div className="admin-message error">No se pudo cargar el perfil del estudiante</div>
        <button onClick={() => navigate("/examiner")} className="admin-btn-secondary">
          ← Volver al Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <button
            onClick={() => navigate("/examiner")}
            className="admin-btn-secondary"
            style={{ marginBottom: "1rem" }}
          >
            ← Volver a Mis Asignaciones
          </button>
          <h1 className="admin-page-title">Perfil del Estudiante</h1>
          <p className="admin-page-subtitle">{profile.studentName}</p>
        </div>
      </div>

      {/* Mensajes */}
      {message && (
        <div className={`admin-message ${messageType}`}>
          {message}
          <button onClick={() => setMessage("")}>✕</button>
        </div>
      )}

      {/* Información del Estudiante */}
      <div className="admin-card" style={{ marginBottom: "2rem" }}>
        <div className="admin-card-header">
          <h2>👤 Información del Estudiante</h2>
        </div>
        <div className="admin-card-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
            <div>
              <strong style={{ display: "block", color: "#6b7280", marginBottom: "0.25rem" }}>
                Nombre Completo
              </strong>
              <span>{profile.studentName}</span>
            </div>
            <div>
              <strong style={{ display: "block", color: "#6b7280", marginBottom: "0.25rem" }}>
                Email
              </strong>
              <span>{profile.studentEmail}</span>
            </div>
            <div>
              <strong style={{ display: "block", color: "#6b7280", marginBottom: "0.25rem" }}>
                Código
              </strong>
              <span>{profile.studentCode || "N/A"}</span>
            </div>
            <div>
              <strong style={{ display: "block", color: "#6b7280", marginBottom: "0.25rem" }}>
                Estado Actual
              </strong>
              <span className={`admin-status-badge ${getStatusBadgeClass(profile.currentStatus)}`}>
                {getStatusLabel(profile.currentStatus)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Información de la Modalidad */}
      <div className="admin-card" style={{ marginBottom: "2rem" }}>
        <div className="admin-card-header">
          <h2>📚 Información de la Modalidad</h2>
        </div>
        <div className="admin-card-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
            <div>
              <strong style={{ display: "block", color: "#6b7280", marginBottom: "0.25rem" }}>
                Modalidad de Grado
              </strong>
              <span>{profile.modalityName}</span>
            </div>
            <div>
              <strong style={{ display: "block", color: "#6b7280", marginBottom: "0.25rem" }}>
                Programa Académico
              </strong>
              <span>{profile.academicProgram}</span>
            </div>
            <div>
              <strong style={{ display: "block", color: "#6b7280", marginBottom: "0.25rem" }}>
                Facultad
              </strong>
              <span>{profile.faculty}</span>
            </div>
            {profile.defenseDate && (
              <div>
                <strong style={{ display: "block", color: "#6b7280", marginBottom: "0.25rem" }}>
                  Fecha de Sustentación
                </strong>
                <span>{formatDate(profile.defenseDate)}</span>
              </div>
            )}
            {profile.defenseLocation && (
              <div>
                <strong style={{ display: "block", color: "#6b7280", marginBottom: "0.25rem" }}>
                  Lugar de Sustentación
                </strong>
                <span>{profile.defenseLocation}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mi Rol como Juez */}
      <div className="admin-card" style={{ marginBottom: "2rem" }}>
        <div className="admin-card-header">
          <h2>👨‍⚖️ Mi Rol como Juez</h2>
        </div>
        <div className="admin-card-body">
          <div style={{
            background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
            padding: "1.5rem",
            borderRadius: "10px",
            border: "2px solid #0ea5e9",
          }}>
            <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#0c4a6e", marginBottom: "0.5rem" }}>
              {profile.examinerType === "PRIMARY_EXAMINER_1" && "🥇 Juez Principal 1"}
              {profile.examinerType === "PRIMARY_EXAMINER_2" && "🥈 Juez Principal 2"}
              {profile.examinerType === "TIEBREAKER_EXAMINER" && "⚖️ Juez de Desempate"}
            </div>
            <div style={{ fontSize: "0.9rem", color: "#0369a1" }}>
              Asignado: {formatDate(profile.assignmentDate)}
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE DOCUMENTOS */}
      {profile.documents && profile.documents.length > 0 && (
        <div className="admin-card" style={{ marginBottom: "2rem" }}>
          <div className="admin-card-header">
            <h2>📄 Documentos para Revisión</h2>
          </div>
          <div className="admin-card-body">
            {profile.documents.map((doc) => (
              <div
                key={doc.studentDocumentId}
                style={{
                  padding: "1.5rem",
                  background: doc.uploaded ? "#f0fdf4" : "#f9fafb",
                  border: `2px solid ${doc.uploaded ? "#86efac" : "#e5e7eb"}`,
                  borderRadius: "10px",
                  marginBottom: "1.5rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <div>
                    <strong style={{ fontSize: "1.1rem" }}>{doc.documentName}</strong>
                    {doc.mandatory && (
                      <span style={{ color: "#dc2626", marginLeft: "0.5rem" }}>*</span>
                    )}
                  </div>
                  <span className={`admin-status-badge ${doc.uploaded ? "success" : "inactive"}`}>
                    {doc.uploaded ? "✓ Subido" : "Sin subir"}
                  </span>
                </div>

                {doc.uploaded && (
                  <>
                    <div style={{ marginBottom: "1rem" }}>
                      <div style={{ fontSize: "0.9rem", color: "#666", marginBottom: "0.5rem" }}>
                        <strong>Estado:</strong>{" "}
                        <span className={`admin-status-badge ${getStatusBadgeClass(doc.status)}`}>
                          {doc.status}
                        </span>
                      </div>
                      {doc.uploadedAt && (
                        <div style={{ fontSize: "0.85rem", color: "#999" }}>
                          Subido: {formatDate(doc.uploadedAt)}
                        </div>
                      )}
                      {doc.notes && (
                        <div style={{ marginTop: "0.75rem", padding: "1rem", background: "#fff", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                          <strong style={{ fontSize: "0.85rem", color: "#666" }}>Notas:</strong>
                          <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.9rem" }}>{doc.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Botones */}
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                      <button
                        onClick={() => handleViewDocument(doc.studentDocumentId, doc.documentName)}
                        disabled={loadingDocId === doc.studentDocumentId}
                        className="admin-btn-secondary"
                      >
                        {loadingDocId === doc.studentDocumentId ? "Cargando..." : "👁️ Ver Documento"}
                      </button>

                      {canReviewDocuments() && !doc.status?.includes("ACCEPTED") && (
                        <button
                          onClick={() => {
                            setReviewingDocId(doc.studentDocumentId);
                            setReviewData({ status: "", notes: "" });
                          }}
                          className="admin-btn-primary"
                        >
                          📝 Revisar Documento
                        </button>
                      )}

                      {reviewingDocId === doc.studentDocumentId && (
                        <button
                          onClick={() => setReviewingDocId(null)}
                          className="admin-btn-delete"
                        >
                          ✕ Cancelar
                        </button>
                      )}
                    </div>

                    {/* Panel de Revisión */}
                    {reviewingDocId === doc.studentDocumentId && (
                      <div style={{
                        marginTop: "1.5rem",
                        padding: "1.5rem",
                        background: "#f8f9fa",
                        borderRadius: "8px",
                        border: "2px solid #7A1117",
                      }}>
                        <h4 style={{ margin: "0 0 1rem 0", color: "#7A1117" }}>
                          📝 Revisar: {doc.documentName}
                        </h4>

                        <div style={{ marginBottom: "1rem" }}>
                          <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>
                            Decisión *
                          </label>
                          <select
                            value={reviewData.status}
                            onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                            style={{
                              width: "100%",
                              padding: "0.75rem",
                              border: "1px solid #ddd",
                              borderRadius: "6px",
                            }}
                            disabled={submittingReview}
                          >
                            <option value="">Seleccionar decisión...</option>
                            <option value={EXAMINER_DOCUMENT_STATUS.ACCEPTED}>✅ Aceptar Documento</option>
                            <option value={EXAMINER_DOCUMENT_STATUS.CORRECTIONS}>⚠️ Solicitar Correcciones</option>
                            <option value={EXAMINER_DOCUMENT_STATUS.REJECTED}>❌ Rechazar Documento</option>
                          </select>
                        </div>

                        <div style={{ marginBottom: "1rem" }}>
                          <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>
                            Notas {(reviewData.status === EXAMINER_DOCUMENT_STATUS.REJECTED ||
                              reviewData.status === EXAMINER_DOCUMENT_STATUS.CORRECTIONS) && "*"}
                          </label>
                          <textarea
                            value={reviewData.notes}
                            onChange={(e) => setReviewData({ ...reviewData, notes: e.target.value })}
                            rows="4"
                            placeholder="Escribe tus observaciones sobre el documento..."
                            style={{
                              width: "100%",
                              padding: "0.75rem",
                              border: "1px solid #ddd",
                              borderRadius: "6px",
                              resize: "vertical",
                            }}
                            disabled={submittingReview}
                          />
                        </div>

                        <button
                          onClick={() => handleSubmitReview(doc.studentDocumentId)}
                          disabled={submittingReview}
                          className="admin-btn-primary"
                          style={{ width: "100%" }}
                        >
                          {submittingReview ? "Enviando..." : "Enviar Revisión"}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECCIÓN DE EVALUACIÓN */}
      {canEvaluate() && !hasEvaluated() && (
        <div className="admin-card" style={{ marginBottom: "2rem" }}>
          <div className="admin-card-header">
            <h2>📊 Evaluación de la Sustentación</h2>
          </div>
          <div className="admin-card-body">
            {!showEvaluationForm ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
                <h3 style={{ marginBottom: "1rem" }}>Registrar Evaluación Final</h3>
                <p style={{ color: "#666", marginBottom: "2rem" }}>
                  Registra tu calificación y decisión sobre la sustentación del estudiante
                </p>
                <button
                  onClick={() => setShowEvaluationForm(true)}
                  className="admin-btn-primary"
                >
                  ✍️ Registrar Mi Evaluación
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitEvaluation}>
                {/* Calificación */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>
                    Calificación Numérica (0.0 - 5.0) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={evaluationData.grade}
                    onChange={(e) => handleGradeChange(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      fontSize: "1.1rem",
                    }}
                    disabled={submittingEvaluation}
                    required
                  />
                  <small style={{ color: "#666", marginTop: "0.5rem", display: "block" }}>
                    La decisión se ajustará automáticamente según la calificación
                  </small>
                </div>

                {/* Decisión */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>
                    Decisión *
                  </label>
                  <select
                    value={evaluationData.decision}
                    onChange={(e) => setEvaluationData({ ...evaluationData, decision: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                    }}
                    disabled={submittingEvaluation}
                    required
                  >
                    <option value="">Seleccionar decisión...</option>
                    <option value={EXAMINER_DECISIONS.REJECTED}>❌ Reprobado (0.0 - 2.9)</option>
                    <option value={EXAMINER_DECISIONS.APPROVED_NO_DISTINCTION}>
                      ✅ Aprobado sin distinción (3.0 - 3.9)
                    </option>
                    <option value={EXAMINER_DECISIONS.APPROVED_MERITORIOUS}>
                      🏅 Aprobado Meritorio (4.0 - 4.4)
                    </option>
                    <option value={EXAMINER_DECISIONS.APPROVED_LAUREATE}>
                      🏆 Aprobado Laureado (4.5 - 5.0)
                    </option>
                  </select>
                </div>

                {/* Observaciones */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>
                    Observaciones *
                  </label>
                  <textarea
                    value={evaluationData.observations}
                    onChange={(e) => setEvaluationData({ ...evaluationData, observations: e.target.value })}
                    rows="6"
                    placeholder="Escribe tus observaciones detalladas sobre la sustentación, el trabajo realizado, y los criterios de evaluación..."
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      resize: "vertical",
                    }}
                    disabled={submittingEvaluation}
                    required
                  />
                </div>

                {/* Botones */}
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEvaluationForm(false);
                      setEvaluationData({ grade: "", decision: "", observations: "" });
                    }}
                    className="admin-btn-secondary"
                    disabled={submittingEvaluation}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="admin-btn-primary"
                    disabled={submittingEvaluation}
                    style={{ flex: 1 }}
                  >
                    {submittingEvaluation ? "Registrando..." : "Registrar Evaluación"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Evaluación Ya Registrada */}
      {hasEvaluated() && (
        <div className="admin-card" style={{ marginBottom: "2rem" }}>
          <div className="admin-card-header">
            <h2>✅ Mi Evaluación Registrada</h2>
          </div>
          <div className="admin-card-body">
            <div style={{
              background: "#d1fae5",
              padding: "2rem",
              borderRadius: "10px",
              border: "2px solid #10b981",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
              <h3 style={{ color: "#065f46", marginBottom: "0.5rem" }}>
                Evaluación Completada
              </h3>
              <p style={{ color: "#047857" }}>
                Ya registraste tu evaluación para esta sustentación
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}