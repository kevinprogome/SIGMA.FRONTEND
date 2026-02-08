import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getModalitiesAdmin,
  getModalityRequirements,
  createModalityRequirements,
  updateModalityRequirements,
  deleteModalityRequirement,
} from "../../services/adminService";
import "../../styles/admin/Roles.css";

const RULE_TYPES = ["NUMERIC", "BOOLEAN", "DOCUMENT", "TEXT", "CONDITION"];

export default function Requirements() {
  const [searchParams] = useSearchParams();
  const modalityIdFromUrl = searchParams.get("modalityId");

  const [modalities, setModalities] = useState([]);
  const [selectedModalityId, setSelectedModalityId] = useState(modalityIdFromUrl || "");
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRequirements, setLoadingRequirements] = useState(false);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    requirementName: "",
    description: "",
    ruleType: "",
    expectedValue: "",
    active: true,
  });

  useEffect(() => {
    fetchModalities();
  }, []);

  useEffect(() => {
    if (selectedModalityId) {
      fetchRequirements();
    } else {
      setRequirements([]);
    }
  }, [selectedModalityId]);

  const fetchModalities = async () => {
    try {
      const data = await getModalitiesAdmin();
      setModalities(data);
    } catch (err) {
      setMessage("Error al cargar modalidades");
    } finally {
      setLoading(false);
    }
  };

  const fetchRequirements = async () => {
    setLoadingRequirements(true);
    try {
      const data = await getModalityRequirements(selectedModalityId);
      setRequirements(data);
    } catch (err) {
      setMessage("Error al cargar requerimientos: " + (err.response?.data?.message || err.message));
      setRequirements([]);
    } finally {
      setLoadingRequirements(false);
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      requirementName: "",
      description: "",
      ruleType: "",
      expectedValue: "",
      active: true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedModalityId) {
      setMessage("Selecciona una modalidad primero");
      return;
    }

    try {
      await createModalityRequirements(selectedModalityId, [formData]);
      setMessage("Requerimiento creado exitosamente");
      setShowModal(false);
      await fetchRequirements(); // ✅ Refresca la lista
    } catch (err) {
      setMessage(err.response?.data || "Error al crear requerimiento");
    }
  };

  const handleDelete = async (requirementId) => {
    if (!window.confirm("¿Estás seguro de eliminar este requerimiento?")) return;

    try {
      await deleteModalityRequirement(requirementId);
      setMessage("Requerimiento eliminado exitosamente");
      await fetchRequirements(); // ✅ Refresca la lista
    } catch (err) {
      setMessage("Error al eliminar requerimiento");
    }
  };

  if (loading) {
    return <div className="admin-loading">Cargando datos...</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Gestión de Requerimientos</h1>
          <p className="admin-page-subtitle">Administra los requerimientos por modalidad</p>
        </div>
        {selectedModalityId && (
          <button onClick={handleOpenCreate} className="admin-btn-primary">
            ➕ Agregar Requerimiento
          </button>
        )}
      </div>

      {message && (
        <div className={`admin-message ${message.includes("Error") ? "error" : "success"}`}>
          {message}
        </div>
      )}

      <div className="admin-form-group" style={{ marginBottom: "2rem" }}>
        <label className="admin-label">Seleccionar Modalidad</label>
        <select
          value={selectedModalityId}
          onChange={(e) => setSelectedModalityId(e.target.value)}
          className="admin-select"
        >
          <option value="">-- Selecciona una modalidad --</option>
          {modalities.map((modality) => (
            <option key={modality.id} value={modality.id}>
              {modality.name}
            </option>
          ))}
        </select>
      </div>

      {selectedModalityId ? (
        loadingRequirements ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            Cargando requerimientos...
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Requerimiento</th>
                  <th>Descripción</th>
                  <th>Tipo de Regla</th>
                  <th>Valor Esperado</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {requirements.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "#999" }}>
                      No hay requerimientos para esta modalidad. ¡Crea uno nuevo!
                    </td>
                  </tr>
                ) : (
                  requirements.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <strong>{req.requirementName}</strong>
                      </td>
                      <td>{req.description}</td>
                      <td>
                        <span className="admin-tag">{req.ruleType}</span>
                      </td>
                      <td>{req.expectedValue}</td>
                      <td>
                        <span className={`admin-status-badge ${req.active ? "active" : "inactive"}`}>
                          {req.active ? "ACTIVO" : "INACTIVO"}
                        </span>
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <button onClick={() => handleDelete(req.id)} className="admin-btn-delete">
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div style={{ textAlign: "center", padding: "4rem", color: "#999" }}>
          👆 Selecciona una modalidad para ver sus requerimientos
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Crear Nuevo Requerimiento</h2>
              <button onClick={() => setShowModal(false)} className="admin-modal-close">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form-group">
                <label className="admin-label">Nombre del Requerimiento</label>
                <input
                  type="text"
                  value={formData.requirementName}
                  onChange={(e) => setFormData({ ...formData, requirementName: e.target.value })}
                  className="admin-input"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="admin-textarea"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Tipo de Regla</label>
                <select
                  value={formData.ruleType}
                  onChange={(e) => setFormData({ ...formData, ruleType: e.target.value })}
                  className="admin-select"
                  required
                >
                  <option value="">-- Selecciona un tipo --</option>
                  {RULE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Valor Esperado</label>
                <input
                  type="text"
                  value={formData.expectedValue}
                  onChange={(e) => setFormData({ ...formData, expectedValue: e.target.value })}
                  className="admin-input"
                  required
                />
              </div>

              <div className="admin-modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="admin-btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="admin-btn-primary">
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}