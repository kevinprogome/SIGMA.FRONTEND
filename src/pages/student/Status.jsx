// src/pages/student/ModalityStatus.jsx
import { useEffect, useState } from "react";
import { getCurrentModalityStatus } from "../../services/studentService";

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

  if (loading) return <p>Cargando estado de la modalidad...</p>;

  if (error) {
    return (
      <div>
        <h2>Estado de la modalidad</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Estado de la modalidad</h2>

      {/* Información principal */}
      <div style={{ marginBottom: "20px" }}>
        <p>
          <strong>Modalidad:</strong> {data.modalityName}
        </p>
        <p>
          <strong>Estado actual:</strong> {data.currentStatus}
        </p>
        <p>{data.currentStatusDescription}</p>
        <p>
          <strong>Última actualización:</strong>{" "}
          {new Date(data.lastUpdatedAt).toLocaleString()}
        </p>
      </div>

      {/* Historial */}
      <h3>Historial de estados</h3>

      {data.history && data.history.length > 0 ? (
        <ul>
          {data.history.map((h, index) => (
            <li key={index} style={{ marginBottom: "15px" }}>
              <p>
                <strong>Estado:</strong> {h.status}
              </p>
              <p>{h.description}</p>
              <p>
                <strong>Fecha:</strong>{" "}
                {new Date(h.changeDate).toLocaleString()}
              </p>
              <p>
                <strong>Responsable:</strong> {h.responsible}
              </p>
              {h.observations && (
                <p>
                  <strong>Observaciones:</strong> {h.observations}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay historial disponible</p>
      )}
    </div>
  );
}
