//components/council/AssignDirectorModal.jsx//
import { useState, useEffect } from "react";
import { getProjectDirectors, assignProjectDirector } from "../../services/councilService";
import "../../styles/council/modals.css";

export default function AssignDirectorModal({ studentModalityId, onClose, onSuccess }) {
  const [directors, setDirectors] = useState([]);
  const [selectedDirector, setSelectedDirector] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDirectors();
  }, []);

  const fetchDirectors = async () => {
    try {
      const res = await getProjectDirectors();
      setDirectors(res);
    } catch (err) {
      console.error(err);
      setError("Error al cargar la lista de directores");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDirector) {
      setError("Debes seleccionar un director");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await assignProjectDirector(studentModalityId, selectedDirector);
      onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error al asignar director");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>👨‍🏫 Asignar Director de Proyecto</h3>
          <button onClick={onClose} className="modal-close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-message">Cargando directores...</div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label>Selecciona un Director *</label>
                <select
                  value={selectedDirector}
                  onChange={(e) => setSelectedDirector(e.target.value)}
                  className="form-select"
                  disabled={submitting}
                >
                  <option value="">-- Selecciona un director --</option>
                  {directors.map((director) => (
                    <option key={director.id} value={director.id}>
                      {director.name} ({director.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="info-box">
                <p>
                  ℹ️ El director asignado será responsable de supervisar el
                  desarrollo de la modalidad del estudiante.
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
                  {submitting ? "Asignando..." : "Asignar Director"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}