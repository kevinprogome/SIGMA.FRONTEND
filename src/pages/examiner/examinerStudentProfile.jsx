import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getExaminerStudentProfile,
  getDocumentBlobUrl,
  reviewDocumentExaminer,
  registerEvaluation,
  getStatusLabel,
  formatDate,
  getErrorMessage,
  EXAMINER_DOCUMENT_STATUS,
  EXAMINER_DECISIONS,
  isGradeConsistentWithDecision,
  getSuggestedDecision,
} from "../../services/examinerService";
import "../../styles/examiners/examinerstudentprofile.css";

export default function ExaminerStudentProfile() {
  const { studentModalityId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [reviewingDocId, setReviewingDocId] = useState(null);
  const [reviewData, setReviewData] = useState({ status: "", notes: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [loadingDocId, setLoadingDocId] = useState(null);

  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [evaluationData, setEvaluationData] = useState({
    grade: "",
    decision: "",
    observations: ""
  });
  const [submittingEvaluation, setSubmittingEvaluation] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [studentModalityId]);

  const fetchProfile = async () => {
    try {
      const data = await getExaminerStudentProfile(studentModalityId);
      console.log("📋 Perfil completo:", data);
      setProfile(data);
    } catch (err) {
      console.error("Error:", err);
      setMessage("Error al cargar el perfil del estudiante");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async (studentDocumentId, documentName) => {
    console.log("📄 Abriendo documento:", studentDocumentId);
    setLoadingDocId(studentDocumentId);

    try {
      const blobUrl = await getDocumentBlobUrl(studentDocumentId);
      window.open(blobUrl, "_blank");

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 60000);
    } catch (err) {
      console.error("Error:", err);
      setMessage(`Error al cargar: ${documentName}`);
      setMessageType("error");
    } finally {
      setLoadingDocId(null);
    }
  };

  const handleSubmitReview = async (studentDocumentId) => {
    if (!reviewData.status) {
      setMessage("Debes seleccionar una decisión");
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
      
      setMessage(response.message || "Documento revisado correctamente");
      setMessageType("success");

      setReviewingDocId(null);
      setReviewData({ status: "", notes: "" });

      await fetchProfile();

      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
    } catch (err) {
      console.error("Error:", err);
      setMessage(getErrorMessage(err));
      setMessageType("error");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleGradeChange = (grade) => {
    setEvaluationData({
      ...evaluationData,
      grade,
      decision: getSuggestedDecision(grade),
    });
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();

    if (!evaluationData.grade || !evaluationData.decision) {
      setMessage("Debes proporcionar calificación y decisión");
      setMessageType("error");
      return;
    }

    if (!evaluationData.observations.trim()) {
      setMessage("Debes proporcionar observaciones");
      setMessageType("error");
      return;
    }

    if (!isGradeConsistentWithDecision(evaluationData.grade, evaluationData.decision)) {
      setMessage("La calificación no es consistente con la decisión");
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

      setMessage(response.message || "Evaluación registrada correctamente");
      setMessageType("success");

      setShowEvaluationForm(false);
      setEvaluationData({ grade: "", decision: "", observations: "" });

      await fetchProfile();

      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 10000);
    } catch (err) {
      console.error("Error:", err);
      setMessage(getErrorMessage(err));
      setMessageType("error");
    } finally {
      setSubmittingEvaluation(false);
    }
  };

  const canReviewDocuments = () => {
    return profile?.currentStatus === "EXAMINERS_ASSIGNED" || 
           profile?.currentStatus === "CORRECTIONS_REQUESTED_EXAMINERS";
  };

  const canEvaluate = () => {
    // Estados válidos según el backend Java
    const validStatuses = [
      "DEFENSE_COMPLETED",
      "READY_FOR_DEFENSE",
      "EXAMINERS_ASSIGNED",
      "UNDER_EVALUATION_PRIMARY_EXAMINERS",
      "UNDER_EVALUATION_TIEBREAKER",
      "DISAGREEMENT_REQUIRES_TIEBREAKER"
    ];

    // Puede evaluar si el estado es válido Y NO ha evaluado
    const statusValid = validStatuses.includes(profile?.currentStatus);
    const notEvaluated = !hasEvaluated();
    
    console.log("🔍 canEvaluate check:", {
      currentStatus: profile?.currentStatus,
      statusValid,
      hasEvaluated: hasEvaluated(),
      notEvaluated,
      result: statusValid && notEvaluated
    });

    return statusValid && notEvaluated;
  };

  const hasEvaluated = () => {
    return profile?.hasEvaluated === true;
  };

  const getExaminerInfo = () => {
    if (!profile?.examiners || profile.examiners.length === 0) return null;
    return profile.examiners[0];
  };

  if (loading) {
    return (
      <div className="examiner-profile-container">
        <div className="examiner-profile-loading">Cargando perfil...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="examiner-profile-container">
        <div className="examiner-profile-message error">
          No se pudo cargar el perfil
        </div>
        <button 
          onClick={() => navigate("/examiner")} 
          className="examiner-profile-back-btn"
        >
          ← Volver
        </button>
      </div>
    );
  }

  const examinerInfo = getExaminerInfo();

  return (
    <div className="examiner-profile-container">
      {/* Header */}
      <div className="examiner-profile-header">
        <button
          onClick={() => navigate("/examiner")}
          className="examiner-profile-back-btn"
        >
          ← Volver a Mis Asignaciones
        </button>
        <h1 className="examiner-profile-title">
          Perfil del Estudiante - Juez Evaluador
        </h1>
        <p className="examiner-profile-subtitle">
          {profile.studentName} {profile.studentLastName} - Universidad Surcolombiana
        </p>
      </div>

      {/* Messages */}
      {message && (
        <div className={`examiner-profile-message ${messageType}`}>
          {message}
          <button 
            onClick={() => setMessage("")} 
            className="examiner-profile-close-btn"
          >
            ✕
          </button>
        </div>
      )}

      {/* Student Info */}
      <div className="examiner-profile-card">
        <h3 className="examiner-profile-card-title">👤 Información del Estudiante</h3>
        <div className="examiner-profile-grid">
          <div className="examiner-profile-item">
            <span className="examiner-profile-label">Nombre Completo</span>
            <span className="examiner-profile-value">
              {profile.studentName} {profile.studentLastName}
            </span>
          </div>
          <div className="examiner-profile-item">
            <span className="examiner-profile-label">Email</span>
            <span className="examiner-profile-value email">{profile.studentEmail}</span>
          </div>
          <div className="examiner-profile-item">
            <span className="examiner-profile-label">Código</span>
            <span className="examiner-profile-value">{profile.studentCode || "N/A"}</span>
          </div>
          <div className="examiner-profile-item">
            <span className="examiner-profile-label">Programa</span>
            <span className="examiner-profile-value">{profile.academicProgramName}</span>
          </div>
          <div className="examiner-profile-item">
            <span className="examiner-profile-label">Facultad</span>
            <span className="examiner-profile-value">{profile.facultyName}</span>
          </div>
          <div className="examiner-profile-item">
            <span className="examiner-profile-label">Estado</span>
            <span className="examiner-profile-value">
              {getStatusLabel(profile.currentStatus)}
            </span>
          </div>
        </div>
      </div>

      {/* Modality Info */}
      <div className="examiner-profile-card">
        <h3 className="examiner-profile-card-title">📚 Información de la Modalidad</h3>
        <div className="examiner-profile-grid">
          <div className="examiner-profile-item">
            <span className="examiner-profile-label">Modalidad</span>
            <span className="examiner-profile-value">{profile.modalityName}</span>
          </div>
          {profile.defenseDate && (
            <div className="examiner-profile-item">
              <span className="examiner-profile-label">Fecha de Sustentación</span>
              <span className="examiner-profile-value">{formatDate(profile.defenseDate)}</span>
            </div>
          )}
          {profile.defenseLocation && (
            <div className="examiner-profile-item">
              <span className="examiner-profile-label">Lugar</span>
              <span className="examiner-profile-value">{profile.defenseLocation}</span>
            </div>
          )}
          {profile.projectDirectorName && (
            <div className="examiner-profile-item">
              <span className="examiner-profile-label">Director</span>
              <span className="examiner-profile-value">{profile.projectDirectorName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Examiner Role */}
      {examinerInfo && (
        <div className="examiner-role-card">
          <h3 className="examiner-role-title">👨‍⚖️ Mi Rol como Juez</h3>
          <div className="examiner-role-type">
            {examinerInfo.examinerType === "PRIMARY_EXAMINER_1" && "🥇 Juez Principal 1"}
            {examinerInfo.examinerType === "PRIMARY_EXAMINER_2" && "🥈 Juez Principal 2"}
            {examinerInfo.examinerType === "TIEBREAKER_EXAMINER" && "⚖️ Juez de Desempate"}
          </div>
          <div className="examiner-role-date">
            Asignado: {formatDate(examinerInfo.assignmentDate)}
          </div>
        </div>
      )}

      {/* Documents */}
      {profile.documents && profile.documents.filter(d => d.uploaded).length > 0 && (
        <div className="examiner-doc-section">
          <h3 className="examiner-doc-title">📄 Documentos para Revisión</h3>

          {profile.documents.filter(d => d.uploaded).map((doc) => (
            <div key={doc.studentDocumentId || Math.random()} className="examiner-doc-item">
              <div className="examiner-doc-header">
                <div>
                  <div className="examiner-doc-name">{doc.documentName}</div>
                  <div className="examiner-doc-type">Tipo: {doc.documentType}</div>
                </div>
                <span className={`examiner-doc-status ${doc.status?.includes("ACCEPTED") ? 'approved' : 'pending'}`}>
                  {doc.status}
                </span>
              </div>

              {doc.notes && (
                <div className="examiner-doc-notes">
                  <strong>Notas previas:</strong>
                  <p style={{ margin: "0.5rem 0 0 0" }}>{doc.notes}</p>
                </div>
              )}

              <div className="examiner-doc-actions">
                <button
                  onClick={() => handleViewDocument(doc.studentDocumentId, doc.documentName)}
                  disabled={loadingDocId === doc.studentDocumentId}
                  className="examiner-doc-btn view"
                >
                  {loadingDocId === doc.studentDocumentId ? "Cargando..." : "👁️ Ver Documento"}
                </button>

                {canReviewDocuments() && !doc.status?.includes("ACCEPTED_FOR_EXAMINER") && (
                  <button
                    onClick={() => {
                      if (reviewingDocId === doc.studentDocumentId) {
                        setReviewingDocId(null);
                      } else {
                        setReviewingDocId(doc.studentDocumentId);
                        setReviewData({ status: "", notes: "" });
                      }
                    }}
                    className={`examiner-doc-btn ${reviewingDocId === doc.studentDocumentId ? 'cancel' : 'review'}`}
                  >
                    {reviewingDocId === doc.studentDocumentId ? "✕ Cancelar" : "📝 Revisar"}
                  </button>
                )}
              </div>

              {reviewingDocId === doc.studentDocumentId && (
                <div className="examiner-review-panel">
                  <h4 className="examiner-review-title">Revisar: {doc.documentName}</h4>

                  <div className="examiner-form-group">
                    <label className="examiner-form-label">Decisión *</label>
                    <select
                      value={reviewData.status}
                      onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                      className="examiner-form-select"
                      disabled={submittingReview}
                    >
                      <option value="">Seleccionar...</option>
                      <option value={EXAMINER_DOCUMENT_STATUS.ACCEPTED}>✅ Aceptar</option>
                      <option value={EXAMINER_DOCUMENT_STATUS.CORRECTIONS}>⚠️ Solicitar Correcciones</option>
                      <option value={EXAMINER_DOCUMENT_STATUS.REJECTED}>❌ Rechazar</option>
                    </select>
                  </div>

                  <div className="examiner-form-group">
                    <label className="examiner-form-label">
                      Notas {(reviewData.status === EXAMINER_DOCUMENT_STATUS.REJECTED ||
                        reviewData.status === EXAMINER_DOCUMENT_STATUS.CORRECTIONS) && "*"}
                    </label>
                    <textarea
                      value={reviewData.notes}
                      onChange={(e) => setReviewData({ ...reviewData, notes: e.target.value })}
                      rows="4"
                      placeholder="Observaciones..."
                      className="examiner-form-textarea"
                      disabled={submittingReview}
                    />
                  </div>

                  <button
                    onClick={() => handleSubmitReview(doc.studentDocumentId)}
                    disabled={submittingReview}
                    className="examiner-form-submit"
                  >
                    {submittingReview ? "Enviando..." : "Enviar Revisión"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Evaluation Section */}
      {canEvaluate() && (
        <div className="examiner-eval-section">
          <h3 className="examiner-profile-card-title">📊 Evaluación de la Sustentación</h3>

          {!showEvaluationForm ? (
            <div className="examiner-eval-empty">
              <div className="examiner-eval-icon">📊</div>
              <h3 className="examiner-eval-title">Registrar Evaluación Final</h3>
              <p className="examiner-eval-text">
                Califica la sustentación del estudiante
              </p>
              <button
                onClick={() => setShowEvaluationForm(true)}
                className="examiner-form-submit"
              >
                ✍️ Registrar Evaluación
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitEvaluation}>
              <div className="examiner-form-group">
                <label className="examiner-form-label">Calificación (0.0 - 5.0) *</label>
                <select
                  value={evaluationData.grade}
                  onChange={(e) => handleGradeChange(e.target.value)}
                  className="examiner-form-select"
                  disabled={submittingEvaluation}
                  required
                >
                  <option value="">Seleccionar calificación...</option>
                  <option value="0.0">0.0</option>
                  <option value="0.5">0.5</option>
                  <option value="1.0">1.0</option>
                  <option value="1.5">1.5</option>
                  <option value="2.0">2.0</option>
                  <option value="2.5">2.5</option>
                  <option value="3.0">3.0</option>
                  <option value="3.5">3.5</option>
                  <option value="4.0">4.0</option>
                  <option value="4.5">4.5</option>
                  <option value="5.0">5.0</option>
                </select>
              </div>

              <div className="examiner-form-group">
                <label className="examiner-form-label">Decisión *</label>
                <select
                  value={evaluationData.decision}
                  onChange={(e) => setEvaluationData({ ...evaluationData, decision: e.target.value })}
                  className="examiner-form-select"
                  disabled={submittingEvaluation}
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value={EXAMINER_DECISIONS.REJECTED}>❌ Reprobado (0.0 - 2.9)</option>
                  <option value={EXAMINER_DECISIONS.APPROVED_NO_DISTINCTION}>✅ Aprobado (3.0 - 3.9)</option>
                  <option value={EXAMINER_DECISIONS.APPROVED_MERITORIOUS}>🏅 Meritorio (4.0 - 4.4)</option>
                  <option value={EXAMINER_DECISIONS.APPROVED_LAUREATE}>🏆 Laureado (4.5 - 5.0)</option>
                </select>
              </div>

              <div className="examiner-form-group">
                <label className="examiner-form-label">Observaciones *</label>
                <textarea
                  value={evaluationData.observations}
                  onChange={(e) => setEvaluationData({ ...evaluationData, observations: e.target.value })}
                  rows="6"
                  placeholder="Observaciones detalladas..."
                  className="examiner-form-textarea"
                  disabled={submittingEvaluation}
                  required
                />
              </div>

              <div className="examiner-form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowEvaluationForm(false);
                    setEvaluationData({ grade: "", decision: "", observations: "" });
                  }}
                  className="examiner-doc-btn cancel"
                  disabled={submittingEvaluation}
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="examiner-form-submit"
                  disabled={submittingEvaluation}
                  style={{ flex: 1 }}
                >
                  {submittingEvaluation ? "Registrando..." : "Registrar Evaluación"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Already Evaluated */}
      {hasEvaluated() && (
        <div className="examiner-eval-completed">
          <div className="examiner-eval-completed-icon">✅</div>
          <h3 className="examiner-eval-completed-title">Evaluación Completada</h3>
          <p className="examiner-eval-completed-text">
            Ya registraste tu evaluación para esta sustentación
          </p>
        </div>
      )}
    </div>
  );
}