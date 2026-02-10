import { useState } from "react";
import { scheduleDefense } from "../../services/committeeService";
import "../../styles/council/modals.css";

export default function ScheduleDefenseModal({ studentModalityId, onClose, onSuccess }) {
  const [defenseDate, setDefenseDate] = useState("");
  const [defenseLocation, setDefenseLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
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
      await scheduleDefense(studentModalityId, {
        defenseDate,
        defenseLocation,
      });

      // Formatear fecha para mostrar
      const formattedDate = new Date(defenseDate).toLocaleString("es-CO", {
        dateStyle: "full",
        timeStyle: "short",
      });

      // Mostrar mensaje de éxito
      setSuccessMessage(
        `✅ Sustentación programada correctamente para el ${formattedDate} en ${defenseLocation}`
      );

      // Esperar antes de cerrar
      setTimeout(() => {
        onSuccess();
      }, 1000000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error al programar sustentación");
    } finally {
      setSubmitting(false);
    }
  };

  // Obtener fecha mínima (hoy)
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📅 Programar Sustentación</h3>
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
                El estudiante fue notificado de esta novedad
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label>Fecha y Hora de Sustentación *</label>
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
                <label>Lugar de Sustentación *</label>
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

              <div className="info-box">
                <p>
                  ℹ️ Una vez programada la sustentación, el estudiante será
                  notificado con los detalles.
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
                  {submitting ? "Programando..." : "Programar Sustentación"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}