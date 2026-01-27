// src/pages/student/ModalityStatus.jsx
import { useEffect, useState } from "react";
import { getCurrentModalityStatus } from "../../services/studentService";
import "../../styles/student/status.css"; // 👈 Importa el CSS

export default function ModalityStatus() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await getCurrentModalityStatus();
        setData(res);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message ||
            "No tienes una modalidad activa en este momento"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (loading) {
    return <div className="status-loading">Cargando estado de la modalidad...</div>;
  }

  if (error) {
    return (
      <div className="status-container">
        <div className="status-error-container">
          <div className="status-error-card">
            <div className="status-error-icon">📋</div>
            <h2 className="status-error-title">Estado de la modalidad</h2>
            <div className="status-error-message">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="status-container">
      {/* Header */}
      <div className="status-header">
        <h2 className="status-title">Estado de la Modalidad</h2>
      </div>

      {/* Información principal */}
      <div className="status-main-card">
        <div className="status-info-grid">
          <div className="status-info-item">
            <span className="status-label">Modalidad</span>
            <span className="status-value">{data.modalityName}</span>
          </div>

          <div className="status-info-item">
            <span className="status-label">Estado actual</span>
            <span className="status-current-badge">{data.currentStatus}</span>
          </div>

          {data.currentStatusDescription && (
            <div className="status-description">
              {data.currentStatusDescription}
            </div>
          )}

          <div className="status-info-item">
            <span className="status-label">Última actualización</span>
            <span className="status-date">
              {new Date(data.lastUpdatedAt).toLocaleString('es-CO', {
                dateStyle: 'long',
                timeStyle: 'short'
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Historial */}
      <div className="status-history-section">
        <h3 className="status-history-title">Historial de Estados</h3>

        {data.history && data.history.length > 0 ? (
          <ul className="status-history-list">
            {data.history.map((h, index) => (
              <li key={index} className="status-history-item">
                <div className="status-history-card">
                  <div className="status-history-status">{h.status}</div>
                  <div className="status-history-description">{h.description}</div>

                  <div className="status-history-meta">
                    <div className="status-history-meta-item">
                      <span className="status-history-meta-label">Fecha:</span>
                      <span className="status-history-meta-value">
                        {new Date(h.changeDate).toLocaleString('es-CO', {
                          dateStyle: 'long',
                          timeStyle: 'short'
                        })}
                      </span>
                    </div>

                    <div className="status-history-meta-item">
                      <span className="status-history-meta-label">Responsable:</span>
                      <span className="status-history-meta-value">{h.responsible}</span>
                    </div>
                  </div>

                  {h.observations && (
                    <div className="status-observations">
                      <span className="status-observations-label">Observaciones:</span>
                      <p className="status-observations-text">{h.observations}</p>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="status-history-empty">
            <div className="status-history-empty-icon">📭</div>
            <p>No hay historial disponible</p>
          </div>
        )}
      </div>
    </div>
  );
}