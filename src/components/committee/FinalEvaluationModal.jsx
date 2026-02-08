//components/council/FinalEvaluationModal.jsx//
import { useState } from "react";
import { registerFinalEvaluation } from "../../services/committeeService";
import "../../styles/council/modals.css";

export default function FinalEvaluationModal({ studentModalityId, onClose, onSuccess }) {
  const [approved, setApproved] = useState("");
  const [academicDistinction, setAcademicDistinction] = useState("NO_DISTINCTION");
  const [observations, setObservations] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const distinctionOptions = [
    { value: "NO_DISTINCTION", label: "Sin Distinción" },
    { value: "MERITORIOUS", label: "Meritorio" },
    { value: "LAUREATE", label: "Laureado" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (approved === "") {
      setError("Debes seleccionar si la modalidad fue aprobada o no");
      return;
    }

    if (!observations.trim()) {
      setError("Debes ingresar las observaciones del jurado");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        approved: approved === "true",
        academicDistinction: approved === "true" ? academicDistinction : null,
        observations,
      };

      await registerFinalEvaluation(studentModalityId, payload);
      onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error al registrar evaluación");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📊 Evaluación Final del Jurado</h3>
          <button onClick={onClose} className="modal-close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label>¿Resultado de la Modalidad? *</label>
              <select
                value={approved}
                onChange={(e) => setApproved(e.target.value)}
                className="form-select"
                disabled={submitting}
              >
                <option value="">-- Selecciona un resultado --</option>
                <option value="true">✅ Aprobado</option>
                <option value="false">❌ Reprobado</option>
              </select>
            </div>

            {approved === "true" && (
              <div className="form-group">
                <label>Mención Académica</label>
                <select
                  value={academicDistinction}
                  onChange={(e) => setAcademicDistinction(e.target.value)}
                  className="form-select"
                  disabled={submitting}
                >
                  {distinctionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <small className="form-hint">
                  Selecciona la distinción académica que corresponda según el
                  desempeño del estudiante.
                </small>
              </div>
            )}

            <div className="form-group">
              <label>Observaciones del Jurado *</label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Incluye: nombres de los jurados, calificaciones, observaciones generales, etc."
                rows={6}
                className="form-textarea"
                disabled={submitting}
              />
              <small className="form-hint">
                Debes incluir los nombres de los jurados y las calificaciones
                otorgadas por cada uno.
              </small>
            </div>

            <div className="warning-box">
              <p>
                ⚠️ <strong>Esta acción es definitiva.</strong> Una vez
                registrada la evaluación final, no se podrá modificar.
              </p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn-cancel"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={submitting}
              >
                {submitting ? "Registrando..." : "Registrar Evaluación"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}