import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAvailableSeminars,
  enrollInSeminar,
  getCurrentModalityStatus,
} from "../../services/studentService";

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

        // Redirigir a documentos después de 3 segundos
        setTimeout(() => {
          navigate("/student/documents");
        }, 3000);
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
      <div className="seminar-selection-container">
        <div className="seminar-loading">
          <div className="spinner"></div>
          <p>Cargando seminarios disponibles...</p>
        </div>
      </div>
    );
  }

  if (!hasSeminarioModality && !alreadyEnrolled) {
    return (
      <div className="seminar-selection-container">
        <div className="seminar-error">
          <div className="error-icon">⚠️</div>
          <h2>Acceso Restringido</h2>
          <p>{message}</p>
          <button
            className="seminar-button"
            onClick={() => navigate("/student/modalities")}
          >
            Ir a Modalidades
          </button>
        </div>
      </div>
    );
  }

  if (alreadyEnrolled) {
    return (
      <div className="seminar-selection-container">
        <div className="seminar-success">
          <div className="success-icon">✅</div>
          <h2>Ya estás inscrito en un seminario</h2>
          <p>Puedes continuar con la carga de tus documentos.</p>
          <button
            className="seminar-button"
            onClick={() => navigate("/student/documents")}
          >
            Ir a Documentos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="seminar-selection-container">
      {/* Header */}
      <div className="seminar-header">
        <div>
          <h1 className="seminar-title">📚 Seminarios Disponibles</h1>
          <p className="seminar-subtitle">
            Selecciona el seminario en el que deseas inscribirte
          </p>
        </div>
        <button
          className="seminar-back-button"
          onClick={() => navigate("/student")}
        >
          ← Volver al Dashboard
        </button>
      </div>

      {/* Mensajes */}
      {message && (
        <div className={`seminar-message ${messageType}`}>
          {message}
          <button onClick={() => setMessage("")}>✕</button>
        </div>
      )}

      {/* Tabla de Seminarios */}
      {seminars.length === 0 ? (
        <div className="seminar-empty">
          <div className="empty-icon">📭</div>
          <h3>No hay seminarios disponibles</h3>
          <p>
            No hay seminarios abiertos para tu programa académico en este
            momento.
          </p>
        </div>
      ) : (
        <div className="seminar-table-container">
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
                    <small className="seminar-program">
                      {seminar.academicProgramName}
                    </small>
                  </td>
                  <td className="seminar-description">
                    {seminar.description}
                  </td>
                  <td className="text-center">
                    <div className="participants-range">
                      {seminar.minParticipants} - {seminar.maxParticipants}
                    </div>
                  </td>
                  <td className="text-center">
                    <div
                      className={`available-spots ${
                        seminar.availableSpots === 0 ? "full" : ""
                      }`}
                    >
                      {seminar.availableSpots}
                    </div>
                  </td>
                  <td className="seminar-cost">
                    {formatCurrency(seminar.totalCost)}
                  </td>
                  <td>{getStatusBadge(seminar.status)}</td>
                  <td>
                    <button
                      className="enroll-button"
                      onClick={() => handleOpenConfirmModal(seminar)}
                      disabled={
                        seminar.status !== "OPEN" ||
                        seminar.availableSpots === 0 ||
                        enrolling === seminar.id
                      }
                    >
                      {enrolling === seminar.id
                        ? "Inscribiendo..."
                        : seminar.availableSpots === 0
                        ? "Sin cupos"
                        : "Unirse"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Confirmación */}
      {showConfirmModal && selectedSeminar && (
        <div
          className="modal-overlay"
          onClick={() => setShowConfirmModal(false)}
        >
          <div className="modal-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirmar Inscripción</h3>
              <button
                className="modal-close"
                onClick={() => setShowConfirmModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-warning">
                ⚠️ <strong>IMPORTANTE:</strong> Al confirmar, quedarás
                inscrito en este seminario y deberás completar el pago.
              </p>

              <div className="seminar-details">
                <h4>{selectedSeminar.name}</h4>
                <p>{selectedSeminar.description}</p>

                <div className="detail-row">
                  <span className="detail-label">Programa:</span>
                  <span className="detail-value">
                    {selectedSeminar.academicProgramName}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Horas totales:</span>
                  <span className="detail-value">
                    {selectedSeminar.totalHours} horas
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Costo:</span>
                  <span className="detail-value cost">
                    {formatCurrency(selectedSeminar.totalCost)}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Cupos disponibles:</span>
                  <span
                    className={`detail-value ${
                      selectedSeminar.availableSpots < 5 ? "low-spots" : ""
                    }`}
                  >
                    {selectedSeminar.availableSpots} /{" "}
                    {selectedSeminar.maxParticipants}
                  </span>
                </div>
              </div>

              <p className="modal-question">
                ¿Estás seguro de que deseas inscribirte en este seminario?
              </p>
            </div>

            <div className="modal-actions">
              <button
                className="seminar-button secondary"
                onClick={() => setShowConfirmModal(false)}
                disabled={enrolling}
              >
                Cancelar
              </button>
              <button
                className="seminar-button primary"
                onClick={handleEnroll}
                disabled={enrolling}
              >
                {enrolling ? "Inscribiendo..." : "Confirmar Inscripción"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}