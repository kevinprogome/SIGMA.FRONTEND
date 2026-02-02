import { useEffect, useState } from "react";
import {
  getAllModalities,
  createRequiredDocument,
  updateRequiredDocument,
} from "../../services/adminService";
import "../../styles/admin/Roles.css";

export default function Documents() {
  const [modalities, setModalities] = useState([]);
  const [selectedModalityId, setSelectedModalityId] = useState("");
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);

  const [formData, setFormData] = useState({
    modalityId: "",
    documentName: "",
    allowedFormat: "",
    maxFileSizeMB: 5,
    isMandatory: true,
    description: "",
    active: true,
  });

  useEffect(() => {
    fetchModalities();
  }, []);

  useEffect(() => {
    if (selectedModalityId) {
      setFormData((prev) => ({ ...prev, modalityId: selectedModalityId }));
      // En producción real, deberías tener un endpoint para obtener documentos por modalityId
      setDocuments([]);
    }
  }, [selectedModalityId]);

  const fetchModalities = async () => {
    try {
      const data = await getAllModalities();
      setModalities(data);
    } catch (err) {
      setMessage("Error al cargar modalidades");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingDocument(null);
    setFormData({
      modalityId: selectedModalityId,
      documentName: "",
      allowedFormat: "",
      maxFileSizeMB: 5,
      isMandatory: true,
      description: "",
      active: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (document) => {
    setEditingDocument(document);
    setFormData({
      modalityId: document.modalityId,
      documentName: document.documentName,
      allowedFormat: document.allowedFormat,
      maxFileSizeMB: document.maxFileSizeMB,
      isMandatory: document.isMandatory,
      description: document.description,
      active: document.active,
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
      if (editingDocument) {
        await updateRequiredDocument(editingDocument.id, formData);
        setMessage("Documento actualizado exitosamente");
      } else {
        await createRequiredDocument(formData);
        setMessage("Documento creado exitosamente");
      }
      setShowModal(false);
      // Aquí deberías refrescar los documentos
    } catch (err) {
      setMessage(err.response?.data || "Error al procesar la solicitud");
    }
  };

  if (loading) {
    return <div className="admin-loading">Cargando datos...</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Gestión de Documentos Requeridos</h1>
          <p className="admin-page-subtitle">Administra los documentos por modalidad</p>
        </div>
        {selectedModalityId && (
          <button onClick={handleOpenCreate} className="admin-btn-primary">
            ➕ Agregar Documento
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
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Descripción</th>
                <th>Formato</th>
                <th>Tamaño Máx</th>
                <th>Obligatorio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "#999" }}>
                    No hay documentos para esta modalidad. ¡Crea uno nuevo!
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <strong>{doc.documentName}</strong>
                    </td>
                    <td>{doc.description}</td>
                    <td>
                      <span className="admin-tag">{doc.allowedFormat}</span>
                    </td>
                    <td>{doc.maxFileSizeMB} MB</td>
                    <td>
                      <span className={`admin-status-badge ${doc.isMandatory ? "active" : "inactive"}`}>
                        {doc.isMandatory ? "SÍ" : "NO"}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-status-badge ${doc.active ? "active" : "inactive"}`}>
                        {doc.active ? "ACTIVO" : "INACTIVO"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button onClick={() => handleOpenEdit(doc)} className="admin-btn-edit">
                          ✏️ Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "4rem", color: "#999" }}>
          👆 Selecciona una modalidad para ver sus documentos
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editingDocument ? "Editar Documento" : "Crear Nuevo Documento"}</h2>
              <button onClick={() => setShowModal(false)} className="admin-modal-close">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form-group">
                <label className="admin-label">Nombre del Documento</label>
                <input
                  type="text"
                  value={formData.documentName}
                  onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
                  className="admin-input"
                  placeholder="Ej: Carta de Presentación"
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
                <label className="admin-label">Formato Permitido</label>
                <input
                  type="text"
                  value={formData.allowedFormat}
                  onChange={(e) => setFormData({ ...formData, allowedFormat: e.target.value })}
                  className="admin-input"
                  placeholder="Ej: PDF, DOCX, JPG"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Tamaño Máximo (MB)</label>
                <input
                  type="number"
                  value={formData.maxFileSizeMB}
                  onChange={(e) => setFormData({ ...formData, maxFileSizeMB: parseInt(e.target.value) })}
                  className="admin-input"
                  min="1"
                  max="50"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isMandatory}
                    onChange={(e) => setFormData({ ...formData, isMandatory: e.target.checked })}
                    className="admin-checkbox"
                  />
                  <span>¿Es obligatorio?</span>
                </label>
              </div>

              {editingDocument && (
                <div className="admin-form-group">
                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="admin-checkbox"
                    />
                    <span>Activo</span>
                  </label>
                </div>
              )}

              <div className="admin-modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="admin-btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="admin-btn-primary">
                  {editingDocument ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}