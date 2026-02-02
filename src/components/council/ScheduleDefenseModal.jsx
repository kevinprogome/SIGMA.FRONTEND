//components/council/ScheduleDefenseModal.jsx//
import { useState } from "react";
import { scheduleDefense } from "../../services/councilService";
import "../../styles/council/modals.css";

export default function ScheduleDefenseModal({ studentModalityId, onClose, onSuccess }) {
  const [defenseDate, setDefenseDate] = useState("");
  const [defenseLocation, setDefenseLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
      onSuccess();
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
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label>Fecha de Sustentación *</label>
              <input
                type="datetime-local"
                value={defenseDate}
                onChange={(e) => setDefenseDate(e.target.value)}
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
                onChange={(e) => setDefenseLocation(e.target.value)}
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
        </div>
      </div>
    </div>
  );
}