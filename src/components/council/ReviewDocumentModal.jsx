import { useState } from "react";
import "../../styles/council/modals.css";

export default function ReviewDocumentModal({ document, onClose, onSubmit }) {
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const statusOptions = [
    { value: "ACCEPTED_FOR_COUNCIL_REVIEW", label: "✅ Aceptado para revisión del consejo" },
    { value: "REJECTED_FOR_COUNCIL_REVIEW", label: "❌ Rechazado por el consejo" },
    { value: "CORRECTIONS_REQUESTED_BY_COUNCIL", label: "📝 Correcciones solicitadas por el consejo" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!status) {
      setError("Debes seleccionar un estado");
      return;
    }

    if (!notes.trim()) {
      setError("Debes agregar un comentario");
      return;
    }

    onSubmit({ status, notes });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Revisar Documento</h3>
          <button onClick={onClose} className="modal-close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="document-info-box">
            <h4>{document.documentName}</h4>
            <p className="current-status">Estado actual: {document.status}</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label>Nuevo Estado *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="form-select"
              >
                <option value="">Selecciona un estado</option>
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Comentarios *</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Escribe tus observaciones sobre este documento..."
                rows={4}
                className="form-textarea"
              />
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn-cancel">
                Cancelar
              </button>
              <button type="submit" className="btn-submit">
                Guardar Revisión
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}