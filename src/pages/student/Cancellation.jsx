import { useState, useEffect } from "react";
import { uploadCancellationDocument, requestCancellationModality, getCurrentModalityStatus } from "../../services/studentService";
import "../../styles/student/cancellation.css";

export default function StudentCancellation() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [studentModalityId, setStudentModalityId] = useState(null);
  const [loadingModalityId, setLoadingModalityId] = useState(true);

  useEffect(() => {
    const fetchModalityId = async () => {
      setLoadingModalityId(true);
      try {
        const status = await getCurrentModalityStatus();
        const modalityId = status.id || status.studentModalityId || status.modalityId;
        
        if (modalityId) {
          setStudentModalityId(modalityId);
        } else {
          setMessage("No se encontró una modalidad activa");
        }
      } catch (err) {
        setMessage("Error al obtener información de la modalidad");
      } finally {
        setLoadingModalityId(false);
      }
    };
    fetchModalityId();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setMessage("Solo se permiten archivos PDF");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setMessage("El archivo no puede superar los 5MB");
        return;
      }
      setFile(selectedFile);
      setMessage("");
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setMessage("Selecciona un archivo primero");
      return;
    }

    if (!studentModalityId) {
      setMessage("No se pudo obtener la información de tu modalidad");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      await uploadCancellationDocument(studentModalityId, formData);
      setMessage("Documento subido exitosamente");
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.message || err.response?.data || "Error al subir el documento");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCancellation = async () => {
    if (!studentModalityId) {
      setMessage("No se pudo obtener la información de tu modalidad");
      return;
    }

    setLoading(true);
    try {
      await requestCancellationModality(studentModalityId);
      setMessage("Solicitud de cancelación enviada exitosamente. El consejo la revisará pronto.");
      setStep(3);
    } catch (err) {
      setMessage(err.response?.data?.message || err.response?.data || "Error al solicitar cancelación");
    } finally {
      setLoading(false);
    }
  };

  if (loadingModalityId) {
    return (
      <div className="cancellation-container">
        <div className="cancellation-header">
          <h1>Cancelar Modalidad de Grado</h1>
          <p>Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cancellation-container">
      <div className="cancellation-header">
        <h1>Cancelar Modalidad de Grado</h1>
        <p>Sigue estos pasos para solicitar la cancelación de tu modalidad</p>
      </div>

      {message && (
        <div className={`cancellation-message ${message.includes("Error") || message.includes("error") ? "error" : "success"}`}>
          {message}
        </div>
      )}

      <div className="cancellation-steps">
        <div className={`step ${step >= 1 ? "active" : ""} ${step > 1 ? "completed" : ""}`}>
          <div className="step-number">1</div>
          <div className="step-content">
            <h3>Subir Documento de Justificación</h3>
            <p>Adjunta un documento PDF explicando las razones de la cancelación</p>
          </div>
        </div>

        <div className={`step ${step >= 2 ? "active" : ""} ${step > 2 ? "completed" : ""}`}>
          <div className="step-number">2</div>
          <div className="step-content">
            <h3>Confirmar Solicitud</h3>
            <p>Envía formalmente tu solicitud de cancelación al consejo</p>
          </div>
        </div>

        <div className={`step ${step >= 3 ? "active" : ""}`}>
          <div className="step-number">3</div>
          <div className="step-content">
            <h3>Esperar Aprobación</h3>
            <p>El consejo revisará tu solicitud y te notificará la decisión</p>
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="cancellation-form">
          <h2>Paso 1: Subir Documento</h2>
          <form onSubmit={handleUploadDocument}>
            <div className="form-group">
              <label>Documento de Justificación (PDF)</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="file-input"
                required
              />
              {file && (
                <div className="file-info">
                  ✅ Archivo seleccionado: {file.name}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading || !file || !studentModalityId}
            >
              {loading ? "Subiendo..." : "Subir Documento"}
            </button>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="cancellation-confirm">
          <h2>Paso 2: Confirmar Solicitud</h2>
          <div className="confirm-box">
            <p>
              ⚠️ <strong>Importante:</strong> Al confirmar esta solicitud, el consejo académico
              revisará tu caso. Este proceso es irreversible una vez enviado.
            </p>
            <p>¿Estás seguro de que deseas continuar?</p>
          </div>

          <div className="button-group">
            <button onClick={() => setStep(1)} className="btn-secondary">
              Volver
            </button>
            <button onClick={handleRequestCancellation} className="btn-danger" disabled={loading || !studentModalityId}>
              {loading ? "Enviando..." : "Confirmar Solicitud"}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="cancellation-success">
          <div className="success-icon">✅</div>
          <h2>Solicitud Enviada</h2>
          <p>Tu solicitud de cancelación ha sido enviada al consejo académico.</p>
          <p>Te notificaremos cuando haya una decisión.</p>
        </div>
      )}
    </div>
  );
}