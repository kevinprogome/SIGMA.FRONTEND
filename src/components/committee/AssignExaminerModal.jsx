import { useState, useEffect } from "react";
import { assignExaminers, getExaminersForCommittee } from "../../services/committeeService";
import "../../styles/council/modals.css";

export default function AssignExaminersModal({ studentModalityId, onClose, onSuccess }) {
  const [examiners, setExaminers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    primaryExaminer1Id: "",
    primaryExaminer2Id: "",
    tiebreakerExaminerId: "",
  });

  useEffect(() => {
    fetchExaminers();
  }, []);

  const fetchExaminers = async () => {
    try {
      const data = await getExaminersForCommittee();
      console.log("📋 Jueces disponibles:", data);
      setExaminers(data);
    } catch (err) {
      console.error("Error al obtener jueces:", err);
      setError("Error al cargar la lista de jueces");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.primaryExaminer1Id || !formData.primaryExaminer2Id) {
      setError("Debes seleccionar al menos los 2 jueces principales");
      return;
    }

    // Verificar que no sean el mismo juez
    const selectedIds = [
      formData.primaryExaminer1Id,
      formData.primaryExaminer2Id,
      formData.tiebreakerExaminerId,
    ].filter(Boolean);

    const uniqueIds = new Set(selectedIds);
    if (uniqueIds.size !== selectedIds.length) {
      setError("No puedes asignar el mismo juez más de una vez");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        primaryExaminer1Id: parseInt(formData.primaryExaminer1Id),
        primaryExaminer2Id: parseInt(formData.primaryExaminer2Id),
        tiebreakerExaminerId: formData.tiebreakerExaminerId
          ? parseInt(formData.tiebreakerExaminerId)
          : null,
      };

      const response = await assignExaminers(studentModalityId, payload);

      console.log("✅ Jueces asignados:", response);

      // Mostrar mensaje de éxito
      setSuccessMessage("✅ Jueces asignados correctamente a la sustentación");

      // Esperar 3 segundos antes de cerrar
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (err) {
      console.error("Error al asignar jueces:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Error al asignar jueces"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getExaminerName = (examinerId) => {
    const examiner = examiners.find((e) => e.id === parseInt(examinerId));
    return examiner ? `${examiner.name} ${examiner.lastName}` : "";
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>⏳ Cargando jueces...</h3>
            <button onClick={onClose} className="modal-close">
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>👨‍⚖️ Asignar Jueces de Sustentación</h3>
          <button onClick={onClose} className="modal-close" disabled={submitting}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {successMessage ? (
            <div className="modal-success-animation">
              <div className="success-icon">✅</div>
              <div className="success-message">{successMessage}</div>
              <div className="success-submessage">
                Cerrando automáticamente...
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="error-message">{error}</div>}

              <div className="info-box" style={{ marginBottom: "1.5rem" }}>
                <p>
                  ℹ️ <strong>Instrucciones:</strong>
                </p>
                <ul style={{ marginLeft: "1.5rem", marginTop: "0.5rem" }}>
                  <li>Los 2 jueces principales son <strong>obligatorios</strong></li>
                  <li>El juez de desempate es <strong>opcional</strong> (solo se usa si hay desacuerdo)</li>
                  <li>No puedes asignar el mismo juez más de una vez</li>
                  <li>El director del proyecto NO puede ser juez</li>
                </ul>
              </div>

              {/* Juez Principal 1 */}
              <div className="form-group">
                <label>
                  Juez Principal 1 <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <select
                  value={formData.primaryExaminer1Id}
                  onChange={(e) => {
                    setFormData({ ...formData, primaryExaminer1Id: e.target.value });
                    setError("");
                  }}
                  className="form-input"
                  disabled={submitting}
                  required
                >
                  <option value="">Seleccionar juez principal 1...</option>
                  {examiners.map((examiner) => (
                    <option key={examiner.id} value={examiner.id}>
                      {examiner.name} {examiner.lastName} - {examiner.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Juez Principal 2 */}
              <div className="form-group">
                <label>
                  Juez Principal 2 <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <select
                  value={formData.primaryExaminer2Id}
                  onChange={(e) => {
                    setFormData({ ...formData, primaryExaminer2Id: e.target.value });
                    setError("");
                  }}
                  className="form-input"
                  disabled={submitting}
                  required
                >
                  <option value="">Seleccionar juez principal 2...</option>
                  {examiners.map((examiner) => (
                    <option
                      key={examiner.id}
                      value={examiner.id}
                      disabled={examiner.id === parseInt(formData.primaryExaminer1Id)}
                    >
                      {examiner.name} {examiner.lastName} - {examiner.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Juez de Desempate */}
              <div className="form-group">
                <label>
                  Juez de Desempate <span style={{ color: "#666", fontSize: "0.85rem" }}>(Opcional)</span>
                </label>
                <select
                  value={formData.tiebreakerExaminerId}
                  onChange={(e) => {
                    setFormData({ ...formData, tiebreakerExaminerId: e.target.value });
                    setError("");
                  }}
                  className="form-input"
                  disabled={submitting}
                >
                  <option value="">Seleccionar juez de desempate (opcional)...</option>
                  {examiners.map((examiner) => (
                    <option
                      key={examiner.id}
                      value={examiner.id}
                      disabled={
                        examiner.id === parseInt(formData.primaryExaminer1Id) ||
                        examiner.id === parseInt(formData.primaryExaminer2Id)
                      }
                    >
                      {examiner.name} {examiner.lastName} - {examiner.email}
                    </option>
                  ))}
                </select>
                <small style={{ color: "#666", marginTop: "0.5rem", display: "block" }}>
                  Solo se utilizará si los jueces principales no llegan a un consenso
                </small>
              </div>

              {/* Resumen de Selección */}
              {(formData.primaryExaminer1Id || formData.primaryExaminer2Id) && (
                <div
                  style={{
                    background: "#f0f9ff",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid #0ea5e9",
                    marginTop: "1.5rem",
                  }}
                >
                  <strong style={{ display: "block", marginBottom: "0.75rem", color: "#0c4a6e" }}>
                    📋 Resumen de Jueces Seleccionados:
                  </strong>
                  <ul style={{ marginLeft: "1.5rem", color: "#0c4a6e" }}>
                    {formData.primaryExaminer1Id && (
                      <li>
                        <strong>Juez Principal 1:</strong>{" "}
                        {getExaminerName(formData.primaryExaminer1Id)}
                      </li>
                    )}
                    {formData.primaryExaminer2Id && (
                      <li>
                        <strong>Juez Principal 2:</strong>{" "}
                        {getExaminerName(formData.primaryExaminer2Id)}
                      </li>
                    )}
                    {formData.tiebreakerExaminerId && (
                      <li>
                        <strong>Juez de Desempate:</strong>{" "}
                        {getExaminerName(formData.tiebreakerExaminerId)}
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-cancel"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? "Asignando..." : "Asignar Jueces"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}