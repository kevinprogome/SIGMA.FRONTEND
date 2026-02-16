import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAvailableSeminars,
  enrollInSeminar,
  getCurrentModalityStatus,
} from "../../services/studentService";
import '../../styles/student/seminars-modal.css';

export default function SeminarSelection() {
  const navigate = useNavigate();

  const [seminars, setSeminars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedSeminar, setSelectedSeminar] = useState(null);
  const [hasSeminarioModality, setHasSeminarioModality] = useState(false);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);

  useEffect(() => {
    checkModalityAndFetchSeminars();
  }, []);

  // ✅ NUEVO: Bloquear cambio de seminario si ya está inscrito
  useEffect(() => {
    if (alreadyEnrolled) {
      setShowConfirmModal(false);
      setSelectedSeminar(null);
    }
  }, [alreadyEnrolled]);

  const checkModalityAndFetchSeminars = async () => {
    try {
      setLoading(true);

      // Verificar si tiene la modalidad de seminario activa
      const currentModality = await getCurrentModalityStatus();
      
      if (!currentModality || !currentModality.modalityName) {
        setMessage("No tienes una modalidad activa. Por favor, selecciona primero la modalidad 'Seminario de Grado'.");
        setMessageType("error");
        setHasSeminarioModality(false);
        setLoading(false);
        return;
      }

      const isSeminarioModality = currentModality.modalityName
        .toUpperCase()
        .includes("SEMINARIO");

      if (!isSeminarioModality) {
        setMessage("Esta sección es solo para estudiantes de Seminario de Grado.");
        setMessageType("error");
        setHasSeminarioModality(false);
        setLoading(false);
        return;
      }

      setHasSeminarioModality(true);

      // Cargar seminarios disponibles
      const response = await getAvailableSeminars();
      
      if (response.success) {
        setSeminars(response.seminars || []);
      } else {
        setMessage("No se pudieron cargar los seminarios disponibles");
        setMessageType("error");
      }
    } catch (err) {
      console.error("❌ Error al cargar seminarios:", err);
      
      // Si el error dice que ya está inscrito, mostrar mensaje diferente
      const errorMsg = err.response?.data?.error || err.response?.data?.message || "";
      
      if (errorMsg.includes("Ya estás inscrito")) {
        setMessage("Ya estás inscrito en un seminario. Puedes continuar con la carga de documentos.");
        setMessageType("success");
        setAlreadyEnrolled(true);
      } else {
        setMessage(errorMsg || "Error al cargar los seminarios disponibles");
        setMessageType("error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfirmModal = (seminar) => {
    if (alreadyEnrolled) return;
    setSelectedSeminar(seminar);
    setShowConfirmModal(true);
  };

  const handleEnroll = async () => {
    if (!selectedSeminar) return;

    try {
      setEnrolling(selectedSeminar.id);
      setMessage("");

      const response = await enrollInSeminar(selectedSeminar.id);

      if (response.success) {
        setMessage(
          `🎉 ${response.message || "Te has inscrito exitosamente en el seminario"}. Redirigiendo a documentos...`
        );
        setMessageType("success");
        setShowConfirmModal(false);

        setTimeout(() => {
          navigate("/student/documents");
        }, 100000);
      } else {
        setMessage(response.error || "Error al inscribirse en el seminario");
        setMessageType("error");
        setShowConfirmModal(false);
      }
    } catch (err) {
      console.error("❌ Error al inscribirse:", err);
      
      const errorMsg = err.response?.data?.error || 
                       err.response?.data?.message ||
                       "Error al inscribirse en el seminario";
      
      setMessage(errorMsg);
      setMessageType("error");
      setShowConfirmModal(false);
    } finally {
      setEnrolling(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const badges = {
      OPEN: { text: "Abierto", class: "open" },
      CLOSED: { text: "Cerrado", class: "closed" },
      IN_PROGRESS: { text: "En Curso", class: "in-progress" },
      COMPLETED: { text: "Completado", class: "completed" },
    };

    const badge = badges[status] || { text: status, class: "default" };

    return (
      <span className={`seminar-status-badge ${badge.class}`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-seminar">
          <div className="seminar-modal-loading">
            <div className="spinner"></div>
            <p>Cargando seminarios disponibles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasSeminarioModality && !alreadyEnrolled) {
    return (
      <div className="modal-overlay">
        <div className="modal-seminar">
          <div className="seminar-modal-empty">
            <p>⚠️ {message}</p>
            <button className="enroll-button" onClick={() => navigate("/student/modalities")}>Ir a Modalidades</button>
          </div>
        </div>
      </div>
    );
  }

  if (alreadyEnrolled) {
    return (
      <div className="modal-overlay">
        <div className="modal-seminar">
          <div className="seminar-modal-empty">
            <p>✅ Ya estás inscrito en un seminario.<br/>Puedes continuar con la carga de tus documentos.</p>
            <button className="enroll-button" onClick={() => navigate("/student/documents")}>Ir a Documentos</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-seminar">
        <div className="modal-detail-header">
          <h3>Seminarios Disponibles</h3>
          <button className="modal-close-btn" onClick={() => navigate("/student")}>✕</button>
        </div>
        <p className="seminar-modal-subtitle">Selecciona el seminario en el que deseas inscribirte</p>
        {message && (
          <div className={`seminar-message ${messageType}`}>{message}</div>
        )}
        {seminars.length === 0 ? (
          <div className="seminar-modal-empty">
            <p>📭 No hay seminarios disponibles para tu programa en este momento.</p>
          </div>
        ) : (
          <div className="seminar-table-wrapper">
            <table className="seminar-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Participantes</th>
                  <th>Espacios</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {seminars.map((seminar) => (
                  <tr key={seminar.id}>
                    <td>
                      <div className="seminar-name">{seminar.name}</div>
                      <small className="seminar-program">{seminar.academicProgramName}</small>
                    </td>
                    <td className="seminar-description">{seminar.description}</td>
                    <td className="text-center">{seminar.minParticipants} - {seminar.maxParticipants}</td>
                    <td className="text-center">
                      <span className={`available-spots ${seminar.availableSpots === 0 ? 'full' : ''}`}>{seminar.availableSpots}</span>
                    </td>
                    <td className="seminar-cost">{formatCurrency(seminar.totalCost)}</td>
                    <td>{getStatusBadge(seminar.status)}</td>
                    <td>
                      <button
                        className="enroll-button"
                        onClick={() => handleOpenConfirmModal(seminar)}
                        disabled={
                          seminar.status !== "OPEN" ||
                          seminar.availableSpots === 0 ||
                          enrolling === seminar.id ||
                          alreadyEnrolled
                        }
                      >
                        {enrolling === seminar.id
                          ? "Inscribiendo..."
                          : seminar.availableSpots === 0
                          ? "Sin cupos"
                          : alreadyEnrolled
                          ? "Ya inscrito"
                          : "Unirse"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {showConfirmModal && selectedSeminar && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1000 }}>
            <div className="modal-confirm" onClick={(e) => e.stopPropagation()}>
              <h3>Confirmar Inscripción en Seminario</h3>
              <div className="seminar-confirm-warning">
                ⚠️ <strong>IMPORTANTE: Al confirmar, quedarás inscrito en este seminario y deberás completar con el pago del seminario.</strong>
              </div>
              <div className="seminar-confirm-details">
                <h4>{selectedSeminar.name}</h4>
                <p>{selectedSeminar.description}</p>
                <div className="detail-row">
                  <span>Horas totales:</span>
                  <strong>{selectedSeminar.totalHours} horas</strong>
                </div>
                <div className="detail-row">
                  <span>Costo:</span>
                  <strong className="cost-highlight">{formatCurrency(selectedSeminar.totalCost)}</strong>
                </div>
                <div className="detail-row">
                  <span>Cupos disponibles:</span>
                  <strong className={selectedSeminar.availableSpots < 5 ? "low-spots" : ""}>
                    {selectedSeminar.availableSpots} / {selectedSeminar.maxParticipants}
                  </strong>
                </div>
              </div>
              <p className="seminar-confirm-question">¿Estás seguro de que deseas inscribirte en este seminario?</p>
              <div className="modal-confirm-actions" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                <button className="enroll-button secondary" onClick={() => setShowConfirmModal(false)} disabled={enrolling}>Cancelar</button>
                <button className="enroll-button primary" onClick={handleEnroll} disabled={enrolling}>{enrolling ? "Inscribiendo..." : "Confirmar"}</button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ NUEVO: Ventana de confirmación final */}
        {messageType === 'success' && message.includes('inscrito') && !showConfirmModal && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="modal-confirm" style={{ maxWidth: 420, margin: 'auto', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ color: '#7A1117', marginBottom: '1rem' }}>¡Seminario seleccionado exitosamente!</h3>
              <div className="seminar-confirm-warning" style={{ justifyContent: 'center', textAlign: 'center' }}>
                ✅ Has seleccionado el seminario <strong>{selectedSeminar?.name}</strong>.<br/>
          
              </div>
              <div className="modal-confirm-actions" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                <button className="enroll-button primary" onClick={() => navigate('/student/documents')}>Ir a Documentos</button>
                <button className="enroll-button secondary" onClick={() => setMessage('')}>Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}