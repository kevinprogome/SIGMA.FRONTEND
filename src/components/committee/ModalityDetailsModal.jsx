//components/council/ModalityDetailsModal.jsx//
import "../../styles/council/modals.css";

export default function ModalityDetailsModal({ modalityDetails, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-large"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>📋 Detalles de la Modalidad</h3>
          <button onClick={onClose} className="modal-close">
            ✕
          </button>
        </div>

        <div className="modal-body modality-details">
          <div className="detail-section">
            <h4 className="detail-title">{modalityDetails.name}</h4>
            <p className="detail-type">
              Tipo: <span>{modalityDetails.type}</span>
            </p>
            <p className="detail-credits">
              Créditos requeridos: <span>{modalityDetails.creditsRequired}</span>
            </p>
          </div>

          <div className="detail-section">
            <h5>Descripción</h5>
            <p className="detail-description">{modalityDetails.description}</p>
          </div>

          {modalityDetails.requirements &&
            modalityDetails.requirements.length > 0 && (
              <div className="detail-section">
                <h5>Requisitos</h5>
                <div className="requirements-list">
                  {modalityDetails.requirements.map((req) => (
                    <div key={req.id} className="requirement-item">
                      <div className="requirement-header">
                        <span className="requirement-name">
                          {req.requirementName}
                        </span>
                        <span className="requirement-type">{req.ruleType}</span>
                      </div>
                      <p className="requirement-description">
                        {req.description}
                      </p>
                      {req.expectedValue && (
                        <p className="requirement-value">
                          Valor esperado: <strong>{req.expectedValue}</strong>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          {modalityDetails.documents && modalityDetails.documents.length > 0 && (
            <div className="detail-section">
              <h5>Documentos Requeridos</h5>
              <div className="documents-list">
                {modalityDetails.documents.map((doc) => (
                  <div key={doc.id} className="document-item">
                    <div className="document-item-header">
                      <span className="document-item-name">
                        {doc.documentName}
                        {doc.documentType === "MANDATORY" && (
                          <span className="mandatory-badge">Obligatorio</span>
                        )}
                      </span>
                    </div>
                    <p className="document-item-description">
                      {doc.description}
                    </p>
                    <div className="document-item-meta">
                      <span>Formatos: {doc.allowedFormat}</span>
                      <span>Tamaño máx: {doc.maxFileSizeMB} MB</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button onClick={onClose} className="btn-submit">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}