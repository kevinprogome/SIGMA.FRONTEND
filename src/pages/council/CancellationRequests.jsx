import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPendingCancellations,
  viewCancellationDocument,
  approveCancellation,
  rejectCancellation,
} from "../../services/adminService";
import "../../styles/council/CancellationRequests.css";

export default function CancellationRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await getPendingCancellations();
      setRequests(data);
    } catch (err) {
      setMessage("Error al cargar solicitudes de cancelación");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async (studentModalityId) => {
    try {
      const blob = await viewCancellationDocument(studentModalityId);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      setMessage("Error al ver el documento");
    }
  };

  const handleViewProfile = (studentModalityId) => {
    navigate(`/council/students/${studentModalityId}`);
  };

  const handleApprove = async (studentModalityId) => {
    if (!window.confirm("¿Estás seguro de aprobar esta solicitud de cancelación?")) {
      return;
    }

    try {
      await approveCancellation(studentModalityId);
      setMessage("Solicitud aprobada exitosamente");
      fetchRequests();
    } catch (err) {
      setMessage("Error al aprobar la solicitud");
    }
  };

  const handleOpenRejectModal = (request) => {
    setSelectedRequest(request);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleReject = async (e) => {
    e.preventDefault();
    try {
      await rejectCancellation(selectedRequest.studentModalityId, rejectReason);
      setMessage("Solicitud rechazada");
      setShowRejectModal(false);
      fetchRequests();
    } catch (err) {
      setMessage("Error al rechazar la solicitud");
    }
  };

  if (loading) {
    return <div className="council-loading">Cargando solicitudes...</div>;
  }

  return (
    <div className="cancellation-requests-container">
      <div className="cancellation-requests-header">
        <h1>Solicitudes de Cancelación de Modalidad</h1>
        <p>Revisa y gestiona las solicitudes de los estudiantes</p>
      </div>

      {message && (
        <div className={`cancellation-message ${message.includes("Error") ? "error" : "success"}`}>
          {message}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No hay solicitudes de cancelación pendientes</p>
        </div>
      ) : (
        <div className="requests-table-container">
          <table className="requests-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Modalidad</th>
                <th>Fecha de Solicitud</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.studentModalityId}>
                  <td>
                    <strong>{request.studentName}</strong>
                    <br />
                    <small>{request.studentEmail}</small>
                  </td>
                  <td>{request.modalityName}</td>
                  <td>{new Date(request.requestDate).toLocaleDateString("es-CO")}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleViewDocument(request.studentModalityId)}
                        className="btn-view-doc"
                        title="Ver documento"
                      >
                        📄 Documento
                      </button>
                      <button
                        onClick={() => handleViewProfile(request.studentModalityId)}
                        className="btn-view-profile"
                        title="Ver perfil"
                      >
                        👤 Perfil
                      </button>
                      <button
                        onClick={() => handleApprove(request.studentModalityId)}
                        className="btn-approve"
                        title="Aprobar"
                      >
                        ✅ Aprobar
                      </button>
                      <button
                        onClick={() => handleOpenRejectModal(request)}
                        className="btn-reject"
                        title="Rechazar"
                      >
                        ❌ Rechazar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Rechazar Solicitud</h2>
              <button onClick={() => setShowRejectModal(false)} className="modal-close">
                ✕
              </button>
            </div>

            <form onSubmit={handleReject} className="modal-form">
              <div className="form-group">
                <label>Estudiante</label>
                <input
                  type="text"
                  value={selectedRequest?.studentName}
                  className="input"
                  disabled
                />
              </div>

              <div className="form-group">
                <label>Razón del Rechazo</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="textarea"
                  placeholder="Explica por qué se rechaza esta solicitud..."
                  required
                  rows="4"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="btn-cancel"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-confirm-reject">
                  Confirmar Rechazo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}//