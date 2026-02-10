//pages/student/Documents.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentModalityStatus } from "../../services/studentService";
import StudentModalityDocuments from "../../pages/student/StudentModalityDocuments";
import "../../styles/student/modalities.css";

export default function Documents() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCurrentModality = async () => {
      try {
        console.log("🔍 Obteniendo modalidad actual...");
        const data = await getCurrentModalityStatus();
        
        console.log("📦 Datos recibidos:", data);

        if (!data || !data.studentModalityId) {
          setError("No tienes una modalidad seleccionada");
          setLoading(false);
          return;
        }

        // Verificar que venga el modalityId (después del fix del backend)
        if (!data.modalityId) {
          console.error("❌ El backend no está devolviendo modalityId");
          setError("Error: Falta información de la modalidad. Contacta al administrador.");
          setLoading(false);
          return;
        }

        setStatusData(data);
      } catch (err) {
        console.error("❌ Error:", err);
        if (err.response?.status === 404) {
          setError("No tienes una modalidad seleccionada");
        } else {
          setError("Error al cargar tu modalidad actual");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentModality();
  }, []);

  if (loading) {
    return (
      <div className="documents-page-loading">
        <div className="spinner"></div>
        <p>Cargando información de tu modalidad...</p>
      </div>
    );
  }

  if (error || !statusData) {
    return (
      <div className="documents-page-error">
        <div className="error-icon">📄</div>
        <h2>No hay modalidad seleccionada</h2>
        <p>{error || "Debes seleccionar una modalidad de grado antes de poder subir documentos."}</p>
        <button 
          className="documents-page-button"
          onClick={() => navigate("/student/modalities")}
        >
          Ir a Modalidades
        </button>
      </div>
    );
  }

  return (
    <div className="documents-page-container">
      <div className="documents-page-header">
        <h2 className="documents-page-title"></h2>
        <p className="documents-page-subtitle">
        </p>
      </div>

      <StudentModalityDocuments
        studentModalityId={statusData.studentModalityId}
        modalityId={statusData.modalityId}
      />
    </div>
  );
}