import { useState } from "react";
import { approveDefenseProposal, rescheduleDefense } from "../../services/committeeService";
import "../../styles/council/modals.css";

export default function DefenseProposalModal({ 
  studentModalityId, 
  proposedDefenseDate,  // ✅ Nombre correcto del backend
  proposedDefenseLocation,  // ✅ Nombre correcto del backend
  onClose, 
  onSuccess 
}) {
  const [action, setAction] = useState(""); // 'approve' o 'reschedule'
  const [defenseDate, setDefenseDate] = useState(proposedDefenseDate || "");
  const [defenseLocation, setDefenseLocation] = useState(proposedDefenseLocation || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleApprove = async () => {
    setSubmitting(true);
    setError("");

    try {
      await approveDefenseProposal(studentModalityId);

      // Formatear fecha para mostrar
      const formattedDate = new Date(proposedDefenseDate).toLocaleString("es-CO", {
        dateStyle: "full",
        timeStyle: "short",
      });

      setSuccessMessage(
        `✅ Propuesta aprobada correctamente. Sustentación programada para el ${formattedDate} en ${proposedDefenseLocation}`
      );

      setTimeout(() => {
        onSuccess();
      }, 10000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error al aprobar propuesta");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();

    if (!defenseDate) {
      setError("Debes seleccionar una fecha");
      return;
    }

    if (!defenseLocation.trim()) {
      setError("Debes ingresar el lugar de la sustentación");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await rescheduleDefense(studentModalityId, {
        defenseDate,
        defenseLocation,
      });

      // Formatear fecha para mostrar
      const formattedDate = new Date(defenseDate).toLocaleString("es-CO", {
        dateStyle: "full",
        timeStyle: "short",
      });

      setSuccessMessage(
        `✅ Sustentación reprogramada correctamente para el ${formattedDate} en ${defenseLocation}`
      );

      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error al reprogramar sustentación");
    } finally {
      setSubmitting(false);
    }
  };

  // Obtener fecha mínima (hoy)
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📅 Revisar Propuesta de Sustentación</h3>
          <button onClick={onClose} className="modal-close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {successMessage ? (
            <div className="modal-success-animation">
              <div className="success-icon">✅</div>
              <div className="success-message">{successMessage}</div>
              <div className="success-submessage">
                El estudiante y director serán notificados...
              </div>
            </div>
          ) : !action ? (
            <>
              {error && <div className="error-message">{error}</div>}

              <div className="info-box" style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ margin: "0 0 1rem 0", color: "#1565c0" }}>
                  📝 Propuesta del Director de Proyecto
                </h4>
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  <div>
                    <strong>Fecha y Hora:</strong>
                    <p style={{ margin: "0.25rem 0 0 0", color: "#333" }}>
                      {proposedDefenseDate ? new Date(proposedDefenseDate).toLocaleString("es-CO", {
                        dateStyle: "full",
                        timeStyle: "short",
                      }) : "No especificada"}
                    </p>
                  </div>
                  <div>
                    <strong>Lugar:</strong>
                    <p style={{ margin: "0.25rem 0 0 0", color: "#333" }}>
                      {proposedDefenseLocation || "No especificado"}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gap: "1rem" }}>
                <button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="btn-submit"
                  style={{ 
                    background: "linear-gradient(135deg, #28a745 0%, #218838 100%)",
                    padding: "1rem"
                  }}
                >
                  {submitting ? "Aprobando..." : "✅ Aprobar Propuesta"}
                </button>

                <button
                  onClick={() => setAction("reschedule")}
                  className="btn-cancel"
                  style={{ 
                    background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                    color: "white",
                    border: "none",
                    padding: "1rem"
                  }}
                >
                  📝 Reprogramar a Otra Fecha
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleReschedule}>
              {error && <div className="error-message">{error}</div>}

              <div className="warning-box" style={{ marginBottom: "1.5rem" }}>
                <p>
                  <strong>⚠️ Reprogramación</strong><br />
                  Estás cambiando la fecha propuesta por el director. Se notificará
                  al estudiante y al director de la nueva fecha.
                </p>
              </div>

              <div className="form-group">
                <label>Nueva Fecha y Hora de Sustentación *</label>
                <input
                  type="datetime-local"
                  value={defenseDate}
                  onChange={(e) => {
                    setDefenseDate(e.target.value);
                    setError("");
                  }}
                  min={today}
                  className="form-input"
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label>Nuevo Lugar de Sustentación *</label>
                <input
                  type="text"
                  value={defenseLocation}
                  onChange={(e) => {
                    setDefenseLocation(e.target.value);
                    setError("");
                  }}
                  placeholder="Ej: Auditorio Principal, Sala 302, etc."
                  className="form-input"
                  disabled={submitting}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setAction("")}
                  className="btn-cancel"
                  disabled={submitting}
                >
                  ← Volver
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={submitting}
                >
                  {submitting ? "Reprogramando..." : "Confirmar Reprogramación"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}